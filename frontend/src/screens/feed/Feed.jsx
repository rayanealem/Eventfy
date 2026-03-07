import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import SkeletonCard from '../../components/SkeletonCard';
import './Feed.css';

// Type badge config from Figma pixel-perfect spec
const TYPE_CONFIG = {
    sport: { label: '○ SPORT', shape: '○', color: '#f56e3d', border: 'rgba(245,110,61,0.3)' },
    music: { label: '□ MUSIC', shape: '□', color: '#f1f5f9', border: 'rgba(255,255,255,0.1)' },
    tech: { label: '⬡ TECH', shape: '⬡', color: '#2dd4bf', border: 'rgba(45,212,191,0.3)' },
    gaming: { label: '◇ GAMING', shape: '◇', color: '#f472b6', border: 'rgba(244,114,182,0.3)' },
    science: { label: '△ SCIENCE', shape: '△', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    charity: { label: '♡ CHARITY', shape: '♡', color: '#f1f5f9', border: 'rgba(255,255,255,0.1)' },
    cultural: { label: '☆ CULTURAL', shape: '☆', color: '#a855f7', border: 'rgba(168,85,247,0.3)' },
};

function formatEventDate(startsAt) {
    const date = new Date(startsAt);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'TODAY';
    if (diffDays === 1) return 'TOMORROW';
    if (diffDays < 7) return `${diffDays}D`;
    return date.toLocaleDateString('en-DZ', { day: '2-digit', month: 'short' }).toUpperCase();
}

export default function Feed() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    // State
    const [events, setEvents] = useState([]);
    const [registeredIds, setRegisteredIds] = useState(new Set());
    const [scope, setScope] = useState('local');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [followedOrgs, setFollowedOrgs] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [saved, setSaved] = useState({});

    // Pull-to-refresh
    const [refreshing, setRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const touchStartY = useRef(0);
    const feedRef = useRef(null);

    const handleTouchStart = (e) => {
        if (feedRef.current?.scrollTop === 0) {
            touchStartY.current = e.touches[0].clientY;
        }
    };

    const handleTouchMove = (e) => {
        if (feedRef.current?.scrollTop === 0 && touchStartY.current > 0) {
            const diff = e.touches[0].clientY - touchStartY.current;
            if (diff > 0) setPullDistance(Math.min(diff * 0.5, 80));
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 50) {
            setRefreshing(true);
            setEvents([]);
            setPage(1);
            setHasMore(true);
            await loadFeed(1);
            setRefreshing(false);
        }
        setPullDistance(0);
        touchStartY.current = 0;
    };

    // Infinite Scroll
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const lastEventElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Reset page when scope/filter changes
    useEffect(() => {
        setEvents([]);
        setPage(1);
        setHasMore(true);
    }, [scope, activeFilter]);

    // Load feed
    useEffect(() => { if (hasMore || page === 1) loadFeed(page); }, [page, scope, activeFilter]);

    // Load followed orgs + notifications on mount
    useEffect(() => {
        loadFollowedOrgs();
        loadNotifications();
    }, [profile]);

    // Realtime: new notifications
    useEffect(() => {
        if (!profile) return;
        const ch = supabase.channel(`notifs:${profile.id}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${profile.id}`
            }, () => setUnreadCount(n => n + 1))
            .subscribe();
        return () => supabase.removeChannel(ch);
    }, [profile]);

    async function loadFeed(pageNum = 1) {
        setLoading(true);
        try {
            const params = new URLSearchParams({ scope, page: pageNum, limit: 5 });
            if (activeFilter !== 'all') params.set('event_type', activeFilter);
            const data = await api('GET', `/events/feed?${params}`);

            if (data.events && data.events.length > 0) {
                setEvents(prev => pageNum === 1 ? data.events : [...prev, ...data.events]);
                setHasMore(data.events.length === 5); // 5 is expected limit
            } else {
                setHasMore(false);
            }
            if (data.registered_event_ids) {
                setRegisteredIds(prev => new Set([...prev, ...data.registered_event_ids]));
            }
        } catch (e) {
            console.error('Feed load failed:', e);
            if (pageNum === 1) setEvents([]);
        } finally {
            setLoading(false);
        }
    }

    async function loadNotifications() {
        if (!profile) return;
        try {
            const { data } = await supabase
                .from('notifications')
                .select('id', { count: 'exact' })
                .eq('user_id', profile?.id)
                .eq('is_read', false);
            setUnreadCount(data?.length || 0);
        } catch { }
    }

    async function loadFollowedOrgs() {
        if (!profile) return;
        try {
            const { data } = await supabase
                .from('org_followers')
                .select('organizations(id, name, slug, logo_url)')
                .eq('user_id', profile.id);
            setFollowedOrgs(data?.map(f => f.organizations) || []);
        } catch { }
    }

    async function handleRegister(eventId, e) {
        e.stopPropagation();
        if (registeredIds.has(eventId)) return;
        setRegisteredIds(prev => new Set([...prev, eventId]));  // optimistic
        try {
            await api('POST', `/events/${eventId}/register`);
        } catch (err) {
            setRegisteredIds(prev => { const s = new Set(prev); s.delete(eventId); return s; });
            console.error('Register failed:', err);
        }
    }

    const toggleSave = (eventId) => {
        setSaved(prev => ({ ...prev, [eventId]: !prev[eventId] }));
    };

    return (
        <div className="feed-root" ref={feedRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {/* Pull-to-refresh indicator */}
            {(pullDistance > 0 || refreshing) && (
                <div className="feed-pull-indicator" style={{ height: refreshing ? 50 : pullDistance, opacity: pullDistance > 30 || refreshing ? 1 : pullDistance / 30 }}>
                    <div className={`pull-spinner ${refreshing ? 'spinning' : ''}`} style={{ transform: `rotate(${pullDistance * 4}deg)` }}>↻</div>
                </div>
            )}
            {/* Noise overlay */}
            <div className="feed-noise" />

            {/* Header */}
            <header className="feed-header">
                <div className="feed-header-left">
                    <span className="feed-logo-shapes">○△□</span>
                    <span className="feed-logo-text">EVENTFY</span>
                </div>
                <div className="feed-search-bar" onClick={() => navigate('/explore')} style={{ cursor: 'pointer' }}>
                    <svg className="feed-search-icon" width="18.5" height="10.5" viewBox="0 0 19 11" fill="none">
                        <circle cx="5" cy="5" r="4.5" stroke="#64748b" strokeWidth="1" />
                        <line x1="8.5" y1="8" x2="13" y2="10.5" stroke="#64748b" strokeWidth="1" />
                    </svg>
                    <span className="feed-search-text">Search the Arena</span>
                </div>
                <div className="feed-header-actions">
                    <div className="feed-notif-box" onClick={() => navigate('/notifications')} style={{ cursor: 'pointer' }}>
                        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                            <path d="M8 0C5.8 0 4 1.8 4 4v4.6L2 11v2h12v-2l-2-2.4V4c0-2.2-1.8-4-4-4zm0 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2z" fill="rgba(255,255,255,0.5)" />
                        </svg>
                        {unreadCount > 0 && <div className="feed-notif-dot" />}
                    </div>
                    <div className="feed-avatar-wrap" onClick={() => navigate('/profile/me')} style={{ cursor: 'pointer' }}>
                        <img
                            className="feed-avatar-img"
                            src={profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop"}
                            alt="avatar"
                        />
                        <span className="feed-avatar-rank">#{profile?.player_number || '????'}</span>
                    </div>
                </div>
            </header>

            {/* Story Row — followed orgs */}
            <div className="feed-stories">
                <div className="feed-story" onClick={() => navigate('/stories/create')} style={{ cursor: 'pointer' }}>
                    <div className="feed-story-ring dashed" style={{ borderColor: '#f472b6' }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <line x1="7" y1="1" x2="7" y2="13" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
                            <line x1="1" y1="7" x2="13" y2="7" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span className="feed-story-name" style={{ color: '#94a3b8' }}>ADD STORY</span>
                </div>
                {followedOrgs.map((org, idx) => {
                    const rc = ['#f56e3d', '#2dd4bf', '#fbbf24', '#334155'];
                    return (
                        <div key={org.id} className="feed-story" onClick={() => navigate(`/stories/${org.id}`)} style={{ cursor: 'pointer' }}>
                            <div className="feed-story-ring" style={{ borderColor: rc[idx % rc.length] }}>
                                <div className="feed-story-avatar-inner">
                                    <img src={org.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&size=80&background=1e293b&color=fff`} alt={org.name} />
                                </div>
                            </div>
                            <span className="feed-story-name" style={{ color: '#f1f5f9' }}>{org.name?.toUpperCase()?.substring(0, 10)}</span>
                        </div>
                    )
                })}
            </div>

            {/* Toggle Bar */}
            <div className="feed-toggle-wrap">
                <div className="feed-toggle-bar">
                    <button className={`feed-toggle-btn ${scope === 'local' ? 'active' : ''}`} onClick={() => setScope('local')}>
                        <span>LOCAL</span>
                        <span className="toggle-shape">○</span>
                    </button>
                    <button className={`feed-toggle-btn ${scope === 'national' ? 'active' : ''}`} onClick={() => setScope('national')}>
                        <span>NATIONAL</span>
                        <span className="toggle-shape">△</span>
                    </button>
                    <button className={`feed-toggle-btn ${scope === 'international' ? 'active' : ''}`} onClick={() => setScope('international')}>
                        <span>INTERNATIONAL</span>
                        <span className="toggle-shape">□</span>
                    </button>
                </div>
            </div>

            {/* Event Cards */}
            <div className="feed-cards">
                {loading && events.length === 0 && (
                    <>
                        <SkeletonCard variant="feed" />
                        <SkeletonCard variant="feed" />
                    </>
                )}
                {!loading && events.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                        NO EVENTS FOUND IN THIS SCOPE
                    </div>
                )}
                {events.map((event, i) => {
                    const typeConf = TYPE_CONFIG[event.event_type] || TYPE_CONFIG.sport;
                    const isRegistered = registeredIds.has(event.id);
                    const org = event.organizations || {};

                    return (
                        <motion.div
                            key={event.id}
                            ref={events.length === i + 1 ? lastEventElementRef : null}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="feed-card-wrap"
                        >
                            <div
                                className="feed-card"
                                style={{ borderLeftColor: typeConf.color }}
                            >
                                {/* Image area — clickable to event detail */}
                                <div className="feed-card-image" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer' }}>
                                    <img src={event.cover_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop'} alt={event.title} />
                                    <div className="feed-card-gradient" />
                                    <div
                                        className="feed-card-type"
                                        style={{ borderColor: typeConf.border }}
                                    >
                                        <span style={{ color: typeConf.color }}>{typeConf.shape}</span>
                                        <span>{event.event_type?.toUpperCase()}</span>
                                    </div>
                                    <div className={`feed-card-countdown hot`}>
                                        {formatEventDate(event.starts_at)}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="feed-card-body">
                                    <h3 className="feed-card-title" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer' }}>
                                        {event.title?.toUpperCase()}
                                    </h3>

                                    <div className="feed-card-org" onClick={(e) => { e.stopPropagation(); navigate(`/org/${org.slug}`); }} style={{ cursor: 'pointer' }}>
                                        <div className="feed-card-org-icon">
                                            <img
                                                src={org.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name || 'O')}&size=24&background=1e293b&color=fff`}
                                                alt={org.name}
                                            />
                                        </div>
                                        <span className="feed-card-org-name">{org.name?.toUpperCase()}</span>
                                        {org.verified && (
                                            <svg className="feed-card-verified" width="11" height="10.5" viewBox="0 0 11 11" fill="none">
                                                <circle cx="5.5" cy="5.5" r="5" fill="#2dd4bf" />
                                                <path d="M3.5 5.5L5 7L7.5 4" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="feed-card-tags">
                                        {(event.tags || ['Algorithm: High Intensity', 'Verified Entry', 'Sponsor Priority']).slice(0, 3).map(tag => {
                                            let bg = 'rgba(255,255,255,0.05)', border = 'rgba(255,255,255,0.1)', color = '#94a3b8';
                                            const t = tag.toLowerCase();
                                            if (t.includes('algorithm') || t.includes('intensity') || t.includes('gaming')) { bg = 'rgba(244,114,182,0.1)'; border = 'rgba(244,114,182,0.2)'; color = '#f472b6'; }
                                            else if (t.includes('verified') || t.includes('boost') || t.includes('tech')) { bg = 'rgba(45,212,191,0.1)'; border = 'rgba(45,212,191,0.2)'; color = '#2dd4bf'; }
                                            else if (t.includes('sponsor') || t.includes('priority')) { bg = 'rgba(251,191,36,0.1)'; border = 'rgba(251,191,36,0.2)'; color = '#fbbf24'; }
                                            return (
                                                <span
                                                    key={tag}
                                                    className="feed-card-tag"
                                                    style={{ background: bg, borderColor: border, color: color }}
                                                >
                                                    {tag}
                                                </span>
                                            )
                                        })}
                                    </div>

                                    <div className="feed-card-capacity">
                                        <div className="feed-card-capacity-row">
                                            <span className="capacity-label">Capacity Status</span>
                                            <span className="capacity-count" style={{ color: typeConf.color }}>
                                                {event.registration_count || 0} / {event.capacity || '∞'} SPOTS
                                            </span>
                                        </div>
                                        <div className="capacity-bar">
                                            <div
                                                className="capacity-bar-fill"
                                                style={{
                                                    width: `${event.capacity ? (event.registration_count / event.capacity) * 100 : 0}%`,
                                                    background: typeConf.color,
                                                    boxShadow: `0 0 8px ${typeConf.color}50`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="feed-card-footer">
                                        <button
                                            className={`feed-card-register ${i % 2 !== 0 ? 'outline' : 'filled'} ${isRegistered ? 'registered' : ''}`}
                                            onClick={(e) => handleRegister(event.id, e)}
                                            style={isRegistered ? { background: '#2dd4bf', borderColor: '#2dd4bf', color: '#000' } : undefined}
                                        >
                                            {isRegistered ? "YOU'RE IN ✓" : `REGISTER ${typeConf.shape}`}
                                        </button>
                                        <div className="feed-card-actions">
                                            <button className="feed-card-action-btn" onClick={() => toggleSave(event.id)}>
                                                <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                                                    <path d="M1 2.5C1 1.67 1.67 1 2.5 1h9c.83 0 1.5.67 1.5 1.5V17l-6-3-6 3V2.5z"
                                                        stroke={saved[event.id] ? '#fbbf24' : 'rgba(255,255,255,0.4)'}
                                                        fill={saved[event.id] ? '#fbbf24' : 'none'}
                                                        strokeWidth="1.2" />
                                                </svg>
                                            </button>
                                            <button className="feed-card-action-btn" onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: `/event/${event.id}` }); }}>
                                                <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                                                    <path d="M2 10l7-8M9 2l7 8M9 2v14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* FAB */}
            <Link to="/event/create" className="feed-fab" onClick={(e) => {
                if (profile?.role !== 'organizer') {
                    e.preventDefault();
                    // Only org users can create events
                }
            }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </Link>
        </div>
    );
}

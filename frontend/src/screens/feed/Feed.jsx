import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';
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

const FILTER_PILLS = [
    { key: 'all', label: 'ALL', shape: '○' },
    { key: 'sport', label: 'SPORT', shape: '○' },
    { key: 'science', label: 'SCIENCE', shape: '△' },
    { key: 'charity', label: 'CHARITY', shape: '□' },
    { key: 'cultural', label: 'CULTURAL', shape: '◇' },
];

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'GOOD MORNING';
    if (h < 17) return 'AFTERNOON MISSION';
    if (h < 22) return 'EVENING OPERATIONS';
    return 'LATE NIGHT GRIND';
}

function formatEventDate(startsAt) {
    const date = new Date(startsAt);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'TODAY';
    if (diffDays === 1) return 'TOMORROW';
    if (diffDays < 7) return `${diffDays}D`;
    return date.toLocaleDateString('en-DZ', { day: '2-digit', month: 'short' }).toUpperCase();
}

function formatEventTime(startsAt) {
    const date = new Date(startsAt);
    return date.toLocaleTimeString('en-DZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function Feed() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { profile, refreshProfile } = useAuth();
    const { showToast } = useToast();

    const isOrgRole = profile?.role === 'organizer' || profile?.role === 'local_admin' || profile?.role === 'global_admin';

    // State
    const [events, setEvents] = useState([]);
    const [registeredIds, setRegisteredIds] = useState(new Set());
    const [scope, setScope] = useState('local');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [followedOrgs, setFollowedOrgs] = useState([]);
    const [followedOrgIds, setFollowedOrgIds] = useState(new Set());
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasActiveStory, setHasActiveStory] = useState(false);
    const [saved, setSaved] = useState({});
    const [liked, setLiked] = useState({});
    const [initialLiked, setInitialLiked] = useState({});
    const [seenStories, setSeenStories] = useState(new Set());
    const [commentSheetEventId, setCommentSheetEventId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commentsList, setCommentsList] = useState({});
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [inlineComment, setInlineComment] = useState({});
    const [localComments, setLocalComments] = useState({});

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

    // Load followed orgs + notifications + personal stories on mount
    useEffect(() => {
        loadFollowedOrgs();
        loadNotifications();
        checkPersonalStories();
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
            const params = new URLSearchParams({ scope, page: pageNum, limit: 5, _t: Date.now() });
            if (activeFilter !== 'all') params.set('event_type', activeFilter);
            const data = await api('GET', `/events/feed?${params}`);

            if (data.events && data.events.length > 0) {
                setEvents(prev => pageNum === 1 ? data.events : [...prev, ...data.events]);
                setHasMore(data.events.length === 5);
            } else {
                setHasMore(false);
            }
            if (data.registered_event_ids) {
                setRegisteredIds(prev => new Set([...prev, ...data.registered_event_ids]));
            }
            // Task 2.1: Hydrate liked and saved state from server
            if (data.liked_event_ids) {
                const likedMap = {};
                data.liked_event_ids.forEach(id => { likedMap[id] = true; });
                if (pageNum === 1) {
                    setLiked(likedMap);
                    setInitialLiked(likedMap);
                } else {
                    setLiked(prev => ({ ...prev, ...likedMap }));
                    setInitialLiked(prev => ({ ...prev, ...likedMap }));
                }
            }
            if (data.saved_event_ids) {
                const savedMap = {};
                data.saved_event_ids.forEach(id => { savedMap[id] = true; });
                if (pageNum === 1) {
                    setSaved(savedMap);
                } else {
                    setSaved(prev => ({ ...prev, ...savedMap }));
                }
            }
        } catch (e) {
            console.error('Feed load failed:', e);
            if (pageNum === 1) setEvents([]);
            showToast(`FEED ERROR: ${e.message}`, 'error');
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

    async function checkPersonalStories() {
        if (!profile) return;
        try {
            // Fetch directly from supabase
            const { data, error } = await supabase
                .from('stories')
                .select('id')
                .eq('user_id', profile.id)
                .gt('expires_at', new Date().toISOString());
                
            if (error) throw error;
            setHasActiveStory(data && data.length > 0);
        } catch (e) {
            console.error('Failed to check personal stories', e);
            setHasActiveStory(false);
        }
    }

    async function loadFollowedOrgs() {
        if (!profile) return;
        try {
            const { data } = await supabase
                .from('org_followers')
                .select('organizations(id, name, slug, logo_url)')
                .eq('user_id', profile.id);
            const orgs = data?.map(f => f.organizations) || [];
            setFollowedOrgs(orgs);
            setFollowedOrgIds(new Set(orgs.map(o => o.id)));
        } catch { }
    }

    async function handleRegister(eventId, e) {
        e.stopPropagation();
        haptic();
        navigate(`/event/${eventId}`);
    }

    const toggleSave = async (eventId) => {
        haptic();
        const isSaving = !saved[eventId];
        setSaved(prev => ({ ...prev, [eventId]: isSaving }));
        showToast(isSaving ? 'EVENT SAVED ◇' : 'REMOVED FROM SAVED', 'success');
        try {
            await api(isSaving ? 'POST' : 'DELETE', `/events/${eventId}/save`);
        } catch (e) {
            setSaved(prev => ({ ...prev, [eventId]: !isSaving }));
        }
    };

    const toggleLike = async (eventId) => {
        haptic();
        const isLiking = !liked[eventId];
        setLiked(prev => ({ ...prev, [eventId]: isLiking }));
        try {
            await api(isLiking ? 'POST' : 'DELETE', `/events/${eventId}/like`);
        } catch (e) {
            setLiked(prev => ({ ...prev, [eventId]: !isLiking }));
        }
    };

    const handleInlineComment = async (eventId) => {
        const text = inlineComment[eventId];
        if (!text || !text.trim()) return;
        haptic();
        try {
            const result = await api('POST', `/events/${eventId}/comment`, { content: text.trim() });
            showToast('COMMENT POSTED ✓', 'success');
            setInlineComment(prev => ({ ...prev, [eventId]: '' }));
            setLocalComments(prev => ({ ...prev, [eventId]: (prev[eventId] || 0) + 1 }));
            // Push into commentsList if loaded
            if (commentsList[eventId]) {
                const newComment = {
                    ...result,
                    profiles: { username: profile?.username, full_name: profile?.full_name, avatar_url: profile?.avatar_url, shape: profile?.shape, shape_color: profile?.shape_color, player_number: profile?.player_number },
                    content: text.trim(),
                    created_at: new Date().toISOString(),
                };
                setCommentsList(prev => ({ ...prev, [eventId]: [...(prev[eventId] || []), newComment] }));
            }
        } catch (err) {
            showToast('COMMENT FAILED', 'error');
        }
    };

    // Task 2.3: Fetch comments for the comment sheet
    const openCommentSheet = async (eventId) => {
        setCommentSheetEventId(eventId);
        if (!commentsList[eventId]) {
            setCommentsLoading(true);
            try {
                const data = await api('GET', `/events/${eventId}/comments?page=1&limit=50&_t=${Date.now()}`);
                setCommentsList(prev => ({ ...prev, [eventId]: data.comments || [] }));
            } catch (e) {
                console.error('Failed to load comments:', e);
                setCommentsList(prev => ({ ...prev, [eventId]: [] }));
            } finally {
                setCommentsLoading(false);
            }
        }
    };

    const handleComment = async () => {
        if (!commentText.trim() || !commentSheetEventId) return;
        haptic();
        try {
            const result = await api('POST', `/events/${commentSheetEventId}/comment`, { content: commentText.trim() });
            showToast('COMMENT SENT ✓', 'success');
            setLocalComments(prev => ({ ...prev, [commentSheetEventId]: (prev[commentSheetEventId] || 0) + 1 }));
            // Push comment into list immediately
            const newComment = {
                ...result,
                profiles: { username: profile?.username, full_name: profile?.full_name, avatar_url: profile?.avatar_url, shape: profile?.shape, shape_color: profile?.shape_color, player_number: profile?.player_number },
                content: commentText.trim(),
                created_at: new Date().toISOString(),
            };
            setCommentsList(prev => ({ ...prev, [commentSheetEventId]: [...(prev[commentSheetEventId] || []), newComment] }));
            setCommentText('');
        } catch (err) {
            showToast('COMMENT FAILED', 'error');
        }
    };

    // Task 2.4: Follow/unfollow toggle
    const toggleFollowOrg = async (orgId, e) => {
        e.stopPropagation();
        haptic();
        const isFollowing = followedOrgIds.has(orgId);
        // Optimistic update
        setFollowedOrgIds(prev => {
            const next = new Set(prev);
            if (isFollowing) next.delete(orgId); else next.add(orgId);
            return next;
        });
        showToast(isFollowing ? 'UNFOLLOWED' : 'FOLLOWING ✓', 'success');
        try {
            await api(isFollowing ? 'DELETE' : 'POST', `/orgs/${orgId}/follow`);
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
            // refresh AuthContext profile immediately
            refreshProfile && refreshProfile();
        } catch (err) {
            // Rollback
            setFollowedOrgIds(prev => {
                const next = new Set(prev);
                if (isFollowing) next.add(orgId); else next.delete(orgId);
                return next;
            });
            showToast('FOLLOW FAILED', 'error');
        }
    };

    // Task 2.2: Compute like delta for display
    const getLikeCount = (event) => {
        const base = event.like_count || 0;
        const wasLiked = !!initialLiked[event.id];
        const nowLiked = !!liked[event.id];
        if (nowLiked && !wasLiked) return base + 1;
        if (!nowLiked && wasLiked) return Math.max(0, base - 1);
        return base;
    };

    // Format relative time for comments
    const formatRelativeTime = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
        return `${Math.floor(diff / 604800)}w`;
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
                    <div className="feed-header-brand">
                        <span className="feed-logo-text">EVENTFY</span>
                        <span className="feed-greeting">{getGreeting()}, #{profile?.player_number || '????'}</span>
                    </div>
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

            {/* Story Row — Instagram-style */}
            <div className="feed-stories">
                {/* "Your Story" Bubble — Instagram-style */}
                <div
                    className="feed-story"
                    onClick={() => hasActiveStory ? navigate(`/stories/${profile.id}`) : navigate('/stories/create')}
                >
                    <div className={`feed-story-ring ${hasActiveStory ? 'gradient' : 'dashed'}`}>
                        <div className="feed-story-avatar-inner">
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'U')}&size=80&background=1e293b&color=fff`}
                                alt="Your Story"
                            />
                        </div>
                    </div>
                    {!hasActiveStory && (
                        <div style={{
                            position: 'absolute',
                            bottom: 18,
                            right: -2,
                            background: 'linear-gradient(135deg, #13ecec 0%, #a855f7 100%)',
                            borderRadius: '50%',
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #0a0a0f',
                            boxShadow: '0 2px 8px rgba(19, 236, 236, 0.3)'
                        }}>
                            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                                <line x1="7" y1="2" x2="7" y2="12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                                <line x1="2" y1="7" x2="12" y2="7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                    )}
                    <span className="feed-story-name" style={{ color: hasActiveStory ? '#13ecec' : 'rgba(255,255,255,0.5)' }}>
                        {hasActiveStory ? 'YOUR STORY' : 'ADD'}
                    </span>
                </div>

                {followedOrgs.map((org) => {
                    const isSeen = seenStories.has(org.id);
                    return (
                        <div key={org.id} className="feed-story" onClick={() => { setSeenStories(prev => new Set([...prev, org.id])); navigate(`/stories/${org.id}`); }}>
                            <div className={`feed-story-ring ${isSeen ? 'seen' : 'gradient'}`}>
                                <div className="feed-story-avatar-inner">
                                    <img src={org.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&size=80&background=1e293b&color=fff`} alt={org.name} />
                                </div>
                            </div>
                            <span className="feed-story-name" style={{ color: isSeen ? 'rgba(255,255,255,0.3)' : '#f1f5f9' }}>{org.name?.toUpperCase()?.substring(0, 8)}</span>
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

            {/* Filter Pills */}
            <div className="feed-filter-pills">
                {FILTER_PILLS.map(fp => {
                    const isActive = activeFilter === fp.key;
                    const typeColor = TYPE_CONFIG[fp.key]?.color || '#f56e3d';
                    return (
                        <motion.button
                            whileTap={{ scale: 0.85 }}
                            key={fp.key}
                            className={`feed-filter-pill ${isActive ? 'active' : ''}`}
                            onClick={() => setActiveFilter(fp.key)}
                            style={{ position: 'relative', overflow: 'hidden', color: isActive ? '#000' : 'inherit', border: '1px solid ' + (isActive ? 'transparent' : 'rgba(255,255,255,0.1)') }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="feedFilterIndicator"
                                    style={{ position: 'absolute', inset: 0, background: typeColor, zIndex: -1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
                                />
                            )}
                            <span style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {fp.label} <span style={{ color: isActive ? '#000' : typeColor }}>{fp.shape}</span>
                            </span>
                        </motion.button>
                    );
                })}
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
                    <div className="feed-empty-state">
                        <span className="feed-empty-shape">○</span>
                        <span className="feed-empty-shape-sm top-right">△</span>
                        <span className="feed-empty-shape-xs bottom-left">□</span>
                        <span className="feed-empty-text">NO EVENTS FOUND IN THIS SCOPE</span>
                        <span className="feed-empty-sub">Try changing your filters or scope</span>
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
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: (i % 5) * 0.05, duration: 0.35, type: 'spring', stiffness: 250, damping: 25 }}
                            whileHover={{ y: -4, transition: { duration: 0.15 } }}
                            className="feed-card-wrap"
                        >
                            <div
                                className="feed-card"
                                style={{ borderLeftColor: typeConf.color }}
                            >
                                {/* Image area — clickable to event detail */}
                                <div className="feed-card-image" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer' }}>
                                    <motion.img layoutId={"event-image-" + event.id} src={event.cover_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop'} alt={event.title} />
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
                                    {/* LIVE NOW indicator */}
                                    {event.is_live && (
                                        <div className="feed-live-badge">
                                            <span className="feed-live-dot" />
                                            LIVE
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="feed-card-body">
                                    <h3 className="feed-card-title" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer' }}>
                                        {event.title?.toUpperCase()}
                                    </h3>

                                    <div className="feed-card-org" onClick={(e) => { e.stopPropagation(); navigate(`/org/${org.slug}`); }} style={{ cursor: 'pointer' }}>
                                        <div className="feed-card-org-left">
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
                                        {org.id && (
                                            <button
                                                className={`feed-follow-btn ${followedOrgIds.has(org.id) ? 'following' : ''}`}
                                                onClick={(e) => toggleFollowOrg(org.id, e)}
                                            >
                                                {followedOrgIds.has(org.id) ? 'FOLLOWING ✓' : 'FOLLOW'}
                                            </button>
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

                                    {/* Event metadata strip */}
                                    <div className="feed-card-meta-strip">
                                        <span className="feed-meta-chip">■ {formatEventDate(event.starts_at)} at {formatEventTime(event.starts_at)}</span>
                                        <span className="feed-meta-chip"><span style={{ color: typeConf.color }}>◉</span> {event.registration_count || 0} going</span>
                                        <span className="feed-meta-chip"><span style={{ color: typeConf.color }}>{typeConf.shape}</span> {event.event_type?.toUpperCase()}</span>
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

                                    {/* Footer — actions left, register right */}
                                    <div className="feed-card-footer">
                                        <div className="feed-card-actions">
                                            {/* LIKE */}
                                            <button className="feed-card-action-btn" onClick={(e) => { e.stopPropagation(); toggleLike(event.id); }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                                                        stroke={liked[event.id] ? '#f43f5e' : 'rgba(255,255,255,0.5)'}
                                                        fill={liked[event.id] ? '#f43f5e' : 'none'}
                                                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginRight: '6px', fontFamily: 'DM Mono' }}>{getLikeCount(event)}</span>

                                            {/* COMMENT */}
                                            <button className="feed-card-action-btn" onClick={(e) => { e.stopPropagation(); openCommentSheet(event.id); }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                                                        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                                </svg>
                                            </button>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginRight: '6px', fontFamily: 'DM Mono' }}>{(event.comment_count || 0) + (localComments[event.id] || 0)}</span>

                                            {/* SAVE */}
                                            <button className="feed-card-action-btn" onClick={(e) => { e.stopPropagation(); toggleSave(event.id); }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                                                        stroke={saved[event.id] ? '#d946ef' : 'rgba(255,255,255,0.5)'}
                                                        fill={saved[event.id] ? '#d946ef' : 'none'}
                                                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>

                                            {/* SHARE */}
                                            <button className="feed-card-action-btn" onClick={(e) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: event.title, url: `/event/${event.id}` }); }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <line x1="22" y1="2" x2="11" y2="13" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    <polygon points="22 2 15 22 11 13 2 9 22 2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                                                </svg>
                                            </button>
                                        </div>
                                        <button
                                            className={`feed-card-register-pill ${isRegistered ? 'registered' : ''}`}
                                            onClick={(e) => handleRegister(event.id, e)}
                                            style={isRegistered ? { background: '#2dd4bf', borderColor: '#2dd4bf', color: '#000' } : undefined}
                                        >
                                            {isRegistered ? 'IN ✓' : `REGISTER ${typeConf.shape}`}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* FAB — only for organizer/admin roles */}
            {isOrgRole && (
                <Link to="/event/create" className="feed-fab">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </Link>
            )}
            {/* Comment Bottom Sheet */}
            <AnimatePresence>
                {commentSheetEventId && (
                    <>
                        <motion.div
                            className="comment-sheet-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setCommentSheetEventId(null)}
                        />
                        <motion.div
                            className="comment-sheet"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="comment-sheet-handle" />
                            <div className="comment-sheet-header">
                                <h3>COMMENTS ○</h3>
                                <button onClick={() => setCommentSheetEventId(null)}>✕</button>
                            </div>
                            <div className="comment-sheet-body">
                                {commentsLoading ? (
                                    <div className="comment-sheet-loading">
                                        <div className="comment-loading-spinner" />
                                        <span>Loading comments...</span>
                                    </div>
                                ) : (commentsList[commentSheetEventId] || []).length === 0 ? (
                                    <p className="comment-sheet-empty">Be the first to comment on this event</p>
                                ) : (
                                    (commentsList[commentSheetEventId] || []).map((c, idx) => (
                                        <div key={c.id || idx} className="comment-row">
                                            <img
                                                className="comment-avatar"
                                                src={c.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.profiles?.username || 'U')}&size=32&background=1e293b&color=fff`}
                                                alt=""
                                            />
                                            <div className="comment-content">
                                                <div className="comment-meta">
                                                    <span className="comment-username">@{c.profiles?.username || 'user'}</span>
                                                    <span className="comment-time">{formatRelativeTime(c.created_at)}</span>
                                                </div>
                                                <p className="comment-text">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button
                                className="comment-sheet-see-all"
                                onClick={() => { setCommentSheetEventId(null); navigate(`/event/${commentSheetEventId}`); }}
                            >
                                SEE ALL COMMENTS →
                            </button>
                            <div className="comment-sheet-compose">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleComment()}
                                />
                                <button
                                    className="comment-sheet-send"
                                    onClick={handleComment}
                                    disabled={!commentText.trim()}
                                >
                                    ▷
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

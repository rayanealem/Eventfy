import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import './Explore.css';

const FILTERS = [
    { label: 'ALL', shape: '○' },
    { label: 'SPORT', shape: '△' },
    { label: 'SCIENCE', shape: '□' },
    { label: 'CULTURAL', shape: '✦' },
];

const TYPE_CONFIG = {
    sport: { label: '△ SPORT', shape: '△', color: '#FF4D4D' },
    science: { label: '□ SCIENCE', shape: '□', color: '#00E5CC' },
    charity: { label: '◇ CHARITY', shape: '◇', color: '#FFD700' },
    cultural: { label: '✦ CULTURAL', shape: '✦', color: '#FF2D78' },
};

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
];

export default function Explore() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const queryClient = useQueryClient();

    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchScope, setSearchScope] = useState('ALL');
    const [recentSearches, setRecentSearches] = useState(() => {
        try { return JSON.parse(localStorage.getItem('eventfy_recent_searches') || '[]'); } catch { return []; }
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            // Save to recent searches when user commits a query
            if (searchQuery.trim().length > 1) {
                setRecentSearches(prev => {
                    const updated = [searchQuery.trim(), ...prev.filter(s => s !== searchQuery.trim())].slice(0, 5);
                    localStorage.setItem('eventfy_recent_searches', JSON.stringify(updated));
                    return updated;
                });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch trending/explore events
    const { data: eventsData, isLoading: loadingEvents } = useQuery({
        queryKey: ['explore', 'events'],
        queryFn: () => api('GET', '/events/trending'),
    });

    // Fetch top orgs
    const { data: orgsData, isLoading: loadingOrgs } = useQuery({
        queryKey: ['explore', 'orgs'],
        queryFn: () => api('GET', '/orgs'),
    });

    // Search query
    const { data: searchResults, isLoading: searching } = useQuery({
        queryKey: ['search', debouncedQuery],
        queryFn: () => api('GET', `/search?q=${encodeURIComponent(debouncedQuery)}`),
        enabled: debouncedQuery.length > 1,
    });

    // Follow mutation
    const followMutation = useMutation({
        mutationFn: ({ orgId, isFollowing }) => isFollowing ? api('DELETE', `/orgs/${orgId}/follow`) : api('POST', `/orgs/${orgId}/follow`),
        onMutate: async ({ orgId, isFollowing }) => {
            await queryClient.cancelQueries({ queryKey: ['explore', 'orgs'] });
            const prevOrgs = queryClient.getQueryData(['explore', 'orgs']);

            queryClient.setQueryData(['explore', 'orgs'], (old) => {
                const orgList = Array.isArray(old) ? old : old?.organizations || [];
                const updatedList = orgList.map(o => o.id === orgId ? { ...o, is_following: !isFollowing } : o);
                return Array.isArray(old) ? updatedList : { ...old, organizations: updatedList };
            });

            return { prevOrgs };
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['explore', 'orgs'], context.prevOrgs);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['explore', 'orgs'] });
        }
    });

    const toggleFollow = (orgId, isFollowing, e) => {
        e.stopPropagation();
        followMutation.mutate({ orgId, isFollowing });
    };

    const trending = Array.isArray(eventsData) ? eventsData : eventsData?.events || eventsData?.data || [];
    const orgs = Array.isArray(orgsData) ? orgsData : orgsData?.organizations || orgsData?.data || [];

    const filteredTrending = activeFilter === 'ALL'
        ? trending
        : trending.filter(e => e.event_type?.toUpperCase() === activeFilter);

    // Masonry Grid Logic: Split filteredTrending into 2 columns
    const col1 = [];
    const col2 = [];
    filteredTrending.forEach((event, i) => {
        if (i % 2 === 0) col1.push(event);
        else col2.push(event);
    });

    return (
        <div className="explore-root">
            <div className="explore-noise" />

            {/* Search Header */}
            <header className="explore-header">
                <div className="explore-search">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="7.5" cy="7.5" r="6" stroke="#64748b" strokeWidth="1.5" />
                        <path d="M12 12l4 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input
                        type="text"
                        placeholder="SEARCH THE ARENA..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchActive(true)}
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#f1f5f9', fontFamily: 'inherit', fontSize: 'inherit',
                            letterSpacing: 'inherit', width: '100%',
                        }}
                    />
                    {isSearchActive && (
                        <button
                            className="explore-search-cancel"
                            onClick={() => { setIsSearchActive(false); setSearchQuery(''); setDebouncedQuery(''); }}
                        >
                            CANCEL
                        </button>
                    )}
                </div>

                {/* Filter Pills — hidden when search is active */}
                {!isSearchActive && (
                    <div className="explore-filters">
                        {FILTERS.map((f, i) => {
                            const isActive = activeFilter === f.label;
                            return (
                                <motion.button
                                    whileTap={{ scale: 0.85 }}
                                    key={i}
                                    className={`explore-pill ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(f.label)}
                                    style={{ position: 'relative', overflow: 'hidden' }}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="exploreFilterIndicator"
                                            style={{ position: 'absolute', inset: 0, background: '#f56e3d', zIndex: -1 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
                                        />
                                    )}
                                    <span style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '6px', alignItems: 'center', color: isActive ? '#000' : 'inherit' }}>
                                        <span className="pill-shape" style={{ color: isActive ? '#000' : '#f56e3d' }}>{f.shape}</span>
                                        <span className="pill-label">{f.label}</span>
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                )}
            </header>

            {/* Recent Searches — when search active but no query */}
            {isSearchActive && debouncedQuery.length <= 1 && (
                <div className="explore-content" style={{ paddingTop: 0 }}>
                    {recentSearches.length > 0 && (
                        <div className="explore-recent-searches">
                            <div className="explore-recent-header">
                                <span>RECENT</span>
                                <button onClick={() => { setRecentSearches([]); localStorage.removeItem('eventfy_recent_searches'); }}>CLEAR</button>
                            </div>
                            <div className="explore-recent-chips">
                                {recentSearches.map((q, i) => (
                                    <button key={i} className="explore-recent-chip" onClick={() => { setSearchQuery(q); setDebouncedQuery(q); }}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search Results */}
            {isSearchActive && debouncedQuery.length > 1 && (
                <div className="explore-content" style={{ paddingTop: 0 }}>
                    {searching ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontFamily: 'DM Mono, monospace' }}>SCANNING...</div>
                    ) : searchResults ? (
                        <div className="explore-search-dropdown" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {/* EVENTS */}
                            {searchResults.events?.length > 0 && searchResults.events.map((event, i) => (
                                <div key={`evt-${i}`} className="explore-search-result" onClick={() => navigate(`/event/${event.id}`)}
                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                                        <motion.img layoutId={"event-image-" + event.id} src={event.cover_url || FALLBACK_IMAGES[i % 4]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Event" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                        <span style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>
                                        <span style={{ color: TYPE_CONFIG[event.event_type]?.color || '#64748b', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                                            {TYPE_CONFIG[event.event_type]?.shape || '○'} {event.event_type?.toUpperCase()} EVENT
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* ORGANIZATIONS */}
                            {searchResults.orgs?.length > 0 && searchResults.orgs.map((org, i) => (
                                <div key={`org-${i}`} className="explore-search-result" onClick={() => navigate(`/org/${org.slug || org.id}`)}
                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={org.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(org.name)}&background=1e293b&color=fff`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Org" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                        <span style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {org.name}
                                            {org.verified && <span style={{ color: '#2dd4bf', fontSize: '12px' }}>✓</span>}
                                        </span>
                                        <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'DM Mono' }}>
                                            ORGANIZATION • {org.follower_count || 0} followers
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* PLAYERS */}
                            {searchResults.users?.length > 0 && searchResults.users.map((u, i) => (
                                <div key={`usr-${i}`} className="explore-search-result" onClick={() => navigate(`/profile/${u.username}`)}
                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                            <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=1e293b&color=fff`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="User" />
                                        </div>
                                        <span className="explore-shape-badge" style={{ background: u.shape_color || '#f56e3d', width: '14px', height: '14px', fontSize: '8px', position: 'absolute', bottom: '-2px', right: '-2px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #000' }}>
                                            {u.shape || '○'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                        <span style={{ color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.75rem', fontFamily: 'DM Mono', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.full_name}</span>
                                    </div>
                                </div>
                            ))}

                            {(!searchResults.events?.length && !searchResults.orgs?.length && !searchResults.users?.length) && (
                                <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontFamily: 'DM Mono, monospace' }}>NO TARGETS ACQUIRED</div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Main Content — Grid View (hidden when search is active) */}
            {!isSearchActive && debouncedQuery.length <= 1 && (
                <div className="explore-content">
                    {/* Top Organizations (Horizontal Scroll) */}
                    <section className="explore-section">
                        <div className="explore-section-header" style={{ marginBottom: '-8px' }}>
                            <h2 className="explore-section-title">TOP ORGS △</h2>
                            <span className="explore-see-all" onClick={() => navigate('/explore/orgs')}>SEE ALL →</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', padding: '0 16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
                            {loadingOrgs ? (
                                [1, 2, 3].map(i => <div key={i} style={{ minWidth: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }} />)
                            ) : orgs.map((org, i) => (
                                <div key={org.id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '80px', cursor: 'pointer' }} onClick={() => navigate(`/org/${org.slug || org.id}`)}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(45deg, #13ecc8, #f45c25)' }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '2px solid black' }}>
                                                <img src={org.logo_url || `https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={org.name} />
                                            </div>
                                        </div>
                                        {org.verified && <span className="explore-org-verified">✓</span>}
                                    </div>
                                    <span style={{ color: '#f1f5f9', fontSize: '10px', fontFamily: 'Space Grotesk', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px', textAlign: 'center', fontWeight: 'bold' }}>
                                        {org.name}
                                    </span>
                                    <span style={{ color: '#64748b', fontSize: '9px', fontFamily: 'DM Mono, monospace', marginTop: '-4px' }}>
                                        {org.upcoming_events || org.event_count || 0} UPCOMING
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Events Masonry Grid */}
                    <section className="explore-section" style={{ marginTop: '16px' }}>
                        <div className="explore-section-header">
                            <h2 className="explore-section-title trending">DISCOVER □</h2>
                            <span className="explore-see-all" onClick={() => navigate('/explore/events')}>SEE ALL →</span>
                        </div>

                        {loadingEvents ? (
                            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontFamily: 'DM Mono, monospace', animation: 'pulse 1.5s infinite' }}>LOADING GRID...</div>
                        ) : filteredTrending.length === 0 ? (
                            <div className="explore-empty-state">
                                <div className="explore-empty-shapes">
                                    <span style={{ color: '#f56e3d', fontSize: '40px' }}>○</span>
                                    <span style={{ color: '#fbbf24', fontSize: '30px' }}>△</span>
                                    <span style={{ color: '#2dd4bf', fontSize: '36px' }}>□</span>
                                    <span style={{ color: '#a855f7', fontSize: '28px' }}>◇</span>
                                </div>
                                <span className="explore-empty-text">NO EVENTS MATCH YOUR FILTER</span>
                                <span className="explore-empty-sub">TRY ADJUSTING YOUR SEARCH OR EXPLORE ALL</span>
                            </div>
                        ) : (
                            <div className="explore-masonry-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px', padding: '0' }}>
                                {/* Column 1 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {col1.map((event, i) => {
                                        const typeInfo = TYPE_CONFIG[event.event_type] || { shape: '○', color: '#ffffff' };
                                        // Pseudo-random tall vs square image based on index to create masonry feel
                                        const isTall = i % 3 === 0;
                                        return (
                                            <motion.div
                                                key={event.id || `c1-${i}`}
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                                                transition={{ delay: (i % 4) * 0.1, duration: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
                                                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                                                onClick={() => navigate(`/event/${event.id}`)}
                                                style={{ position: 'relative', width: '100%', paddingBottom: isTall ? '133%' : '100%', cursor: 'pointer', overflow: 'hidden', background: '#1a1d2e' }}
                                            >
                                                <motion.img layoutId={"event-image-" + event.id} src={event.cover_url || FALLBACK_IMAGES[(i * 2) % FALLBACK_IMAGES.length]} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={event.title} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />

                                                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                    {typeInfo.shape === '✦' ?
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill={typeInfo.color}><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6-6.2-4.5h7.6z" /></svg>
                                                        : <span style={{ color: typeInfo.color, fontSize: '18px', fontWeight: 'bold' }}>{typeInfo.shape}</span>}
                                                </div>

                                                <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px' }}>
                                                    <div style={{ color: 'white', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '12px', lineHeight: '14px', marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.title}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                {/* Column 2 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    {col2.map((event, i) => {
                                        const typeInfo = TYPE_CONFIG[event.event_type] || { shape: '○', color: '#ffffff' };
                                        const isTall = i % 3 === 1; // Different rhythm from col1
                                        return (
                                            <motion.div
                                                key={event.id || `c2-${i}`}
                                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                                viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                                                transition={{ delay: (i % 4) * 0.1, duration: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
                                                whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                                                onClick={() => navigate(`/event/${event.id}`)}
                                                style={{ position: 'relative', width: '100%', paddingBottom: isTall ? '133%' : '100%', cursor: 'pointer', overflow: 'hidden', background: '#1a1d2e' }}
                                            >
                                                <motion.img layoutId={"event-image-" + event.id} src={event.cover_url || FALLBACK_IMAGES[(i * 2 + 1) % FALLBACK_IMAGES.length]} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt={event.title} />
                                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />

                                                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                                    {typeInfo.shape === '✦' ?
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill={typeInfo.color}><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6-6.2-4.5h7.6z" /></svg>
                                                        : <span style={{ color: typeInfo.color, fontSize: '18px', fontWeight: 'bold' }}>{typeInfo.shape}</span>}
                                                </div>

                                                <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px' }}>
                                                    <div style={{ color: 'white', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '12px', lineHeight: '14px', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{event.title}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}

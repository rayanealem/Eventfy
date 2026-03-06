import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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

// Fallback images for events without cover_url
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=250&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=250&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=250&fit=crop',
];

export default function Explore() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [following, setFollowing] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);

    // Data from API
    const [trending, setTrending] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [loadingOrgs, setLoadingOrgs] = useState(true);

    // Fetch trending events
    useEffect(() => {
        async function fetchTrending() {
            setLoadingTrending(true);
            try {
                const data = await api('GET', '/events/trending');
                setTrending(Array.isArray(data) ? data : data?.events || data?.data || []);
            } catch (err) {
                console.error('Failed to fetch trending:', err);
                setTrending([]);
            } finally {
                setLoadingTrending(false);
            }
        }
        fetchTrending();
    }, []);

    // Fetch top organizations
    useEffect(() => {
        async function fetchOrgs() {
            setLoadingOrgs(true);
            try {
                const data = await api('GET', '/orgs');
                const orgList = Array.isArray(data) ? data : data?.organizations || data?.data || [];
                setOrgs(orgList);
                // Check which orgs user follows (if logged in)
                if (profile) {
                    const followMap = {};
                    for (const org of orgList) {
                        followMap[org.id] = org.is_following || false;
                    }
                    setFollowing(followMap);
                }
            } catch (err) {
                console.error('Failed to fetch orgs:', err);
                setOrgs([]);
            } finally {
                setLoadingOrgs(false);
            }
        }
        fetchOrgs();
    }, [profile]);

    // Search handler
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults(null);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                const data = await api('GET', `/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(data);
            } catch (err) {
                console.error('Search failed:', err);
            }
        }, 400); // debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleFollow = async (orgId) => {
        const wasFollowing = following[orgId];
        // Optimistic update
        setFollowing(prev => ({ ...prev, [orgId]: !wasFollowing }));
        try {
            if (wasFollowing) {
                await api('DELETE', `/orgs/${orgId}/follow`);
            } else {
                await api('POST', `/orgs/${orgId}/follow`);
            }
        } catch (err) {
            // Revert on error
            setFollowing(prev => ({ ...prev, [orgId]: wasFollowing }));
            console.error('Follow toggle failed:', err);
        }
    };

    // Filter trending by type
    const filteredTrending = activeFilter === 'ALL'
        ? trending
        : trending.filter(e => e.event_type?.toUpperCase() === activeFilter);

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
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#f1f5f9', fontFamily: 'inherit', fontSize: 'inherit',
                            letterSpacing: 'inherit', width: '100%',
                        }}
                    />
                </div>

                {/* Filter Pills */}
                <div className="explore-filters">
                    {FILTERS.map((f, i) => (
                        <button key={i} className={`explore-pill ${activeFilter === f.label ? 'active' : ''}`} onClick={() => setActiveFilter(f.label)}>
                            <span className="pill-shape">{f.shape}</span>
                            <span className="pill-label">{f.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Search Results Overlay */}
            {searchResults && (
                <div className="explore-content" style={{ paddingTop: 0 }}>
                    {searchResults.events?.length > 0 && (
                        <section className="explore-section">
                            <h2 className="explore-section-title">EVENTS</h2>
                            {searchResults.events.map((event, i) => (
                                <div key={i} className="explore-search-result" onClick={() => navigate(`/event/${event.id}`)}
                                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ color: '#f1f5f9' }}>{event.title}</span>
                                    <span style={{ color: TYPE_CONFIG[event.event_type]?.color || '#64748b', marginLeft: 8, fontSize: '0.75rem' }}>
                                        {TYPE_CONFIG[event.event_type]?.label || event.event_type}
                                    </span>
                                </div>
                            ))}
                        </section>
                    )}
                    {searchResults.orgs?.length > 0 && (
                        <section className="explore-section">
                            <h2 className="explore-section-title">ORGANIZATIONS</h2>
                            {searchResults.orgs.map((org, i) => (
                                <div key={i} className="explore-search-result" onClick={() => navigate(`/org/${org.slug || org.id}`)}
                                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ color: '#f1f5f9' }}>{org.name}</span>
                                </div>
                            ))}
                        </section>
                    )}
                    {searchResults.users?.length > 0 && (
                        <section className="explore-section">
                            <h2 className="explore-section-title">USERS</h2>
                            {searchResults.users.map((u, i) => (
                                <div key={i} className="explore-search-result" onClick={() => navigate(`/profile/${u.username}`)}
                                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <span style={{ color: '#f1f5f9' }}>@{u.username}</span>
                                    <span style={{ color: '#64748b', marginLeft: 8 }}>{u.full_name}</span>
                                </div>
                            ))}
                        </section>
                    )}
                    {(!searchResults.events?.length && !searchResults.orgs?.length && !searchResults.users?.length) && (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No results found</div>
                    )}
                </div>
            )}

            {/* Main Content — only when not searching */}
            {!searchResults && (
                <div className="explore-content">
                    {/* Trending Now */}
                    <section className="explore-section">
                        <div className="explore-section-header">
                            <h2 className="explore-section-title trending">TRENDING NOW ○</h2>
                            <svg width="17" height="10" viewBox="0 0 17 10" fill="none">
                                <path d="M10 1l6 4-6 4" stroke="#f1f5f9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M0 5h14" stroke="#f1f5f9" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="explore-trending-scroll">
                            {loadingTrending ? (
                                <div style={{ padding: 24, color: '#64748b' }}>Loading...</div>
                            ) : filteredTrending.length === 0 ? (
                                <div style={{ padding: 24, color: '#64748b' }}>No trending events</div>
                            ) : (
                                filteredTrending.map((event, i) => {
                                    const typeInfo = TYPE_CONFIG[event.event_type] || { label: event.event_type, shape: '○' };
                                    return (
                                        <motion.div
                                            key={event.id || i}
                                            className="explore-trending-card"
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 + i * 0.1 }}
                                            onClick={() => navigate(`/event/${event.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="trending-image">
                                                <img src={event.cover_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]} alt={event.title} />
                                                <div className="trending-tag">{typeInfo.label}</div>
                                            </div>
                                            <div className="trending-info">
                                                <span className="trending-title">{event.title}</span>
                                                <span className="trending-views">
                                                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 0l1.5 3H8L5.5 5l1 3L4 6 1.5 8l1-3L0 3h2.5z" fill="#13ecc8" /></svg>
                                                    +{event.view_count || event.registration_count || 0} VIEWS
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    {/* Top Organizations */}
                    <section className="explore-section">
                        <h2 className="explore-section-title">TOP ORGANIZATIONS △</h2>
                        <div className="explore-orgs-grid">
                            {loadingOrgs ? (
                                <div style={{ padding: 24, color: '#64748b' }}>Loading...</div>
                            ) : orgs.length === 0 ? (
                                <div style={{ padding: 24, color: '#64748b' }}>No organizations</div>
                            ) : (
                                orgs.map((org, i) => (
                                    <motion.div
                                        key={org.id || i}
                                        className="explore-org-card"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 + i * 0.08 }}
                                    >
                                        <div className="org-avatar-wrap" onClick={() => navigate(`/org/${org.slug || org.id}`)} style={{ cursor: 'pointer' }}>
                                            <div className="org-avatar-hex">
                                                <img src={org.logo_url || `https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop`} alt={org.name} />
                                            </div>
                                        </div>
                                        <div className="org-name-row" onClick={() => navigate(`/org/${org.slug || org.id}`)} style={{ cursor: 'pointer' }}>
                                            <span className="org-name">{org.name}</span>
                                            {org.verified && (
                                                <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                                                    <path d="M7.5 0l2 4.5h5L10 7.5l1.5 5L7.5 10 3.5 12.5 5 7.5 .5 4.5h5z" fill="#13ecc8" />
                                                </svg>
                                            )}
                                        </div>
                                        <button
                                            className="org-follow-btn"
                                            onClick={() => toggleFollow(org.id)}
                                            style={following[org.id] ? { background: 'rgba(45,212,191,0.2)', borderColor: '#2dd4bf', color: '#2dd4bf' } : undefined}
                                        >
                                            {following[org.id] ? 'FOLLOWING ✓' : 'FOLLOW +'}
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}

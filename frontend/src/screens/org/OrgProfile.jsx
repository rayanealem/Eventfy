import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import './OrgProfile.css';

const TABS = ['EVENTS', 'ABOUT', 'POSTS'];

export default function OrgProfile() {
    const navigate = useNavigate();
    const { orgId } = useParams(); // Using orgId as slug

    const [org, setOrg] = useState(null);
    const [events, setEvents] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('EVENTS');

    const [isFollowing, setIsFollowing] = useState(false); // Optimistic UI
    const [isNotified, setIsNotified] = useState(false);

    useEffect(() => {
        if (orgId) {
            loadOrgData(orgId);
        }
    }, [orgId]);

    const loadOrgData = async (slug) => {
        setLoading(true);
        try {
            // Get Org Profile
            const res = await api.get(`/orgs/${slug}`);
            setOrg(res.data);

            // Get Events
            const eventRes = await api.get(`/orgs/${res.data.id}/events`);
            setEvents(eventRes.data || []);

            // Get Posts
            const postRes = await api.get(`/orgs/${res.data.id}/posts`);
            setPosts(postRes.data || []);

        } catch (error) {
            console.error("Failed to load org profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async () => {
        if (!org) return;
        try {
            if (isFollowing) {
                await api.delete(`/orgs/${org.id}/follow`);
                setOrg(o => ({ ...o, follower_count: Math.max(0, o.follower_count - 1) }));
                setIsFollowing(false);
            } else {
                await api.post(`/orgs/${org.id}/follow`);
                setOrg(o => ({ ...o, follower_count: o.follower_count + 1 }));
                setIsFollowing(true);
            }
        } catch (error) {
            console.error("Follow error", error);
        }
    };

    if (loading) {
        return <div style={{ color: 'var(--color-teal)', padding: '2rem' }}>LOADING PROFILE...</div>;
    }

    if (!org) {
        return <div style={{ color: 'var(--color-teal)', padding: '2rem' }}>ORGANIZATION NOT FOUND</div>;
    }

    const STATS = [
        { value: events.length.toString(), label: 'Events', shape: '○' },
        { value: org.total_attendees?.toString() || '0', label: 'Attendees', shape: '△' },
        { value: org.follower_count?.toString() || '0', label: 'Followers', shape: '□' },
    ];

    return (
        <div className="orgp-root">
            <div className="orgp-noise" />

            {/* Hero */}
            <div className="orgp-hero">
                <img src={org.cover_url || "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=512&fit=crop"} alt="" className="orgp-hero-img" />
                <div className="orgp-hero-gradient" />
                <div className="orgp-logo-overlap">
                    <div className="orgp-logo-box" style={{ backgroundImage: org.logo_url ? `url(${org.logo_url})` : 'none', backgroundSize: 'cover' }}>
                        {!org.logo_url && <span className="orgp-logo-icon">{org.name.substring(0, 2)}</span>}
                        {org.verified && (
                            <div className="orgp-verified-dot">
                                <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4l3 4 7-7" stroke="#0d0f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Header Info */}
            <div className="orgp-info">
                <h1 className="orgp-name">{org.name.toUpperCase()}</h1>
                <div className="orgp-meta">
                    <span className="orgp-type">{org.org_type.replace('_', ' ').toUpperCase()} △</span>
                    {org.city && (
                        <>
                            <span className="orgp-dot" />
                            <span className="orgp-location">{org.city.toUpperCase()}{org.wilaya ? `, ${org.wilaya}` : ''}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="orgp-actions">
                <button
                    className="orgp-follow-btn"
                    onClick={toggleFollow}
                    style={isFollowing ? { background: '#2dd4bf', borderColor: '#2dd4bf', color: '#000' } : undefined}
                >
                    {isFollowing ? 'FOLLOWING ✓' : 'FOLLOW +'}
                </button>
                <button
                    className="orgp-notify-btn"
                    onClick={() => setIsNotified(n => !n)}
                    style={isNotified ? { background: 'rgba(45,212,191,0.15)', borderColor: '#2dd4bf', color: '#2dd4bf' } : undefined}
                >
                    {isNotified ? 'NOTIFIED ✓' : 'NOTIFY ME □'}
                </button>
            </div>

            {/* Stats */}
            <div className="orgp-stats">
                {STATS.map((s, i) => (
                    <motion.div key={i} className="orgp-stat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <span className="orgp-stat-value">{s.value}</span>
                        <div className="orgp-stat-label-row">
                            <span className="orgp-stat-label">{s.label}</span>
                            <span className="orgp-stat-shape">{s.shape}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="orgp-tabs">
                {TABS.map((t) => (
                    <button key={t} className={`orgp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
            </div>

            {/* Events Tab */}
            {activeTab === 'EVENTS' && (
                <div className="orgp-events">
                    {events.length === 0 ? <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>NO EVENTS FOUND.</p> : events.map((e, i) => (
                        <motion.div key={e.id} className="orgp-event-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} onClick={() => navigate(`/event/${e.id}`)} style={{ cursor: 'pointer' }}>
                            <img src={e.cover_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop"} alt="" className="orgp-event-img" />
                            <div className="orgp-event-gradient" />
                            <div className="orgp-event-info">
                                <span className="orgp-event-date">{new Date(e.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                <span className="orgp-event-title">{e.title.toUpperCase()}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* About Tab */}
            {activeTab === 'ABOUT' && (
                <div style={{ padding: '1rem 1.5rem', color: 'var(--color-text)' }}>
                    <h3 style={{ color: 'var(--color-teal)', letterSpacing: '0.1em', marginBottom: '1rem' }}>ABOUT US △</h3>
                    <p style={{ lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{org.description || 'No description provided.'}</p>

                    {org.website && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 style={{ color: 'var(--color-teal)', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>LINK 🌐</h3>
                            <a href={org.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>{org.website}</a>
                        </div>
                    )}
                </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'POSTS' && (
                <div className="orgp-events">
                    {posts.length === 0 ? <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>NO POSTS FOUND.</p> : posts.map((p, i) => (
                        <motion.div key={p.id} className="orgp-review-card" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} style={{ marginBottom: '1rem' }}>
                            <div className="orgp-review-avatar">
                                <img src={org.logo_url || "https://i.pravatar.cc/40?img=3"} alt="" />
                            </div>
                            <div className="orgp-review-content">
                                <div className="orgp-review-meta">
                                    <span className="orgp-review-name">{org.name}</span>
                                    <span className="orgp-review-time">{new Date(p.published_at).toLocaleDateString()}</span>
                                </div>
                                <p className="orgp-review-text" style={{ margin: '0.5rem 0' }}>{p.content}</p>
                                {p.media_urls?.length > 0 && (
                                    <img src={p.media_urls[0]} alt="post media" style={{ width: '100%', borderRadius: '8px', marginTop: '0.5rem' }} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

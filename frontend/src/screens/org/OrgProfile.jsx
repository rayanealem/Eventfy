import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import './OrgProfile.css';

const TABS = ['EVENTS', 'ABOUT', 'POSTS'];

export default function OrgProfile() {
    const navigate = useNavigate();
    const { orgId } = useParams();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('EVENTS');
    const [isNotified, setIsNotified] = useState(false);

    // Fetch org profile
    const { data: org, isLoading, isError, refetch } = useQuery({
        queryKey: ['org', orgId],
        queryFn: () => api('GET', `/orgs/${orgId}`),
        enabled: !!orgId,
    });

    // Fetch org events
    const { data: eventsData } = useQuery({
        queryKey: ['org', orgId, 'events'],
        queryFn: () => api('GET', `/orgs/${org?.id || orgId}/events`),
        enabled: !!org,
    });

    // Fetch org posts
    const { data: postsData } = useQuery({
        queryKey: ['org', orgId, 'posts'],
        queryFn: () => api('GET', `/orgs/${org?.id || orgId}/posts`),
        enabled: !!org,
    });

    // Follow mutation with optimistic UI
    const followMutation = useMutation({
        mutationFn: () => org?.is_following
            ? api('DELETE', `/orgs/${org.id}/follow`)
            : api('POST', `/orgs/${org.id}/follow`),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['org', orgId] });
            const prev = queryClient.getQueryData(['org', orgId]);
            queryClient.setQueryData(['org', orgId], (old) => ({
                ...old,
                is_following: !old?.is_following,
                follower_count: old?.is_following
                    ? Math.max(0, (old?.follower_count || 0) - 1)
                    : (old?.follower_count || 0) + 1,
            }));
            return { prev };
        },
        onError: (err, vars, context) => {
            queryClient.setQueryData(['org', orgId], context.prev);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['org', orgId] });
        },
    });

    const events = Array.isArray(eventsData) ? eventsData : eventsData?.data || [];
    const posts = Array.isArray(postsData) ? postsData : postsData?.data || [];

    if (isLoading) {
        return (
            <div className="orgp-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                    <div style={{ width: '140px', height: '14px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                </div>
            </div>
        );
    }

    if (isError || !org) {
        return (
            <div className="orgp-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>△</span>
                <span style={{ color: '#ef4444', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>ORGANIZATION NOT FOUND</span>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>This organization may not exist.</span>
                <button onClick={() => refetch()} style={{ marginTop: '8px', padding: '10px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '12px', borderRadius: '8px', cursor: 'pointer' }}>RETRY</button>
            </div>
        );
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
                {/* Back button */}
                <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 5, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6l5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <div className="orgp-logo-overlap">
                    <div className="orgp-logo-box" style={{ backgroundImage: org.logo_url ? `url(${org.logo_url})` : 'none', backgroundSize: 'cover' }}>
                        {!org.logo_url && <span className="orgp-logo-icon">{org.name?.substring(0, 2)}</span>}
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
                <h1 className="orgp-name">{org.name?.toUpperCase()}</h1>
                <div className="orgp-meta">
                    <span className="orgp-type">{(org.org_type || '').replace('_', ' ').toUpperCase()} △</span>
                    {org.city && (
                        <>
                            <span className="orgp-dot" />
                            <span className="orgp-location">{org.city.toUpperCase()}{org.wilaya ? `, ${org.wilaya}` : ''}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="orgp-actions">
                <button
                    className="orgp-follow-btn"
                    onClick={() => followMutation.mutate()}
                    style={org.is_following ? { background: '#2dd4bf', borderColor: '#2dd4bf', color: '#000' } : undefined}
                >
                    {org.is_following ? 'FOLLOWING ✓' : 'FOLLOW +'}
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

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'EVENTS' && (
                    <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="orgp-events">
                        {events.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                                <span style={{ display: 'block', fontSize: '32px', marginBottom: '12px', opacity: 0.2 }}>○</span>
                                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>NO EVENTS YET</span>
                            </div>
                        ) : events.map((e, i) => (
                            <motion.div key={e.id} className="orgp-event-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} onClick={() => navigate(`/event/${e.id}`)} style={{ cursor: 'pointer' }}>
                                <img src={e.cover_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop"} alt="" className="orgp-event-img" />
                                <div className="orgp-event-gradient" />
                                <div className="orgp-event-info">
                                    <span className="orgp-event-date">{new Date(e.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</span>
                                    <span className="orgp-event-title">{e.title?.toUpperCase()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'ABOUT' && (
                    <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '24px' }}>
                        <h3 style={{ color: '#13ecc8', fontFamily: 'Bebas Neue', letterSpacing: '2px', marginBottom: '16px', fontSize: '18px' }}>ABOUT US △</h3>
                        <p style={{ lineHeight: 1.7, color: '#94a3b8', fontFamily: 'Space Grotesk', fontSize: '14px' }}>{org.description || 'No description provided.'}</p>
                        {org.website && (
                            <div style={{ marginTop: '24px' }}>
                                <h3 style={{ color: '#13ecc8', fontFamily: 'Bebas Neue', letterSpacing: '2px', marginBottom: '8px', fontSize: '16px' }}>LINK 🌐</h3>
                                <a href={org.website} target="_blank" rel="noreferrer" style={{ color: '#ffd700', textDecoration: 'none', fontFamily: 'DM Mono', fontSize: '12px' }}>{org.website}</a>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'POSTS' && (
                    <motion.div key="posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="orgp-events">
                        {posts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                                <span style={{ display: 'block', fontSize: '32px', marginBottom: '12px', opacity: 0.2 }}>□</span>
                                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>NO POSTS YET</span>
                            </div>
                        ) : posts.map((p, i) => (
                            <motion.div key={p.id} className="orgp-review-card" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} style={{ marginBottom: '16px' }}>
                                <div className="orgp-review-avatar">
                                    <img src={org.logo_url || "https://i.pravatar.cc/40?img=3"} alt="" />
                                </div>
                                <div className="orgp-review-content">
                                    <div className="orgp-review-meta">
                                        <span className="orgp-review-name">{org.name}</span>
                                        <span className="orgp-review-time">{new Date(p.published_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="orgp-review-text" style={{ margin: '8px 0' }}>{p.content}</p>
                                    {p.media_urls?.length > 0 && (
                                        <img src={p.media_urls[0]} alt="post media" style={{ width: '100%', borderRadius: '8px', marginTop: '8px' }} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

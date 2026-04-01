import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';
import './OrgProfile.css';

/* ─── SVG Icons ─── */
const IBack = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>;
const IShare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
const ICheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#0a0a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ILink = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
const IPin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IUsers = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
const IHeart = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IComment = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IEye = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const ICalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;

const TABS = [
    { key: 'upcoming', label: 'UPCOMING' },
    { key: 'past', label: 'PAST' },
    { key: 'posts', label: 'POSTS' },
];

function getCountdown(start) {
    const diff = new Date(start) - new Date();
    if (diff <= 0) return 'LIVE NOW';
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    if (d > 0) return `${d}D ${h}H`;
    const m = Math.floor((diff % 36e5) / 6e4);
    return `${h}H ${m}M`;
}

function formatNum(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ORG PROFILE V3 — LinkedIn × Professional
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function OrgProfile() {
    const navigate = useNavigate();
    const { orgId } = useParams();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('upcoming');
    const [isNotified, setIsNotified] = useState(false);
    const [aboutExpanded, setAboutExpanded] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);

    /* ─── Data ─── */
    const { data: org, isLoading, isError, refetch } = useQuery({
        queryKey: ['org', orgId],
        queryFn: () => api('GET', `/orgs/${orgId}`),
        enabled: !!orgId,
    });

    const { data: eventsRaw } = useQuery({
        queryKey: ['orgEvents', org?.id],
        queryFn: () => api('GET', `/orgs/${org.id}/events`),
        enabled: !!org?.id,
    });

    const { data: postsRaw } = useQuery({
        queryKey: ['orgPosts', org?.id],
        queryFn: () => api('GET', `/orgs/${org.id}/posts`),
        enabled: !!org?.id,
    });

    const { data: followersRaw } = useQuery({
        queryKey: ['orgFollowers', org?.id],
        queryFn: () => api('GET', `/orgs/${org.id}/followers`),
        enabled: showFollowers && !!org?.id,
    });

    /* ─── Follow ─── */
    const followMutation = useMutation({
        mutationFn: () => org?.is_following ? api('DELETE', `/orgs/${org.id}/follow`) : api('POST', `/orgs/${org.id}/follow`),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['org', orgId] });
            const prev = queryClient.getQueryData(['org', orgId]);
            queryClient.setQueryData(['org', orgId], old => ({
                ...old,
                is_following: !old?.is_following,
                follower_count: old?.is_following ? Math.max(0, (old?.follower_count || 0) - 1) : (old?.follower_count || 0) + 1,
            }));
            return { prev };
        },
        onError: (_, __, ctx) => queryClient.setQueryData(['org', orgId], ctx.prev),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['org', orgId] }),
    });

    /* ─── Derived ─── */
    const allEvents = Array.isArray(eventsRaw) ? eventsRaw : [];
    const now = new Date();
    const upcoming = allEvents.filter(e => new Date(e.starts_at) > now || e.status === 'live' || e.status === 'scheduled').sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
    const past = allEvents.filter(e => new Date(e.ends_at || e.starts_at) < now && e.status !== 'live').sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at));
    const posts = Array.isArray(postsRaw) ? postsRaw : [];
    const mediaPosts = posts.filter(p => p.media_urls?.length > 0);
    const textPosts = posts.filter(p => !p.media_urls?.length);
    const followers = Array.isArray(followersRaw) ? followersRaw : [];
    const totalAttendees = allEvents.reduce((sum, e) => sum + (e.registration_count || 0), 0);

    /* ─── Loading ─── */
    if (isLoading) {
        return (
            <div className="orgp-root">
                <div className="orgp-skeleton">
                    <div className="orgp-skel-cover" />
                    <div className="orgp-skel-logo" />
                    <div className="orgp-skel-bar w60" />
                    <div className="orgp-skel-bar w40" />
                    <div className="orgp-skel-metrics">
                        <div className="orgp-skel-metric" /><div className="orgp-skel-metric" /><div className="orgp-skel-metric" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !org) {
        return (
            <div className="orgp-root">
                <div className="orgp-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    <span className="orgp-error-title">Organization not found</span>
                    <button className="orgp-retry-btn" onClick={() => refetch()}>RETRY</button>
                    <button className="orgp-retry-btn" onClick={() => navigate(-1)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>GO BACK</button>
                </div>
            </div>
        );
    }

    return (
        <div className="orgp-root">

            {/* ===== COVER HERO ===== */}
            <div className="orgp-cover">
                <img src={org.cover_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=450&fit=crop'} alt="" />
                <div className="orgp-cover-fade" />
                <div className="orgp-cover-nav">
                    <button className="orgp-nav-pill" onClick={() => navigate(-1)}><IBack /></button>
                    <button className="orgp-nav-pill"><IShare /></button>
                </div>
            </div>

            {/* Logo Dock */}
            <div className="orgp-logo-dock">
                <div className={`orgp-logo-box ${org.verified ? 'verified' : ''}`}>
                    {org.logo_url
                        ? <img src={org.logo_url} alt={org.name} />
                        : <span className="orgp-logo-initials">{org.name?.substring(0, 2).toUpperCase()}</span>
                    }
                </div>
                {org.verified && (
                    <div className="orgp-verified-badge">
                        <ICheck />
                    </div>
                )}
            </div>

            {/* ===== ORG INFO ===== */}
            <section className="orgp-info">
                <h1 className="orgp-name">{org.name?.toUpperCase()}</h1>
                <div className="orgp-meta-row">
                    <span className="orgp-type-pill">{(org.org_type || '').replace('_', ' ').toUpperCase()}</span>
                    {org.city && (
                        <span className="orgp-loc"><IPin />{org.city.toUpperCase()}{org.wilaya ? `, W${org.wilaya}` : ''}</span>
                    )}
                    {org.founded_year && <span className="orgp-founded">EST. {org.founded_year}</span>}
                </div>
                {org.website && (
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="orgp-link">
                        <ILink />{org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                )}
            </section>

            {/* About */}
            {org.description && (
                <section className="orgp-about">
                    <div className={`orgp-about-text ${aboutExpanded ? '' : 'clamped'}`}>{org.description}</div>
                    {org.description.length > 120 && (
                        <button className="orgp-about-more" onClick={() => setAboutExpanded(!aboutExpanded)}>
                            {aboutExpanded ? 'Show less' : '...more'}
                        </button>
                    )}
                </section>
            )}

            {/* ===== ACTIONS ===== */}
            <div className="orgp-actions">
                <button
                    className={`orgp-btn-follow ${org.is_following ? 'following' : 'idle'}`}
                    onClick={() => { haptic(); followMutation.mutate(); }}
                >
                    {org.is_following ? '✓ Following' : 'Follow +'}
                </button>
                <button
                    className={`orgp-btn-notify ${isNotified ? 'on' : ''}`}
                    onClick={() => { haptic(); setIsNotified(n => !n); showToast(isNotified ? 'Notifications off' : 'Notifications on', 'success'); }}
                >
                    {isNotified ? '🔔' : '🔔'}
                </button>
            </div>

            {/* ===== METRICS ===== */}
            <div className="orgp-metrics">
                {[
                    { n: allEvents.length, l: 'Events', icon: <ICalendar /> },
                    { n: totalAttendees, l: 'Attendees', icon: <IUsers /> },
                    { n: org.follower_count || 0, l: 'Followers', icon: null, click: () => { haptic(); setShowFollowers(true); } },
                ].map((m, i) => (
                    <motion.div key={i} className="orgp-metric-card" onClick={m.click} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
                        <span className="orgp-metric-num">{formatNum(m.n)}</span>
                        <span className="orgp-metric-lbl">{m.l}</span>
                    </motion.div>
                ))}
            </div>

            {/* ===== TABS ===== */}
            <div className="orgp-tabs">
                {TABS.map(tab => (
                    <button key={tab.key} className={`orgp-tab ${activeTab === tab.key ? 'on' : ''}`} onClick={() => { haptic(); setActiveTab(tab.key); }}>
                        {tab.label}
                        {activeTab === tab.key && <motion.div className="orgp-tab-line" layoutId="orgpInd" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
                    </button>
                ))}
            </div>

            {/* ===== CONTENT ===== */}
            <AnimatePresence mode="wait">
                {activeTab === 'upcoming' && <motion.div key="u" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><UpcomingList events={upcoming} navigate={navigate} /></motion.div>}
                {activeTab === 'past' && <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PastList events={past} navigate={navigate} /></motion.div>}
                {activeTab === 'posts' && <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PostsTab media={mediaPosts} text={textPosts} org={org} /></motion.div>}
            </AnimatePresence>

            {/* ===== FOLLOWERS SHEET ===== */}
            <AnimatePresence>
                {showFollowers && (
                    <>
                        <motion.div className="orgp-sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFollowers(false)} />
                        <motion.div className="orgp-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
                            <div className="orgp-sheet-pill" />
                            <div className="orgp-sheet-head">
                                <h3 className="orgp-sheet-title">FOLLOWERS</h3>
                                <button className="orgp-sheet-x" onClick={() => setShowFollowers(false)}>✕</button>
                            </div>
                            <div className="orgp-sheet-list">
                                {followers.length > 0 ? followers.map((f, i) => {
                                    const pr = f.profiles || {};
                                    return (
                                        <div key={i} className="orgp-sheet-row" onClick={() => { setShowFollowers(false); navigate(`/profile/${pr.username}`); }}>
                                            <img src={pr.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${pr.username}`} alt="" />
                                            <div className="orgp-sheet-info"><span className="orgp-sheet-name">@{pr.username}</span><span className="orgp-sheet-sub">{pr.full_name || ''}</span></div>
                                        </div>
                                    );
                                }) : <div className="orgp-sheet-nil">No followers yet</div>}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


/* ━━━━ SUB-COMPONENTS ━━━━ */

function UpcomingList({ events, navigate }) {
    if (!events.length) return (
        <div className="orgp-empty">
            <div className="orgp-empty-icon"><ICalendar /></div>
            <span className="orgp-empty-title">No upcoming events</span>
            <span className="orgp-empty-sub">Check back soon for new events</span>
        </div>
    );
    return (
        <div className="orgp-upcoming">
            {events.map((ev, i) => {
                const reg = ev.registration_count || 0;
                const cap = ev.capacity || 0;
                const pct = cap > 0 ? Math.min(100, Math.round(reg / cap * 100)) : 0;
                const color = pct > 80 ? '#ef4444' : pct > 50 ? '#f97316' : '#00ffc2';
                const countdown = getCountdown(ev.starts_at);
                const isLive = countdown === 'LIVE NOW';
                return (
                    <motion.div key={ev.id} className="orgp-ev-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} onClick={() => navigate(`/event/${ev.id}`)}>
                        <div className="orgp-ev-cover">
                            <img src={ev.cover_url || `https://picsum.photos/seed/${ev.id}/600/300`} alt="" />
                            <div className="orgp-ev-cover-fade" />
                            <span className="orgp-ev-date-badge">
                                {new Date(ev.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                            </span>
                            <span className={`orgp-ev-countdown ${isLive ? 'live' : ''}`}>
                                {isLive && <span className="orgp-ev-live-dot" />}{countdown}
                            </span>
                        </div>
                        <div className="orgp-ev-body">
                            <div className="orgp-ev-title">{ev.title}</div>
                            <div className="orgp-ev-meta-row">
                                <span className="orgp-ev-type-tag">{ev.event_type?.toUpperCase() || 'EVENT'}</span>
                                {ev.venue_name && <span className="orgp-ev-venue"><IPin />{ev.venue_name}</span>}
                            </div>
                            {cap > 0 && (
                                <div className="orgp-cap">
                                    <div className="orgp-cap-row"><span className="orgp-cap-text">{reg}/{cap} spots</span><span className="orgp-cap-pct" style={{ color }}>{pct}%</span></div>
                                    <div className="orgp-cap-track"><motion.div className="orgp-cap-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ background: color }} /></div>
                                </div>
                            )}
                            <button className="orgp-register-btn" onClick={e => { e.stopPropagation(); navigate(`/event/${ev.id}/register`); }}>REGISTER NOW →</button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function PastList({ events, navigate }) {
    if (!events.length) return (
        <div className="orgp-empty">
            <div className="orgp-empty-icon"><ICalendar /></div>
            <span className="orgp-empty-title">No past events</span>
            <span className="orgp-empty-sub">Events will appear here after completion</span>
        </div>
    );
    return (
        <div className="orgp-past">
            {events.map((ev, i) => (
                <motion.div key={ev.id} className="orgp-past-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => navigate(`/event/${ev.id}`)}>
                    <div className="orgp-past-cover">
                        <img src={ev.cover_url || `https://picsum.photos/seed/${ev.id}/400/200`} alt="" loading="lazy" />
                        <div className="orgp-past-cover-fade" />
                        <span className="orgp-past-done">COMPLETED</span>
                    </div>
                    <div className="orgp-past-body">
                        <div className="orgp-past-date">{new Date(ev.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
                        <div className="orgp-past-title">{ev.title?.toUpperCase()}</div>
                        <div className="orgp-past-stats">
                            <span className="orgp-past-stat"><IUsers />{ev.registration_count || 0}</span>
                            <span className="orgp-past-stat"><IEye />{ev.view_count || 0}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function PostsTab({ media, text, org }) {
    if (!media.length && !text.length) return (
        <div className="orgp-empty">
            <div className="orgp-empty-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </div>
            <span className="orgp-empty-title">No posts yet</span>
            <span className="orgp-empty-sub">Official announcements will appear here</span>
        </div>
    );
    return (
        <>
            {media.length > 0 && (
                <div className="orgp-grid">
                    {media.map((p, i) => (
                        <motion.div key={p.id || i} className="orgp-grid-item" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}>
                            <img src={p.media_urls[0]} alt="" loading="lazy" />
                        </motion.div>
                    ))}
                </div>
            )}
            {text.map((p, i) => (
                <motion.div key={p.id || i} className="orgp-text-post" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                    <div className="orgp-text-head">
                        <img className="orgp-text-logo" src={org.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${org.slug}`} alt="" />
                        <div className="orgp-text-meta">
                            <span className="orgp-text-org-name">{org.name}</span>
                            <span className="orgp-text-time">{new Date(p.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        {p.post_type === 'announcement' && <span className="orgp-text-announce-tag">ANNOUNCE</span>}
                    </div>
                    <div className="orgp-text-content">{p.content}</div>
                    <div className="orgp-text-engagement">
                        <span className="orgp-text-stat"><IHeart />{p.like_count || 0}</span>
                        <span className="orgp-text-stat"><IComment />{p.comment_count || 0}</span>
                    </div>
                </motion.div>
            ))}
        </>
    );
}

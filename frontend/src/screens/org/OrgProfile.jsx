import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';
import './OrgProfile.css';

/* ─── SVG Icons ─── */
const IBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>;
const IShare = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
const ICheck = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4" stroke="#0a0a0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ILink = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
const IPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IUsers = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>;
const IHeart = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IComment = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IEye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const ICalendar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const ITrendUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ffc2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;

const TABS = [
    { key: 'upcoming', label: 'UPCOMING EVENTS' },
    { key: 'past', label: 'PAST PORTFOLIO' },
    { key: 'posts', label: 'ANNOUNCEMENTS' },
];

function getCountdown(start) {
    const diff = new Date(start) - new Date();
    if (diff <= 0) return 'LIVE NOW';
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    if (d > 0) return `${d}D ${h}H LEFT`;
    const m = Math.floor((diff % 36e5) / 6e4);
    return `${h}H ${m}M LEFT`;
}

function formatStat(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ORG PROFILE V4 — Bloomberg × LinkedIn
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
            haptic();
            return { prev };
        },
        onError: (_, __, ctx) => queryClient.setQueryData(['org', orgId], ctx.prev),
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['org', orgId] }),
        onSuccess: (_, variables, context) => {
            const isNowFollowing = !context.prev?.is_following;
            showToast(isNowFollowing ? 'Added to portfolio' : 'Removed from portfolio', 'success');
        }
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
                    <div className="orgp-skel-content">
                        <div className="orgp-skel-logo" />
                        <div className="orgp-skel-bar w60" style={{ marginTop: '20px' }} />
                        <div className="orgp-skel-bar w40" />
                        <div className="orgp-skel-metrics">
                            <div className="orgp-skel-metric" /><div className="orgp-skel-metric" /><div className="orgp-skel-metric" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !org) {
        return (
            <div className="orgp-root">
                <div className="orgp-error">
                    <div className="orgp-error-icon">404</div>
                    <span className="orgp-error-title">ENTITY NOT FOUND</span>
                    <button className="orgp-btn-primary" onClick={() => refetch()}>RELOAD DATA</button>
                    <button className="orgp-btn-secondary" onClick={() => navigate(-1)}>GO BACK</button>
                </div>
            </div>
        );
    }

    return (
        <div className="orgp-root">

            {/* ===== COVER HERO ===== */}
            <div className="orgp-cover">
                <img src={org.cover_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=450&fit=crop'} alt="" />
                <div className="orgp-cover-overlay">
                    {/* Grid texture for Bloomberg vibe */}
                    <div className="orgp-cover-grid" />
                </div>
                <div className="orgp-top-bar">
                    <button className="orgp-nav-btn" onClick={() => navigate(-1)}><IBack /></button>
                    <div className="orgp-ticker">
                        <span>{org.slug?.toUpperCase()}</span>
                        <span className="orgp-ticker-dot" />
                        <span>EST. {org.founded_year || '2024'}</span>
                    </div>
                    <button className="orgp-nav-btn"><IShare /></button>
                </div>
            </div>

            <div className="orgp-main-content">
                {/* ===== HEADER ROW ===== */}
                <div className="orgp-header-row">
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
                    
                    <div className="orgp-actions">
                        <button
                            className={`orgp-btn-action follower ${org.is_following ? 'active' : ''}`}
                            onClick={() => followMutation.mutate()}
                        >
                            {org.is_following ? 'TRACKING' : 'TRACK ENTITY'}
                        </button>
                        <button
                            className={`orgp-btn-action shadow-icon ${isNotified ? 'active' : ''}`}
                            onClick={() => { haptic(); setIsNotified(n => !n); }}
                        >
                            🔔
                        </button>
                    </div>
                </div>

                {/* ===== IDENTITY INFO ===== */}
                <section className="orgp-identity">
                    <h1 className="orgp-name">{org.name?.toUpperCase()}</h1>
                    <div className="orgp-badges">
                        <span className="orgp-badge type">{(org.org_type || '').replace('_', ' ').toUpperCase()}</span>
                        {org.city && <span className="orgp-badge loc"><IPin /> {org.city.toUpperCase()}</span>}
                        {org.verified && <span className="orgp-badge cert">VERIFIED OFFICIAL</span>}
                    </div>
                    {org.website && (
                        <a href={org.website} target="_blank" rel="noopener noreferrer" className="orgp-link">
                            <ILink /> MARKET LINK: {org.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        </a>
                    )}
                </section>

                {/* ===== METRICS DASHBOARD (Frosted Glass) ===== */}
                <section className="orgp-dashboard">
                    <div className="orgp-dashboard-glass">
                        <div className="orgp-dash-row">
                            <div className="orgp-dash-item" onClick={() => setShowFollowers(true)}>
                                <div className="orgp-dash-val">{formatStat(org.follower_count || 0)} <ITrendUp /></div>
                                <div className="orgp-dash-lbl">MARKET FOLLOWERS</div>
                            </div>
                            <div className="orgp-dash-divider" />
                            <div className="orgp-dash-item">
                                <div className="orgp-dash-val">{formatStat(allEvents.length)}</div>
                                <div className="orgp-dash-lbl">TOTAL OPERATIONS</div>
                            </div>
                            <div className="orgp-dash-divider" />
                            <div className="orgp-dash-item">
                                <div className="orgp-dash-val">{formatStat(totalAttendees)}</div>
                                <div className="orgp-dash-lbl">LIFETIME ATTENDANCE</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ===== EXECUTIVE SUMMARY ===== */}
                {org.description && (
                    <section className="orgp-about">
                        <h3 className="orgp-section-title">EXECUTIVE SUMMARY</h3>
                        <div className={`orgp-about-text ${aboutExpanded ? '' : 'clamped'}`}>{org.description}</div>
                        {org.description.length > 150 && (
                            <button className="orgp-about-more" onClick={() => setAboutExpanded(!aboutExpanded)}>
                                {aboutExpanded ? 'Collapse Data' : 'Expand Data ->'}
                            </button>
                        )}
                    </section>
                )}

                {/* ===== TABS ===== */}
                <div className="orgp-tabs">
                    {TABS.map(tab => (
                        <button key={tab.key} className={`orgp-tab ${activeTab === tab.key ? 'on' : ''}`} onClick={() => { haptic(); setActiveTab(tab.key); }}>
                            <span>{tab.label}</span>
                            {activeTab === tab.key && <motion.div className="orgp-tab-indicator" layoutId="orgpIndicator" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />}
                        </button>
                    ))}
                </div>

                {/* ===== TAB CONTENT ===== */}
                <div className="orgp-content-area">
                    <AnimatePresence mode="wait">
                        {activeTab === 'upcoming' && <motion.div key="u" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><UpcomingList events={upcoming} navigate={navigate} /></motion.div>}
                        {activeTab === 'past' && <motion.div key="p" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><PastList events={past} navigate={navigate} /></motion.div>}
                        {activeTab === 'posts' && <motion.div key="o" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}><PostsTab media={mediaPosts} text={textPosts} org={org} /></motion.div>}
                    </AnimatePresence>
                </div>
            </div>

            {/* ===== FOLLOWERS SHEET ===== */}
            <AnimatePresence>
                {showFollowers && (
                    <>
                        <motion.div className="orgp-sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFollowers(false)} />
                        <motion.div className="orgp-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }}>
                            <div className="orgp-sheet-handle" />
                            <div className="orgp-sheet-header">
                                <h3 className="orgp-sheet-title">PORTFOLIO TRACKERS</h3>
                                <button className="orgp-btn-icon-close" onClick={() => setShowFollowers(false)}>✕</button>
                            </div>
                            <div className="orgp-sheet-list">
                                {followers.length > 0 ? followers.map((f, i) => {
                                    const pr = f.profiles || {};
                                    return (
                                        <div key={i} className="orgp-sheet-row" onClick={() => { setShowFollowers(false); navigate(`/profile/${pr.username}`); }}>
                                            <div className="orgp-sheet-avatar">
                                                <img src={pr.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${pr.username}`} alt="" />
                                            </div>
                                            <div className="orgp-sheet-info">
                                                <span className="orgp-sheet-name">{pr.full_name || `@${pr.username}`}</span>
                                                <span className="orgp-sheet-sub">@{pr.username}</span>
                                            </div>
                                            <div className="orgp-sheet-arrow">→</div>
                                        </div>
                                    );
                                }) : <div className="orgp-empty-state">No active trackers found.</div>}
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
        <div className="orgp-empty-state">
            <div className="orgp-empty-icon"><ICalendar /></div>
            <span className="orgp-empty-head">NO ACTIVE OPERATIONS</span>
            <span className="orgp-empty-desc">Monitoring for new event listings.</span>
        </div>
    );
    return (
        <div className="orgp-ticket-list">
            {events.map((ev, i) => {
                const reg = ev.registration_count || 0;
                const cap = ev.capacity || 0;
                const pct = cap > 0 ? Math.min(100, Math.round(reg / cap * 100)) : 0;
                // Bloomberg color coding: Green (safe), Yellow (warning), Red (critical/sold out)
                const isFull = pct >= 100;
                const statusColor = isFull ? '#ff2d78' : (pct > 75 ? '#fbbf24' : '#00ffc2');
                const countdown = getCountdown(ev.starts_at);
                const isLive = countdown === 'LIVE NOW';
                
                return (
                    <motion.div key={ev.id} className="orgp-ticket-card" onClick={() => navigate(`/event/${ev.id}`)}>
                        <div className="orgp-ticket-top">
                            {/* Left Data */}
                            <div className="orgp-ticket-data">
                                <div className="orgp-ticket-date">{new Date(ev.starts_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</div>
                                <div className="orgp-ticket-title">{ev.title}</div>
                                <div className="orgp-ticket-meta">
                                    <span className="orgp-meta-box">{ev.event_type?.substring(0,3).toUpperCase() || 'EVT'}</span>
                                    {ev.venue_name && <span className="orgp-meta-text"><IPin /> {ev.venue_name.substring(0,18).toUpperCase()}</span>}
                                </div>
                            </div>
                            {/* Right Visual */}
                            <div className="orgp-ticket-visual">
                                <img src={ev.cover_url || `https://picsum.photos/seed/${ev.id}/200/200`} alt="" />
                                {isLive && <div className="orgp-live-pulse-ring"><div className="orgp-live-pulse-core" /></div>}
                            </div>
                        </div>

                        <div className="orgp-ticket-divider" />

                        {/* Capacity Bar (Bloomberg Terminals style metric) */}
                        <div className="orgp-ticket-capacity">
                            <div className="orgp-cap-labels">
                                <span className="orgp-cap-lbl">VOLUME: {reg}/{cap || '∞'}</span>
                                <span className="orgp-cap-val" style={{ color: statusColor }}>{pct}% CAPACITY</span>
                            </div>
                            <div className="orgp-cap-bar-bg">
                                <motion.div className="orgp-cap-bar-fill" style={{ background: statusColor }} initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }} />
                                {/* Overlay grid for terminal feel */}
                                <div className="orgp-cap-bar-grid" />
                            </div>
                        </div>

                        <button className={`orgp-ticket-cta ${isFull ? 'sold-out' : ''}`} onClick={(e) => { e.stopPropagation(); navigate(`/event/${ev.id}/register`); }}>
                            {isFull ? 'MARKET CLOSED (SOLD OUT)' : isLive ? 'JOIN LIVE OPERATION →' : 'ACQUIRE TICKET →'}
                        </button>
                    </motion.div>
                );
            })}
        </div>
    );
}

function PastList({ events, navigate }) {
    if (!events.length) return (
        <div className="orgp-empty-state">
            <div className="orgp-empty-icon"><ICalendar /></div>
            <span className="orgp-empty-head">NO PAST PORTFOLIO</span>
            <span className="orgp-empty-desc">History will populate post-event.</span>
        </div>
    );
    return (
        <div className="orgp-portfolio-grid">
            {events.map((ev, i) => (
                <motion.div key={ev.id} className="orgp-portfolio-item" onClick={() => navigate(`/event/${ev.id}`)}>
                    <div className="orgp-port-visual">
                        <img src={ev.cover_url || `https://picsum.photos/seed/${ev.id}/400/200`} alt="" loading="lazy" />
                        <div className="orgp-port-overlay">
                            <span className="orgp-port-badge tag-completed">CLSD</span>
                        </div>
                    </div>
                    <div className="orgp-port-data">
                        <div className="orgp-port-date">{new Date(ev.ends_at || ev.starts_at).toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' })}</div>
                        <div className="orgp-port-title">{ev.title?.toUpperCase()}</div>
                        <div className="orgp-port-metrics">
                            <div className="orgp-port-metric"><IUsers /> <span>{ev.registration_count || 0}</span></div>
                            <div className="orgp-port-metric"><IEye /> <span>{ev.view_count || 0}</span></div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function PostsTab({ media, text, org }) {
    if (!media.length && !text.length) return (
        <div className="orgp-empty-state">
            <div className="orgp-empty-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
            </div>
            <span className="orgp-empty-head">NO ANNOUNCEMENTS</span>
            <span className="orgp-empty-desc">System updates will appear here.</span>
        </div>
    );
    return (
        <div className="orgp-announcements">
            {/* Visual Media Grid if any */}
            {media.length > 0 && (
                <div className="orgp-media-grid">
                    {media.map((p, i) => (
                        <motion.div key={p.id || i} className="orgp-media-item">
                            <img src={p.media_urls[0]} alt="" loading="lazy" />
                        </motion.div>
                    ))}
                </div>
            )}
            
            {/* Text / Press Release Cards */}
            {text.map((p, i) => (
                <motion.div key={p.id || i} className="orgp-press-card">
                    <div className="orgp-press-head">
                        <img src={org.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${org.slug}`} alt="" className="orgp-press-logo" />
                        <div className="orgp-press-source">
                            <div className="orgp-press-org">{org.name?.toUpperCase()}</div>
                            <div className="orgp-press-time">
                                {new Date(p.published_at).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit' }).toUpperCase()}
                            </div>
                        </div>
                        {p.post_type === 'announcement' && <div className="orgp-press-tag">BULLETIN</div>}
                    </div>
                    <div className="orgp-press-body">
                        {p.content}
                    </div>
                    <div className="orgp-press-footer">
                        <div className="orgp-press-stat"><IHeart /> {p.like_count || 0} Vol</div>
                        <div className="orgp-press-stat"><IComment /> {p.comment_count || 0} Thread</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

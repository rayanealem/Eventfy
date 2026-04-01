import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';
import './PlayerProfile.css';

/* ─── SVG Icons (inline, no deps) ─── */
const IBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>;
const IMenu = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
const IDots = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;
const IVerified = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#00ffc2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const IGrid = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
const ICalendar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IBookmark = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>;
const IPin = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IUni = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" /></svg>;
const IEye = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IChat = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
const ICheck = () => <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
const IMulti = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.8"><rect x="4" y="4" width="12" height="12" rx="2" stroke="white" strokeWidth="1.5" fill="none" /><rect x="8" y="8" width="12" height="12" rx="2" fill="white" opacity="0.4" /></svg>;
const IStar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>;
const IBolt = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#00ffc2" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10" /></svg>;
const IAward = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></svg>;

const TABS = [
    { key: 'posts', icon: <IGrid />, label: 'POSTS' },
    { key: 'events', icon: <ICalendar />, label: 'EVENTS' },
    { key: 'saved', icon: <IBookmark />, label: 'SAVED' },
];

const TYPE_COLORS = { sport: '#f56e3d', science: '#fbbf24', charity: '#2dd4bf', cultural: '#a855f7', hackathon: '#3b82f6' };

function getLevelTitle(level) {
    const t = { 1: 'ROOKIE', 2: 'BEGINNER', 3: 'ACTIVE', 4: 'REGULAR', 5: 'RISING STAR', 6: 'WARRIOR', 7: 'VETERAN', 8: 'ELITE', 9: 'LEGENDARY', 10: 'SUPREME' };
    return t[level] || (level > 10 ? 'SUPREME' : 'UNKNOWN');
}

function formatCount(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PLAYER PROFILE V3 — Instagram × LinkedIn × RPG
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function PlayerProfile() {
    const navigate = useNavigate();
    const { username } = useParams();
    const { profile: myProfile } = useAuth();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('posts');
    const [sheetType, setSheetType] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [localFollowerDelta, setLocalFollowerDelta] = useState(0);
    const [connectionStatus, setConnectionStatus] = useState('none');
    const [bioExpanded, setBioExpanded] = useState(false);

    const isOwnProfile = !username || username === '@me' || username === myProfile?.username;
    const targetUsername = isOwnProfile ? myProfile?.username : username;

    /* ─── Data Queries ─── */
    const { data: profileData, isLoading, isError, refetch } = useQuery({
        queryKey: ['profile', targetUsername],
        queryFn: () => isOwnProfile ? api('GET', '/auth/me') : api('GET', `/users/${targetUsername}`),
        enabled: !!targetUsername,
        placeholderData: isOwnProfile ? myProfile : undefined,
    });

    const { data: passportData } = useQuery({
        queryKey: ['passport', targetUsername],
        queryFn: () => api('GET', `/users/${targetUsername}/passport`),
        enabled: !!targetUsername,
    });

    const { data: storiesData } = useQuery({
        queryKey: ['userStories', targetUsername],
        queryFn: () => api('GET', `/users/${targetUsername}/stories`),
        enabled: !!targetUsername,
    });

    const { data: highlightsData } = useQuery({
        queryKey: ['highlights', targetUsername],
        queryFn: () => api('GET', `/users/${targetUsername}/highlights`),
        enabled: !!targetUsername,
    });

    const { data: followersData, refetch: refetchFollowers } = useQuery({
        queryKey: ['followers', profileData?.id],
        queryFn: () => api('GET', `/users/followers/${profileData?.id}`),
        enabled: sheetType === 'followers' && !!profileData?.id,
    });

    const { data: followingData, refetch: refetchFollowing } = useQuery({
        queryKey: ['following', profileData?.id],
        queryFn: () => api('GET', `/users/following/${profileData?.id}`),
        enabled: sheetType === 'following' && !!profileData?.id,
    });

    const { data: connectionsData, refetch: refetchConnections } = useQuery({
        queryKey: ['connections'],
        queryFn: () => api('GET', '/users/me/connections'),
        enabled: sheetType === 'connections' && isOwnProfile,
    });

    // Derived profile
    const p = profileData || myProfile || {};
    const passport = passportData || {};
    const passportEvents = passport?.events_attended || [];
    const passportBadges = passport?.badges || [];
    const passportSkills = passport?.skills || [];
    const userStories = storiesData?.stories || [];
    const highlights = highlightsData?.highlights || [];

    // Computed
    const displayName = p.full_name || p.username || 'Player';
    const handle = `@${p.username || 'unknown'}`;
    const avatarUrl = p.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.username || 'user'}`;
    const xp = p.xp || 0;
    const level = p.level || 1;
    const followerCount = (p.follower_count || 0) + localFollowerDelta;
    const followingCount = p.following_count || 0;
    const connectionsCount = passport?.connections_count || 0;
    const bio = p.bio || '';
    const location = p.wilaya ? `Wilaya ${p.wilaya}` : p.city || '';
    const university = p.university || '';
    const levelTitle = getLevelTitle(level);
    const xpProgress = Math.min(100, Math.round((xp % 1000) / 10));
    const shapeColor = p.shape_color || '#00ffc2';
    const postsCount = p.story_count || userStories.length || 0;
    const eventCount = p.event_count || passportEvents.length || 0;
    const badgeCount = passportBadges.length;
    const certCount = passport?.certificate_count || 0;
    const hasActiveStory = userStories.length > 0;

    /* ─── Sync ─── */
    useEffect(() => {
        if (profileData?.is_following !== undefined) setIsFollowing(profileData.is_following);
    }, [profileData?.is_following]);

    useEffect(() => {
        if (!isOwnProfile && p.id) {
            api('GET', `/users/me/connection-status/${p.id}`)
                .then(d => setConnectionStatus(d.status || 'none'))
                .catch(() => setConnectionStatus('none'));
        }
    }, [isOwnProfile, p.id]);

    useEffect(() => {
        if (sheetType === 'followers') refetchFollowers();
        if (sheetType === 'following') refetchFollowing();
        if (sheetType === 'connections') refetchConnections();
    }, [sheetType]);

    /* ─── Mutations ─── */
    const toggleFollow = async () => {
        haptic();
        const was = isFollowing;
        setIsFollowing(!was);
        setLocalFollowerDelta(d => was ? d - 1 : d + 1);
        try {
            await api(was ? 'DELETE' : 'POST', `/users/follow/${p.id}`);
            showToast(was ? 'Unfollowed' : 'Following ✓', 'success');
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        } catch {
            setIsFollowing(was);
            setLocalFollowerDelta(d => was ? d + 1 : d - 1);
        }
    };

    const connectMutation = useMutation({
        mutationFn: () => api('POST', `/users/me/connections/${p.id}`),
        onMutate: () => setConnectionStatus('pending'),
        onSuccess: () => { showToast('Request sent', 'success'); haptic(); },
        onError: () => { setConnectionStatus('none'); },
    });

    /* ─── Loading ─── */
    if (isLoading && !p.username) {
        return (
            <div className="plp-root">
                <div className="plp-skeleton">
                    <div className="plp-skel-avatar" />
                    <div className="plp-skel-bar w60" />
                    <div className="plp-skel-bar w40" />
                    <div className="plp-skel-stats">
                        <div className="plp-skel-stat" /><div className="plp-skel-stat" /><div className="plp-skel-stat" />
                    </div>
                    <div className="plp-skel-bar w80" />
                    <div className="plp-skel-card" />
                </div>
            </div>
        );
    }

    if (isError && !isOwnProfile && !p.username) {
        return (
            <div className="plp-root">
                <div className="plp-error">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    <span className="plp-error-title">Player not found</span>
                    <button className="plp-retry-btn" onClick={() => refetch()}>RETRY</button>
                </div>
            </div>
        );
    }

    return (
        <div className="plp-root">

            {/* ===== TOP BAR ===== */}
            <header className="plp-topbar">
                <div className="plp-topbar-left">
                    {!isOwnProfile && <button className="plp-back-btn" onClick={() => navigate(-1)}><IBack /></button>}
                    <span className="plp-username-display">{p.username || 'PLAYER'}</span>
                    {p.verified && <span className="plp-verified-tick"><IVerified /></span>}
                </div>
                <div className="plp-topbar-right">
                    {isOwnProfile && <button className="plp-edit-btn" onClick={() => navigate('/profile/edit')}>Edit</button>}
                    <button className="plp-icon-btn" onClick={() => navigate(isOwnProfile ? '/settings' : '#')}>
                        {isOwnProfile ? <IMenu /> : <IDots />}
                    </button>
                </div>
            </header>

            {/* ===== HERO — Avatar + Stats ===== */}
            <section className="plp-hero">
                <motion.div
                    className="plp-avatar-frame"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div className={`plp-avatar-ring ${hasActiveStory ? 'has-story' : ''}`} style={{ '--ring-c1': shapeColor, '--ring-c2': '#ff2d78' }}>
                        <div className="plp-avatar-circle">
                            <img src={avatarUrl} alt="" />
                        </div>
                    </div>
                    <div className="plp-level-dot" style={{ borderColor: shapeColor, background: `linear-gradient(135deg, ${shapeColor}22, #0a0a0f)` }}>
                        <span>{level}</span>
                    </div>
                </motion.div>

                <div className="plp-stats">
                    {[
                        { n: postsCount, l: 'Posts' },
                        { n: followerCount, l: 'Followers', click: () => { haptic(); setSheetType('followers'); } },
                        { n: followingCount, l: 'Following', click: () => { haptic(); setSheetType('following'); } },
                        ...(isOwnProfile ? [{ n: connectionsCount, l: 'Connects', click: () => { haptic(); setSheetType('connections'); } }] : []),
                    ].map((s, i) => (
                        <motion.div key={i} className="plp-stat" onClick={s.click} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.05 }}>
                            <span className="plp-stat-num">{formatCount(s.n)}</span>
                            <span className="plp-stat-lbl">{s.l}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ===== IDENTITY ===== */}
            <section className="plp-identity">
                <div className="plp-name-row">
                    <span className="plp-fullname">{displayName}</span>
                    <span className="plp-rank-pill"><span className="plp-rank-gem">◇</span>{levelTitle}</span>
                </div>
                <div className="plp-handle">{handle}</div>
                {bio && (
                    <div className={`plp-bio ${!bioExpanded && bio.length > 120 ? 'clamped' : ''}`} onClick={() => bio.length > 120 && setBioExpanded(!bioExpanded)}>
                        {bio}
                        {!bioExpanded && bio.length > 120 && <span className="plp-bio-more"> ...more</span>}
                    </div>
                )}
                {(location || university) && (
                    <div className="plp-meta-chips">
                        {location && <span className="plp-chip"><IPin />{location}</span>}
                        {university && <span className="plp-chip"><IUni />{university}</span>}
                    </div>
                )}
                {/* Skills Carousel */}
                {passportSkills.length > 0 && (
                    <div className="plp-skills-row">
                        {passportSkills.slice(0, 6).map((s, i) => (
                            <span key={s.skill_id || i} className="plp-skill-chip">
                                {s.skills?.name || 'Skill'}
                                {s.verified && <ICheck />}
                            </span>
                        ))}
                        {passportSkills.length > 6 && <span className="plp-skill-chip plp-skill-more">+{passportSkills.length - 6}</span>}
                    </div>
                )}
            </section>

            {/* ===== PLAYER PASSPORT CARD ===== */}
            <section className="plp-passport-section">
                <motion.div
                    className="plp-passport-card"
                    onClick={() => { haptic(); navigate(`/passport/${p.username}`); }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{ '--accent': shapeColor }}
                >
                    <div className="plp-pass-left">
                        <div className="plp-pass-level-ring">
                            <svg viewBox="0 0 36 36" className="plp-pass-ring-svg">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2.5" />
                                <motion.circle
                                    cx="18" cy="18" r="15.9"
                                    fill="none" stroke={shapeColor} strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeDasharray={`${xpProgress}, 100`}
                                    initial={{ strokeDasharray: '0, 100' }}
                                    animate={{ strokeDasharray: `${xpProgress}, 100` }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                            <span className="plp-pass-level-num">{level}</span>
                        </div>
                        <div className="plp-pass-info">
                            <span className="plp-pass-title">{levelTitle}</span>
                            <span className="plp-pass-xp">{xp.toLocaleString()} XP</span>
                            <span className="plp-pass-next">{xpProgress}% → LV.{String(level + 1).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="plp-pass-right">
                        <div className="plp-pass-stat"><IStar /><span>{badgeCount}</span></div>
                        <div className="plp-pass-stat"><IBolt /><span>{eventCount}</span></div>
                        <div className="plp-pass-stat"><IAward /><span>{certCount}</span></div>
                    </div>
                    <div className="plp-pass-cta">
                        <span>VIEW PASSPORT</span><IArrow />
                    </div>
                </motion.div>
            </section>

            {/* ===== STORY HIGHLIGHTS (Instagram-style circles) ===== */}
            {highlights.length > 0 && (
                <section className="plp-highlights">
                    <div className="plp-highlights-scroll">
                        {highlights.map((h, i) => {
                            const frames = h.story_frames || [];
                            const thumb = frames[0]?.thumbnail_url || frames[0]?.media_url || `https://picsum.photos/seed/${h.id}/100`;
                            return (
                                <motion.div key={h.id || i} className="plp-hl-item" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}>
                                    <div className="plp-hl-circle">
                                        <img src={thumb} alt="" />
                                    </div>
                                    <span className="plp-hl-label">{h.caption || 'Highlight'}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ===== BADGE CAROUSEL ===== */}
            {passportBadges.length > 0 && (
                <section className="plp-badges">
                    <div className="plp-badges-head">
                        <span className="plp-badges-title">Badges</span>
                        <span className="plp-badges-count">{passportBadges.length}</span>
                    </div>
                    <div className="plp-badges-scroll">
                        {passportBadges.slice(0, 10).map((badge, i) => (
                            <motion.div key={badge.id || i} className="plp-badge-cell" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.04 }}>
                                <div className="plp-badge-hex">{badge.icon || badge.badges?.icon || '🏆'}</div>
                                <span className="plp-badge-label">{badge.name || badge.badge_name || badge.badges?.name || 'Badge'}</span>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ===== ACTIONS — other profiles ===== */}
            {!isOwnProfile && (
                <div className="plp-actions">
                    <button className={`plp-act-follow ${isFollowing ? 'active' : 'idle'}`} onClick={toggleFollow}>
                        {isFollowing ? '✓ Following' : 'Follow'}
                    </button>
                    <button className={`plp-act-connect ${connectionStatus}`} onClick={() => { if (connectionStatus === 'none') connectMutation.mutate(); }} disabled={connectionStatus !== 'none'}>
                        {connectionStatus === 'accepted' ? '✓ Connected' : connectionStatus === 'pending' ? 'Requested' : 'Connect'}
                    </button>
                    <button className="plp-act-dm" onClick={() => { haptic(); navigate(`/chat?dm=${p.id}`); }}>
                        <IChat />
                    </button>
                </div>
            )}

            {/* ===== TABS ===== */}
            <div className="plp-tabs">
                {TABS.map(tab => (
                    <button key={tab.key} className={`plp-tab ${activeTab === tab.key ? 'on' : ''}`} onClick={() => { haptic(); setActiveTab(tab.key); }}>
                        {tab.icon}
                        {activeTab === tab.key && <motion.div className="plp-tab-bar" layoutId="plpInd" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
                    </button>
                ))}
            </div>

            {/* ===== CONTENT ===== */}
            <AnimatePresence mode="wait">
                {activeTab === 'posts' && <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PostsGrid stories={userStories} /></motion.div>}
                {activeTab === 'events' && <motion.div key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><EventHistory events={passportEvents} certificates={passport?.certificates || []} navigate={navigate} /></motion.div>}
                {activeTab === 'saved' && <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SavedTab isOwn={isOwnProfile} navigate={navigate} /></motion.div>}
            </AnimatePresence>

            {/* ===== SHEET ===== */}
            <AnimatePresence>
                {sheetType && (
                    <>
                        <motion.div className="plp-sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheetType(null)} />
                        <motion.div className="plp-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}>
                            <div className="plp-sheet-pill" />
                            <div className="plp-sheet-head">
                                <h3 className="plp-sheet-title">{sheetType.toUpperCase()}</h3>
                                <button className="plp-sheet-x" onClick={() => setSheetType(null)}>✕</button>
                            </div>
                            <div className="plp-sheet-list">
                                <SheetContent type={sheetType} followers={followersData} following={followingData} connections={connectionsData} isOwn={isOwnProfile} username={p.username} navigate={navigate} close={() => setSheetType(null)} />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}


/* ━━━━ SUB-COMPONENTS ━━━━ */

function PostsGrid({ stories }) {
    if (!stories?.length) {
        return (
            <div className="plp-empty">
                <div className="plp-empty-icon"><IGrid /></div>
                <span className="plp-empty-title">No posts yet</span>
                <span className="plp-empty-sub">Share your first story to see it here</span>
            </div>
        );
    }
    return (
        <div className="plp-grid">
            {stories.map((story, i) => {
                const frames = story.story_frames || [];
                const f0 = [...frames].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0];
                const src = f0?.thumbnail_url || f0?.media_url || `https://picsum.photos/seed/${story.id || i}/300`;
                const isVideo = f0?.media_type === 'video';
                return (
                    <motion.div key={story.id || i} className="plp-grid-item" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02 }}>
                        <img src={src} alt="" loading="lazy" />
                        <div className="plp-grid-overlay">
                            <span className="plp-grid-ov-stat"><IEye />{story.view_count || 0}</span>
                        </div>
                        {frames.length > 1 && <div className="plp-grid-multi"><IMulti /></div>}
                        {isVideo && <div className="plp-grid-reel">▶</div>}
                    </motion.div>
                );
            })}
        </div>
    );
}

function EventHistory({ events, certificates, navigate }) {
    if (!events?.length) {
        return (
            <div className="plp-empty">
                <div className="plp-empty-icon"><ICalendar /></div>
                <span className="plp-empty-title">No event credentials</span>
                <span className="plp-empty-sub">Attend events to build your experience</span>
            </div>
        );
    }

    // Group by year
    const sorted = [...events].sort((a, b) => new Date(b.events?.starts_at || b.registered_at || 0) - new Date(a.events?.starts_at || a.registered_at || 0));
    const yearGroups = {};
    sorted.forEach(e => {
        const year = new Date(e.events?.starts_at || e.registered_at || 0).getFullYear();
        if (!yearGroups[year]) yearGroups[year] = [];
        yearGroups[year].push(e);
    });

    return (
        <div className="plp-events">
            {Object.keys(yearGroups).sort((a, b) => b - a).map(year => (
                <div key={year} className="plp-ev-year-group">
                    <div className="plp-ev-year-label">{year}</div>
                    {yearGroups[year].map((e, i) => {
                        const ev = e.events || {};
                        const type = ev.event_type || 'sport';
                        const cover = ev.cover_url || `https://picsum.photos/seed/${e.event_id || i}/200`;
                        const date = ev.starts_at || e.registered_at;
                        const hasCert = certificates?.some(c => c.event_id === e.event_id);
                        return (
                            <motion.div key={e.id || i} className="plp-cred-card" initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} onClick={() => e.event_id && navigate(`/event/${e.event_id}`)}>
                                <img className="plp-cred-cover" src={cover} alt="" loading="lazy" />
                                <div className="plp-cred-body">
                                    <div className="plp-cred-date">
                                        {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'TBD'}
                                    </div>
                                    <div className="plp-cred-title">{(ev.title || 'Event').toUpperCase()}</div>
                                    <div className="plp-cred-tags">
                                        <span className="plp-cred-type" style={{ color: TYPE_COLORS[type] || '#94a3b8', borderColor: `${TYPE_COLORS[type] || '#94a3b8'}33` }}>{type.toUpperCase()}</span>
                                        {e.checked_in && <span className="plp-cred-checked"><ICheck />ATTENDED</span>}
                                        {hasCert && <span className="plp-cred-cert"><IAward />CERT</span>}
                                    </div>
                                </div>
                                <div className="plp-cred-arrow"><IArrow /></div>
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function SavedTab({ isOwn, navigate }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOwn) { setLoading(false); return; }
        api('GET', `/events/me/saved?_t=${Date.now()}`).then(d => setEvents(d.events || [])).catch(() => { }).finally(() => setLoading(false));
    }, [isOwn]);

    if (!isOwn) return (
        <div className="plp-empty">
            <div className="plp-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="9" y1="10" x2="15" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /></svg>
            </div>
            <span className="plp-empty-title">Private</span>
            <span className="plp-empty-sub">Saved events are only visible to the owner</span>
        </div>
    );
    if (loading) return <div className="plp-spinner"><div className="plp-spin-ring" /></div>;
    if (!events.length) return (
        <div className="plp-empty">
            <div className="plp-empty-icon"><IBookmark /></div>
            <span className="plp-empty-title">No saved events</span>
            <span className="plp-empty-sub">Bookmark events to find them here</span>
        </div>
    );

    return (
        <div className="plp-saved">
            {events.map((ev, i) => {
                const startsAt = ev.starts_at ? new Date(ev.starts_at) : null;
                const isFuture = startsAt && startsAt > new Date();
                return (
                    <motion.div key={ev.id || i} className={`plp-saved-card ${isFuture ? 'upcoming' : ''}`} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} onClick={() => navigate(`/event/${ev.id}`)}>
                        <img className="plp-saved-thumb" src={ev.cover_url || `https://picsum.photos/seed/${ev.id}/400/300`} alt="" loading="lazy" />
                        <div className="plp-saved-pin">
                            <svg width="10" height="12" viewBox="0 0 24 24" fill="white"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <div className="plp-saved-body">
                            <div className="plp-saved-date">{startsAt ? startsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() : 'TBD'}</div>
                            <div className="plp-saved-name">{ev.title?.toUpperCase() || 'EVENT'}</div>
                            {isFuture && <span className="plp-saved-soon">UPCOMING</span>}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function SheetContent({ type, followers, following, connections, isOwn, username, navigate, close }) {
    const renderUser = (u, i) => (
        <div key={i} className="plp-sheet-row" onClick={() => { close(); navigate(`/profile/${u.username}`); }}>
            <img src={u.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.username}`} alt="" />
            <div className="plp-sheet-info">
                <span className="plp-sheet-name">@{u.username}</span>
                <span className="plp-sheet-sub">{u.full_name || ''}</span>
            </div>
        </div>
    );

    if (type === 'followers') {
        const list = followers?.followers || [];
        return list.length > 0 ? list.map(renderUser) : <div className="plp-sheet-nil">{isOwn ? 'No followers yet' : `@${username} has no followers`}</div>;
    }
    if (type === 'following') {
        const list = following?.following || [];
        return list.length > 0 ? list.map(renderUser) : <div className="plp-sheet-nil">{isOwn ? 'Not following anyone' : `@${username} isn't following anyone`}</div>;
    }
    if (type === 'connections') {
        if (!isOwn) return <div className="plp-sheet-nil">Connections are private</div>;
        const list = Array.isArray(connections) ? connections : connections?.connections || [];
        return list.length > 0 ? list.map((c, i) => (
            <div key={i} className="plp-sheet-row" onClick={() => { close(); navigate(`/profile/${c.username}`); }}>
                <img src={c.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${c.username}`} alt="" />
                <div className="plp-sheet-info"><span className="plp-sheet-name">@{c.username}</span><span className="plp-sheet-sub">{c.status || 'Connected'}</span></div>
            </div>
        )) : <div className="plp-sheet-nil">No connections yet</div>;
    }
    return null;
}

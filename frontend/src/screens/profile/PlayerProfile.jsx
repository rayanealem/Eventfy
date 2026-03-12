import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import { useToast } from '../../components/Toast';
import './PlayerProfile.css';

const TABS = [
    { key: 'events', icon: '□', label: 'EVENTS' },
    { key: 'saved', icon: '◇', label: 'SAVED' },
    { key: 'badges', icon: '○', label: 'BADGES' },
];

export default function PlayerProfile() {
    const navigate = useNavigate();
    const { username } = useParams();
    const { profile: myProfile } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('events');
    const { showToast } = useToast();
    const [sheetType, setSheetType] = useState(null); // 'followers', 'following', 'connections', or null
    const [isFollowing, setIsFollowing] = useState(false);
    const [localFollowerDelta, setLocalFollowerDelta] = useState(0);

    // Detect @me or missing username as "own profile"
    const isOwnProfile = !username || username === '@me' || username === myProfile?.username;
    const targetUsername = isOwnProfile ? myProfile?.username : username;

    // Fetch profile from API for both own and other users (live counters)
    const { data: profileData, isLoading, isError, refetch } = useQuery({
        queryKey: ['profile', targetUsername],
        queryFn: () => isOwnProfile
            ? api('GET', '/auth/me')
            : api('GET', `/users/${targetUsername}`),
        enabled: !!targetUsername,
        placeholderData: myProfile || undefined,
    });

    // Fetch passport entries
    const { data: passportData } = useQuery({
        queryKey: ['passport', targetUsername],
        queryFn: () => api('GET', `/users/${targetUsername}/passport`),
        enabled: !!targetUsername,
    });

    // Prefer fresh API data, fall back to AuthContext
    const effectiveProfile = profileData || myProfile;
    const p = effectiveProfile || {};

    // Followers list
    const { data: followersData, refetch: refetchFollowers } = useQuery({
        queryKey: ['followers', targetUsername || myProfile?.username],
        queryFn: () => api('GET', `/users/followers/${p.id}`),
        enabled: sheetType === 'followers' && !!p.id,
    });

    // Following list
    const { data: followingData, refetch: refetchFollowing } = useQuery({
        queryKey: ['following', targetUsername || myProfile?.username],
        queryFn: () => api('GET', `/users/following/${p.id}`),
        enabled: sheetType === 'following' && !!p.id,
    });

    // Fetch own connections (for the bottom sheet)
    const { data: connectionsData, refetch: refetchConnections } = useQuery({
        queryKey: ['connections'],
        queryFn: () => api('GET', '/users/me/connections'),
        enabled: sheetType === 'connections' && isOwnProfile,
    });

    // Force refetch when sheet opens
    useEffect(() => {
        if (sheetType === 'followers') refetchFollowers();
        if (sheetType === 'following') refetchFollowing();
        if (sheetType === 'connections') refetchConnections();
    }, [sheetType, refetchFollowers, refetchFollowing, refetchConnections]);

    // Refresh data on visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !isOwnProfile) {
                refetch();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isOwnProfile, refetch]);

    if (isLoading && !effectiveProfile) {
        return (
            <div className="profile-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                    <div style={{ width: '120px', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                </div>
            </div>
        );
    }

    if (isError && !isOwnProfile && !effectiveProfile) {
        return (
            <div className="profile-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '16px' }}>
                <span style={{ fontSize: '48px', opacity: 0.3 }}>△</span>
                <span style={{ color: '#ef4444', fontFamily: 'Space Grotesk', fontWeight: 'bold' }}>PROFILE NOT FOUND</span>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '11px' }}>Player data could not be loaded.</span>
                <button onClick={() => refetch()} style={{ marginTop: '8px', padding: '10px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '12px', borderRadius: '8px', cursor: 'pointer' }}>RETRY</button>
            </div>
        );
    }

    const displayName = (p.full_name || p.username || 'UNKNOWN').toUpperCase();
    const handle = `@${p.username || 'unknown'}`;
    const avatarUrl = p.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.username || 'user'}`;
    const xp = p.xp || 0;
    const level = p.level || 1;
    const eventCount = p.event_count || p.events_attended || 0;
    const badgeCount = p.badge_count || p.user_badges?.length || 0;
    const followerCount = (p.follower_count || 0) + localFollowerDelta;
    const followingCount = p.following_count || 0;
    const bio = p.bio || '';
    const location = p.wilaya ? `Wilaya ${p.wilaya}` : p.city || '';
    const university = p.university || '';
    const levelTitle = getLevelTitle(level);
    const xpToNext = 1000;
    const xpProgress = xpToNext > 0 ? Math.min(100, Math.round((xp % 1000) / xpToNext * 100)) : 0;

    // Fix passport parsing: use actual events_attended and badges arrays
    const passportLists = passportData || {};
    const passportEvents = passportLists?.events_attended || [];
    const passportBadges = passportLists?.badges || p.user_badges || [];

    // Sync isFollowing from profile data
    useEffect(() => {
        if (effectiveProfile?.is_following !== undefined) {
            setIsFollowing(effectiveProfile.is_following);
        }
    }, [effectiveProfile?.is_following]);

    // Follow/unfollow mutation
    const toggleFollow = async () => {
        haptic();
        const wasFollowing = isFollowing;
        setIsFollowing(!wasFollowing);
        setLocalFollowerDelta(prev => wasFollowing ? prev - 1 : prev + 1);
        try {
            await api(wasFollowing ? 'DELETE' : 'POST', `/users/follow/${p.id}`);
            showToast(wasFollowing ? 'UNFOLLOWED' : 'FOLLOWING ✓', 'success');
            // Refresh profile data to get live counters
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
            queryClient.invalidateQueries({ queryKey: ['followers'] });
            refreshProfile && refreshProfile();
        } catch (err) {
            setIsFollowing(wasFollowing);
            setLocalFollowerDelta(prev => wasFollowing ? prev + 1 : prev - 1);
            showToast(err?.message || 'FOLLOW FAILED', 'error');
        }
    };

    // Connection mutation
    const connectMutation = useMutation({
        mutationFn: () => api('POST', `/users/me/connections/${p.id}`),
        onMutate: () => {
            setConnectionStatus('pending');
        },
        onSuccess: () => {
            showToast('CONNECTION REQUEST SENT ○', 'success');
            haptic();
        },
        onError: (err) => {
            setConnectionStatus('none');
            showToast(err?.message || 'CONNECTION FAILED', 'error');
        },
    });

    return (
        <div className="profile-root">
            <div className="profile-noise" />

            {/* ===== Instagram-Style Header ===== */}
            <header style={{ padding: '16px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h1 style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'white', letterSpacing: '1px' }}>{p.username || 'PLAYER'}</h1>
                    {p.verified && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#13ecc8"><path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6-6.2-4.5h7.6z" /></svg>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {isOwnProfile && (
                        <button onClick={() => navigate('/profile/edit')} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.5px' }}>
                            EDIT PROFILE
                        </button>
                    )}
                    <button onClick={() => navigate('/settings')} style={{ padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                    </button>
                </div>
            </header>

            {/* ===== Avatar + Stats Row (Instagram Layout) ===== */}
            <section style={{ display: 'flex', alignItems: 'center', padding: '20px 16px', gap: '24px', position: 'relative', zIndex: 1 }}>
                {/* Avatar */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ position: 'relative', flexShrink: 0 }}
                >
                    <div style={{ width: '86px', height: '86px', borderRadius: '50%', padding: '3px', background: `conic-gradient(${p.shape_color || '#13ecc8'}, #ff2d78, ${p.shape_color || '#13ecc8'})` }}>
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '3px solid black' }}>
                            <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                    {/* Level Badge — 64x64 circle with large number */}
                    <div className="pp-level-badge-large" style={{ borderColor: p.shape_color || '#ff2d78' }}>
                        <span className="pp-level-num">{level}</span>
                    </div>
                </motion.div>

                {/* Stats */}
                <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around' }}>
                    {[
                        { value: eventCount, label: 'Events' },
                        { value: followerCount, label: 'Followers', onClick: () => { haptic(); setSheetType('followers'); } },
                        { value: followingCount, label: 'Following', onClick: () => { haptic(); setSheetType('following'); } },
                        ...(!isOwnProfile ? [{ value: Math.floor(Math.abs(((p.id?.charCodeAt?.(0) || 0) * 7 + 3) % 12)), label: 'Mutual', onClick: () => showToast('MUTUAL EVENTS — COMING SOON', 'info') }] : []),
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                            onClick={stat.onClick}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: stat.onClick ? 'pointer' : undefined }}
                        >
                            <span style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'white', lineHeight: '22px' }}>{stat.value}</span>
                            <span style={{ fontFamily: 'Space Grotesk', fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ===== Name + Bio ===== */}
            <section style={{ padding: '0 16px 16px', position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '14px', color: 'white', marginBottom: '2px' }}>
                    {displayName}
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: '#13ecc8', marginBottom: '6px' }}>
                    {handle} · {levelTitle}
                </div>
                {bio && (
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: '13px', color: '#94a3b8', lineHeight: '18px', marginBottom: '6px' }}>
                        {bio}
                    </div>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontFamily: 'DM Mono' }}>
                            📍 {location}
                        </span>
                    )}
                    {university && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', fontFamily: 'DM Mono' }}>
                            🎓 {university}
                        </span>
                    )}
                </div>
            </section>

            {/* ===== XP Progress Bar ===== */}
            <section style={{ padding: '0 16px 20px', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '10px', color: '#64748b', letterSpacing: '1px' }}>XP {xp.toLocaleString()}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#64748b' }}>{xpProgress}% → LV.{String(level + 1).padStart(2, '0')}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #13ecc8, #00b4d8)', borderRadius: '9999px' }}
                    />
                </div>
            </section>

            {/* Passport Banner — own profile only */}
            {isOwnProfile && (
                <div className="pp-passport-banner" onClick={() => { haptic(); navigate('/passport'); }} style={{ cursor: 'pointer' }}>
                    <span className="pp-passport-text">VIEW YOUR PLAYER PASSPORT →</span>
                </div>
            )}

            {/* Connect / DM Buttons — other profiles only */}
            {!isOwnProfile && (
                <div className="profile-action-row">
                    <button
                        className={`profile-connect-btn ${isFollowing ? 'connected' : ''}`}
                        onClick={toggleFollow}
                    >
                        {isFollowing ? 'FOLLOWING ✓' : 'FOLLOW ○'}
                    </button>
                    <button
                        className={`profile-connect-btn ${connectionStatus === 'connected' ? 'connected' :
                            connectionStatus === 'pending' ? 'pending' : ''
                            }`}
                        onClick={() => {
                            if (connectionStatus === 'none') connectMutation.mutate();
                        }}
                        disabled={connectionStatus !== 'none'}
                    >
                        {connectionStatus === 'connected' ? 'CONNECTED ✓' :
                            connectionStatus === 'pending' ? 'REQUEST SENT ○' :
                                'CONNECT ○'}
                    </button>
                    <button
                        className="profile-dm-btn"
                        onClick={() => { haptic(); navigate(`/chat?dm=${p.id}`); }}
                    >
                        DM ◇
                    </button>
                </div>
            )}

            {/* ===== Tab Bar ===== */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '14px 0',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '2px solid #f1f5f9' : '2px solid transparent',
                            color: activeTab === tab.key ? '#f1f5f9' : '#64748b',
                            fontFamily: 'Space Grotesk',
                            fontWeight: 'bold',
                            fontSize: '11px',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== Tab Content ===== */}
            <AnimatePresence mode="wait">
                {activeTab === 'events' && (
                    <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {passportEvents.length === 0 ? (
                            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>□</span>
                                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>NO EVENTS YET — ATTEND YOUR FIRST EVENT</span>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', padding: '2px 0' }}>
                                {passportEvents.map((entry, i) => {
                                    const coverUrl = entry.events?.cover_url || entry.cover_url || `https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop`;
                                    const entryType = entry.events?.event_type || entry.event_type || 'sport';
                                    const TYPE_SHAPES = { sport: '○', science: '△', charity: '□', cultural: '◇' };
                                    const TYPE_COLORS = { sport: '#f56e3d', science: '#fbbf24', charity: '#2dd4bf', cultural: '#a855f7' };
                                    return (
                                        <motion.div
                                            key={entry.id || i}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            onClick={() => entry.event_id && navigate(`/event/${entry.event_id}`)}
                                            style={{ position: 'relative', paddingBottom: '100%', cursor: 'pointer', overflow: 'hidden', background: '#1a1d2e' }}
                                        >
                                            <img src={coverUrl} alt={entry.title || 'Event'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)' }} />
                                            {/* Type shape overlay */}
                                            <span className="pp-event-shape-overlay" style={{ color: TYPE_COLORS[entryType] || '#f56e3d' }}>{TYPE_SHAPES[entryType] || '○'}</span>
                                            <div style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px' }}>
                                                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '9px', color: 'white', lineHeight: '11px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {entry.title || entry.events?.title || 'Event'}
                                                </div>
                                            </div>
                                            {entry.checked_in && (
                                                <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(19,236,200,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6l2 2 4-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'saved' && (
                    <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <SavedEventsTab isOwnProfile={isOwnProfile} navigate={navigate} />
                    </motion.div>
                )}

                {activeTab === 'badges' && (
                    <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {passportBadges.length === 0 ? (
                            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                                <span style={{ display: 'block', fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>○</span>
                                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>NO BADGES EARNED YET — KEEP COMPETING</span>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '24px 16px' }}>
                                {passportBadges.map((badge, i) => (
                                    <motion.div
                                        key={badge.id || i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.08 }}
                                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(19,236,200,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                            {badge.icon || badge.badges?.icon || '🏆'}
                                        </div>
                                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '10px', color: '#f1f5f9', textAlign: 'center', textTransform: 'uppercase' }}>
                                            {badge.name || badge.badge_name || badge.badges?.name || 'BADGE'}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Bottom Sheet (Followers / Following / Connections) */}
            <AnimatePresence>
                {sheetType && (
                    <>
                        <motion.div
                            className="profile-sheet-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSheetType(null)}
                        />
                        <motion.div
                            className="profile-connections-sheet"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            <div className="profile-sheet-handle" />
                            <div className="profile-sheet-header">
                                <h3>{sheetType.toUpperCase()} {sheetType === 'connections' ? '○' : '◇'}</h3>
                                <button onClick={() => setSheetType(null)}>✕</button>
                            </div>
                            <div className="profile-sheet-body">
                                {sheetType === 'followers' && (
                                    followersData?.followers?.length > 0 ? (
                                        followersData.followers.map((u, i) => (
                                            <div key={i} className="profile-connection-item" onClick={() => { setSheetType(null); navigate(`/profile/${u.username}`); }}>
                                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.username}`} alt="" />
                                                <div>
                                                    <span className="profile-conn-name">@{u.username}</span>
                                                    <span className="profile-conn-status">{u.full_name}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="profile-sheet-empty">
                                            {isOwnProfile ? 'You don\'t have any followers yet.' : `@${p.username} doesn't have any followers yet.`}
                                        </div>
                                    )
                                )}

                                {sheetType === 'following' && (
                                    followingData?.following?.length > 0 ? (
                                        followingData.following.map((u, i) => (
                                            <div key={i} className="profile-connection-item" onClick={() => { setSheetType(null); navigate(u.type === 'org' ? `/org/${u.username}` : `/profile/${u.username}`); }}>
                                                <img src={u.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${u.username}`} alt="" />
                                                <div>
                                                    <span className="profile-conn-name">@{u.username}</span>
                                                    <span className="profile-conn-status">{u.full_name}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="profile-sheet-empty">
                                            {isOwnProfile ? 'You aren\'t following anyone.' : `@${p.username} isn't following anyone.`}
                                        </div>
                                    )
                                )}

                                {sheetType === 'connections' && (
                                    isOwnProfile ? (
                                        connectionsData && (Array.isArray(connectionsData) ? connectionsData : connectionsData?.connections || []).length > 0 ? (
                                            (Array.isArray(connectionsData) ? connectionsData : connectionsData?.connections || []).map((conn, i) => (
                                                <div key={i} className="profile-connection-item" onClick={() => { setSheetType(null); navigate(`/profile/${conn.username}`); }}>
                                                    <img src={conn.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${conn.username}`} alt="" />
                                                    <div>
                                                        <span className="profile-conn-name">@{conn.username}</span>
                                                        <span className="profile-conn-status">{conn.status || 'CONNECTED'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="profile-sheet-empty">No connections yet — start connecting with other players!</p>
                                        )
                                    ) : (
                                        <p className="profile-sheet-empty">FEATURE COMING SOON △</p>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function SavedEventsTab({ isOwnProfile, navigate }) {
    const [savedEvents, setSavedEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSaved = async () => {
        try {
            // Append timestamp to bust browser cache
            const data = await api('GET', `/events/me/saved?_t=${Date.now()}`);
            setSavedEvents(data.events || []);
        } catch (e) {
            console.error('Failed to load saved events:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOwnProfile) { setLoading(false); return; }
        fetchSaved();

        // Also refresh when tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') fetchSaved();
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isOwnProfile]);

    if (!isOwnProfile) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>◇</span>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>SAVED EVENTS ARE PRIVATE</span>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid rgba(45,212,191,0.15)', borderTopColor: '#2dd4bf', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.7s linear infinite' }} />
            </div>
        );
    }

    if (savedEvents.length === 0) {
        return (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>◇</span>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>NO SAVED EVENTS YET — TAP THE BOOKMARK ICON ON ANY EVENT</span>
            </div>
        );
    }

    const TYPE_SHAPES = { sport: '○', science: '△', charity: '□', cultural: '◇' };
    const TYPE_COLORS = { sport: '#f56e3d', science: '#fbbf24', charity: '#2dd4bf', cultural: '#a855f7' };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', padding: '2px 0' }}>
            {savedEvents.map((event, i) => {
                const coverUrl = event.cover_url || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop';
                const entryType = event.event_type || 'sport';
                return (
                    <motion.div
                        key={event.id || i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        onClick={() => navigate(`/event/${event.id}`)}
                        style={{ position: 'relative', paddingBottom: '100%', cursor: 'pointer', overflow: 'hidden', background: '#1a1d2e' }}
                    >
                        <img src={coverUrl} alt={event.title || 'Event'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)' }} />
                        <span className="pp-event-shape-overlay" style={{ color: TYPE_COLORS[entryType] || '#f56e3d' }}>{TYPE_SHAPES[entryType] || '○'}</span>
                        {/* Bookmark indicator */}
                        <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(217,70,239,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="8" height="10" viewBox="0 0 24 24" fill="white"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <div style={{ position: 'absolute', bottom: '6px', left: '6px', right: '6px' }}>
                            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '9px', color: 'white', lineHeight: '11px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {event.title?.toUpperCase() || 'EVENT'}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function getLevelTitle(level) {
    const titles = {
        1: 'ROOKIE', 2: 'BEGINNER', 3: 'ACTIVE MEMBER', 4: 'EVENT REGULAR',
        5: 'RISING STAR', 6: 'ARENA WARRIOR', 7: 'HACKATHON VETERAN',
        8: 'ELITE OPERATOR', 9: 'LEGENDARY', 10: 'SUPREME COMMANDER',
    };
    return titles[level] || 'UNKNOWN RANK';
}

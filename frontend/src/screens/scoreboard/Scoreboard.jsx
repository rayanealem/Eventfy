import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { haptic } from '../../lib/haptic';
import './Scoreboard.css';

const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000, 10000, 14000, 19000, 25000];

const getLevelInfo = (xp) => {
    let level = 1, nextThreshold = LEVEL_THRESHOLDS[1], prevThreshold = 0;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
            prevThreshold = LEVEL_THRESHOLDS[i];
            nextThreshold = LEVEL_THRESHOLDS[i + 1] || Infinity;
        } else break;
    }
    const progress = nextThreshold === Infinity ? 100 : ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    return { level, nextThreshold, progress };
};

const TABS = [
    { key: 'leaderboard', label: 'LEADERBOARD', icon: '◇' },
    { key: 'badges', label: 'BADGES', icon: '○' },
    { key: 'achievements', label: 'ACHIEVEMENTS', icon: '△' },
];

const ACHIEVEMENTS = [
    { icon: '🏆', title: 'FIRST BLOOD', desc: 'Win your first event', claimed: true },
    { icon: '⚡', title: 'SPEED DEMON', desc: 'Complete 3 events in a week', claimed: true },
    { icon: '🎯', title: 'SHARPSHOOTER', desc: 'Score 100% in a quiz', claimed: false },
    { icon: '🔥', title: 'ON FIRE', desc: '7-day login streak', claimed: false },
    { icon: '🌍', title: 'GLOBETROTTER', desc: 'Events in 5+ wilayas', claimed: false },
    { icon: '🤝', title: 'TEAM PLAYER', desc: 'Join 3+ teams', claimed: true },
];

export default function Scoreboard() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('leaderboard');
    const [claimed, setClaimed] = useState({});

    // Filters
    const [eventType, setEventType] = useState('all');
    const [wilaya, setWilaya] = useState('');
    const [showWilayaSheet, setShowWilayaSheet] = useState(false);

    // Fetch leaderboard
    const { data: leaderboardRaw = [], isLoading } = useQuery({
        queryKey: ['scoreboard', eventType, wilaya],
        queryFn: () => {
            const params = new URLSearchParams();
            if (eventType !== 'all') params.append('event_type', eventType);
            if (wilaya) params.append('wilaya', wilaya);
            const query = params.toString() ? `?${params.toString()}` : '';
            return api('GET', `/gamification/scoreboard${query}`);
        },
        staleTime: 60000,
    });

    // Fetch user badges
    const { data: myBadges = [] } = useQuery({
        queryKey: ['badges', profile?.id],
        queryFn: () => api('GET', `/gamification/badges/${profile?.id}`),
        enabled: !!profile?.id,
    });

    const leaderboard = (Array.isArray(leaderboardRaw) ? leaderboardRaw : []).map((p, i) => ({
        rank: i + 1,
        id: p.id,
        name: p.username || 'Anonymous',
        xp: p.xp || 0,
        medal: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '',
        avatar: p.avatar_url || `https://i.pravatar.cc/48?u=${p.id}`,
        shape: p.shape || ['○', '△', '□', '◇'][i % 4],
        shape_color: p.shape_color || ['#f56e3d', '#fbbf24', '#2dd4bf', '#a855f7'][i % 4],
    }));

    const myRank = profile ? leaderboard.findIndex(p => p.id === profile.id) + 1 || 'UNRANKED' : '--';
    const { level, nextThreshold, progress } = getLevelInfo(profile?.xp || 0);

    return (
        <div className="sb-root">
            <div className="sb-noise" />

            {/* Header */}
            <header className="sb-header">
                <div className="sb-header-top">
                    <h1 className="sb-title">SCOREBOARD</h1>
                    <span className="sb-title-shape">◇</span>
                </div>
                <span className="sb-subtitle">GAMIFICATION HUB</span>
            </header>

            {/* Global Standing Card */}
            <motion.div className="sb-standing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="sb-standing-left">
                    <span className="sb-standing-label">GLOBAL STANDING</span>
                    <div className="sb-standing-rank">
                        <span className="sb-rank-hash" style={{ fontFamily: 'DM Mono' }}>#</span>
                        <span className="sb-rank-num" style={{ fontFamily: 'DM Mono' }}>{myRank}</span>
                    </div>
                    <span className="sb-standing-league">DIAMOND LEAGUE ◇</span>
                </div>
                <div className="sb-standing-right">
                    <div className="sb-xp-section">
                        <div className="sb-xp-info">
                            <span className="sb-xp-level" style={{ fontFamily: 'DM Mono' }}>LVL {level}</span>
                            <span className="sb-xp-next" style={{ fontFamily: 'DM Mono' }}>{nextThreshold === Infinity ? 'MAX LEVEL' : `NEXT: ${nextThreshold.toLocaleString()} XP`}</span>
                        </div>
                        <div className="sb-xp-bar">
                            <motion.div className="sb-xp-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                        </div>
                        <span className="sb-xp-current" style={{ fontFamily: 'DM Mono' }}>{profile?.xp?.toLocaleString() || 0} {nextThreshold !== Infinity ? `/ ${nextThreshold.toLocaleString()}` : ''} XP</span>
                    </div>
                </div>
            </motion.div>

            {/* Tab Bar */}
            <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '0 16px', borderRadius: '8px', overflow: 'hidden' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '12px 0', background: activeTab === tab.key ? 'rgba(255,255,255,0.05)' : 'none',
                            border: 'none', borderBottom: activeTab === tab.key ? '2px solid #13ecc8' : '2px solid transparent',
                            color: activeTab === tab.key ? '#f1f5f9' : '#64748b',
                            fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '10px', letterSpacing: '1px', cursor: 'pointer',
                        }}
                    >
                        <span style={{ fontSize: '12px' }}>{tab.icon}</span> {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'leaderboard' && (
                    <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sb-leaderboard">
                        {/* Filters */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px 16px 0 16px' }}>
                            {/* Wilaya Filter Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowWilayaSheet(true)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px', padding: '12px 16px', color: '#f1f5f9',
                                    fontFamily: 'DM Mono', fontSize: '12px', letterSpacing: '1px'
                                }}
                            >
                                <span>WILAYA: {wilaya || 'ALL'}</span>
                                <span style={{ opacity: 0.5 }}>▼</span>
                            </motion.button>

                            {/* Event Type Filter Pills */}
                            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                                {['all', 'sport', 'science', 'charity', 'cultural'].map(type => (
                                    <motion.button
                                        key={type}
                                        onClick={() => setEventType(type)}
                                        whileTap={{ scale: 0.85 }}
                                        style={{
                                            position: 'relative',
                                            padding: '8px 16px',
                                            borderRadius: '999px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: eventType === type ? '#0a0a0f' : '#94a3b8',
                                            fontFamily: 'Space Grotesk',
                                            fontWeight: 'bold',
                                            fontSize: '11px',
                                            letterSpacing: '1px',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            zIndex: 1
                                        }}
                                    >
                                        {eventType === type && (
                                            <motion.div
                                                layoutId="eventTypePill"
                                                style={{
                                                    position: 'absolute', inset: 0,
                                                    background: '#13ecda', borderRadius: '999px', zIndex: -1
                                                }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                                            />
                                        )}
                                        {type.toUpperCase()}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* YOU ARE HERE card */}
                        <motion.div className="sb-rank-card" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="sb-rank-card-left">
                                <span className="sb-rank-card-label">YOU ARE HERE</span>
                                <span className="sb-rank-card-pos" style={{ fontFamily: 'DM Mono' }}>#{myRank}</span>
                            </div>
                            <div className="sb-rank-card-right">
                                <span className="sb-rank-card-gap" style={{ fontFamily: 'DM Mono' }}>{typeof myRank === 'number' && myRank > 1 ? `${((leaderboard[myRank - 2]?.xp || 0) - (profile?.xp || 0)).toLocaleString()} XP TO NEXT RANK` : 'TOP RANK'}</span>
                                <div className="sb-rank-card-bar">
                                    <div className="sb-rank-card-fill" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </motion.div>

                        <div className="sb-lb-header">
                            <span className="sb-lb-title">TOP PLAYERS</span>
                            <span className="sb-lb-filter">GLOBAL</span>
                        </div>

                        {/* Top 3 Podium */}
                        {leaderboard.length >= 3 && (
                            <div className="sb-podium">
                                {[1, 0, 2].map(idx => {
                                    const p = leaderboard[idx];
                                    const colors = { 0: '#ffd700', 1: '#c0c0c0', 2: '#cd7f32' };
                                    return (
                                        <motion.div key={p.id || idx} className={`sb-podium-card ${idx === 0 ? 'first' : ''}`}
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                                            onClick={() => navigate(`/profile/${p.name}`)} style={{ borderColor: colors[idx], cursor: 'pointer' }}
                                        >
                                            <img className="sb-podium-avatar" src={p.avatar} alt="" />
                                            <span className="sb-podium-rank" style={{ color: colors[idx], fontFamily: 'DM Mono' }}>#{p.rank}</span>
                                            <span className="sb-podium-name">{p.name?.substring(0, 8)}</span>
                                            <span className="sb-podium-xp" style={{ fontFamily: 'DM Mono' }}>{p.xp.toLocaleString()} XP</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {isLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '32px', height: '16px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
                                        <div style={{ flex: 1, height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="sb-lb-list">
                                {leaderboard.slice(3, 15).map((p, i) => (
                                    <motion.div
                                        key={p.id || i}
                                        className={`sb-lb-row ${p.id === profile?.id ? 'user-row' : ''}`}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => navigate(`/profile/${p.name}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="sb-lb-rank">
                                            <span className="sb-rank-text" style={{ color: p.id === profile?.id ? '#13ecda' : '', fontFamily: 'DM Mono' }}>#{p.rank}</span>
                                        </div>
                                        <div className={`sb-lb-avatar ${p.id === profile?.id ? 'user-avatar' : ''}`}>
                                            <img src={p.avatar} alt="" />
                                        </div>
                                        <span className="sb-lb-shape" style={{ color: p.shape_color }}>{p.shape}</span>
                                        <div className="sb-lb-info">
                                            <span className="sb-lb-name" style={{ color: p.id === profile?.id ? '#13ecda' : '' }}>
                                                {p.name} {p.id === profile?.id ? '(YOU)' : ''}
                                            </span>
                                            <span className="sb-lb-xp" style={{ fontFamily: 'DM Mono' }}>{p.xp.toLocaleString()} XP</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'badges' && (
                    <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sb-badges">
                        <span className="sb-badges-title">BADGES EARNED</span>
                        {/* Group badges by shape */}
                        {(() => {
                            const badges = myBadges.length > 0 ? myBadges : [
                                { icon: '◇', label: 'ELITE', color: '#ffd700', category: 'diamond' },
                                { icon: '△', label: 'PIONEER', color: '#13ecda', category: 'triangle' },
                                { icon: '□', label: 'SCHOLAR', color: '#a78bfa', category: 'square' },
                                { icon: '○', label: 'WARRIOR', color: '#f44725', category: 'circle' },
                            ];
                            const groups = {};
                            badges.forEach(b => {
                                const cat = b.category || b.icon || '○';
                                if (!groups[cat]) groups[cat] = [];
                                groups[cat].push(b);
                            });
                            return Object.entries(groups).map(([cat, items]) => (
                                <div key={cat} style={{ marginBottom: '16px' }}>
                                    <div className="sb-badge-group-header">
                                        <span>{cat.toUpperCase()} BADGES</span>
                                    </div>
                                    <div className="sb-badges-grid">
                                        {items.map((b, i) => (
                                            <motion.div key={i} className="sb-badge" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                                <div className="sb-badge-hex" style={{ borderColor: `${b.color || '#13ecc8'}40`, background: `${b.color || '#13ecc8'}15` }}>
                                                    <span style={{ color: b.color || '#13ecc8' }}>{b.icon || '🏅'}</span>
                                                </div>
                                                <span className="sb-badge-label" style={{ color: b.color || '#13ecc8' }}>{b.label || b.name || 'BADGE'}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div key="ach" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="sb-achievements">
                        <span className="sb-ach-title">ACHIEVEMENTS</span>
                        <div className="sb-ach-list">
                            {ACHIEVEMENTS.map((a, i) => (
                                <motion.div key={i} className={`sb-ach-card ${a.claimed || claimed[a.title] ? 'claimed' : ''}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                    <span className="sb-ach-icon">{a.icon}</span>
                                    <div className="sb-ach-info">
                                        <span className="sb-ach-name">{a.title}</span>
                                        <span className="sb-ach-desc">{a.desc}</span>
                                    </div>
                                    <div className="sb-ach-status">
                                        {(a.claimed || claimed[a.title]) ? (
                                            <span className="sb-ach-check">✓</span>
                                        ) : (
                                            <button className="sb-ach-claim-btn" onClick={() => setClaimed(prev => ({ ...prev, [a.title]: true }))}>CLAIM</button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Wilaya Bottom Sheet */}
            <AnimatePresence>
                {showWilayaSheet && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowWilayaSheet(false)}
                            style={{
                                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(4px)', zIndex: 1000
                            }}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
                            style={{
                                position: 'fixed', bottom: 0, left: 0, right: 0,
                                background: '#0a0a0f', borderTop: '1px solid rgba(255,255,255,0.1)',
                                borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
                                padding: '24px', maxHeight: '60vh', overflowY: 'auto',
                                zIndex: 1001
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', fontSize: '16px', color: '#fff' }}>SELECT WILAYA</span>
                                <button onClick={() => setShowWilayaSheet(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px' }}>×</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button
                                    onClick={() => { setWilaya(''); setShowWilayaSheet(false); }}
                                    style={{
                                        padding: '16px', background: !wilaya ? 'rgba(19,236,218,0.1)' : 'rgba(255,255,255,0.05)',
                                        border: `1px solid ${!wilaya ? '#13ecda' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px',
                                        color: !wilaya ? '#13ecda' : '#fff', fontFamily: 'DM Mono', fontSize: '14px', textAlign: 'left'
                                    }}
                                >
                                    ALL WILAYAS
                                </button>
                                {/* In a real app we would map the 58 Wilayas. I'll provide a subset for demonstration. */}
                                {['16 - Alger', '31 - Oran', '25 - Constantine', '23 - Annaba', '09 - Blida'].map(w => {
                                    const isActive = wilaya === w.split(' - ')[0];
                                    return (
                                        <button
                                            key={w}
                                            onClick={() => { setWilaya(w.split(' - ')[0]); setShowWilayaSheet(false); }}
                                            style={{
                                                padding: '16px', background: isActive ? 'rgba(19,236,218,0.1)' : 'rgba(255,255,255,0.05)',
                                                border: `1px solid ${isActive ? '#13ecda' : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px',
                                                color: isActive ? '#13ecda' : '#fff', fontFamily: 'DM Mono', fontSize: '14px', textAlign: 'left'
                                            }}
                                        >
                                            {w}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

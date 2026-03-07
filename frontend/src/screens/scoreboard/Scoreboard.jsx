import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
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

    // Fetch leaderboard
    const { data: leaderboardRaw = [], isLoading } = useQuery({
        queryKey: ['scoreboard'],
        queryFn: () => api('GET', '/gamification/scoreboard'),
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
                        <span className="sb-rank-hash">#</span>
                        <span className="sb-rank-num">{myRank}</span>
                    </div>
                    <span className="sb-standing-league">DIAMOND LEAGUE ◇</span>
                </div>
                <div className="sb-standing-right">
                    <div className="sb-xp-section">
                        <div className="sb-xp-info">
                            <span className="sb-xp-level">LVL {level}</span>
                            <span className="sb-xp-next">{nextThreshold === Infinity ? 'MAX LEVEL' : `NEXT: ${nextThreshold.toLocaleString()} XP`}</span>
                        </div>
                        <div className="sb-xp-bar">
                            <motion.div className="sb-xp-fill" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: 'easeOut' }} />
                        </div>
                        <span className="sb-xp-current">{profile?.xp?.toLocaleString() || 0} {nextThreshold !== Infinity ? `/ ${nextThreshold.toLocaleString()}` : ''} XP</span>
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
                        <div className="sb-lb-header">
                            <span className="sb-lb-title">TOP PLAYERS</span>
                            <span className="sb-lb-filter">THIS WEEK</span>
                        </div>
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
                                {leaderboard.slice(0, 15).map((p, i) => (
                                    <motion.div
                                        key={p.id || i}
                                        className={`sb-lb-row ${p.rank <= 3 ? 'top-3' : ''} ${p.rank === 1 ? 'gold' : ''} ${p.id === profile?.id ? 'user-row' : ''}`}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        onClick={() => navigate(`/profile/${p.name}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="sb-lb-rank">
                                            {p.medal === 'gold' && <span className="sb-medal" style={{ color: '#ffd700' }}>🥇</span>}
                                            {p.medal === 'silver' && <span className="sb-medal" style={{ color: '#c0c0c0' }}>🥈</span>}
                                            {p.medal === 'bronze' && <span className="sb-medal" style={{ color: '#cd7f32' }}>🥉</span>}
                                            {!p.medal && <span className="sb-rank-text" style={{ color: p.id === profile?.id ? '#13ecda' : '' }}>#{p.rank}</span>}
                                        </div>
                                        <div className={`sb-lb-avatar ${p.id === profile?.id ? 'user-avatar' : ''}`}>
                                            <img src={p.avatar} alt="" />
                                        </div>
                                        <div className="sb-lb-info">
                                            <span className="sb-lb-name" style={{ color: p.id === profile?.id ? '#13ecda' : '' }}>
                                                {p.name} {p.id === profile?.id ? '○' : ''}
                                            </span>
                                            <span className="sb-lb-xp">{p.xp.toLocaleString()} XP</span>
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
                        <div className="sb-badges-grid">
                            {(myBadges.length > 0 ? myBadges : [
                                { icon: '◇', label: 'ELITE', color: '#ffd700' },
                                { icon: '△', label: 'PIONEER', color: '#13ecda' },
                                { icon: '□', label: 'SCHOLAR', color: '#a78bfa' },
                                { icon: '○', label: 'WARRIOR', color: '#f44725' },
                            ]).map((b, i) => (
                                <motion.div key={i} className="sb-badge" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                                    <div className="sb-badge-hex" style={{ borderColor: `${b.color || '#13ecc8'}40`, background: `${b.color || '#13ecc8'}15` }}>
                                        <span style={{ color: b.color || '#13ecc8' }}>{b.icon || b.icon_url || '🏅'}</span>
                                    </div>
                                    <span className="sb-badge-label" style={{ color: b.color || '#13ecc8' }}>{b.label || b.name || 'BADGE'}</span>
                                </motion.div>
                            ))}
                        </div>
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
        </div>
    );
}

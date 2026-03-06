import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './Scoreboard.css';

// XP engine logic imported from backend for UI calculation
const LEVEL_THRESHOLDS = [
    0, 500, 1200, 2500, 4500, 7000, 10000, 14000, 19000, 25000
];

const getLevelInfo = (xp) => {
    let level = 1;
    let nextThreshold = LEVEL_THRESHOLDS[1];
    let prevThreshold = 0;

    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
            prevThreshold = LEVEL_THRESHOLDS[i];
            nextThreshold = LEVEL_THRESHOLDS[i + 1] || Infinity;
        } else {
            break;
        }
    }

    const progress = nextThreshold === Infinity
        ? 100
        : ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

    return { level, nextThreshold, progress };
};

const ACHIEVEMENTS = [
    { icon: '🏆', title: 'FIRST BLOOD', desc: 'Win your first event', claimed: true },
    { icon: '⚡', title: 'SPEED DEMON', desc: 'Complete 3 events in a week', claimed: true },
    { icon: '🎯', title: 'SHARPSHOOTER', desc: 'Score 100% in a quiz', claimed: false },
    { icon: '🔥', title: 'ON FIRE', desc: '7-day login streak', claimed: false },
];

const BADGES = [
    { icon: '◇', label: 'ELITE', color: '#ffd700' },
    { icon: '△', label: 'PIONEER', color: '#13ecda' },
    { icon: '□', label: 'SCHOLAR', color: '#a78bfa' },
    { icon: '○', label: 'WARRIOR', color: '#f44725' },
];

export default function Scoreboard() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [claimed, setClaimed] = useState({});

    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [myBadges, setMyBadges] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const lbData = await api('GET', '/gamification/scoreboard');
            const sorted = (lbData || []).map((p, i) => {
                let medal = '';
                if (i === 0) medal = 'gold';
                else if (i === 1) medal = 'silver';
                else if (i === 2) medal = 'bronze';

                return {
                    rank: i + 1,
                    id: p.id,
                    name: p.username || 'Anonymous',
                    xp: p.xp,
                    medal,
                    avatar: p.avatar_url || `https://i.pravatar.cc/48?u=${p.id}`
                };
            });
            setLeaderboard(sorted);

            if (profile) {
                const rankIdx = sorted.findIndex(p => p.id === profile.id);
                setMyRank(rankIdx !== -1 ? rankIdx + 1 : 'UNRANKED');

                // Fetch badges
                const bData = await api('GET', `/gamification/badges/${profile.id}`);
                setMyBadges(bData || []);
            }
        } catch (e) {
            console.error("Failed to load gamification data", e);
        }
    }

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

            {/* Global Standing */}
            <motion.div className="sb-standing" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="sb-standing-left">
                    <span className="sb-standing-label">GLOBAL STANDING</span>
                    <div className="sb-standing-rank">
                        <span className="sb-rank-hash">#</span>
                        <span className="sb-rank-num">{myRank || '--'}</span>
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
                            <div className="sb-xp-fill" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="sb-xp-current">{profile?.xp?.toLocaleString() || 0} {nextThreshold !== Infinity ? `/ ${nextThreshold.toLocaleString()}` : ''} XP</span>
                    </div>
                </div>
            </motion.div>

            {/* Badges */}
            <div className="sb-badges">
                <span className="sb-badges-title">BADGES EARNED</span>
                <div className="sb-badges-grid">
                    {/* Hardcoding for prototype if backend doesn't return badges, otherwise map myBadges */}
                    {BADGES.map((b, i) => (
                        <motion.div key={i} className="sb-badge" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                            <div className="sb-badge-hex" style={{ borderColor: `${b.color}40`, background: `${b.color}15` }}>
                                <span style={{ color: b.color }}>{b.icon}</span>
                            </div>
                            <span className="sb-badge-label" style={{ color: b.color }}>{b.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Leaderboard */}
            <div className="sb-leaderboard">
                <div className="sb-lb-header">
                    <span className="sb-lb-title">LEADERBOARD</span>
                    <span className="sb-lb-filter">THIS WEEK</span>
                </div>

                <div className="sb-lb-list">
                    {leaderboard.slice(0, 10).map((p, i) => (
                        <motion.div
                            key={i}
                            className={`sb-lb-row ${p.rank <= 3 ? 'top-3' : ''} ${p.rank === 1 ? 'gold' : ''} ${p.id === profile?.id ? 'user-row' : ''}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onClick={() => navigate(`/profile/${p.name.toLowerCase()}`)}
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
            </div>

            {/* Achievements */}
            <div className="sb-achievements">
                <span className="sb-ach-title">ACHIEVEMENTS</span>
                <div className="sb-ach-list">
                    {ACHIEVEMENTS.map((a, i) => (
                        <motion.div key={i} className={`sb-ach-card ${a.claimed ? 'claimed' : ''}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
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
            </div>
        </div>
    );
}

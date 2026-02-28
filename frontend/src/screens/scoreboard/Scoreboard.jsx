import { motion } from 'framer-motion';
import './Scoreboard.css';

const LEADERBOARD = [
    { rank: 1, name: 'K-TERMINATOR', xp: '12,420 XP', medal: 'gold', avatar: 'https://i.pravatar.cc/48?img=5' },
    { rank: 2, name: 'VOID_RUNNER', xp: '11,890 XP', medal: 'silver', avatar: 'https://i.pravatar.cc/48?img=12' },
    { rank: 3, name: 'CYBER_PUNK_9', xp: '10,250 XP', medal: 'bronze', avatar: 'https://i.pravatar.cc/48?img=33' },
    { rank: 4, name: 'NEO_BLADE', xp: '9,800 XP', medal: '', avatar: 'https://i.pravatar.cc/48?img=15' },
    { rank: 5, name: 'SHADOW_X', xp: '8,450 XP', medal: '', avatar: 'https://i.pravatar.cc/48?img=22' },
];

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
                        <span className="sb-rank-num">7</span>
                    </div>
                    <span className="sb-standing-league">DIAMOND LEAGUE ◇</span>
                </div>
                <div className="sb-standing-right">
                    <div className="sb-xp-section">
                        <div className="sb-xp-info">
                            <span className="sb-xp-level">LVL 24</span>
                            <span className="sb-xp-next">NEXT: 8,500 XP</span>
                        </div>
                        <div className="sb-xp-bar">
                            <div className="sb-xp-fill" />
                        </div>
                        <span className="sb-xp-current">7,420 / 8,500 XP</span>
                    </div>
                </div>
            </motion.div>

            {/* Badges */}
            <div className="sb-badges">
                <span className="sb-badges-title">BADGES EARNED</span>
                <div className="sb-badges-grid">
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
                    {LEADERBOARD.map((p, i) => (
                        <motion.div
                            key={i}
                            className={`sb-lb-row ${p.rank <= 3 ? 'top-3' : ''} ${p.rank === 1 ? 'gold' : ''}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <div className="sb-lb-rank">
                                {p.medal === 'gold' && <span className="sb-medal" style={{ color: '#ffd700' }}>🥇</span>}
                                {p.medal === 'silver' && <span className="sb-medal" style={{ color: '#c0c0c0' }}>🥈</span>}
                                {p.medal === 'bronze' && <span className="sb-medal" style={{ color: '#cd7f32' }}>🥉</span>}
                                {!p.medal && <span className="sb-rank-text">#{p.rank}</span>}
                            </div>
                            <div className="sb-lb-avatar">
                                <img src={p.avatar} alt="" />
                            </div>
                            <div className="sb-lb-info">
                                <span className="sb-lb-name">{p.name}</span>
                                <span className="sb-lb-xp">{p.xp}</span>
                            </div>
                        </motion.div>
                    ))}

                    {/* User highlight */}
                    <motion.div className="sb-lb-row user-row" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                        <div className="sb-lb-rank">
                            <span className="sb-rank-text" style={{ color: '#13ecda' }}>#7</span>
                        </div>
                        <div className="sb-lb-avatar user-avatar">
                            <img src="https://i.pravatar.cc/48?img=68" alt="" />
                        </div>
                        <div className="sb-lb-info">
                            <span className="sb-lb-name" style={{ color: '#13ecda' }}>YOU ○</span>
                            <span className="sb-lb-xp">7,420 XP</span>
                        </div>
                    </motion.div>
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
                                {a.claimed ? (
                                    <span className="sb-ach-check">✓</span>
                                ) : (
                                    <button className="sb-ach-claim-btn">CLAIM</button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

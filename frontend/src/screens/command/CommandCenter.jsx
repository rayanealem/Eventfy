import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './CommandCenter.css';

const STATS = [
    { label: 'Check-ins', value: '247/500', color: '#2dd4bf', bars: [50, 75, 100, 66, 83] },
    { label: 'Volunteers', value: '18/24', sub: 'ON DUTY', color: '#f44725', hasActive: true },
    { label: 'Live Chat', value: '1,247', color: '#fff', bars: [50, 75, 100, 66, 83] },
    { label: 'Total XP', value: '24,800', color: '#fbbf24', rank: 'RANK: GOLD' },
];

const LOG_ENTRIES = [
    { time: '[14:22:01]', msg: 'Player #4821 checked in - Zone A', color: '#2dd4bf' },
    { time: '[14:21:45]', msg: 'Volunteer #12 assigned to Zone B', color: '#cbd5e1' },
    { time: '[14:20:30]', msg: "New Announcement: 'Round 2 Starting'", color: '#f44725' },
    { time: '[14:19:12]', msg: 'Network latency spike detected (+45ms)', color: '#cbd5e1' },
    { time: '[14:18:55]', msg: 'Global XP Multiplier active (x1.5)', color: '#fbbf24' },
    { time: '[14:17:40]', msg: 'Player #1092 checked in - Main Hall', color: '#2dd4bf' },
    { time: '[14:17:02]', msg: 'System diagnostic complete. All clear.', color: '#cbd5e1' },
];

export default function CommandCenter() {
    const navigate = useNavigate();
    return (
        <div className="cc-root">
            <div className="cc-noise" />
            <div className="cc-glow-tr" />
            <div className="cc-glow-bl" />

            {/* Header */}
            <header className="cc-header">
                <div className="cc-header-row">
                    <h1 className="cc-title">COMMAND CENTER □</h1>
                    <div className="cc-live-badge">
                        <div className="cc-live-dot" />
                        <span className="cc-live-text">● LIVE</span>
                    </div>
                </div>
                <div className="cc-timer-row">
                    <div className="cc-network">
                        <span className="cc-net-icon">📡</span>
                        <span className="cc-net-label">Eventfy Net-04</span>
                    </div>
                    <span className="cc-timer">01:24:30</span>
                </div>
            </header>

            {/* Main */}
            <div className="cc-main">
                {/* Stats Grid */}
                <div className="cc-stats-grid">
                    {STATS.map((s, i) => (
                        <motion.div key={i} className="cc-stat-card"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}>
                            <div className="cc-stat-info">
                                <span className="cc-stat-label">{s.label}</span>
                                <span className="cc-stat-value" style={{ color: s.color }}>{s.value}</span>
                                {s.sub && <span className="cc-stat-sub" style={{ color: s.color }}>{s.sub}</span>}
                            </div>
                            {s.bars && (
                                <div className="cc-mini-bars">
                                    {s.bars.map((h, j) => (
                                        <div key={j} className="cc-bar" style={{ height: `${h}%`, opacity: h === 100 ? 0.3 : 0.1 + (h / 300) }} />
                                    ))}
                                </div>
                            )}
                            {s.rank && (
                                <div className="cc-rank-row">
                                    <span className="cc-rank" style={{ color: 'rgba(251,191,36,.6)' }}>{s.rank}</span>
                                    <span className="cc-rank-arrow">▶</span>
                                </div>
                            )}
                            {s.hasActive && (
                                <div className="cc-active-row">
                                    <span className="cc-active-icon">⚡</span>
                                    <span className="cc-active-label" style={{ color: s.color }}>ACTIVE DEP.</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Live Feed */}
                <div className="cc-feed-section">
                    <div className="cc-feed-head">
                        <span className="cc-feed-title">LIVE FEED</span>
                        <span className="cc-feed-sub">Auto-scrolling log</span>
                    </div>
                    <div className="cc-feed-terminal">
                        {LOG_ENTRIES.map((e, i) => (
                            <motion.div key={i} className="cc-log-entry"
                                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}>
                                <span className="cc-log-time" style={{ color: e.color, opacity: 0.5 }}>{e.time}</span>
                                <span className="cc-log-msg" style={{ color: e.color }}>{e.msg}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="cc-footer">
                <div className="cc-footer-top">
                    <div className="cc-action-pill">
                        <div className="cc-pill-btn">
                            <span className="cc-pill-icon">📢</span>
                            <span className="cc-pill-label" style={{ color: '#f44725' }}>Announce</span>
                        </div>
                        <div className="cc-pill-divider" />
                        <div className="cc-pill-btn">
                            <span className="cc-pill-icon">🔔</span>
                            <span className="cc-pill-label" style={{ color: '#2dd4bf' }}>Push</span>
                        </div>
                        <div className="cc-pill-divider" />
                        <div className="cc-pill-btn">
                            <span className="cc-pill-icon">📄</span>
                            <span className="cc-pill-label" style={{ color: '#94a3b8' }}>Export</span>
                        </div>
                    </div>
                    <div className="cc-emergency-fab">⚠</div>
                </div>
                <div className="cc-scan-fab" onClick={() => navigate('/qr')} style={{ cursor: 'pointer' }}>
                    <span className="cc-scan-icon">⬡</span>
                    <span className="cc-scan-label">SCAN △</span>
                </div>
            </div>
        </div>
    );
}

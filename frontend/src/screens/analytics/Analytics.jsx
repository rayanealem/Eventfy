import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Analytics.css';

const STATS = [
    { label: 'Registrations', value: '4,502', icon: '□', color: 'teal' },
    { label: 'Attendance', value: '3,890', icon: '▲', color: 'red' },
    { label: 'Volunteers', value: '124', icon: '△', color: 'gold' },
    { label: 'Satisfaction', value: '★★★★☆', icon: null, color: 'gold', isStars: true },
];

const SKILLS = [
    { name: 'STRATEGY', score: 88, width: '88%' },
    { name: 'SURVIVAL', score: 72, width: '72%' },
    { name: 'STEALTH', score: 45, width: '45%' },
];

const ENGAGEMENT = [
    { label: 'Chat', value: '12K' },
    { label: 'Shares', value: '842' },
    { label: 'Saves', value: '2.1K' },
];

const FINANCIALS = [
    { label: 'Gross Revenue', value: '$142,500.00', color: '#fff' },
    { label: 'Financial Reach', value: '8.2M', color: '#fff' },
    { label: 'Acquisition Cost', value: '$12.42', color: '#ff6b6b' },
];

const TIMELINE_LABELS = ['01 OCT', '10 OCT', '20 OCT', '30 OCT'];

export default function Analytics() {
    const navigate = useNavigate();

    return (
        <div className="an-root">
            <div className="an-noise" />

            {/* Header */}
            <header className="an-header">
                <div className="an-header-left">
                    <button className="an-back" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="an-title">ANALYTICS □</h1>
                </div>
                <button className="an-export-btn">⬡</button>
            </header>

            {/* Main */}
            <div className="an-main">
                {/* Stats Grid */}
                <div className="an-stats-grid">
                    {STATS.map((s, i) => (
                        <motion.div key={i} className={`an-stat-card an-stat-${s.color}`}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}>
                            <span className="an-stat-label">{s.label}</span>
                            <div className="an-stat-val-row">
                                <span className="an-stat-value">{s.value}</span>
                                {s.icon && <span className="an-stat-icon">{s.icon}</span>}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Registration Timeline */}
                <div className="an-timeline-card">
                    <div className="an-timeline-head">
                        <span className="an-timeline-title">Registration Timeline</span>
                        <span className="an-timeline-badge">30 DAYS</span>
                    </div>
                    <div className="an-chart-area">
                        <svg viewBox="0 0 358 140" className="an-chart-svg">
                            <defs>
                                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="rgba(19,236,218,0.3)" />
                                    <stop offset="100%" stopColor="rgba(19,236,218,0)" />
                                </linearGradient>
                            </defs>
                            <path d="M0,120 Q40,110 80,90 T160,60 T240,30 T320,50 L358,40 L358,140 L0,140Z" fill="url(#chartGrad)" />
                            <path d="M0,120 Q40,110 80,90 T160,60 T240,30 T320,50 L358,40" fill="none" stroke="#13ecda" strokeWidth="2" />
                        </svg>
                    </div>
                    <div className="an-chart-labels">
                        {TIMELINE_LABELS.map((l, i) => (
                            <span key={i} className="an-chart-label">{l}</span>
                        ))}
                    </div>
                </div>

                {/* Audience & Skills */}
                <div className="an-duo-cards">
                    {/* Audience */}
                    <div className="an-audience-card">
                        <span className="an-card-title">Audience</span>
                        <div className="an-donut-wrap">
                            <div className="an-donut">
                                <span className="an-donut-label">GEN Z</span>
                            </div>
                        </div>
                        <div className="an-audience-stats">
                            <div className="an-aud-row"><span className="an-aud-name">GEN Z</span><span className="an-aud-pct">64%</span></div>
                            <div className="an-aud-row"><span className="an-aud-name">MILLENIAL</span><span className="an-aud-pct dim">28%</span></div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="an-skills-card">
                        <span className="an-card-title">Top Skills</span>
                        <div className="an-skills-list">
                            {SKILLS.map((s, i) => (
                                <div key={i} className="an-skill-item">
                                    <div className="an-skill-head">
                                        <span className="an-skill-name">{s.name}</span>
                                        <span className="an-skill-score">{s.score}</span>
                                    </div>
                                    <div className="an-skill-bar">
                                        <div className="an-skill-fill" style={{ width: s.width }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Engagement */}
                <div className="an-engagement-row">
                    {ENGAGEMENT.map((e, i) => (
                        <div key={i} className="an-eng-card">
                            <span className="an-eng-label">{e.label}</span>
                            <span className="an-eng-value">{e.value}</span>
                            <div className="an-eng-spark" />
                        </div>
                    ))}
                </div>

                {/* Financial ROI */}
                <div className="an-fin-card">
                    <div className="an-fin-header">
                        <span className="an-fin-title">Financial ROI</span>
                        <span className="an-fin-badge">HIGH YIELD</span>
                    </div>
                    <div className="an-fin-rows">
                        {FINANCIALS.map((f, i) => (
                            <div key={i} className="an-fin-row">
                                <span className="an-fin-label">{f.label}</span>
                                <span className="an-fin-value" style={{ color: f.color }}>{f.value}</span>
                            </div>
                        ))}
                        <div className="an-fin-divider" />
                        <div className="an-fin-row">
                            <span className="an-fin-label highlight">Net Profit</span>
                            <span className="an-fin-value highlight">+$84,202.10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="an-footer">
                <button className="an-download-btn">DOWNLOAD REPORT PDF □</button>
                <button className="an-share-btn">SHARE LINK △</button>
            </div>
        </div>
    );
}

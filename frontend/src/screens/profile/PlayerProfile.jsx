import { motion } from 'framer-motion';
import './PlayerProfile.css';

const STATS = [
    { label: 'EVENTS', value: '12' },
    { label: 'XP', value: '4,500' },
    { label: 'BADGES', value: '08' },
];

const PASSPORT_ENTRIES = [
    {
        date: 'OCT 2023',
        status: 'COMPLETED',
        title: 'Global Game Jam Tunis',
        description: "Awarded for 'Best Game Mechanics' in survival horror category.",
        badge: 'CERTIFICATE ISSUED',
        badgeColor: '#13ecc8',
        shapes: ['△', '○'],
        shapeSide: 'right',
    },
    {
        date: 'AUG 2023',
        status: 'PARTICIPATED',
        title: 'Cyber Security Expo',
        description: 'Attended advanced workshops on defensive architecture.',
        badge: null,
        shapes: ['◇', '○'],
        shapeSide: 'right',
    },
    {
        date: 'MAY 2023',
        status: 'MERIT',
        title: "React Summit '23",
        description: 'Lightning talk speaker: "The future of hexagonal UI".',
        badge: null,
        shapes: ['□'],
        shapeSide: 'left',
    },
];

export default function PlayerProfile() {
    return (
        <div className="profile-root">
            <div className="profile-noise" />

            {/* Decorative corner shapes */}
            <div className="profile-deco-tl">○</div>
            <div className="profile-deco-tr">◇</div>

            {/* Avatar */}
            <section className="profile-hero">
                <motion.div
                    className="profile-avatar-ring"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face"
                        alt="Ahmed Benali"
                    />
                </motion.div>
                <div className="profile-badge">#4821</div>
            </section>

            {/* Name & Info */}
            <section className="profile-identity">
                <h1 className="profile-name">AHMED BENALI</h1>
                <span className="profile-handle">@ahmed_dev</span>
                <div className="profile-tags">
                    <span className="profile-tag">
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M5 0C3 0 0 1.5 0 4.5c0 3 5 7.5 5 7.5s5-4.5 5-7.5C10 1.5 7 0 5 0z" fill="#94a3b8" /></svg>
                        Tunis, TN
                    </span>
                    <span className="profile-tag">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 1h8v10H2z" stroke="#94a3b8" strokeWidth="1" /><path d="M4 0v2M8 0v2M2 4h8" stroke="#94a3b8" strokeWidth="1" /></svg>
                        CS Student
                    </span>
                </div>
                <div className="profile-mode">○ PARTICIPANT MODE ○</div>
            </section>

            {/* Stats */}
            <section className="profile-stats">
                {STATS.map((s, i) => (
                    <motion.div
                        key={i}
                        className="profile-stat"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.1 }}
                    >
                        <span className="stat-label">{s.label}</span>
                        <span className="stat-value">{s.value}</span>
                    </motion.div>
                ))}
            </section>

            {/* Level */}
            <section className="profile-level">
                <div className="level-header">
                    <div className="level-info">
                        <span className="level-label">LEVEL 07</span>
                        <span className="level-title">HACKATHON VETERAN</span>
                    </div>
                    <span className="level-percent">85% TO L.08</span>
                </div>
                <div className="level-bar">
                    <div className="level-fill" style={{ width: '85%' }} />
                </div>
            </section>

            {/* Identity Passport */}
            <section className="profile-passport">
                <h2 className="passport-heading">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="1" y="1" width="14" height="14" rx="2" stroke="#ff4d4d" strokeWidth="1.5" />
                        <path d="M5 5h6M5 8h4" stroke="#ff4d4d" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    IDENTITY PASSPORT
                </h2>

                <div className="passport-entries">
                    {PASSPORT_ENTRIES.map((entry, i) => (
                        <motion.div
                            key={i}
                            className="passport-entry"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.12 }}
                        >
                            {/* Decorative shapes */}
                            {entry.shapes.map((s, j) => (
                                <span key={j} className={`entry-deco ${entry.shapeSide} pos-${j}`}>{s}</span>
                            ))}

                            <div className="entry-meta">
                                <span className="entry-date">{entry.date}</span>
                                <span className="entry-dot">•</span>
                                <span className="entry-status">{entry.status}</span>
                            </div>
                            <h3 className="entry-title">{entry.title}</h3>
                            <p className="entry-desc">{entry.description}</p>
                            {entry.badge && (
                                <div className="entry-badge" style={{ color: entry.badgeColor }}>
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke={entry.badgeColor} strokeWidth="1.5" /><path d="M4 6l2 2 3-3" stroke={entry.badgeColor} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    {entry.badge}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Download Button */}
            <section className="profile-download">
                <button className="download-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 2v9M4 8l4 4 4-4" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 14h12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    DOWNLOAD FULL PASSPORT PDF
                </button>
            </section>
        </div>
    );
}

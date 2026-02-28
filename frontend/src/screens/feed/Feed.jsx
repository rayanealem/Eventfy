import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Feed.css';

const MOCK_EVENTS = [
    {
        id: '1',
        title: 'NEON CIRCUIT: THE FINAL ELIMINATION',
        org: 'ORG_PRIME',
        orgVerified: true,
        type: 'SPORT',
        typeShape: '○',
        typeShapeColor: '#f56e3d',
        typeBorderColor: 'rgba(245,110,61,0.3)',
        borderAccent: '#f56e3d',
        countdown: '2D 14H',
        countdownStyle: 'hot',
        spots: { filled: 284, total: 500 },
        spotsColor: '#f56e3d',
        image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop',
        tags: [
            { text: 'Algorithm: High Intensity', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)', color: '#f472b6' },
            { text: 'Verified Entry', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)', color: '#2dd4bf' },
            { text: 'Sponsor Priority', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', color: '#fbbf24' },
        ],
        registerStyle: 'filled',
        registerShape: '○',
    },
    {
        id: '2',
        title: 'SYNTHWAVE REBELS LIVE',
        org: 'VOX_NETWORKS',
        orgVerified: false,
        type: 'MUSIC',
        typeShape: '□',
        typeShapeColor: '#94a3b8',
        typeBorderColor: 'rgba(255,255,255,0.1)',
        borderAccent: '#334155',
        countdown: '4D 02H',
        countdownStyle: 'cool',
        spots: { filled: 1200, total: 2000 },
        spotsColor: '#cbd5e1',
        image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop',
        tags: [
            { text: 'Vocal Boost', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)', color: '#2dd4bf' },
            { text: 'Standard Access', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', color: '#94a3b8' },
        ],
        registerStyle: 'outline',
        registerShape: '□',
    },
];

const STORIES = [
    { id: 0, name: 'ADD STORY', isAdd: true, borderColor: '#f472b6' },
    { id: 1, name: 'LIVE_P102', borderColor: '#f56e3d', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', nameColor: '#f1f5f9' },
    { id: 2, name: 'ELITE_01', borderColor: '#2dd4bf', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', nameColor: '#f1f5f9' },
    { id: 3, name: 'SUPREME_X', borderColor: '#fbbf24', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop', nameColor: '#f1f5f9' },
    { id: 4, name: 'PLAYER_59', borderColor: '#334155', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', nameColor: '#64748b', faded: true },
];

export default function Feed() {
    return (
        <div className="feed-root">
            {/* Noise overlay */}
            <div className="feed-noise" />

            {/* Header */}
            <header className="feed-header">
                <div className="feed-header-left">
                    <span className="feed-logo-shapes">○△□</span>
                    <span className="feed-logo-text">EVENTFY</span>
                </div>
                <div className="feed-search-bar">
                    <svg className="feed-search-icon" width="18.5" height="10.5" viewBox="0 0 19 11" fill="none">
                        <circle cx="5" cy="5" r="4.5" stroke="#64748b" strokeWidth="1" />
                        <line x1="8.5" y1="8" x2="13" y2="10.5" stroke="#64748b" strokeWidth="1" />
                    </svg>
                    <span className="feed-search-text">Search the Arena</span>
                </div>
                <div className="feed-header-actions">
                    <div className="feed-notif-box">
                        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                            <path d="M8 0C5.8 0 4 1.8 4 4v4.6L2 11v2h12v-2l-2-2.4V4c0-2.2-1.8-4-4-4zm0 20c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2z" fill="rgba(255,255,255,0.5)" />
                        </svg>
                        <div className="feed-notif-dot" />
                    </div>
                    <div className="feed-avatar-wrap">
                        <img
                            className="feed-avatar-img"
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop"
                            alt="avatar"
                        />
                        <span className="feed-avatar-rank">#4821</span>
                    </div>
                </div>
            </header>

            {/* Story Row */}
            <div className="feed-stories">
                {STORIES.map(s => (
                    <div key={s.id} className={`feed-story ${s.faded ? 'faded' : ''}`}>
                        <div
                            className={`feed-story-ring ${s.isAdd ? 'dashed' : ''}`}
                            style={{ borderColor: s.borderColor }}
                        >
                            {s.isAdd ? (
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <line x1="7" y1="1" x2="7" y2="13" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="1" y1="7" x2="13" y2="7" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <div className="feed-story-avatar-inner">
                                    <img src={s.image} alt={s.name} />
                                </div>
                            )}
                        </div>
                        <span className="feed-story-name" style={{ color: s.nameColor || '#94a3b8' }}>{s.name}</span>
                    </div>
                ))}
            </div>

            {/* Toggle Bar */}
            <div className="feed-toggle-wrap">
                <div className="feed-toggle-bar">
                    <button className="feed-toggle-btn active">
                        <span>LOCAL</span>
                        <span className="toggle-shape">○</span>
                    </button>
                    <button className="feed-toggle-btn">
                        <span>NATIONAL</span>
                        <span className="toggle-shape">△</span>
                    </button>
                    <button className="feed-toggle-btn">
                        <span>INTERNATIONAL</span>
                        <span className="toggle-shape">□</span>
                    </button>
                </div>
            </div>

            {/* Event Cards */}
            <div className="feed-cards">
                {MOCK_EVENTS.map((event, i) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.12, duration: 0.4 }}
                        className={`feed-card-wrap ${event.id === '2' ? 'card-faded' : ''}`}
                    >
                        <div
                            className="feed-card"
                            style={{ borderLeftColor: event.borderAccent }}
                        >
                            {/* Image area */}
                            <div className="feed-card-image">
                                <img src={event.image} alt={event.title} />
                                <div className="feed-card-gradient" />
                                <div
                                    className="feed-card-type"
                                    style={{ borderColor: event.typeBorderColor }}
                                >
                                    <span style={{ color: event.typeShapeColor }}>{event.typeShape}</span>
                                    <span>{event.type}</span>
                                </div>
                                <div className={`feed-card-countdown ${event.countdownStyle}`}>
                                    {event.countdown}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="feed-card-body">
                                <h3 className="feed-card-title">{event.title}</h3>

                                <div className="feed-card-org">
                                    <div className="feed-card-org-icon">
                                        <img
                                            src={`https://images.unsplash.com/photo-${event.id === '1' ? '1472099645785-5658abf4ff4e' : '1560250097-0b93528c311a'}?w=24&h=24&fit=crop`}
                                            alt={event.org}
                                        />
                                    </div>
                                    <span className="feed-card-org-name">{event.org}</span>
                                    {event.orgVerified && (
                                        <svg className="feed-card-verified" width="11" height="10.5" viewBox="0 0 11 11" fill="none">
                                            <circle cx="5.5" cy="5.5" r="5" fill="#2dd4bf" />
                                            <path d="M3.5 5.5L5 7L7.5 4" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>

                                <div className="feed-card-tags">
                                    {event.tags.map(t => (
                                        <span
                                            key={t.text}
                                            className="feed-card-tag"
                                            style={{
                                                background: t.bg,
                                                borderColor: t.border,
                                                color: t.color,
                                            }}
                                        >
                                            {t.text}
                                        </span>
                                    ))}
                                </div>

                                <div className="feed-card-capacity">
                                    <div className="feed-card-capacity-row">
                                        <span className="capacity-label">Capacity Status</span>
                                        <span className="capacity-count" style={{ color: event.spotsColor }}>
                                            {event.spots.filled >= 1000
                                                ? `${(event.spots.filled / 1000).toFixed(1)}K`
                                                : event.spots.filled
                                            } / {event.spots.total >= 1000
                                                ? `${(event.spots.total / 1000).toFixed(0)}K`
                                                : event.spots.total
                                            } SPOTS
                                        </span>
                                    </div>
                                    <div className="capacity-bar">
                                        <div
                                            className="capacity-bar-fill"
                                            style={{
                                                width: `${(event.spots.filled / event.spots.total) * 100}%`,
                                                background: event.id === '1' ? '#f56e3d' : '#475569',
                                                boxShadow: event.id === '1' ? '0 0 8px rgba(245,110,61,0.5)' : 'none',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="feed-card-footer">
                                    <button className={`feed-card-register ${event.registerStyle}`}>
                                        REGISTER {event.registerShape}
                                    </button>
                                    <div className="feed-card-actions">
                                        <button className="feed-card-action-btn">
                                            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
                                                <path d="M1 2.5C1 1.67 1.67 1 2.5 1h9c.83 0 1.5.67 1.5 1.5V17l-6-3-6 3V2.5z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
                                            </svg>
                                        </button>
                                        <button className="feed-card-action-btn">
                                            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                                                <path d="M2 10l7-8M9 2l7 8M9 2v14" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FAB */}
            <Link to="/event/create" className="feed-fab">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <line x1="10" y1="2" x2="10" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="2" y1="10" x2="18" y2="10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </Link>
        </div>
    );
}

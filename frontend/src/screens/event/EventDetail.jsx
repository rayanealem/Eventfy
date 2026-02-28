import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import './EventDetail.css';

const ARTISTS = [
    { name: 'TECHNO PHARAOH', stage: 'MAIN STAGE • HEADLINER', time: '22:00 ○', timeBg: '#f45c25', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop', highlighted: true },
    { name: 'SAHARA ECHOES', stage: 'CULTURAL TENT • LIVE BAND', time: '20:30 ○', timeBg: 'rgba(255,255,255,0.1)', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=64&h=64&fit=crop', highlighted: false },
    { name: 'PULSE GENERATOR', stage: 'THE UNDERGROUND • DJ SET', time: '19:00 ○', timeBg: 'rgba(255,255,255,0.1)', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=64&h=64&fit=crop', highlighted: false },
];

const TIERS = [
    {
        name: 'STANDARD', shape: '□', shapeColor: '#2dd4bf', subtitle: 'GENERAL ADMISSION', price: 'DZD 2,000',
        nameColor: 'white', subtitleColor: '#64748b',
        bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
        items: ['Entry to Main Festival Grounds', 'Standard Food/Drink Access'],
        itemColor: '#94a3b8', dotColor: '#475569',
        buttonBg: 'rgba(45,212,191,0.2)', buttonBorder: '#2dd4bf', buttonText: 'SELECT □', buttonColor: '#2dd4bf',
        recommended: false,
    },
    {
        name: 'VIP PASS', shape: '△', shapeColor: '#fbbf24', subtitle: 'EXCLUSIVE ACCESS', price: 'DZD 5,000',
        nameColor: '#fbbf24', subtitleColor: 'rgba(251,191,36,0.6)',
        bg: 'rgba(251,191,36,0.05)', border: 'rgba(251,191,36,0.3)',
        items: ['Front Row Stage Access', 'VIP Lounge & Bar', 'Dedicated Restrooms'],
        itemColor: '#cbd5e1', dotColor: '#fbbf24',
        buttonBg: '#fbbf24', buttonBorder: 'transparent', buttonText: 'SELECT △', buttonColor: 'black',
        recommended: true,
    },
    {
        name: 'VVIP ULTIMATE', shape: '○', shapeColor: '#f45c25', subtitle: 'ALL ACCESS MISSION', price: 'DZD 12,000',
        nameColor: 'white', subtitleColor: '#64748b',
        bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
        items: ['Backstage Access (Meet & Greet)', 'Private Table with Bottle Service', 'Priority Mission Site Parking'],
        itemColor: '#94a3b8', dotColor: '#f45c25',
        buttonBg: '#fbbf24', buttonBorder: 'transparent', buttonText: 'SELECT ○', buttonColor: 'black',
        recommended: false,
    },
];

export default function EventDetail() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <div className="event-root">
            <div className="event-noise" />

            {/* Top Nav */}
            <header className="event-topnav">
                <button className="event-back" onClick={() => navigate(-1)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <span className="event-topnav-title">MISSION: EVENTFY ◇</span>
                <button className="event-share">
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                        <path d="M2 10l7-8M9 2l7 8M9 2v14" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </header>

            {/* Hero */}
            <div className="event-hero">
                <img src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop" alt="Event" />
                <div className="event-hero-gradient" />
                <div className="event-hero-content">
                    <div className="event-hero-badge">◇ CULTURAL MISSION</div>
                    <h1 className="event-hero-title">ALGIERS{'\n'}MUSIC FESTIVAL</h1>
                    <div className="event-hero-meta">
                        <span className="event-meta-item">
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><rect x="1" y="1" width="7" height="8" rx="1" stroke="#94a3b8" strokeWidth="1" /><line x1="3" y1="0" x2="3" y2="2" stroke="#94a3b8" strokeWidth="1" /><line x1="6" y1="0" x2="6" y2="2" stroke="#94a3b8" strokeWidth="1" /></svg>
                            NOV 24, 2024
                        </span>
                        <span className="event-meta-item">
                            <svg width="8" height="10" viewBox="0 0 8 10" fill="none"><path d="M4 0C2 0 0 1.5 0 4c0 3 4 6 4 6s4-3 4-6c0-2.5-2-4-4-4z" fill="#94a3b8" /><circle cx="4" cy="4" r="1.5" fill="black" /></svg>
                            ALGIERS ARENA
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="event-tabs">
                <button className="event-tab active">INFO</button>
                <button className="event-tab">TICKETS</button>
                <button className="event-tab">MAP</button>
            </div>

            {/* Content */}
            <div className="event-content">
                {/* Lineup */}
                <section className="event-section">
                    <div className="event-section-header">
                        <h2 className="event-section-title">THE LINEUP</h2>
                        <span className="event-section-count">04 PERFORMERS</span>
                    </div>
                    <div className="event-artists">
                        {ARTISTS.map((a, i) => (
                            <motion.div
                                key={i}
                                className="event-artist"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`event-artist-avatar ${a.highlighted ? 'highlighted' : ''}`}>
                                    <img src={a.image} alt={a.name} />
                                </div>
                                <div className="event-artist-info">
                                    <div className="event-artist-row">
                                        <span className="event-artist-name">{a.name}</span>
                                        <span className="event-artist-time" style={{ background: a.timeBg }}>{a.time}</span>
                                    </div>
                                    <span className="event-artist-stage">{a.stage}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Access Tiers */}
                <section className="event-section">
                    <h2 className="event-section-title">ACCESS TIERS</h2>
                    <div className="event-tiers">
                        {TIERS.map((tier, i) => (
                            <motion.div
                                key={i}
                                className="event-tier"
                                style={{ background: tier.bg, borderColor: tier.border }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.12 }}
                            >
                                {tier.recommended && <div className="tier-recommended">RECOMMENDED</div>}
                                <div className="tier-header">
                                    <div className="tier-info">
                                        <div className="tier-name-row">
                                            <span className="tier-shape" style={{ color: tier.shapeColor }}>{tier.shape}</span>
                                            <span className="tier-name" style={{ color: tier.nameColor }}>{tier.name}</span>
                                        </div>
                                        <span className="tier-subtitle" style={{ color: tier.subtitleColor }}>{tier.subtitle}</span>
                                    </div>
                                    <span className="tier-price">{tier.price}</span>
                                </div>
                                <div className="tier-items">
                                    {tier.items.map((item, j) => (
                                        <div key={j} className="tier-item">
                                            <div className="tier-dot" style={{ background: tier.dotColor }} />
                                            <span style={{ color: tier.itemColor }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="tier-button"
                                    style={{
                                        background: tier.buttonBg,
                                        borderColor: tier.buttonBorder,
                                        color: tier.buttonColor,
                                        border: tier.buttonBorder !== 'transparent' ? `1px solid ${tier.buttonBorder}` : 'none',
                                    }}
                                >
                                    {tier.buttonText}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Mission Site */}
                <section className="event-section">
                    <div className="event-section-header">
                        <h2 className="event-section-title">MISSION SITE</h2>
                        <span className="event-section-location">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 0C4 0 0 2 0 6.5c0 4 6.5 6.5 6.5 6.5S13 10.5 13 6.5C13 2 9 0 6.5 0z" fill="#64748b" /><circle cx="6.5" cy="6.5" r="2" fill="black" /></svg>
                            ALGIERS ARENA
                        </span>
                    </div>
                    <div className="event-map-container">
                        <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop&sat=-100" alt="Map" className="event-map-img" />
                        <div className="event-map-pin">
                            <span>◇</span>
                        </div>
                        <div className="event-map-label">DROP POINT: SECTOR B-4</div>
                    </div>
                </section>

                {/* Gamification Card */}
                <section className="event-xp-card">
                    <div className="xp-bg-text">XP</div>
                    <div className="xp-content">
                        <div className="xp-header">
                            <div className="xp-icon">◇</div>
                            <div className="xp-info">
                                <span className="xp-label">MISSION REWARD</span>
                                <span className="xp-value">+200 PLAYER XP</span>
                            </div>
                        </div>
                        <div className="xp-badge-row">
                            <div className="xp-badge-icon">
                                <svg width="10" height="20" viewBox="0 0 10 20" fill="none">
                                    <path d="M5 0v20M0 5l5-5 5 5M0 15l5 5 5-5" stroke="#f45c25" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <div className="xp-badge-info">
                                <span className="xp-badge-title">CULTURE ENTHUSIAST ◇</span>
                                <span className="xp-badge-sub">COLLECTIBLE BADGE</span>
                            </div>
                            <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
                                <path d="M6 0l2 8h8l-6.5 5 2.5 8L6 16l-6 5L2.5 13 -4 8h8z" fill="#64748b" />
                            </svg>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sticky Footer */}
            <div className="event-footer">
                <button className="event-cta">
                    <span>ENTER THE GAME</span>
                    <div className="cta-circle">○</div>
                </button>
            </div>
        </div>
    );
}

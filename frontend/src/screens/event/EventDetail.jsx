import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
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

const TYPE_SHAPES = { sport: '○', science: '△', charity: '□', cultural: '◇' };

export default function EventDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { profile } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('INFO');
    const [selectedTier, setSelectedTier] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => { loadEvent(); }, [id]);

    async function loadEvent() {
        setLoading(true);
        try {
            const data = await api('GET', `/events/${id}`);
            setEvent(data);
            setIsRegistered(!!data.my_registration);
        } catch (e) {
            console.error('Failed to load event:', e);
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister() {
        if (isRegistered) return;
        setIsRegistered(true); // optimistic
        try {
            await api('POST', `/events/${id}/register`);
        } catch (e) {
            setIsRegistered(false);
            console.error('Register failed:', e);
        }
    }

    if (loading || !event) {
        return (
            <div className="event-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>LOADING EVENT...</span>
            </div>
        );
    }

    const org = event.organizations || {};
    const typeShape = TYPE_SHAPES[event.event_type] || '○';
    const typeDetails = event.type_details || {};

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
                <span className="event-topnav-title" onClick={() => navigate('/org/' + (org.slug || ''))} style={{ cursor: 'pointer' }}>MISSION: {org.name || 'EVENTFY'} {typeShape}</span>
                <button className="event-share" onClick={() => { if (navigator.share) navigator.share({ title: event.title, url: `/event/${id}` }); }}>
                    <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                        <path d="M2 10l7-8M9 2l7 8M9 2v14" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </header>

            {/* Hero */}
            <div className="event-hero">
                <img src={event.cover_url || "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop"} alt="Event" />
                <div className="event-hero-gradient" />
                <div className="event-hero-content">
                    <div className="event-hero-badge">{typeShape} {event.event_type?.toUpperCase()} MISSION</div>
                    <h1 className="event-hero-title">{event.title?.toUpperCase()}</h1>
                    <div className="event-hero-meta">
                        <span className="event-meta-item">
                            <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><rect x="1" y="1" width="7" height="8" rx="1" stroke="#94a3b8" strokeWidth="1" /><line x1="3" y1="0" x2="3" y2="2" stroke="#94a3b8" strokeWidth="1" /><line x1="6" y1="0" x2="6" y2="2" stroke="#94a3b8" strokeWidth="1" /></svg>
                            {event.starts_at ? new Date(event.starts_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'TBD'}
                        </span>
                        <span className="event-meta-item">
                            <svg width="8" height="10" viewBox="0 0 8 10" fill="none"><path d="M4 0C2 0 0 1.5 0 4c0 3 4 6 4 6s4-3 4-6c0-2.5-2-4-4-4z" fill="#94a3b8" /><circle cx="4" cy="4" r="1.5" fill="black" /></svg>
                            {event.venue_name?.toUpperCase() || event.city?.toUpperCase() || 'ONLINE'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="event-tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap', justifyContent: 'flex-start', WebkitOverflowScrolling: 'touch' }}>
                <button className={`event-tab ${activeTab === 'INFO' ? 'active' : ''}`} onClick={() => setActiveTab('INFO')}>INFO</button>
                <button className={`event-tab ${activeTab === 'COMMUNITY' ? 'active' : ''}`} onClick={() => setActiveTab('COMMUNITY')}>COMMUNITY</button>
                <button className={`event-tab ${activeTab === 'VOLUNTEERS' ? 'active' : ''}`} onClick={() => setActiveTab('VOLUNTEERS')}>VOLUNTEERS</button>
                <button className={`event-tab ${activeTab === 'SPONSORS' ? 'active' : ''}`} onClick={() => setActiveTab('SPONSORS')}>SPONSORS</button>
            </div>

            {/* Content */}
            <div className="event-content">
                {activeTab === 'INFO' && (
                    <>
                        {event.event_type === 'cultural' && (
                            <>
                                {/* Lineup */}
                                <section className="event-section">
                                    <div className="event-section-header">
                                        <h2 className="event-section-title">THE LINEUP</h2>
                                        <span className="event-section-count">{String((event.performers || ARTISTS).length).padStart(2, '0')} PERFORMERS</span>
                                    </div>
                                    <div className="event-artists">
                                        {(event.performers && event.performers.length > 0 ? event.performers.map(p => ({
                                            name: p.name?.toUpperCase() || 'PERFORMER',
                                            stage: p.stage || p.role || 'MAIN STAGE',
                                            time: p.time_slot || '',
                                            timeBg: p.sort_order === 0 ? '#f45c25' : 'rgba(255,255,255,0.1)',
                                            image: p.image_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.name}`,
                                            highlighted: p.sort_order === 0,
                                        })) : ARTISTS).map((a, i) => (
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
                                        {(event.ticket_tiers && event.ticket_tiers.length > 0 ? event.ticket_tiers.map((t, idx) => ({
                                            name: t.name?.toUpperCase() || `TIER ${idx + 1}`,
                                            shape: ['□', '△', '○'][idx % 3],
                                            shapeColor: ['#2dd4bf', '#fbbf24', '#f45c25'][idx % 3],
                                            subtitle: t.description?.toUpperCase() || '',
                                            price: t.price ? `DZD ${Number(t.price).toLocaleString()}` : 'FREE',
                                            nameColor: idx === 1 ? '#fbbf24' : 'white',
                                            subtitleColor: idx === 1 ? 'rgba(251,191,36,0.6)' : '#64748b',
                                            bg: idx === 1 ? 'rgba(251,191,36,0.05)' : 'rgba(255,255,255,0.05)',
                                            border: idx === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.1)',
                                            items: t.perks || t.features || [],
                                            itemColor: '#94a3b8',
                                            dotColor: ['#475569', '#fbbf24', '#f45c25'][idx % 3],
                                            buttonBg: idx > 0 ? '#fbbf24' : 'rgba(45,212,191,0.2)',
                                            buttonBorder: idx > 0 ? 'transparent' : '#2dd4bf',
                                            buttonText: `SELECT ${['□', '△', '○'][idx % 3]}`,
                                            buttonColor: idx > 0 ? 'black' : '#2dd4bf',
                                            recommended: idx === 1,
                                        })) : TIERS).map((tier, i) => (
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
                                                    onClick={() => setSelectedTier(tier.name)}
                                                    style={{
                                                        background: selectedTier === tier.name ? '#2dd4bf' : tier.buttonBg,
                                                        borderColor: selectedTier === tier.name ? '#2dd4bf' : tier.buttonBorder,
                                                        color: selectedTier === tier.name ? '#000' : tier.buttonColor,
                                                        border: tier.buttonBorder !== 'transparent' ? `1px solid ${selectedTier === tier.name ? '#2dd4bf' : tier.buttonBorder}` : 'none',
                                                    }}
                                                >
                                                    {selectedTier === tier.name ? 'SELECTED ✓' : tier.buttonText}
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
                            </>
                        )}
                        {event.event_type === 'sport' && (
                            <section className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                                <h2 className="event-section-title" style={{ marginBottom: '16px' }}>TEAM SELECTION</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '24px' }}>Teams are forming for this sporting event.</p>
                                <button className="tier-button" onClick={() => navigate(`/event/${event.id}/teams`)} style={{ borderColor: '#2dd4bf', color: '#2dd4bf', padding: '12px 24px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', background: 'transparent' }}>
                                    JOIN A TEAM △
                                </button>
                            </section>
                        )}
                        {event.event_type === 'science' && (
                            <section className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                                <h2 className="event-section-title">SCIENCE TRACK</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '16px' }}>Panels, workshops, and hackathons.</p>
                            </section>
                        )}
                        {event.event_type === 'charity' && (
                            <section className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                                <h2 className="event-section-title">DONATION GOALS</h2>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '16px' }}>Help us reach our charitable milestones.</p>
                            </section>
                        )}
                    </>
                )}

                {activeTab === 'COMMUNITY' && (
                    <div className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '2px', marginBottom: '16px' }}>COMMUNITY LOBBY</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginBottom: '32px' }}>Discuss strategies, find teammates, and connect.</p>
                        <button className="tier-button" onClick={() => navigate(`/chat/${event.id}`)} style={{ borderColor: '#2dd4bf', color: '#2dd4bf', padding: '12px 24px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', background: 'transparent' }}>
                            JOIN LOBBY CHAT ○
                        </button>
                    </div>
                )}
                {activeTab === 'VOLUNTEERS' && (
                    <div className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '2px', marginBottom: '16px' }}>VOLUNTEER MISSIONS</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Help organize the event and earn special XP.</p>
                    </div>
                )}
                {activeTab === 'SPONSORS' && (
                    <div className="event-section" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', letterSpacing: '2px', marginBottom: '16px' }}>EVENT PARTNERS</h3>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Supported by leading brands in the industry.</p>
                    </div>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="event-footer">
                <button className="event-cta" onClick={handleRegister} style={isRegistered ? { background: '#2dd4bf' } : undefined}>
                    <span>{isRegistered ? "YOU'RE IN ✓" : 'ENTER THE GAME'}</span>
                    {!isRegistered && <div className="cta-circle">○</div>}
                </button>
                {isRegistered && (
                    <button className="event-cta" onClick={() => navigate(`/qr/${id}`)} style={{ background: 'transparent', border: '1px solid white', marginTop: '12px' }}>
                        <span>SCAN IN ○</span>
                    </button>
                )}
                {/* Note: In a real app we'd check user role. Hardcoding the manage button for organizer simulation if needed, but not specified to always show. Example: */}
                {/* <button className="event-cta" onClick={() => navigate(`/manage/${id}`)} style={{ background: 'var(--color-gold)', color: 'black', marginTop: '12px' }}><span>MANAGE THIS EVENT □</span></button> */}
            </div>
        </div>
    );
}

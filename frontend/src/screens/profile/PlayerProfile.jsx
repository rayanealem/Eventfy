import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './PlayerProfile.css';

export default function PlayerProfile() {
    const navigate = useNavigate();
    const { username } = useParams();
    const { profile: myProfile } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [passport, setPassport] = useState([]);
    const [loading, setLoading] = useState(true);

    // Determine which username to load
    const targetUsername = username || myProfile?.username;

    useEffect(() => {
        if (!targetUsername) return;
        async function loadProfile() {
            setLoading(true);
            try {
                // Fetch profile data
                const data = await api('GET', `/users/profile/${targetUsername}`);
                setProfileData(data);

                // Fetch passport entries
                try {
                    const passportData = await api('GET', `/users/passport/${targetUsername}`);
                    setPassport(passportData?.entries || passportData || []);
                } catch (e) {
                    console.error('Failed to load passport:', e);
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
                // Fallback to own profile from context
                if (myProfile) {
                    setProfileData(myProfile);
                }
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [targetUsername]);

    if (loading) {
        return (
            <div className="profile-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ color: '#00ffc2', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>LOADING PROFILE...</div>
            </div>
        );
    }

    // Use API data or fallback to AuthContext profile
    const p = profileData || myProfile || {};
    const displayName = (p.full_name || p.username || 'UNKNOWN').toUpperCase();
    const handle = `@${p.username || 'unknown'}`;
    const avatarUrl = p.avatar_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${p.username || 'user'}`;
    const xp = p.xp || 0;
    const level = p.level || 1;
    const eventCount = p.event_count || p.events_attended || 0;
    const badgeCount = p.badge_count || p.user_badges?.length || 0;
    const location = p.wilaya ? `Wilaya ${p.wilaya}` : p.city || '';
    const isStudent = p.is_student;
    const university = p.university || '';
    const levelTitle = getLevelTitle(level);
    const xpToNext = getXpToNext(level);
    const xpProgress = xpToNext > 0 ? Math.min(100, Math.round((xp % 1000) / xpToNext * 100)) : 0;

    const STATS = [
        { label: 'EVENTS', value: String(eventCount).padStart(2, '0') },
        { label: 'XP', value: xp.toLocaleString() },
        { label: 'BADGES', value: String(badgeCount).padStart(2, '0') },
    ];

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
                    <img src={avatarUrl} alt={displayName} />
                </motion.div>
                <div className="profile-badge">#{String(p.id || '').slice(-4) || '0000'}</div>
            </section>

            {/* Name & Info */}
            <section className="profile-identity">
                <h1 className="profile-name">{displayName}</h1>
                <span className="profile-handle">{handle}</span>
                <div className="profile-tags">
                    {location && (
                        <span className="profile-tag">
                            <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M5 0C3 0 0 1.5 0 4.5c0 3 5 7.5 5 7.5s5-4.5 5-7.5C10 1.5 7 0 5 0z" fill="#94a3b8" /></svg>
                            {location}
                        </span>
                    )}
                    {isStudent && university && (
                        <span className="profile-tag">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 1h8v10H2z" stroke="#94a3b8" strokeWidth="1" /><path d="M4 0v2M8 0v2M2 4h8" stroke="#94a3b8" strokeWidth="1" /></svg>
                            {university}
                        </span>
                    )}
                    {p.role && (
                        <span className="profile-tag" style={{ textTransform: 'uppercase' }}>
                            {p.role === 'organizer' ? '△ ORGANIZER' : '○ PARTICIPANT'}
                        </span>
                    )}
                </div>
                <div className="profile-mode" onClick={() => navigate('/profile/edit')} style={{ cursor: 'pointer' }}>
                    {p.role === 'organizer' ? '△ ORGANIZER MODE △' : '○ PARTICIPANT MODE ○'}
                </div>
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
                        <span className="level-label">LEVEL {String(level).padStart(2, '0')}</span>
                        <span className="level-title">{levelTitle}</span>
                    </div>
                    <span className="level-percent">{xpProgress}% TO L.{String(level + 1).padStart(2, '0')}</span>
                </div>
                <div className="level-bar">
                    <div className="level-fill" style={{ width: `${xpProgress}%` }} />
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
                    {passport.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                            NO PASSPORT ENTRIES YET — ATTEND EVENTS TO BUILD YOUR PASSPORT
                        </div>
                    )}
                    {passport.map((entry, i) => {
                        const date = entry.date || new Date(entry.registered_at || entry.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
                        const status = entry.status || entry.attendance_status || 'PARTICIPATED';
                        const title = entry.title || entry.events?.title || 'Untitled Event';
                        const description = entry.description || entry.events?.description || '';
                        return (
                            <motion.div
                                key={entry.id || i}
                                className="passport-entry"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.12 }}
                            >
                                <span className="entry-deco right pos-0">△</span>
                                <div className="entry-meta">
                                    <span className="entry-date">{date}</span>
                                    <span className="entry-dot">•</span>
                                    <span className="entry-status">{status.toUpperCase()}</span>
                                </div>
                                <h3 className="entry-title">{title}</h3>
                                {description && <p className="entry-desc">{description.substring(0, 120)}</p>}
                                {entry.certificate_issued && (
                                    <div className="entry-badge" style={{ color: '#13ecc8' }}>
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#13ecc8" strokeWidth="1.5" /><path d="M4 6l2 2 3-3" stroke="#13ecc8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        CERTIFICATE ISSUED
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
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

function getLevelTitle(level) {
    const titles = {
        1: 'ROOKIE', 2: 'BEGINNER', 3: 'ACTIVE MEMBER', 4: 'EVENT REGULAR',
        5: 'RISING STAR', 6: 'ARENA WARRIOR', 7: 'HACKATHON VETERAN',
        8: 'ELITE OPERATOR', 9: 'LEGENDARY', 10: 'SUPREME COMMANDER',
    };
    return titles[level] || 'UNKNOWN RANK';
}

function getXpToNext(level) {
    return 1000; // Each level requires 1000 XP
}

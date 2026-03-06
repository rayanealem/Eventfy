import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './CreateEvent.css';

const CATEGORIES = [
    { icon: '○', label: 'SPORT', val: 'sport' },
    { icon: '◇', label: 'SCIENCE', val: 'science' },
    { icon: '□', label: 'CHARITY', val: 'charity' },
    { icon: '◇', label: 'CULTURAL', val: 'cultural' },
];

const STEPS = [
    { num: '○', label: 'BASICS', active: true },
    { num: '△', label: 'CAPACITY', active: false },
    { num: '□', label: 'VOLUNTEERS', active: false },
    { num: '◇', label: 'GAMIFICATION', active: false },
];

export default function CreateEvent() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');

    const [participantLimit, setParticipantLimit] = useState(100);
    const [activeCategory, setActiveCategory] = useState('sport');
    const [activeStep, setActiveStep] = useState(0);
    const [waitlist, setWaitlist] = useState(true);
    const [teamMode, setTeamMode] = useState(false);
    const [pricing, setPricing] = useState('FREE');

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleDeploy = async () => {
        if (!title || !date || !time) {
            alert("Title, Date, and Time are required!");
            return;
        }

        const org = profile?.organizations?.[0];
        if (!org) {
            alert("You must belong to an organization to create events.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Construct datetime
            const startsAt = new Date(`${date}T${time}`).toISOString();
            // Default ends_at to 2 hours later
            const endsAt = new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();

            const payload = {
                org_id: org.id,
                title,
                description,
                event_type: activeCategory,
                visibility: "open",
                starts_at: startsAt,
                ends_at: endsAt,
                registration_closes_at: startsAt,
                venue_name: location,
                address: location, // Duplicate for now
                wilaya: "16 - Algiers", // Default testing
                city: "Algiers",
                is_online: false,
                is_international: false,
                capacity: participantLimit,
                waitlist_enabled: waitlist,
                team_mode: teamMode,
                is_paid: pricing === 'PAID',
                xp_checkin: 100,
                xp_completion: 200,
                xp_winner: 0,
                xp_volunteer_multiplier: true
            };

            const created = await api('POST', '/events', payload);

            // Auto publish for this prototype so it shows in feed
            await api('POST', `/events/${created.id}/publish`);

            navigate('/feed');
        } catch (e) {
            console.error("Deploy failed:", e);
            alert("Failed to create event: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="ce-root">
            <div className="ce-noise" />

            {/* Header */}
            <header className="ce-header">
                <div className="ce-header-top">
                    <button className="ce-back" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="ce-title">CREATE EVENT □</h1>
                    <button className="ce-close" onClick={() => { if (window.confirm('Discard draft?')) navigate(-1); }}>✕</button>
                </div>
                <div className="ce-progress">
                    <div className="ce-progress-line" />
                    {STEPS.map((s, i) => (
                        <div key={i} className={`ce-step ${s.active ? 'active' : ''}`}>
                            <span>{s.num}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Main */}
            <div className="ce-main">
                {/* STEP 1: BASICS */}
                <section className="ce-section">
                    <div className="ce-section-head">
                        <span className="ce-step-label active">STEP 1 ○</span>
                        <span className="ce-section-title">BASICS</span>
                    </div>

                    <div className="ce-upload-zone">
                        <span className="ce-upload-icon">📤</span>
                        <span className="ce-upload-text">Upload 16:9 Cover Image</span>
                    </div>

                    <div className="ce-categories">
                        {CATEGORIES.map((c, i) => (
                            <button key={i} className={`ce-cat-btn ${activeCategory === c.val ? 'active' : ''}`} onClick={() => setActiveCategory(c.val)}>
                                <span className="ce-cat-icon">{c.icon}</span>
                                <span className="ce-cat-label">{c.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ce-field ce-full-width" style={{ marginTop: '20px' }}>
                        <label className="ce-field-label">Event Title</label>
                        <input
                            type="text"
                            className="ce-input"
                            placeholder="Enter event name..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'white' }}
                        />
                    </div>

                    <div className="ce-field ce-full-width">
                        <label className="ce-field-label">Description</label>
                        <textarea
                            className="ce-input"
                            placeholder="What is this event about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'white', minHeight: '60px', resize: 'vertical' }}
                        />
                    </div>

                    <div className="ce-fields-row">
                        <div className="ce-field">
                            <label className="ce-field-label">Date</label>
                            <input
                                type="date"
                                className="ce-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: "DM Mono" }}
                            />
                        </div>
                        <div className="ce-field">
                            <label className="ce-field-label">Time</label>
                            <input
                                type="time"
                                className="ce-input"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: "DM Mono" }}
                            />
                        </div>
                    </div>

                    <div className="ce-field ce-full-width">
                        <label className="ce-field-label">Location</label>
                        <div className="ce-input ce-input-icon">
                            <span className="ce-loc-icon">📍</span>
                            <input
                                type="text"
                                placeholder="Enter Arena Coordinates..."
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'white' }}
                            />
                        </div>
                    </div>
                </section>

                {/* STEP 2: CAPACITY */}
                <section className="ce-section ce-section-border">
                    <div className="ce-section-head">
                        <span className="ce-step-label">STEP 2 △</span>
                        <span className="ce-section-title dim">CAPACITY</span>
                    </div>

                    <div className="ce-capacity-card">
                        <div className="ce-capacity-row">
                            <span className="ce-cap-label">Participant Limit</span>
                            <div className="ce-counter">
                                <button className="ce-counter-btn" onClick={() => setParticipantLimit(Math.max(1, participantLimit - 10))}>−</button>
                                <span className="ce-counter-val">{participantLimit}</span>
                                <button className="ce-counter-btn" onClick={() => setParticipantLimit(participantLimit + 10)}>+</button>
                            </div>
                        </div>

                        <div className="ce-toggle-row">
                            <span className="ce-toggle-label">ENABLE WAITLIST ○</span>
                            <div className={`ce-toggle ${waitlist ? 'active' : ''}`} onClick={() => setWaitlist(w => !w)} style={{ cursor: 'pointer' }}>
                                <div className="ce-toggle-dot" />
                            </div>
                        </div>

                        <div className="ce-toggle-row">
                            <span className="ce-toggle-label">TEAM MODE □</span>
                            <div className={`ce-toggle ${teamMode ? 'active' : ''}`} onClick={() => setTeamMode(t => !t)} style={{ cursor: 'pointer' }}>
                                <div className="ce-toggle-dot" />
                            </div>
                        </div>

                        <div className="ce-pricing">
                            <button className={`ce-price-btn ${pricing === 'FREE' ? 'active' : ''}`} onClick={() => setPricing('FREE')}>FREE ○</button>
                            <button className={`ce-price-btn ${pricing === 'PAID' ? 'active' : ''}`} onClick={() => setPricing('PAID')}>PAID △</button>
                        </div>
                    </div>
                </section>

                {/* STEP 3: VOLUNTEERS */}
                <section className="ce-section ce-section-border">
                    <div className="ce-section-head-row">
                        <div className="ce-section-head">
                            <span className="ce-step-label">STEP 3 □</span>
                            <span className="ce-section-title dim">VOLUNTEERS</span>
                        </div>
                        <div className="ce-vol-toggle-row">
                            <span className="ce-vol-label">NEED VOLUNTEERS? △</span>
                            <div className="ce-toggle small active orange">
                                <div className="ce-toggle-dot" />
                            </div>
                        </div>
                    </div>

                    <div className="ce-shift-card">
                        <div className="ce-shift-badge">SHIFT 01</div>
                        <div className="ce-field">
                            <label className="ce-field-label">Role Name</label>
                            <div className="ce-input">Gate Keeper</div>
                        </div>
                        <div className="ce-fields-row">
                            <div className="ce-field">
                                <label className="ce-field-label">Time Range</label>
                                <div className="ce-input">18:00 - 22:00</div>
                            </div>
                            <div className="ce-field">
                                <label className="ce-field-label">Count</label>
                                <div className="ce-input">4</div>
                            </div>
                        </div>
                        <div className="ce-skill-tags">
                            <span className="ce-skill-tag">STAMINA △</span>
                            <span className="ce-skill-tag">COMMUNICATION □</span>
                            <button className="ce-add-tag">+ ADD TAG</button>
                        </div>
                    </div>

                    <button className="ce-add-shift-btn">ADD SHIFT +</button>
                </section>

                {/* STEP 4: GAMIFICATION */}
                <section className="ce-section ce-section-border">
                    <div className="ce-section-head">
                        <span className="ce-step-label">STEP 4 ◇</span>
                        <span className="ce-section-title dim">GAMIFICATION</span>
                    </div>

                    <div className="ce-xp-row">
                        <span className="ce-xp-label">XP Reward</span>
                        <span className="ce-xp-value">+500 XP</span>
                    </div>
                    <div className="ce-xp-bar"><div className="ce-xp-fill" /></div>

                    <div className="ce-badge-creator">
                        <span className="ce-badge-title">Badge Architect</span>
                        <div className="ce-badge-preview">
                            <div className="ce-badge-hex">
                                <span>○</span>
                                <div className="ce-badge-name-tag">ELITE</div>
                            </div>
                        </div>
                        <div className="ce-badge-shapes">
                            <button className="ce-shape-btn active">○</button>
                            <button className="ce-shape-btn">△</button>
                            <button className="ce-shape-btn">□</button>
                            <button className="ce-shape-btn">◇</button>
                        </div>
                        <div className="ce-badge-colors">
                            <div className="ce-color-swatch active" style={{ background: '#f45c25' }} />
                            <div className="ce-color-swatch" style={{ background: '#22d3ee' }} />
                            <div className="ce-color-swatch" style={{ background: '#9333ea' }} />
                            <div className="ce-color-swatch" style={{ background: '#475569' }} />
                        </div>
                        <div className="ce-badge-name-input">Badge Name...</div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <div className="ce-footer">
                <button
                    className="ce-deploy-btn"
                    onClick={handleDeploy}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'DEPLOYING...' : 'DEPLOY TO THE ARENA □'}
                </button>
                <button className="ce-draft-btn" onClick={() => navigate(-1)}>SAVE DRAFT △</button>
            </div>
        </div>
    );
}

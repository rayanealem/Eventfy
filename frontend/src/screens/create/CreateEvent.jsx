import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './CreateEvent.css';

const CATEGORIES = [
    { icon: '○', label: 'SPORT', val: 'sport' },
    { icon: '△', label: 'SCIENCE', val: 'science' },
    { icon: '□', label: 'CHARITY', val: 'charity' },
    { icon: '◇', label: 'CULTURAL', val: 'cultural' },
];

const STEP_META = [
    { num: '○', label: 'BASICS' },
    { num: '△', label: 'CAPACITY' },
    { num: '□', label: 'VOLUNTEERS' },
    { num: '◇', label: 'GAMIFICATION' },
];

const emptyShift = () => ({
    id: Date.now() + Math.random(),
    roleName: '',
    timeStart: '',
    timeEnd: '',
    count: 2,
    skills: [],
});

export default function CreateEvent() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    // Step navigation
    const [activeStep, setActiveStep] = useState(0);

    // Step 1: Basics
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [activeCategory, setActiveCategory] = useState('sport');

    // Step 2: Capacity
    const [participantLimit, setParticipantLimit] = useState(100);
    const [waitlist, setWaitlist] = useState(true);
    const [teamMode, setTeamMode] = useState(false);
    const [pricing, setPricing] = useState('FREE');

    // Step 3: Volunteers
    const [needsVolunteers, setNeedsVolunteers] = useState(true);
    const [shifts, setShifts] = useState([emptyShift()]);

    // Step 4: Gamification
    const [xpCheckin, setXpCheckin] = useState(100);
    const [xpCompletion, setXpCompletion] = useState(200);
    const [badgeName, setBadgeName] = useState('');
    const [badgeShape, setBadgeShape] = useState('○');
    const [badgeColor, setBadgeColor] = useState('#f45c25');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stepErrors, setStepErrors] = useState({});

    // --- Type Specific & Form Options ---
    const [requireCustomForm, setRequireCustomForm] = useState(false);
    
    // Sport
    const [sportTeamA, setSportTeamA] = useState('');
    const [sportTeamB, setSportTeamB] = useState('');
    const [sportLeague, setSportLeague] = useState('');
    const [sportLiveScore, setSportLiveScore] = useState(false);

    // Science
    const [scienceCallPapers, setScienceCallPapers] = useState(false);
    const [scienceDeadline, setScienceDeadline] = useState('');
    const [scienceWordLimit, setScienceWordLimit] = useState('');
    const [sciencePdf, setSciencePdf] = useState(true);

    // Charity
    const [charityNgoCert, setCharityNgoCert] = useState('');
    const [charityLiveProgress, setCharityLiveProgress] = useState(true);

    // Cultural
    const [culturalAgeVerify, setCulturalAgeVerify] = useState(false);

    // -- Shift management --
    const addShift = () => setShifts(prev => [...prev, emptyShift()]);
    const removeShift = (id) => setShifts(prev => prev.filter(s => s.id !== id));
    const updateShift = (id, field, value) => {
        setShifts(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };
    const addSkillToShift = (id, skill) => {
        if (!skill.trim()) return;
        setShifts(prev => prev.map(s =>
            s.id === id ? { ...s, skills: [...s.skills, skill.trim().toUpperCase()] } : s
        ));
    };
    const removeSkillFromShift = (shiftId, skillIdx) => {
        setShifts(prev => prev.map(s =>
            s.id === shiftId ? { ...s, skills: s.skills.filter((_, i) => i !== skillIdx) } : s
        ));
    };

    // -- Validation per step --
    const validateStep = (step) => {
        const errors = {};
        if (step === 0) {
            if (!title.trim()) errors.title = 'Event title is required';
            if (!date) errors.date = 'Date is required';
            if (!time) errors.time = 'Time is required';
        }
        if (step === 1) {
            if (participantLimit < 1) errors.capacity = 'Capacity must be at least 1';
        }
        setStepErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const goNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => Math.min(prev + 1, 3));
        }
    };
    const goBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

    // -- Deploy --
    const handleDeploy = async () => {
        if (!title || !date || !time) {
            setActiveStep(0);
            validateStep(0);
            return;
        }

        const org = profile?.managed_orgs?.[0];
        if (!org) {
            alert("You must belong to an organization to create events.");
            return;
        }

        setIsSubmitting(true);
        try {
            const startsAt = new Date(`${date}T${time}`).toISOString();
            const endsAt = new Date(new Date(startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString();

            let typeDetails = null;
            if (activeCategory === 'sport') {
                typeDetails = { team_a_name: sportTeamA, team_b_name: sportTeamB, league_name: sportLeague, live_score_enabled: sportLiveScore };
            } else if (activeCategory === 'science') {
                typeDetails = { call_for_papers: scienceCallPapers, submission_deadline: scienceDeadline || null, abstract_word_limit: scienceWordLimit ? parseInt(scienceWordLimit) : null, accept_pdf_uploads: sciencePdf };
            } else if (activeCategory === 'charity') {
                typeDetails = { ngo_cert_number: charityNgoCert, show_live_progress: charityLiveProgress };
            } else if (activeCategory === 'cultural') {
                typeDetails = { require_age_verify: culturalAgeVerify };
            }

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
                address: location,
                wilaya: "16 - Algiers",
                city: "Algiers",
                is_online: false,
                is_international: false,
                capacity: participantLimit,
                waitlist_enabled: waitlist,
                team_mode: teamMode,
                is_paid: pricing === 'PAID',
                is_live: isLive,
                xp_checkin: xpCheckin,
                xp_completion: xpCompletion,
                xp_winner: 0,
                xp_volunteer_multiplier: true,
                require_custom_form: requireCustomForm,
                type_details: typeDetails,
                volunteer_shifts: needsVolunteers ? shifts.map(s => ({
                    role_name: s.roleName,
                    time_start: s.timeStart,
                    time_end: s.timeEnd,
                    count: s.count,
                    required_skills: s.skills,
                })) : [],
                badge: badgeName ? {
                    name: badgeName,
                    shape: badgeShape,
                    color: badgeColor,
                } : null,
            };

            const created = await api('POST', '/events', payload);
            await api('POST', `/events/${created.id}/publish`);
            navigate(`/manage/${created.id}`);
        } catch (e) {
            console.error("Deploy failed:", e);
            alert("Failed to create event: " + e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepVariants = {
        enter: { x: 40, opacity: 0 },
        center: { x: 0, opacity: 1, transition: { duration: 0.25 } },
        exit: { x: -40, opacity: 0, transition: { duration: 0.15 } },
    };

    return (
        <div className="ce-root">
            <div className="ce-noise" />

            {/* Header */}
            <header className="ce-header">
                <div className="ce-header-top">
                    <button className="ce-back" onClick={() => {
                        if (activeStep > 0) goBack();
                        else if (window.confirm('Discard draft?')) navigate(-1);
                    }}>‹</button>
                    <h1 className="ce-title">CREATE EVENT □</h1>
                    <button className="ce-close" onClick={() => { if (window.confirm('Discard draft?')) navigate(-1); }}>✕</button>
                </div>
                <div className="ce-progress">
                    <div className="ce-progress-line" />
                    {STEP_META.map((s, i) => (
                        <div
                            key={i}
                            className={`ce-step ${i === activeStep ? 'active' : ''} ${i < activeStep ? 'completed' : ''}`}
                            onClick={() => { if (i < activeStep) setActiveStep(i); }}
                            style={{ cursor: i < activeStep ? 'pointer' : 'default' }}
                        >
                            <span>{i < activeStep ? '✓' : s.num}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 24px', marginTop: '4px' }}>
                    {STEP_META.map((s, i) => (
                        <span key={i} style={{
                            fontSize: '9px',
                            fontFamily: 'DM Mono, monospace',
                            color: i === activeStep ? '#f45c25' : i < activeStep ? '#2dd4bf' : '#475569',
                            letterSpacing: '1px',
                            textAlign: 'center',
                            flex: 1,
                        }}>{s.label}</span>
                    ))}
                </div>
            </header>

            {/* Main — Step Content */}
            <div className="ce-main">
                <AnimatePresence mode="wait">
                    {/* STEP 1: BASICS */}
                    {activeStep === 0 && (
                        <motion.section key="step0" variants={stepVariants} initial="enter" animate="center" exit="exit" className="ce-section">
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
                                <label className="ce-field-label">Event Title {stepErrors.title && <span style={{ color: '#ef4444', fontSize: '10px', marginLeft: '8px' }}>⚠ {stepErrors.title}</span>}</label>
                                <input
                                    type="text"
                                    className="ce-input"
                                    placeholder="Enter event name..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    style={{ width: '100%', background: 'transparent', border: stepErrors.title ? '1px solid #ef4444' : 'none', outline: 'none', color: 'white' }}
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
                                    <label className="ce-field-label">Date {stepErrors.date && <span style={{ color: '#ef4444', fontSize: '10px' }}>⚠</span>}</label>
                                    <input
                                        type="date"
                                        className="ce-input"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        style={{ background: 'transparent', border: stepErrors.date ? '1px solid #ef4444' : 'none', outline: 'none', color: 'white', fontFamily: "DM Mono" }}
                                    />
                                </div>
                                <div className="ce-field">
                                    <label className="ce-field-label">Time {stepErrors.time && <span style={{ color: '#ef4444', fontSize: '10px' }}>⚠</span>}</label>
                                    <input
                                        type="time"
                                        className="ce-input"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        style={{ background: 'transparent', border: stepErrors.time ? '1px solid #ef4444' : 'none', outline: 'none', color: 'white', fontFamily: "DM Mono" }}
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

                            <div className="ce-field ce-full-width" style={{ marginTop: '20px' }}>
                                <div className="ce-section-head" style={{ marginBottom: '16px' }}>
                                    <span className="ce-section-title">TYPE-SPECIFIC DETAILS</span>
                                </div>
                                
                                {activeCategory === 'sport' && (
                                    <>
                                        <div className="ce-fields-row" style={{ marginBottom: '16px' }}>
                                            <div className="ce-field">
                                                <label className="ce-field-label">Team A Name</label>
                                                <input type="text" className="ce-input" placeholder="Home Team" value={sportTeamA} onChange={(e) => setSportTeamA(e.target.value)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white' }} />
                                            </div>
                                            <div className="ce-field">
                                                <label className="ce-field-label">Team B Name</label>
                                                <input type="text" className="ce-input" placeholder="Away Team" value={sportTeamB} onChange={(e) => setSportTeamB(e.target.value)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white' }} />
                                            </div>
                                        </div>
                                        <div className="ce-field" style={{ marginBottom: '16px' }}>
                                            <label className="ce-field-label">League/Tournament Name</label>
                                            <input type="text" className="ce-input" placeholder="e.g. World Cup 2026" value={sportLeague} onChange={(e) => setSportLeague(e.target.value)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white' }} />
                                        </div>
                                        <div className="ce-toggle-row" style={{ padding: 0 }}>
                                            <span className="ce-toggle-label">ENABLE LIVE SCORES ○</span>
                                            <div className={`ce-toggle ${sportLiveScore ? 'active' : ''}`} onClick={() => setSportLiveScore(!sportLiveScore)} style={{ cursor: 'pointer' }}>
                                                <div className="ce-toggle-dot" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeCategory === 'science' && (
                                    <>
                                        <div className="ce-toggle-row" style={{ padding: 0, marginBottom: '16px' }}>
                                            <span className="ce-toggle-label">CALL FOR PAPERS ○</span>
                                            <div className={`ce-toggle ${scienceCallPapers ? 'active' : ''}`} onClick={() => setScienceCallPapers(!scienceCallPapers)} style={{ cursor: 'pointer' }}>
                                                <div className="ce-toggle-dot" />
                                            </div>
                                        </div>
                                        {scienceCallPapers && (
                                            <>
                                                <div className="ce-fields-row" style={{ marginBottom: '16px' }}>
                                                    <div className="ce-field">
                                                        <label className="ce-field-label">Submission Deadline</label>
                                                        <input type="date" className="ce-input" value={scienceDeadline} onChange={(e) => setScienceDeadline(e.target.value)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white' }} />
                                                    </div>
                                                    <div className="ce-field">
                                                        <label className="ce-field-label">Word Limit</label>
                                                        <input type="number" className="ce-input" placeholder="e.g. 500" value={scienceWordLimit} onChange={(e) => setScienceWordLimit(e.target.value)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white' }} />
                                                    </div>
                                                </div>
                                                <div className="ce-toggle-row" style={{ padding: 0 }}>
                                                    <span className="ce-toggle-label">ACCEPT PDF UPLOADS ○</span>
                                                    <div className={`ce-toggle ${sciencePdf ? 'active' : ''}`} onClick={() => setSciencePdf(!sciencePdf)} style={{ cursor: 'pointer' }}>
                                                        <div className="ce-toggle-dot" />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {activeCategory === 'charity' && (
                                    <>
                                        <div className="ce-field" style={{ marginBottom: '16px' }}>
                                            <label className="ce-field-label">NGO Certification Number</label>
                                            <input type="text" className="ce-input" placeholder="Required for legal charity" value={charityNgoCert} onChange={(e) => setCharityNgoCert(e.target.value)} style={{ background: 'transparent', border: '1px solid #334155', color: 'white' }} />
                                        </div>
                                        <div className="ce-toggle-row" style={{ padding: 0 }}>
                                            <span className="ce-toggle-label">SHOW DONATION PROGRESS ○</span>
                                            <div className={`ce-toggle ${charityLiveProgress ? 'active' : ''}`} onClick={() => setCharityLiveProgress(!charityLiveProgress)} style={{ cursor: 'pointer' }}>
                                                <div className="ce-toggle-dot" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeCategory === 'cultural' && (
                                    <>
                                        <div className="ce-toggle-row" style={{ padding: 0 }}>
                                            <span className="ce-toggle-label">REQUIRE AGE VERIFICATION (+18) ○</span>
                                            <div className={`ce-toggle ${culturalAgeVerify ? 'active' : ''}`} onClick={() => setCulturalAgeVerify(!culturalAgeVerify)} style={{ cursor: 'pointer', borderColor: culturalAgeVerify ? '#ef4444' : '' }}>
                                                <div className="ce-toggle-dot" style={{ background: culturalAgeVerify ? '#ef4444' : '' }} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="ce-section-head" style={{ marginTop: '32px', marginBottom: '16px' }}>
                                    <span className="ce-section-title">REGISTRATION & FORM</span>
                                </div>
                                <div className="ce-info-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed #3A3D42', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ marginRight: '16px' }}>
                                        <h4 style={{ margin: 0, fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>Require Custom Form</h4>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#94a3b8' }}>If enabled, players must fill out their Name, Phone, and Extra Info instead of instant 1-click registration.</p>
                                    </div>
                                    <div className={`ce-toggle ${requireCustomForm ? 'active' : ''}`} onClick={() => setRequireCustomForm(!requireCustomForm)} style={{ cursor: 'pointer', flexShrink: 0 }}>
                                        <div className="ce-toggle-dot" />
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* STEP 2: CAPACITY */}
                    {activeStep === 1 && (
                        <motion.section key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="ce-section">
                            <div className="ce-section-head">
                                <span className="ce-step-label active">STEP 2 △</span>
                                <span className="ce-section-title">CAPACITY</span>
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

                                <div className="ce-toggle-row">
                                    <span className="ce-toggle-label" style={{ color: '#ef4444' }}>IS LIVE NOW? ○</span>
                                    <div className={`ce-toggle ${isLive ? 'active' : ''}`} onClick={() => setIsLive(l => !l)} style={{ cursor: 'pointer', borderColor: isLive ? '#ef4444' : '' }}>
                                        <div className="ce-toggle-dot" style={{ background: isLive ? '#ef4444' : '' }} />
                                    </div>
                                </div>

                                <div className="ce-pricing">
                                    <button className={`ce-price-btn ${pricing === 'FREE' ? 'active' : ''}`} onClick={() => setPricing('FREE')}>FREE ○</button>
                                    <button className={`ce-price-btn ${pricing === 'PAID' ? 'active' : ''}`} onClick={() => setPricing('PAID')}>PAID △</button>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {/* STEP 3: VOLUNTEERS */}
                    {activeStep === 2 && (
                        <motion.section key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" className="ce-section">
                            <div className="ce-section-head-row">
                                <div className="ce-section-head">
                                    <span className="ce-step-label active">STEP 3 □</span>
                                    <span className="ce-section-title">VOLUNTEERS</span>
                                </div>
                                <div className="ce-vol-toggle-row">
                                    <span className="ce-vol-label">NEED VOLUNTEERS? △</span>
                                    <div className={`ce-toggle small ${needsVolunteers ? 'active orange' : ''}`} onClick={() => setNeedsVolunteers(v => !v)} style={{ cursor: 'pointer' }}>
                                        <div className="ce-toggle-dot" />
                                    </div>
                                </div>
                            </div>

                            {needsVolunteers && (
                                <>
                                    {shifts.map((shift, idx) => (
                                        <div key={shift.id} className="ce-shift-card">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div className="ce-shift-badge">SHIFT {String(idx + 1).padStart(2, '0')}</div>
                                                {shifts.length > 1 && (
                                                    <button onClick={() => removeShift(shift.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontFamily: 'DM Mono' }}>✕ REMOVE</button>
                                                )}
                                            </div>
                                            <div className="ce-field">
                                                <label className="ce-field-label">Role Name</label>
                                                <input
                                                    type="text"
                                                    className="ce-input"
                                                    placeholder="e.g. Gate Keeper"
                                                    value={shift.roleName}
                                                    onChange={(e) => updateShift(shift.id, 'roleName', e.target.value)}
                                                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'white' }}
                                                />
                                            </div>
                                            <div className="ce-fields-row">
                                                <div className="ce-field">
                                                    <label className="ce-field-label">Start Time</label>
                                                    <input
                                                        type="time"
                                                        className="ce-input"
                                                        value={shift.timeStart}
                                                        onChange={(e) => updateShift(shift.id, 'timeStart', e.target.value)}
                                                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: "DM Mono" }}
                                                    />
                                                </div>
                                                <div className="ce-field">
                                                    <label className="ce-field-label">End Time</label>
                                                    <input
                                                        type="time"
                                                        className="ce-input"
                                                        value={shift.timeEnd}
                                                        onChange={(e) => updateShift(shift.id, 'timeEnd', e.target.value)}
                                                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontFamily: "DM Mono" }}
                                                    />
                                                </div>
                                                <div className="ce-field">
                                                    <label className="ce-field-label">Count</label>
                                                    <div className="ce-counter" style={{ justifyContent: 'center' }}>
                                                        <button className="ce-counter-btn" onClick={() => updateShift(shift.id, 'count', Math.max(1, shift.count - 1))}>−</button>
                                                        <span className="ce-counter-val" style={{ minWidth: '24px', textAlign: 'center' }}>{shift.count}</span>
                                                        <button className="ce-counter-btn" onClick={() => updateShift(shift.id, 'count', shift.count + 1)}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ce-skill-tags">
                                                {shift.skills.map((skill, si) => (
                                                    <span key={si} className="ce-skill-tag" onClick={() => removeSkillFromShift(shift.id, si)} style={{ cursor: 'pointer' }}>
                                                        {skill} ✕
                                                    </span>
                                                ))}
                                                <button className="ce-add-tag" onClick={() => {
                                                    const skill = prompt('Enter skill tag:');
                                                    if (skill) addSkillToShift(shift.id, skill);
                                                }}>+ ADD TAG</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="ce-add-shift-btn" onClick={addShift}>ADD SHIFT +</button>
                                </>
                            )}
                        </motion.section>
                    )}

                    {/* STEP 4: GAMIFICATION */}
                    {activeStep === 3 && (
                        <motion.section key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" className="ce-section">
                            <div className="ce-section-head">
                                <span className="ce-step-label active">STEP 4 ◇</span>
                                <span className="ce-section-title">GAMIFICATION</span>
                            </div>

                            <div className="ce-xp-row">
                                <span className="ce-xp-label">Check-in XP</span>
                                <div className="ce-counter">
                                    <button className="ce-counter-btn" onClick={() => setXpCheckin(Math.max(0, xpCheckin - 50))}>−</button>
                                    <span className="ce-xp-value">+{xpCheckin} XP</span>
                                    <button className="ce-counter-btn" onClick={() => setXpCheckin(xpCheckin + 50)}>+</button>
                                </div>
                            </div>
                            <div className="ce-xp-row" style={{ marginTop: '12px' }}>
                                <span className="ce-xp-label">Completion XP</span>
                                <div className="ce-counter">
                                    <button className="ce-counter-btn" onClick={() => setXpCompletion(Math.max(0, xpCompletion - 50))}>−</button>
                                    <span className="ce-xp-value">+{xpCompletion} XP</span>
                                    <button className="ce-counter-btn" onClick={() => setXpCompletion(xpCompletion + 50)}>+</button>
                                </div>
                            </div>
                            <div className="ce-xp-bar"><div className="ce-xp-fill" style={{ width: `${Math.min(100, ((xpCheckin + xpCompletion) / 1000) * 100)}%` }} /></div>

                            <div className="ce-badge-creator">
                                <span className="ce-badge-title">Badge Architect</span>
                                <div className="ce-badge-preview">
                                    <div className="ce-badge-hex" style={{ borderColor: badgeColor, color: badgeColor }}>
                                        <span>{badgeShape}</span>
                                        <div className="ce-badge-name-tag">{badgeName || 'BADGE'}</div>
                                    </div>
                                </div>
                                <div className="ce-badge-shapes">
                                    {['○', '△', '□', '◇'].map(s => (
                                        <button key={s} className={`ce-shape-btn ${badgeShape === s ? 'active' : ''}`} onClick={() => setBadgeShape(s)}>{s}</button>
                                    ))}
                                </div>
                                <div className="ce-badge-colors">
                                    {['#f45c25', '#22d3ee', '#9333ea', '#475569'].map(c => (
                                        <div key={c} className={`ce-color-swatch ${badgeColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setBadgeColor(c)} />
                                    ))}
                                </div>
                                <div className="ce-field" style={{ marginTop: '12px' }}>
                                    <input
                                        type="text"
                                        className="ce-input"
                                        placeholder="Badge Name..."
                                        value={badgeName}
                                        onChange={(e) => setBadgeName(e.target.value.toUpperCase())}
                                        style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'white', textAlign: 'center', letterSpacing: '2px' }}
                                    />
                                </div>
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="ce-footer">
                {activeStep < 3 ? (
                    <button className="ce-deploy-btn" onClick={goNext}>
                        NEXT →
                    </button>
                ) : (
                    <button
                        className="ce-deploy-btn"
                        onClick={handleDeploy}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'DEPLOYING...' : 'DEPLOY TO THE ARENA □'}
                    </button>
                )}
                {activeStep < 3 ? (
                    activeStep > 0 ? (
                        <button className="ce-draft-btn" onClick={goBack}>← BACK</button>
                    ) : (
                        <button className="ce-draft-btn" onClick={() => navigate(-1)}>CANCEL</button>
                    )
                ) : (
                    <button className="ce-draft-btn" onClick={() => navigate(-1)}>SAVE DRAFT △</button>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './CreateEvent.css';

const CATEGORIES = [
    { icon: '○', label: 'SPORT', active: true },
    { icon: '◇', label: 'SCIENCE', active: false },
    { icon: '□', label: 'CHARITY', active: false },
    { icon: '◇', label: 'CULTURAL', active: false },
];

const STEPS = [
    { num: '○', label: 'BASICS', active: true },
    { num: '△', label: 'CAPACITY', active: false },
    { num: '□', label: 'VOLUNTEERS', active: false },
    { num: '◇', label: 'GAMIFICATION', active: false },
];

export default function CreateEvent() {
    const navigate = useNavigate();
    const [participantLimit, setParticipantLimit] = useState(100);

    return (
        <div className="ce-root">
            <div className="ce-noise" />

            {/* Header */}
            <header className="ce-header">
                <div className="ce-header-top">
                    <button className="ce-back" onClick={() => navigate(-1)}>‹</button>
                    <h1 className="ce-title">CREATE EVENT □</h1>
                    <button className="ce-close">✕</button>
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
                            <button key={i} className={`ce-cat-btn ${c.active ? 'active' : ''}`}>
                                <span className="ce-cat-icon">{c.icon}</span>
                                <span className="ce-cat-label">{c.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ce-fields-row">
                        <div className="ce-field">
                            <label className="ce-field-label">Date</label>
                            <div className="ce-input">mm/dd/yyyy</div>
                        </div>
                        <div className="ce-field">
                            <label className="ce-field-label">Time</label>
                            <div className="ce-input">--:-- --</div>
                        </div>
                    </div>

                    <div className="ce-field ce-full-width">
                        <label className="ce-field-label">Location</label>
                        <div className="ce-input ce-input-icon">
                            <span className="ce-loc-icon">📍</span>
                            <span className="ce-placeholder">Enter Arena Coordinates...</span>
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
                                <button className="ce-counter-btn">−</button>
                                <span className="ce-counter-val">{participantLimit}</span>
                                <button className="ce-counter-btn">+</button>
                            </div>
                        </div>

                        <div className="ce-toggle-row">
                            <span className="ce-toggle-label">ENABLE WAITLIST ○</span>
                            <div className="ce-toggle active">
                                <div className="ce-toggle-dot" />
                            </div>
                        </div>

                        <div className="ce-toggle-row">
                            <span className="ce-toggle-label">TEAM MODE □</span>
                            <div className="ce-toggle">
                                <div className="ce-toggle-dot" />
                            </div>
                        </div>

                        <div className="ce-pricing">
                            <button className="ce-price-btn active">FREE ○</button>
                            <button className="ce-price-btn">PAID △</button>
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
                <button className="ce-deploy-btn">DEPLOY TO THE ARENA □</button>
                <button className="ce-draft-btn">SAVE DRAFT △</button>
            </div>
        </div>
    );
}

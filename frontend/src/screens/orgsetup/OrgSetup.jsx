import './OrgSetup.css';

const STEPS = [
    { icon: '○', label: 'IDENTITY', active: true },
    { icon: '△', label: 'TEAM', active: false },
    { icon: '□', label: 'EVENT', active: false },
    { icon: '◇', label: 'GAMIFY', active: false },
    { icon: '⬡', label: 'DISCOVER', active: false },
];

const CATEGORIES = [
    { label: 'TECH', active: true },
    { label: 'SPORT', active: false },
    { label: 'ART', active: true },
    { label: 'GAMING', active: false },
    { label: 'MUSIC', active: false },
];

export default function OrgSetup() {
    return (
        <div className="orgset-root">
            <div className="orgset-noise" />

            {/* Header */}
            <header className="orgset-header">
                <div className="orgset-header-top">
                    <span className="orgset-back">‹</span>
                    <h1 className="orgset-title">WELCOME TO THE<br />ARENA □</h1>
                    <span className="orgset-menu">⊕</span>
                </div>

                {/* Progress Bar */}
                <div className="orgset-progress">
                    {STEPS.map((s, i) => (
                        <div key={i} className="orgset-prog-item">
                            <div className={`orgset-prog-icon ${s.active ? 'active' : ''}`}>
                                <span>{s.icon}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`orgset-prog-line ${s.active ? 'active' : ''}`} />}
                        </div>
                    ))}
                </div>
            </header>

            {/* Main Form */}
            <div className="orgset-main">
                {/* Step 1: Identity */}
                <section className="orgset-section">
                    <div className="orgset-section-head">
                        <span className="orgset-section-label active">Step 1 ○ IDENTITY</span>
                        <span className="orgset-section-status">INITIATING PROTOCOL</span>
                    </div>

                    {/* Cover Upload */}
                    <div className="orgset-cover-upload">
                        <span className="orgset-upload-icon">↑</span>
                        <span className="orgset-upload-title">UPLOAD COVER IMAGE</span>
                        <span className="orgset-upload-hint">16:9 RATIO REQUIRED</span>
                    </div>

                    {/* Logo + Tagline */}
                    <div className="orgset-logo-row">
                        <div className="orgset-logo-upload">
                            <span className="orgset-logo-icon">+</span>
                        </div>
                        <div className="orgset-tagline-field">
                            <label className="orgset-label">Tagline □</label>
                            <input className="orgset-input" placeholder="Enter Arena Slogan..." />
                        </div>
                    </div>

                    {/* Social */}
                    <div className="orgset-social-row">
                        <div className="orgset-social-input">
                            <span className="orgset-social-icon">🌐</span>
                            <input className="orgset-input sm" placeholder="Website" />
                        </div>
                        <div className="orgset-social-input">
                            <span className="orgset-social-icon">𝕏</span>
                            <input className="orgset-input sm" placeholder="Twitter" />
                        </div>
                    </div>
                </section>

                {/* Step 2: Team */}
                <section className="orgset-section">
                    <div className="orgset-section-head">
                        <span className="orgset-section-label">Step 2 △ TEAM</span>
                        <span className="orgset-skip-link">SKIP FOR NOW</span>
                    </div>

                    <label className="orgset-label">INVITE PLAYERS △</label>
                    <div className="orgset-invite-row">
                        <input className="orgset-input flex1" placeholder="Email or Player #" />
                        <div className="orgset-role-select">
                            <span>President △</span>
                            <span className="orgset-select-arrow">▼</span>
                        </div>
                        <button className="orgset-invite-btn">+</button>
                    </div>

                    <div className="orgset-team-grid">
                        <div className="orgset-team-card active">
                            <div className="orgset-team-avatar"><span>001</span></div>
                            <div className="orgset-team-info">
                                <span className="orgset-team-name">GM_VOLD</span>
                                <span className="orgset-team-role">President △</span>
                            </div>
                        </div>
                        <div className="orgset-team-card">
                            <div className="orgset-team-avatar muted"><span>+</span></div>
                            <div className="orgset-team-info">
                                <span className="orgset-team-name">Pending...</span>
                                <span className="orgset-team-role">VP ○</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 3: First Event */}
                <section className="orgset-section">
                    <div className="orgset-section-head">
                        <span className="orgset-section-label">Step 3 □ FIRST EVENT</span>
                    </div>
                    <div className="orgset-event-card">
                        <span className="orgset-event-icon">📅</span>
                        <span className="orgset-event-title">READY TO COMMENCE?</span>
                        <span className="orgset-event-desc">Initialize your first challenge to attract<br />participants to your arena.</span>
                        <button className="orgset-event-btn primary">CREATE EVENT NOW □</button>
                        <button className="orgset-event-btn outline">SKIP</button>
                    </div>
                </section>

                {/* Step 4: Gamification */}
                <section className="orgset-section">
                    <div className="orgset-section-head">
                        <span className="orgset-section-label">Step 4 ◇ GAMIFICATION</span>
                    </div>

                    <div className="orgset-xp-header">
                        <span className="orgset-label">XP ALLOCATION ◇</span>
                        <span className="orgset-xp-value">2,500 XP</span>
                    </div>
                    <div className="orgset-xp-bar">
                        <div className="orgset-xp-fill" />
                    </div>

                    <div className="orgset-multiplier-row">
                        <div className="orgset-multiplier-info">
                            <span className="orgset-mult-name">VOLUNTEER MULTIPLIER</span>
                            <span className="orgset-mult-desc">Boost XP for support roles</span>
                        </div>
                        <div className="orgset-mult-toggle">
                            <button className="orgset-mult-btn active">2×</button>
                            <button className="orgset-mult-btn">3×</button>
                        </div>
                    </div>

                    <div className="orgset-badge-section">
                        <span className="orgset-label">Badge Creator</span>
                        <div className="orgset-badge-row">
                            <div className="orgset-badge-preview">🏆</div>
                            <div className="orgset-badge-shapes">
                                <button className="orgset-shape-btn">○</button>
                                <button className="orgset-shape-btn">△</button>
                                <button className="orgset-shape-btn">□</button>
                                <button className="orgset-shape-btn active">◇</button>
                            </div>
                        </div>
                        <input className="orgset-input" placeholder="Badge Name (e.g. VIP Guard)" />
                    </div>
                </section>

                {/* Step 5: Discovery */}
                <section className="orgset-section">
                    <div className="orgset-section-head">
                        <span className="orgset-section-label">Step 5 ⬡ DISCOVERY</span>
                    </div>

                    <span className="orgset-label">CATEGORIES ⬡</span>
                    <div className="orgset-cat-row">
                        {CATEGORIES.map((c, i) => (
                            <button key={i} className={`orgset-cat-btn ${c.active ? 'active' : ''}`}>{c.label}</button>
                        ))}
                    </div>

                    <div className="orgset-toggle-list">
                        <div className="orgset-toggle-item">
                            <span className="orgset-toggle-label">ENABLE ORG STORIES □</span>
                            <div className="orgset-toggle on"><div className="orgset-toggle-knob" /></div>
                        </div>
                        <div className="orgset-toggle-item">
                            <span className="orgset-toggle-label">ALLOW SPONSORSHIPS ◇</span>
                            <div className="orgset-toggle off"><div className="orgset-toggle-knob" /></div>
                        </div>
                    </div>
                </section>

                {/* Completion Card */}
                <div className="orgset-completion">
                    <div className="orgset-comp-gold-line" />
                    <div className="orgset-comp-icon">🏛</div>
                    <h2 className="orgset-comp-title">YOUR ARENA IS<br />READY ◇</h2>
                    <p className="orgset-comp-quote">"The games are about to begin. May<br />the odds favor your organization."</p>
                    <button className="orgset-comp-btn">GO TO ORG DASHBOARD □</button>
                </div>
            </div>
        </div>
    );
}

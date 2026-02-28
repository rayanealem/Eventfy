import './OnboardingSteps.css';

const SKILLS_DATA = [
    { label: 'Python', active: true },
    { label: 'React', active: false },
    { label: 'Design', active: true },
    { label: 'Cybersec', active: false },
    { label: 'Marketing', active: false },
    { label: 'Gaming', active: true },
    { label: 'AI/ML', active: false },
    { label: 'Blockchain', active: false },
    { label: 'Event Planning', active: false },
];

const ALLIES = [
    { name: 'TECH_SQUAD', members: '2.4K MEMBERS', color: 'rgba(19,236,236,0.2)', img: 'https://i.pravatar.cc/56?img=3' },
    { name: 'NEON_CLAN', members: '1.1K MEMBERS', color: 'rgba(255,77,77,0.2)', img: 'https://i.pravatar.cc/56?img=5' },
    { name: 'VOID_WALK', members: '850 MEMBERS', color: 'rgba(255,204,0,0.2)', img: 'https://i.pravatar.cc/56?img=8' },
    { name: 'PROTO_X', members: '4.2K MEMBERS', color: 'rgba(255,255,255,0.2)', img: 'https://i.pravatar.cc/56?img=12' },
];

export default function OnboardingSteps() {
    return (
        <div className="obs-root">
            {/* Sticky Header */}
            <header className="obs-sticky-header">
                <span className="obs-brand">EVENTFY</span>
                <div className="obs-header-shapes">
                    <span className="obs-h-shape active">○</span>
                    <span className="obs-h-shape active">△</span>
                    <span className="obs-h-shape">□</span>
                    <span className="obs-h-shape">◇</span>
                </div>
            </header>

            <div className="obs-main">
                {/* STEP 2: PROFILE */}
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 2: WHO ARE YOU? ○</h2>

                    <div className="obs-avatar-zone">
                        <div className="obs-hex-upload">
                            <span className="obs-upload-icon">↑</span>
                        </div>
                        <span className="obs-upload-label">Upl0ad Identity</span>
                    </div>

                    <div className="obs-symbol-section">
                        <span className="obs-sub-label">Select Your Symbol</span>
                        <div className="obs-symbols">
                            <button className="obs-sym">○</button>
                            <button className="obs-sym active">△</button>
                            <button className="obs-sym">□</button>
                            <button className="obs-sym">◇</button>
                        </div>
                        <div className="obs-colors">
                            <div className="obs-color active" style={{ background: '#13ecec' }} />
                            <div className="obs-color" style={{ background: '#ff4d4d' }} />
                            <div className="obs-color" style={{ background: '#fc0' }} />
                            <div className="obs-color" style={{ background: '#fff' }} />
                        </div>
                    </div>

                    <div className="obs-username-field">
                        <span className="obs-field-label">Username Entry</span>
                        <div className="obs-username-input-wrap">
                            <input className="obs-text-input" defaultValue="@ahmed_dev" />
                            <span className="obs-avail">✓ AVAILABLE</span>
                        </div>
                    </div>

                    <button className="obs-cta-btn cyan round">SAVE & CONTINUE △</button>
                </section>

                {/* STEP 3: ATTRIBUTES */}
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 3: WHAT ARE YOU<br />MADE OF? △</h2>
                    <div className="obs-skills-cloud">
                        {SKILLS_DATA.map((s, i) => (
                            <button key={i} className={`obs-pill ${s.active ? 'active' : ''}`}>{s.label}</button>
                        ))}
                    </div>
                    <button className="obs-cta-btn outline">CONTINUE □</button>
                </section>

                {/* STEP 4: LOCATION */}
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 4: WHERE DO YOU<br />PLAY? □</h2>

                    <div className="obs-field">
                        <span className="obs-field-label">Region Select</span>
                        <div className="obs-dropdown"><span>Algiers (Wilaya 16)</span><span className="obs-dd-arrow">▼</span></div>
                    </div>

                    <div className="obs-field">
                        <span className="obs-field-label">Base of Operations</span>
                        <div className="obs-dropdown"><span>USTHB University</span><span className="obs-dd-arrow">▼</span></div>
                    </div>

                    <div className="obs-field">
                        <span className="obs-field-label">Radar Radius</span>
                        <div className="obs-radar">
                            <button className="obs-radar-btn">10KM</button>
                            <button className="obs-radar-btn active">25KM</button>
                            <button className="obs-radar-btn">50KM</button>
                        </div>
                    </div>

                    <button className="obs-cta-btn gold">CONTINUE ◇</button>
                </section>

                {/* STEP 5: ALLIES */}
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 5: CHOOSE YOUR<br />ALLIES ◇</h2>
                    <div className="obs-allies-grid">
                        {ALLIES.map((a, i) => (
                            <div key={i} className="obs-ally-card">
                                <div className="obs-ally-avatar" style={{ background: a.color }}>
                                    <img src={a.img} alt="" />
                                </div>
                                <span className="obs-ally-name">{a.name}</span>
                                <span className="obs-ally-members">{a.members}</span>
                                <button className="obs-follow-btn">+ Follow</button>
                            </div>
                        ))}
                    </div>
                    <button className="obs-cta-btn cyan-outline round">FOLLOW ALL △</button>
                </section>

                {/* STEP 6: MISSION */}
                <section className="obs-step">
                    <h2 className="obs-step-title gold">YOUR FIRST MISSION ○</h2>

                    <div className="obs-mission-card">
                        <div className="obs-mission-img">
                            <img src="https://i.pravatar.cc/400?img=30" alt="" />
                        </div>
                        <div className="obs-mission-body">
                            <div className="obs-mission-meta">
                                <div>
                                    <span className="obs-mission-priority">High Priority</span>
                                    <span className="obs-mission-name">CODE RED: HACKATHON 2024</span>
                                </div>
                                <span className="obs-mission-date">OCT 24</span>
                            </div>
                            <p className="obs-mission-desc">Join the elite 456 developers in Algiers for the ultimate coding survival challenge. 48 hours. No mercy.</p>
                            <button className="obs-register-btn">REGISTER NOW ○</button>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="obs-final-cta">
                        <button className="obs-enter-btn">ENTER THE ARENA<br />□</button>
                        <span className="obs-final-status">Initiating sequence... 456 players connected</span>
                    </div>
                </section>
            </div>

            {/* Ambient Glow */}
            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

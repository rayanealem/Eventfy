import './EditProfile.css';

const SKILLS = [
    { label: 'Python', active: true },
    { label: 'React', active: false },
    { label: 'Design', active: true },
    { label: 'Cybersec', active: false },
    { label: 'Marketing', active: false },
    { label: 'Gaming', active: true },
    { label: 'AI/ML', active: false },
    { label: 'Blockchain', active: false },
];

export default function EditProfile() {
    return (
        <div className="edp-root">
            {/* Header */}
            <header className="edp-header">
                <span className="edp-back">‹</span>
                <h1 className="edp-title">EDIT PROFILE ◇</h1>
                <span className="edp-save">SAVE</span>
            </header>

            <div className="edp-main">
                {/* Avatar Section */}
                <section className="edp-avatar-section">
                    <div className="edp-hex-avatar">
                        <img src="https://i.pravatar.cc/128?img=11" alt="avatar" />
                        <div className="edp-avatar-overlay">
                            <span className="edp-cam-icon">📷</span>
                        </div>
                    </div>
                    <div className="edp-badge">#4821</div>
                </section>

                {/* Name */}
                <section className="edp-field-group">
                    <label className="edp-label">DISPLAY NAME</label>
                    <input className="edp-input" defaultValue="AHMED BENALI" />
                </section>

                {/* Username */}
                <section className="edp-field-group">
                    <label className="edp-label">USERNAME</label>
                    <div className="edp-input-wrap">
                        <input className="edp-input" defaultValue="@ahmed_dev" />
                        <span className="edp-avail">✓ AVAILABLE</span>
                    </div>
                </section>

                {/* Bio */}
                <section className="edp-field-group">
                    <label className="edp-label">BIO</label>
                    <textarea className="edp-textarea" rows={3} defaultValue="CS Student at USTHB. Hackathon veteran. Building the future one line at a time." />
                </section>

                {/* Location */}
                <section className="edp-field-group">
                    <label className="edp-label">LOCATION</label>
                    <div className="edp-select">
                        <span>Algiers (Wilaya 16)</span>
                        <span className="edp-arrow">▼</span>
                    </div>
                </section>

                {/* Institution */}
                <section className="edp-field-group">
                    <label className="edp-label">INSTITUTION</label>
                    <div className="edp-select">
                        <span>USTHB University</span>
                        <span className="edp-arrow">▼</span>
                    </div>
                </section>

                {/* Skills */}
                <section className="edp-field-group">
                    <label className="edp-label">SKILLS & ATTRIBUTES △</label>
                    <div className="edp-skills">
                        {SKILLS.map((s, i) => (
                            <button key={i} className={`edp-skill ${s.active ? 'active' : ''}`}>{s.label}</button>
                        ))}
                    </div>
                </section>

                {/* Symbol Picker */}
                <section className="edp-field-group">
                    <label className="edp-label">YOUR SYMBOL</label>
                    <div className="edp-symbols">
                        <button className="edp-sym-btn">○</button>
                        <button className="edp-sym-btn active">△</button>
                        <button className="edp-sym-btn">□</button>
                        <button className="edp-sym-btn">◇</button>
                    </div>
                </section>

                {/* Color Picker */}
                <section className="edp-field-group">
                    <label className="edp-label">ACCENT COLOR</label>
                    <div className="edp-colors">
                        <div className="edp-color active" style={{ background: '#13ecec' }} />
                        <div className="edp-color" style={{ background: '#ff4d4d' }} />
                        <div className="edp-color" style={{ background: '#ffcc00' }} />
                        <div className="edp-color" style={{ background: '#fff' }} />
                        <div className="edp-color" style={{ background: '#f4257b' }} />
                    </div>
                </section>

                {/* Radar */}
                <section className="edp-field-group">
                    <label className="edp-label">RADAR RADIUS</label>
                    <div className="edp-radar">
                        <button className="edp-radar-btn">10KM</button>
                        <button className="edp-radar-btn active">25KM</button>
                        <button className="edp-radar-btn">50KM</button>
                    </div>
                </section>

                {/* Social Links */}
                <section className="edp-field-group">
                    <label className="edp-label">SOCIAL LINKS</label>
                    <div className="edp-social-fields">
                        <div className="edp-social-row">
                            <span className="edp-social-icon">🌐</span>
                            <input className="edp-input sm" placeholder="Website URL" />
                        </div>
                        <div className="edp-social-row">
                            <span className="edp-social-icon">𝕏</span>
                            <input className="edp-input sm" placeholder="Twitter handle" />
                        </div>
                        <div className="edp-social-row">
                            <span className="edp-social-icon">⚡</span>
                            <input className="edp-input sm" placeholder="GitHub username" />
                        </div>
                    </div>
                </section>

                {/* Save Button */}
                <button className="edp-save-btn">SAVE CHANGES △</button>
            </div>
        </div>
    );
}

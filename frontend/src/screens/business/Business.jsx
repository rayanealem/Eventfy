import './Business.css';

const FILTERS = ['ALL SKILLS', 'UI/UX △', 'FRONT-END □', 'STRATEGY ◇'];
const TIERS = [
    { icon: '○', label: 'BRONZE', active: false },
    { icon: '◇', label: 'SILVER', active: false },
    { icon: '□', label: 'GOLD', active: true },
    { icon: '◇', label: 'PLATINUM', active: false },
];

const CANDIDATES = [
    {
        name: 'KANG SAE-BYEOK',
        player: 'PLAYER 067',
        match: '87% MATCH ◇',
        matchColor: '#fbbf24',
        highlighted: true,
        skills: ['Infiltration', 'Strategy'],
        img: 'https://i.pravatar.cc/64?img=47',
    },
    {
        name: 'CHO SANG-WOO',
        player: 'PLAYER 218',
        match: '64% MATCH ○',
        matchColor: 'rgba(255,255,255,0.4)',
        highlighted: false,
        skills: ['Economics', 'Management'],
        img: 'https://i.pravatar.cc/64?img=12',
    },
];

export default function Business() {
    return (
        <div className="biz-root">
            <div className="biz-noise" />

            {/* Header */}
            <header className="biz-header">
                <div className="biz-brand">
                    <span className="biz-brand-icon">‹</span>
                    <h1 className="biz-brand-title">EVENTFY BUSINESS ◇</h1>
                </div>
                <div className="biz-header-icons">
                    <span>🔔</span>
                    <span>⊕</span>
                </div>
            </header>

            <div className="biz-main">
                {/* Talent Pool Section */}
                <section className="biz-section">
                    <div className="biz-section-header">
                        <h2 className="biz-talent-title">TALENT POOL ◇</h2>
                        <span className="biz-recruiter-status">RECRUITER_ACCESS: ENABLED</span>
                    </div>

                    {/* Skill Filters */}
                    <div className="biz-filters">
                        {FILTERS.map((f, i) => (
                            <button key={i} className={`biz-filter-btn ${i === 0 ? 'active' : ''}`}>
                                {f} {i === 0 && '○'}
                            </button>
                        ))}
                    </div>

                    {/* Candidate Cards */}
                    <div className="biz-candidates">
                        {CANDIDATES.map((c, i) => (
                            <div key={i} className={`biz-candidate-card ${c.highlighted ? 'highlighted' : ''}`}>
                                <div className="biz-cand-top">
                                    <div className="biz-cand-avatar">
                                        <img src={c.img} alt="" />
                                    </div>
                                    <div className="biz-cand-info">
                                        <div className="biz-cand-header">
                                            <span className="biz-cand-name">{c.name}</span>
                                            <span className="biz-cand-player">{c.player}</span>
                                        </div>
                                        <div className="biz-cand-tags">
                                            <span className="biz-match-badge" style={{ borderColor: c.matchColor, color: c.matchColor }}>{c.match}</span>
                                            {c.skills.map((s, j) => (
                                                <span key={j} className={`biz-skill-tag ${c.highlighted ? 'teal' : ''}`}>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className={`biz-cand-actions ${!c.highlighted ? 'muted' : ''}`}>
                                    <button className={`biz-view-btn ${c.highlighted ? 'primary' : ''}`}>VIEW PASSPORT □</button>
                                    <button className="biz-contact-btn">CONTACT △</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sponsorship Portal */}
                <section className="biz-section">
                    <h2 className="biz-sponsor-title">SPONSORSHIP PORTAL ◇</h2>

                    {/* Active Campaign */}
                    <div className="biz-campaign-card">
                        <div className="biz-campaign-top">
                            <div className="biz-campaign-meta">
                                <span className="biz-campaign-label">ACTIVE CAMPAIGN</span>
                                <span className="biz-campaign-name">MARBLES ARENA REDUX</span>
                            </div>
                            <span className="biz-gold-badge">GOLD SPONSOR ◇</span>
                        </div>
                        <div className="biz-campaign-stats">
                            <div className="biz-campaign-stat">
                                <span className="biz-campaign-stat-label">Impressions</span>
                                <span className="biz-campaign-stat-value">1,248,092</span>
                            </div>
                            <div className="biz-campaign-stat">
                                <span className="biz-campaign-stat-label">Clicks</span>
                                <span className="biz-campaign-stat-value">42,105</span>
                            </div>
                        </div>
                    </div>

                    {/* Create Sponsorship CTA */}
                    <button className="biz-create-sponsor-btn">CREATE SPONSORSHIP □</button>

                    {/* Sponsorship Form */}
                    <div className="biz-sponsor-form">
                        <h3 className="biz-form-title">NEW PARTNERSHIP_CONFIG</h3>

                        <div className="biz-form-fields">
                            <div className="biz-field">
                                <label className="biz-label">Select Arena Event</label>
                                <div className="biz-select">
                                    <span>GLASS BRIDGE MARATHON</span>
                                    <span className="biz-select-arrow">▼</span>
                                </div>
                            </div>

                            <div className="biz-field">
                                <label className="biz-label">Sponsorship Tier</label>
                                <div className="biz-tiers">
                                    {TIERS.map((t, i) => (
                                        <button key={i} className={`biz-tier-btn ${t.active ? 'active' : ''}`}>
                                            <span className="biz-tier-icon">{t.icon}</span>
                                            <span className="biz-tier-label">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="biz-field-row">
                                <div className="biz-field half">
                                    <label className="biz-label">Budget (PTS)</label>
                                    <div className="biz-input"><span>50,000</span></div>
                                </div>
                                <div className="biz-field half">
                                    <label className="biz-label">Duration (HRS)</label>
                                    <div className="biz-input"><span>48</span></div>
                                </div>
                            </div>

                            <div className="biz-field">
                                <label className="biz-label">Brand Asset Upload</label>
                                <div className="biz-upload">
                                    <span className="biz-upload-icon">↑</span>
                                    <span className="biz-upload-text">DRAG LOGO_SVG OR CLICK □</span>
                                </div>
                            </div>

                            <button className="biz-submit-btn">SUBMIT APPLICATION △</button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

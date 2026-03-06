import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import './Business.css';

const FILTERS = ['ALL SKILLS', 'UI/UX', 'FRONT-END', 'STRATEGY', 'PYTHON', 'LEADERSHIP'];
const TIERS = [
    { id: 'bronze', icon: '○', label: 'BRONZE' },
    { id: 'silver', icon: '◇', label: 'SILVER' },
    { id: 'gold', icon: '□', label: 'GOLD' },
];

export default function Business() {
    const { profile } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ALL SKILLS');
    const [loading, setLoading] = useState(true);

    // Sponsorship Form State
    const [events, setEvents] = useState([]);
    const [sponsorEventId, setSponsorEventId] = useState('');
    const [sponsorTier, setSponsorTier] = useState('gold');
    const [sponsorAmount, setSponsorAmount] = useState(50000);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadCandidates(activeFilter);
    }, [activeFilter]);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadCandidates = async (skill) => {
        try {
            setLoading(true);
            const res = await api.get(`/search/talent`, {
                params: { skill: skill === 'ALL SKILLS' ? null : skill, page_size: 20 }
            });
            setCandidates(res.data || []);
        } catch (error) {
            console.error("Failed to load talent:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadEvents = async () => {
        try {
            const res = await api.get('/search', { params: { type: 'events', page_size: 10 } });
            if (res.data.events) {
                setEvents(res.data.events);
                if (res.data.events.length > 0) setSponsorEventId(res.data.events[0].id);
            }
        } catch (error) {
            console.error("Failed to load events:", error);
        }
    };

    const handleSponsorSubmit = async () => {
        if (!sponsorEventId || !profile?.id) return;
        setSubmitting(true);
        try {
            const orgsRes = await api.get('/orgs/my');
            const orgId = orgsRes.data.length > 0 ? orgsRes.data[0].org_id : null;

            if (!orgId) {
                alert("ERROR: You must belong to an organization to sponsor an event.");
                setSubmitting(false);
                return;
            }

            await api.post('/sponsorships', {
                event_id: sponsorEventId,
                org_id: orgId,
                tier: sponsorTier,
                amount: sponsorAmount
            });
            alert("✓ Sponsorship application submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Error submitting sponsorship.");
        } finally {
            setSubmitting(false);
        }
    };

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
                            <button
                                key={i}
                                className={`biz-filter-btn ${activeFilter === f ? 'active' : ''}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f} {activeFilter === f && '○'}
                            </button>
                        ))}
                    </div>

                    {/* Candidate Cards */}
                    <div className="biz-candidates">
                        {loading ? (
                            <div style={{ color: '#00ffc2', padding: '2rem' }}>LOADING CANDIDATES...</div>
                        ) : candidates.map((c, i) => (
                            <div key={i} className={`biz-candidate-card ${i === 0 ? 'highlighted' : ''}`}>
                                <div className="biz-cand-top">
                                    <div className="biz-cand-avatar">
                                        <img src={c.avatar_url || `https://i.pravatar.cc/64?img=${50 + i}`} alt="" />
                                    </div>
                                    <div className="biz-cand-info">
                                        <div className="biz-cand-header">
                                            <span className="biz-cand-name">{c.full_name}</span>
                                            <span className="biz-cand-player">XP: {c.xp} | LVL {c.level}</span>
                                        </div>
                                        <div className="biz-cand-tags">
                                            <span className="biz-match-badge" style={{ borderColor: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)', color: i === 0 ? '#fbbf24' : 'rgba(255,255,255,0.4)' }}>
                                                {99 - (i * 3)}% MATCH {i === 0 ? '◇' : '○'}
                                            </span>
                                            {c.user_skills?.slice(0, 3).map((us, j) => (
                                                <span key={j} className={`biz-skill-tag ${i === 0 ? 'teal' : ''}`}>
                                                    {us.skills?.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className={`biz-cand-actions ${i !== 0 ? 'muted' : ''}`}>
                                    <button className={`biz-view-btn ${i === 0 ? 'primary' : ''}`}>VIEW PASSPORT □</button>
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
                    <button className="biz-create-sponsor-btn" onClick={() => window.scrollTo(0, document.body.scrollHeight)}>
                        CREATE SPONSORSHIP □
                    </button>

                    {/* Sponsorship Form */}
                    <div className="biz-sponsor-form">
                        <h3 className="biz-form-title">NEW PARTNERSHIP_CONFIG</h3>

                        <div className="biz-form-fields">
                            <div className="biz-field">
                                <label className="biz-label">Select Arena Event</label>
                                <div className="biz-select">
                                    <select
                                        value={sponsorEventId}
                                        onChange={(e) => setSponsorEventId(e.target.value)}
                                        style={{ background: 'transparent', color: 'white', border: 'none', width: '100%', outline: 'none', appearance: 'none', fontFamily: 'inherit' }}
                                    >
                                        {events.map(ev => (
                                            <option key={ev.id} value={ev.id} style={{ background: '#0a0a0a' }}>{ev.title}</option>
                                        ))}
                                    </select>
                                    <span className="biz-select-arrow" style={{ pointerEvents: 'none' }}>▼</span>
                                </div>
                            </div>

                            <div className="biz-field">
                                <label className="biz-label">Sponsorship Tier</label>
                                <div className="biz-tiers">
                                    {TIERS.map((t) => (
                                        <button
                                            key={t.id}
                                            className={`biz-tier-btn ${sponsorTier === t.id ? 'active' : ''}`}
                                            onClick={() => setSponsorTier(t.id)}
                                        >
                                            <span className="biz-tier-icon">{t.icon}</span>
                                            <span className="biz-tier-label">{t.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="biz-field-row">
                                <div className="biz-field half">
                                    <label className="biz-label">Budget (PTS)</label>
                                    <div className="biz-input">
                                        <input
                                            type="number"
                                            value={sponsorAmount}
                                            onChange={(e) => setSponsorAmount(parseInt(e.target.value))}
                                            style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', width: '100%', fontFamily: 'inherit' }}
                                        />
                                    </div>
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

                            <button className="biz-submit-btn" onClick={handleSponsorSubmit} disabled={submitting}>
                                {submitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION △'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

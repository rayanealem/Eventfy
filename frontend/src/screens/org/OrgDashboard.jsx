import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import './OrgDashboard.css';

export default function OrgDashboard() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await api('GET', '/orgs/me/dashboard');
            setData(res);
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="od-loader-screen">
                <span className="od-loader-text">LOADING COMMAND DATA...</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="od-loader-screen" style={{ flexDirection: 'column', gap: '1rem' }}>
                <span className="od-loader-text" style={{ color: 'var(--color-coral)' }}>CONNECTION FAILED</span>
                <button className="od-retry-btn" onClick={loadDashboard}>RETRY CONNECTION ⟳</button>
            </div>
        );
    }

    const { org, stats, events } = data;
    const liveEvents = events.filter(e => e.status === 'live' || e.is_live);
    const scheduledEvents = events.filter(e => e.status === 'scheduled' || e.status === 'draft');

    return (
        <div className="od-root">
            <div className="od-noise" />

            {/* Header */}
            <header className="od-header">
                <div className="od-header-left">
                    <div className="od-org-avatar" style={{ backgroundImage: org?.logo_url ? `url(${org.logo_url})` : 'none' }}>
                        {!org?.logo_url && <span>{org?.name?.substring(0, 2)?.toUpperCase()}</span>}
                    </div>
                    <div className="od-org-titles">
                        <h1 className="od-org-name">{org?.name?.toUpperCase()}</h1>
                        <span className="od-subtitle">◆ COMMAND CENTER</span>
                    </div>
                </div>
                <button className="od-settings-btn" onClick={() => navigate('/org/setup')}>⚙</button>
            </header>

            <main className="od-main">
                {/* Stats Grid */}
                <div className="od-stats-grid">
                    <motion.div className="od-stat-card pink" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <span className="od-stat-icon">○</span>
                        <div className="od-stat-data">
                            <span className="od-stat-val">{stats.follower_count.toLocaleString()}</span>
                            <span className="od-stat-label">TOTAL FOLLOWERS</span>
                        </div>
                    </motion.div>

                    <motion.div className="od-stat-card gold" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <span className="od-stat-icon">△</span>
                        <div className="od-stat-data">
                            <span className="od-stat-val">{stats.total_events.toLocaleString()}</span>
                            <span className="od-stat-label">TOTAL EVENTS</span>
                        </div>
                    </motion.div>

                    <motion.div className="od-stat-card teal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <span className="od-stat-icon">□</span>
                        <div className="od-stat-data">
                            <span className="od-stat-val">{stats.total_registrations.toLocaleString()}</span>
                            <span className="od-stat-label">TOTAL REGISTRATIONS</span>
                        </div>
                    </motion.div>

                    <motion.div className={`od-stat-card coral ${stats.pending_volunteers > 0 ? 'pulse' : ''}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <span className="od-stat-icon">◇</span>
                        <div className="od-stat-data">
                            <span className="od-stat-val">{stats.pending_volunteers.toLocaleString()}</span>
                            <span className="od-stat-label">PENDING VOLUNTEERS</span>
                        </div>
                    </motion.div>
                </div>

                {/* Create CTA */}
                <button className="od-create-cta" onClick={() => navigate('/event/create')}>
                    + CREATE NEW EVENT □
                </button>

                {/* Pending Actions */}
                {stats.pending_volunteers > 0 && (
                    <div className="od-pending-band">
                        <span className="od-pending-text">ATTENTION: {stats.pending_volunteers} PENDING VOLUNTEER {stats.pending_volunteers === 1 ? 'APPLICATION' : 'APPLICATIONS'}</span>
                        <button className="od-view-btn">VIEW ◇</button>
                    </div>
                )}

                {/* Live Events */}
                {liveEvents.length > 0 && (
                    <section className="od-section">
                        <h2 className="od-section-title">ACTIVE TRANSMISSIONS</h2>
                        <div className="od-events-list">
                            {liveEvents.map((ev) => (
                                <div key={ev.id} className="od-event-card live" onClick={() => navigate(`/manage/${ev.id}`)}>
                                    <div className="od-ec-cover" style={{ backgroundImage: ev.cover_url ? `url(${ev.cover_url})` : 'var(--gradient-card)' }} />
                                    <div className="od-ec-info">
                                        <div className="od-ec-head">
                                            <span className="od-ec-dot" />
                                            <h3 className="od-ec-title">{ev.title.toUpperCase()}</h3>
                                        </div>
                                        <div className="od-ec-stats">
                                            <span>REG: {ev.registration_count || 0}/{ev.capacity || '∞'}</span>
                                        </div>
                                    </div>
                                    <button className="od-scan-btn" onClick={(e) => { e.stopPropagation(); navigate(`/qr/${ev.id}`); }}>
                                        ⬡ SCAN
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Scheduled Events */}
                <section className="od-section">
                    <h2 className="od-section-title">SCHEDULED EVENTS</h2>
                    {scheduledEvents.length === 0 ? (
                        <div className="od-empty-state">
                            <span className="od-empty-text">NO EVENTS FOUND IN REGISTRY</span>
                            <button className="od-empty-link" onClick={() => navigate('/event/create')}>
                                CREATE YOUR FIRST EVENT ○
                            </button>
                        </div>
                    ) : (
                        <div className="od-events-list">
                            {scheduledEvents.map((ev) => (
                                <div key={ev.id} className="od-event-card" onClick={() => navigate(`/manage/${ev.id}`)}>
                                    <div className="od-ec-cover" style={{ backgroundImage: ev.cover_url ? `url(${ev.cover_url})` : 'var(--gradient-card)' }} />
                                    <div className="od-ec-info">
                                        <h3 className="od-ec-title">{ev.title.toUpperCase()}</h3>
                                        <div className="od-ec-meta">
                                            <span>{new Date(ev.starts_at).toLocaleDateString()}</span>
                                            <span className="od-ec-divider">•</span>
                                            <span>{ev.registration_count || 0} REG</span>
                                        </div>
                                    </div>
                                    <div className="od-ec-arrow">›</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

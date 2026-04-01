import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Megaphone, QrCode, Users, Check, X, ArrowRight } from 'lucide-react';
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
            setData({
                ...res,
                pending_volunteers: res.pending_volunteers || []
            });
        } catch (err) {
            console.error("Dashboard error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="od-root theme-ph">
                <header className="od-header">
                    <div className="od-header-left">
                        <div className="od-org-avatar skeleton-box" style={{ borderRadius: '12px' }} />
                        <div className="od-org-titles">
                            <div className="skeleton-box" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
                            <div className="skeleton-box" style={{ width: '180px', height: '32px' }} />
                        </div>
                    </div>
                </header>
                <main className="od-main">
                    <div className="od-snapshot-container">
                        <div className="od-snapshot-scroll">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="od-snap-card skeleton-card">
                                    <div className="skeleton-box" style={{ width: '70%', height: '14px', marginBottom: '16px' }} />
                                    <div className="skeleton-box" style={{ width: '50%', height: '36px' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <section className="od-section">
                        <div className="skeleton-box" style={{ width: '140px', height: '24px', marginBottom: '16px', borderRadius: '4px' }} />
                        <div className="od-actions-grid">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="od-action-btn skeleton-card" style={{ height: '130px', border: 'none' }} />
                            ))}
                        </div>
                    </section>
                    <section className="od-section" style={{ marginTop: '1rem' }}>
                        <div className="skeleton-box" style={{ width: '180px', height: '24px', marginBottom: '16px', borderRadius: '4px' }} />
                        <div className="od-events-list">
                            {[1, 2].map(i => (
                                <div key={i} className="od-event-row skeleton-card" style={{ height: '140px', border: 'none' }} />
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="od-root theme-ph error-state">
                <div className="od-error-content">
                    <X size={48} className="od-error-icon" />
                    <span className="od-error-text">CONNECTION FAILED</span>
                    <button className="od-retry-btn" onClick={loadDashboard}>RETRY CONNECTION</button>
                </div>
            </div>
        );
    }

    const { org, stats, events, pending_volunteers } = data;
    const activeEvents = events.filter(e => e.status === 'live' || e.is_live || e.status === 'scheduled');

    const getCapacityColor = (regCount, cap) => {
        if (!cap) return 'var(--color-teal)'; // No limit
        const ratio = regCount / cap;
        if (ratio >= 1) return 'var(--color-orange)';
        if (ratio >= 0.7) return 'var(--color-purple)';
        return 'var(--color-teal)';
    };

    return (
        <div className="od-root theme-ph">
            {/* Header */}
            <header className="od-header">
                <div className="od-header-left">
                    <div className="od-org-avatar" style={{ backgroundImage: org?.logo_url ? `url(${org.logo_url})` : 'none' }}>
                        {!org?.logo_url && <span>{org?.name?.substring(0, 2)?.toUpperCase()}</span>}
                    </div>
                    <div className="od-org-titles">
                        <span className="od-supertitle">COMMAND CENTER</span>
                        <h1 className="od-org-name">{org?.name?.toUpperCase()}</h1>
                    </div>
                </div>
                <div className="od-header-actions">
                    <button className="od-settings-btn" onClick={() => navigate(`/org/${org.slug}`)}>PROFILE</button>
                    <button className="od-settings-btn icon" onClick={() => navigate('/org/setup')}>⚙</button>
                </div>
            </header>

            <main className="od-main">
                {/* Snapshot Cards */}
                <div className="od-snapshot-container">
                    <div className="od-snapshot-scroll">
                        <motion.div className="od-snap-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                            <span className="od-snap-label">TOTAL EVENTS</span>
                            <span className="od-snap-val">{stats?.total_events?.toLocaleString() || 0}</span>
                        </motion.div>

                        <motion.div className="od-snap-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <span className="od-snap-label">REGISTRATIONS</span>
                            <span className="od-snap-val">{stats?.total_registrations?.toLocaleString() || 0}</span>
                        </motion.div>

                        <motion.div className="od-snap-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <span className="od-snap-label">FOLLOWERS</span>
                            <span className="od-snap-val">{stats?.follower_count?.toLocaleString() || 0}</span>
                        </motion.div>

                        <motion.div className={`od-snap-card ${stats?.pending_volunteers > 0 ? 'alert' : ''}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <span className="od-snap-label">VOLUNTEERS</span>
                            <span className="od-snap-val">{stats?.pending_volunteers?.toLocaleString() || 0}</span>
                        </motion.div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <section className="od-section">
                    <h2 className="od-section-title">OPERATIONS</h2>
                    <div className="od-actions-grid">
                        <button 
                            className="od-action-btn purple"
                            onClick={() => navigate('/event/create')}
                        >
                            <Plus size={28} className="oa-icon" strokeWidth={2} />
                            <span>CREATE EVENT</span>
                        </button>
                        
                        <button 
                            className="od-action-btn teal"
                            onClick={() => navigate('/announcements/create')}
                        >
                            <Megaphone size={28} className="oa-icon" strokeWidth={2} />
                            <span>PUBLISH POST</span>
                        </button>

                        <button 
                            className="od-action-btn teal"
                            onClick={() => navigate('/qr-scanner')}
                        >
                            <QrCode size={28} className="oa-icon" strokeWidth={2} />
                            <span>SCAN TICKETS</span>
                        </button>

                        <button 
                            className="od-action-btn purple"
                            onClick={() => navigate('/org/team')}
                        >
                            <Users size={28} className="oa-icon" strokeWidth={2} />
                            <span>MANAGE TEAM</span>
                        </button>
                    </div>
                </section>

                {/* Pending Volunteers Panel */}
                {pending_volunteers && pending_volunteers.length > 0 && (
                    <section className="od-section attention-panel">
                        <h2 className="od-section-title alert-text">ATTENTION REQUIRED</h2>
                        <div className="od-volunteers-list">
                            {pending_volunteers.map((vol) => (
                                <div key={vol.id} className="od-volunteer-card">
                                    <div className="od-vol-info">
                                        <h4>{vol.user?.name || 'Applicant'}</h4>
                                        <p>Event: <strong>{vol.event?.title || 'Unknown Event'}</strong></p>
                                    </div>
                                    <div className="od-vol-actions">
                                        <button className="od-btn-approve"><Check size={20} strokeWidth={3} /></button>
                                        <button className="od-btn-reject"><X size={20} strokeWidth={3} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Active Events & Capacity Manager */}
                <section className="od-section">
                    <h2 className="od-section-title">ACTIVE EVENTS</h2>
                    {activeEvents.length === 0 ? (
                        <div className="od-empty-state">
                            <span className="od-empty-icon">⌘</span>
                            <p>NO ACTIVE TRANSMISSIONS</p>
                        </div>
                    ) : (
                        <div className="od-events-list">
                            {activeEvents.map((ev) => {
                                const regCount = ev.registration_count || 0;
                                const cap = ev.capacity || 0;
                                const pct = cap > 0 ? Math.min((regCount / cap) * 100, 100) : (regCount > 0 ? 100 : 0);
                                const capColor = getCapacityColor(regCount, cap);
                                const isLive = ev.status === 'live' || ev.is_live;

                                return (
                                    <div key={ev.id} className="od-event-row" onClick={() => navigate(`/manage/${ev.id}`)}>
                                        <div className="od-er-top">
                                            <div className="od-er-info">
                                                <h3 className="od-er-title">{ev.title}</h3>
                                                <span className="od-er-date">
                                                    <span className={`status-dot ${isLive ? 'live' : 'scheduled'}`} />
                                                    {new Date(ev.starts_at).toLocaleDateString()} • {isLive ? 'LIVE' : 'SCHEDULED'}
                                                </span>
                                            </div>
                                            <ArrowRight size={24} className="od-er-arrow" />
                                        </div>
                                        
                                        <div className="od-er-bottom">
                                            <div className="od-capacity-labels">
                                                <span>CAPACITY</span>
                                                <span style={{ color: capColor }}>{regCount} / {cap || '∞'}</span>
                                            </div>
                                            <div className="od-capacity-track">
                                                <div 
                                                    className="od-capacity-fill" 
                                                    style={{ 
                                                        width: cap ? `${pct}%` : '100%', 
                                                        backgroundColor: capColor 
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

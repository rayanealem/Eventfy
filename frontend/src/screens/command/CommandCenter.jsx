import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import './CommandCenter.css';

export default function CommandCenter() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Live feed logic
    const [logEntries, setLogEntries] = useState([
        { time: `[${new Date().toLocaleTimeString()}]`, msg: 'Command Center Initialized', color: '#cbd5e1' }
    ]);

    useEffect(() => {
        loadEvent();

        // Listen to checkin updates
        const channel = supabase.channel(`cc_${eventId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'event_registrations', filter: `event_id=eq.${eventId}` },
                (payload) => {
                    if (payload.new.checked_in && !payload.old.checked_in) {
                        addLog(`Player checked in! (Reg ID: ${payload.new.id.substring(0, 8)})`, '#2dd4bf');
                        // Refresh capacity stats
                        loadEvent();
                    }
                }
            ).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);

    const loadEvent = async () => {
        try {
            const res = await api('GET', `/events/${eventId}`);
            setEvent(res);
        } catch (error) {
            console.error("Failed to load event:", error);
            addLog("Failed to sync event data.", "#f44725");
        } finally {
            setLoading(false);
        }
    };

    const addLog = (msg, color = '#cbd5e1') => {
        const time = `[${new Date().toLocaleTimeString()}]`;
        setLogEntries(prev => [{ time, msg, color }, ...prev].slice(0, 20));
    };

    const handleStatusToggle = async () => {
        if (!event) return;
        const newStatus = event.status === 'live' ? 'completed' :
            event.status === 'scheduled' ? 'live' : 'scheduled';

        try {
            setUpdating(true);
            await api('PATCH', `/events/${eventId}`, { status: newStatus });
            setEvent(prev => ({ ...prev, status: newStatus }));
            addLog(`Event status changed to: ${newStatus.toUpperCase()}`, '#fbbf24');
        } catch (error) {
            console.error(error);
            addLog(`Failed to update status.`, '#f44725');
            alert("Error updating status. Are you sure you are the organizer?");
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !event) return <div style={{ color: '#00ffc2', padding: '2rem' }}>BOOTING COMMAND CENTER...</div>;

    const stats = [
        { label: 'Check-ins', value: `${event.checkin_count || 0}/${event.capacity || '∞'}`, color: '#2dd4bf', bars: [50, 75, 100, 66, 83] },
        { label: 'Registrations', value: `${event.registration_count || 0}`, sub: 'TOTAL VOLUMES', color: '#f44725', hasActive: true },
        { label: 'Views', value: `${event.view_count || 0}`, color: '#fff', bars: [20, 40, 60, 80, 100] },
        { label: 'Total XP Pool', value: `${event.xp_checkin * (event.capacity || 100)}`, color: '#fbbf24', rank: 'REWARD TIER' },
    ];

    const isLive = event.status === 'live';

    return (
        <div className="cc-root">
            <div className="cc-noise" />
            <div className="cc-glow-tr" />
            <div className="cc-glow-bl" />

            <header className="cc-header">
                <div className="cc-header-row">
                    <h1 className="cc-title">{event.title.toUpperCase()} □</h1>
                    <div className="cc-live-badge" onClick={handleStatusToggle} style={{ cursor: 'pointer', background: isLive ? 'rgba(244,71,37,0.1)' : 'rgba(255,255,255,0.1)' }}>
                        {isLive && <div className="cc-live-dot" />}
                        <span className="cc-live-text" style={{ color: isLive ? '#f44725' : '#fff' }}>
                            {updating ? "UPDATING..." : `● ${event.status.toUpperCase()}`}
                        </span>
                    </div>
                </div>
                <div className="cc-timer-row">
                    <div className="cc-network">
                        <span className="cc-net-icon">📡</span>
                        <span className="cc-net-label">Eventfy Net-04 • ORG LINK</span>
                    </div>
                    <span className="cc-timer">{new Date(event.starts_at).toLocaleDateString()}</span>
                </div>
            </header>

            <div className="cc-main">
                <div className="cc-stats-grid">
                    {stats.map((s, i) => (
                        <motion.div key={i} className="cc-stat-card"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}>
                            <div className="cc-stat-info">
                                <span className="cc-stat-label">{s.label}</span>
                                <span className="cc-stat-value" style={{ color: s.color }}>{s.value}</span>
                                {s.sub && <span className="cc-stat-sub" style={{ color: s.color }}>{s.sub}</span>}
                            </div>
                            {s.bars && (
                                <div className="cc-mini-bars">
                                    {s.bars.map((h, j) => (
                                        <div key={j} className="cc-bar" style={{ height: `${h}%`, opacity: h === 100 ? 0.3 : 0.1 + (h / 300) }} />
                                    ))}
                                </div>
                            )}
                            {s.rank && (
                                <div className="cc-rank-row">
                                    <span className="cc-rank" style={{ color: 'rgba(251,191,36,.6)' }}>{s.rank}</span>
                                    <span className="cc-rank-arrow">▶</span>
                                </div>
                            )}
                            {s.hasActive && (
                                <div className="cc-active-row">
                                    <span className="cc-active-icon">⚡</span>
                                    <span className="cc-active-label" style={{ color: s.color }}>ACTIVE DEP.</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>

                <div className="cc-feed-section">
                    <div className="cc-feed-head">
                        <span className="cc-feed-title">LIVE FEED</span>
                        <span className="cc-feed-sub">Auto-scrolling log</span>
                    </div>
                    <div className="cc-feed-terminal">
                        {logEntries.map((e, i) => (
                            <motion.div key={i} className="cc-log-entry"
                                initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}>
                                <span className="cc-log-time" style={{ color: e.color, opacity: 0.5 }}>{e.time}</span>
                                <span className="cc-log-msg" style={{ color: e.color }}>{e.msg}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="cc-footer">
                <div className="cc-footer-top">
                    <div className="cc-action-pill">
                        <div className="cc-pill-btn" onClick={() => navigate(`/manage/${eventId}/analytics`)}>
                            <span className="cc-pill-icon">📊</span>
                            <span className="cc-pill-label" style={{ color: '#fbbf24' }}>Analytics</span>
                        </div>
                        <div className="cc-pill-divider" />
                        <div className="cc-pill-btn">
                            <span className="cc-pill-icon">📢</span>
                            <span className="cc-pill-label" style={{ color: '#f44725' }}>Announce</span>
                        </div>
                    </div>
                    <div className="cc-emergency-fab" onClick={() => navigate('/explore')}>✕</div>
                </div>
                <div className="cc-scan-fab" onClick={() => navigate('/scan')} style={{ cursor: 'pointer' }}>
                    <span className="cc-scan-icon">⬡</span>
                    <span className="cc-scan-label">SCAN QR △</span>
                </div>
            </div>
        </div>
    );
}

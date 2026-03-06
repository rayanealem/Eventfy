import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './Notifications.css';

const TABS = [
    { label: 'ALL ○', key: 'all' },
    { label: 'EVENTS △', key: 'events' },
    { label: 'SOCIAL □', key: 'social' },
    { label: 'SYSTEM ◇', key: 'system' },
];

// Type-based styling from integration spec
const TYPE_STYLE = {
    event_update: { label: 'EVENT ALERT', shape: '○', color: '#FF4D4D', icon: '🗓️' },
    registration_confirmed: { label: 'REGISTERED', shape: '○', color: '#FF4D4D', icon: '✓' },
    event_starts_soon: { label: 'STARTING SOON', shape: '○', color: '#FF4D4D', icon: '⏰' },
    flash_alert: { label: 'FLASH ALERT', shape: '◇', color: '#FFD700', icon: '⚡' },
    new_follower: { label: 'NEW FOLLOWER', shape: '△', color: '#00E5CC', icon: '👤' },
    connection_request: { label: 'CONNECTION', shape: '△', color: '#00E5CC', icon: '🔗' },
    new_message: { label: 'NEW MESSAGE', shape: '△', color: '#00E5CC', icon: '💬' },
    badge_earned: { label: 'ACHIEVEMENT', shape: '□', color: '#FFD700', icon: '🏆' },
    xp_gained: { label: 'XP EARNED', shape: '□', color: '#FFD700', icon: '⚡' },
    level_up: { label: 'LEVEL UP', shape: '□', color: '#FFD700', icon: '🎯' },
    volunteer_approved: { label: 'VOLUNTEER', shape: '△', color: '#00E5CC', icon: '✓' },
    golden_ticket: { label: 'GOLDEN TICKET', shape: '◇', color: '#FFD700', icon: '🎫' },
};

function timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return d.toLocaleDateString();
}

export default function Notifications() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [activeTab, profile]);

    async function loadNotifications() {
        if (!profile) return;
        setLoading(true);
        try {
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false });

            if (activeTab === 'events') query = query.in('type', ['event_update', 'registration_confirmed', 'event_starts_soon', 'flash_alert']);
            if (activeTab === 'social') query = query.in('type', ['new_follower', 'connection_request', 'new_message']);
            if (activeTab === 'system') query = query.in('type', ['badge_earned', 'xp_gained', 'level_up', 'volunteer_approved']);

            const { data } = await query;
            setNotifications(data || []);
        } catch (e) {
            console.error('Failed to load notifications:', e);
        } finally {
            setLoading(false);
        }
    }

    async function markAllRead() {
        if (!profile) return;
        await supabase.from('notifications')
            .update({ is_read: true })
            .eq('user_id', profile.id);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    }

    function handleNotificationTap(notif) {
        // Mark as read
        supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        // Navigate
        if (notif.data?.event_id) navigate(`/event/${notif.data.event_id}`);
        else if (notif.data?.username) navigate(`/profile/${notif.data.username}`);
        else if (notif.data?.org_id) navigate(`/org/${notif.data.org_id}`);
    }

    const allRead = notifications.length > 0 && notifications.every(n => n.is_read);

    return (
        <div className="notif-root">
            <div className="notif-noise" />

            {/* Header */}
            <header className="notif-header">
                <h1 className="notif-title">NOTIFICATIONS <span className="notif-shape">○</span></h1>
                <button className="notif-mark-read" onClick={markAllRead} style={allRead ? { color: '#2dd4bf' } : undefined}>
                    {allRead ? 'ALL READ ✓' : 'MARK ALL READ △'}
                </button>
            </header>

            {/* Tabs */}
            <div className="notif-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`notif-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification Items */}
            <div className="notif-list">
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                        LOADING...
                    </div>
                )}
                {!loading && notifications.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>
                        NO NOTIFICATIONS
                    </div>
                )}
                {notifications.map((n, i) => {
                    const style = TYPE_STYLE[n.type] || { label: 'NOTIFICATION', shape: '○', color: '#94a3b8', icon: '📋' };
                    const isGolden = n.type === 'golden_ticket';
                    return (
                        <motion.div
                            key={n.id}
                            className={`notif-item ${isGolden ? 'glow' : ''} ${n.is_read ? 'faded' : ''}`}
                            style={{ borderLeftColor: n.is_read ? 'transparent' : style.color, opacity: n.is_read ? 0.6 : 1 }}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: n.is_read ? 0.6 : 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            onClick={() => handleNotificationTap(n)}
                        >
                            <div className="notif-item-inner">
                                <div className="notif-icon-wrap">
                                    <div className="notif-icon" style={{ background: `${style.color}15`, borderColor: isGolden ? `${style.color}33` : 'transparent' }}>
                                        <span>{style.icon}</span>
                                    </div>
                                </div>
                                <div className="notif-content">
                                    <div className="notif-meta">
                                        <span className="notif-label" style={{ color: style.color }}>{style.label}</span>
                                        <span className="notif-time">{timeAgo(n.created_at)}</span>
                                    </div>
                                    <div className="notif-text-wrap">
                                        <p className="notif-text">
                                            {n.title} {style.shape}
                                        </p>
                                    </div>
                                    {n.body && n.body !== n.title && <p className="notif-subtitle">{n.body}</p>}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

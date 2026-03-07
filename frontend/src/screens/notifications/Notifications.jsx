import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import './Notifications.css';

const TABS = [
    { label: 'ALL ○', key: 'all' },
    { label: 'EVENTS △', key: 'events' },
    { label: 'SOCIAL □', key: 'social' },
    { label: 'SYSTEM ◇', key: 'system' },
];

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

const TAB_FILTERS = {
    all: null,
    events: ['event_update', 'registration_confirmed', 'event_starts_soon', 'flash_alert'],
    social: ['new_follower', 'connection_request', 'new_message'],
    system: ['badge_earned', 'xp_gained', 'level_up', 'volunteer_approved'],
};

function timeAgo(date) {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now - d) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return d.toLocaleDateString();
}

export default function Notifications() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all');

    // Fetch notifications with Supabase
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications', profile?.id, activeTab],
        queryFn: async () => {
            if (!profile) return [];
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false });

            const filters = TAB_FILTERS[activeTab];
            if (filters) query = query.in('type', filters);

            const { data, error } = await query;
            if (error) throw error;
            return data || [];
        },
        enabled: !!profile,
    });

    // Mark all as read mutation
    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            if (!profile) return;
            await supabase.from('notifications')
                .update({ is_read: true })
                .eq('user_id', profile.id);
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] });
            queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) =>
                Array.isArray(old) ? old.map(n => ({ ...n, is_read: true })) : old
            );
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    // Mark single as read (fire-and-forget)
    const markRead = (notifId) => {
        supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
        queryClient.setQueriesData({ queryKey: ['notifications'] }, (old) =>
            Array.isArray(old) ? old.map(n => n.id === notifId ? { ...n, is_read: true } : n) : old
        );
    };

    function handleNotificationTap(notif) {
        markRead(notif.id);
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
                <button className="notif-mark-read" onClick={() => markAllReadMutation.mutate()} style={allRead ? { color: '#2dd4bf' } : undefined}>
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
                {isLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px 16px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', flexShrink: 0, animation: 'pulse 1.5s infinite ease-in-out' }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ width: '60%', height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                    <div style={{ width: '90%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite ease-in-out' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && notifications.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                        <span style={{ display: 'block', fontSize: '40px', marginBottom: '16px', opacity: 0.2 }}>◇</span>
                        <span style={{ color: '#64748b', fontFamily: 'DM Mono, monospace', fontSize: '12px' }}>NO NOTIFICATIONS — ALL QUIET</span>
                    </div>
                )}
                <AnimatePresence>
                    {notifications.map((n, i) => {
                        const style = TYPE_STYLE[n.type] || { label: 'NOTIFICATION', shape: '○', color: '#94a3b8', icon: '📋' };
                        const isGolden = n.type === 'golden_ticket';
                        return (
                            <motion.div
                                key={n.id}
                                className={`notif-item ${isGolden ? 'glow' : ''} ${n.is_read ? 'faded' : ''}`}
                                style={{ borderLeftColor: n.is_read ? 'transparent' : style.color, opacity: n.is_read ? 0.6 : 1 }}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: n.is_read ? 0.6 : 1, scale: 1, y: 0 }}
                                whileTap={{ scale: 0.96, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300, delay: i * 0.03 }}
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
                </AnimatePresence>
            </div>
        </div>
    );
}

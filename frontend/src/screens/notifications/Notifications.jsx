import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const TABS = [
    { label: 'ALL ○', active: true },
    { label: 'EVENTS △', active: false },
    { label: 'SOCIAL □', active: false },
    { label: 'SYSTEM ◇', active: false },
];

const NOTIFICATIONS = [
    {
        type: 'event',
        label: 'EVENT ALERT',
        labelColor: '#ff4d4d',
        borderColor: '#ff4d4d',
        time: '2m ago',
        title: 'INTER-UNI FOOTBALL CUP starts in 2 hours ○',
        action: { label: 'VIEW EVENT □', type: 'filled' },
        icon: '🗓️',
        iconBg: 'rgba(255, 77, 77, 0.1)',
    },
    {
        type: 'social',
        label: 'NEW FOLLOWER',
        labelColor: '#00e5cc',
        borderColor: 'transparent',
        time: '14m ago',
        title: 'Sarah started following you △',
        titleBold: 'Sarah',
        action: { label: 'FOLLOW BACK ○', type: 'outlined' },
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    },
    {
        type: 'achievement',
        label: 'ACHIEVEMENT',
        labelColor: '#ffd700',
        borderColor: 'transparent',
        time: '1h ago',
        title: '+100 XP earned ◇',
        subtitle: 'Level 4 Completed: Red Light, Green Light',
        icon: '🏆',
        iconBg: 'rgba(255, 215, 0, 0.2)',
        glow: true,
    },
    {
        type: 'system',
        label: 'SYSTEM',
        labelColor: '#94a3b8',
        borderColor: 'transparent',
        time: '3h ago',
        title: 'Your certificate is ready □',
        download: true,
        icon: '⚙️',
        iconBg: '#1e293b',
    },
    {
        type: 'announcement',
        label: 'ANNOUNCEMENT',
        labelColor: '#64748b',
        borderColor: 'transparent',
        time: 'Yesterday',
        title: 'System maintenance scheduled for 03:00 AM UTC.',
        icon: '📡',
        iconBg: '#1e293b',
        faded: true,
    },
];

export default function Notifications() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('ALL');
    const [followedBack, setFollowedBack] = useState({});
    const [allRead, setAllRead] = useState(false);
    return (
        <div className="notif-root">
            <div className="notif-noise" />

            {/* Header */}
            <header className="notif-header">
                <h1 className="notif-title">NOTIFICATIONS <span className="notif-shape">○</span></h1>
                <button className="notif-mark-read" onClick={() => setAllRead(true)} style={allRead ? { color: '#2dd4bf' } : undefined}>
                    {allRead ? 'ALL READ ✓' : 'MARK ALL READ △'}
                </button>
            </header>

            {/* Tabs */}
            <div className="notif-tabs">
                {TABS.map((tab, i) => (
                    <button
                        key={i}
                        className={`notif-tab ${activeTab === tab.label.split(' ')[0] ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.label.split(' ')[0])}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notification Items */}
            <div className="notif-list">
                {NOTIFICATIONS.map((n, i) => (
                    <motion.div
                        key={i}
                        className={`notif-item ${n.glow ? 'glow' : ''} ${n.faded ? 'faded' : ''}`}
                        style={{ borderLeftColor: n.borderColor }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <div className="notif-item-inner">
                            <div className="notif-icon-wrap">
                                {n.avatar ? (
                                    <div className="notif-avatar">
                                        <img src={n.avatar} alt="" />
                                    </div>
                                ) : (
                                    <div className="notif-icon" style={{ background: n.iconBg, borderColor: n.glow ? `${n.labelColor}33` : 'transparent' }}>
                                        <span>{n.icon}</span>
                                    </div>
                                )}
                            </div>
                            <div className="notif-content">
                                <div className="notif-meta">
                                    <span className="notif-label" style={{ color: n.labelColor }}>{n.label}</span>
                                    <span className="notif-time">{n.time}</span>
                                </div>
                                <div className="notif-text-wrap">
                                    {n.titleBold ? (
                                        <p className="notif-text">
                                            <strong>{n.titleBold}</strong>
                                            <span className="notif-text-rest"> started following you △</span>
                                        </p>
                                    ) : (
                                        <p className="notif-text">{n.title}</p>
                                    )}
                                </div>
                                {n.subtitle && <p className="notif-subtitle">{n.subtitle}</p>}
                                {n.action && n.action.type === 'filled' && (
                                    <button className="notif-action-filled" onClick={() => navigate('/event/1')}>{n.action.label}</button>
                                )}
                                {n.action && n.action.type === 'outlined' && (
                                    <button
                                        className="notif-action-outlined"
                                        onClick={() => setFollowedBack(prev => ({ ...prev, [n.titleBold]: !prev[n.titleBold] }))}
                                        style={followedBack[n.titleBold] ? { background: 'rgba(45,212,191,0.2)', borderColor: '#2dd4bf', color: '#2dd4bf' } : undefined}
                                    >
                                        {followedBack[n.titleBold] ? 'FOLLOWING ✓' : n.action.label}
                                    </button>
                                )}
                                {n.download && (
                                    <button className="notif-download">
                                        <span className="dl-icon">↓</span> DOWNLOAD PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

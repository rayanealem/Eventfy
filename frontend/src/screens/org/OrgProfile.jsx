import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './OrgProfile.css';

const STATS = [
    { value: '42', label: 'Events', shape: '○' },
    { value: '1.2k', label: 'Attendees', shape: '△' },
    { value: '85', label: 'Volunteers', shape: '□' },
];

const EVENTS = [
    { date: 'OCT 24', title: 'CYBER SECURITY WK', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop' },
    { date: 'NOV 12', title: 'HACKATHON v4.0', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop' },
];

const REVIEWS = [
    { name: 'KARIM.B', time: '2D AGO', text: '"The most active tech community in Algeria. Truly high level events."', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face' },
    { name: 'SARAH_X', time: '1W AGO', text: '"Incredible networking opportunities. High industrial standards. ◇"', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=48&h=48&fit=crop&crop=face' },
];

const TABS = ['EVENTS', 'ABOUT', 'REVIEWS'];

export default function OrgProfile() {
    const navigate = useNavigate();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isNotified, setIsNotified] = useState(false);
    const [activeTab, setActiveTab] = useState('EVENTS');

    return (
        <div className="orgp-root">
            <div className="orgp-noise" />

            {/* Hero */}
            <div className="orgp-hero">
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=900&h=512&fit=crop" alt="" className="orgp-hero-img" />
                <div className="orgp-hero-gradient" />
                <div className="orgp-logo-overlap">
                    <div className="orgp-logo-box">
                        <span className="orgp-logo-icon">🌿</span>
                        <div className="orgp-verified-dot">
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4l3 4 7-7" stroke="#0d0f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header Info */}
            <div className="orgp-info">
                <h1 className="orgp-name">MICRO CLUB USTHB</h1>
                <div className="orgp-meta">
                    <span className="orgp-type">UNIVERSITY CLUB △</span>
                    <span className="orgp-dot" />
                    <span className="orgp-location">ALGIERS, ALGERIA</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="orgp-actions">
                <button
                    className="orgp-follow-btn"
                    onClick={() => setIsFollowing(f => !f)}
                    style={isFollowing ? { background: '#2dd4bf', borderColor: '#2dd4bf', color: '#000' } : undefined}
                >
                    {isFollowing ? 'FOLLOWING ✓' : 'FOLLOW +'}
                </button>
                <button
                    className="orgp-notify-btn"
                    onClick={() => setIsNotified(n => !n)}
                    style={isNotified ? { background: 'rgba(45,212,191,0.15)', borderColor: '#2dd4bf', color: '#2dd4bf' } : undefined}
                >
                    {isNotified ? 'NOTIFIED ✓' : 'NOTIFY ME □'}
                </button>
            </div>

            {/* Stats */}
            <div className="orgp-stats">
                {STATS.map((s, i) => (
                    <motion.div key={i} className="orgp-stat" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <span className="orgp-stat-value">{s.value}</span>
                        <div className="orgp-stat-label-row">
                            <span className="orgp-stat-label">{s.label}</span>
                            <span className="orgp-stat-shape">{s.shape}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="orgp-tabs">
                {TABS.map((t, i) => (
                    <button key={t} className={`orgp-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
            </div>

            {/* Events Grid */}
            <div className="orgp-events">
                {EVENTS.map((e, i) => (
                    <motion.div key={i} className="orgp-event-card" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} onClick={() => navigate(`/event/${i + 1}`)} style={{ cursor: 'pointer' }}>
                        <img src={e.img} alt="" className="orgp-event-img" />
                        <div className="orgp-event-gradient" />
                        <div className="orgp-event-info">
                            <span className="orgp-event-date">{e.date}</span>
                            <span className="orgp-event-title">{e.title}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Reviews */}
            <div className="orgp-reviews">
                <div className="orgp-reviews-header">
                    <div className="orgp-rating-col">
                        <span className="orgp-rating-num">4.8</span>
                        <div className="orgp-stars">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="orgp-star">♥</span>
                            ))}
                        </div>
                    </div>
                    <button className="orgp-view-reviews">VIEW ALL REVIEWS</button>
                </div>

                <div className="orgp-review-list">
                    {REVIEWS.map((r, i) => (
                        <motion.div key={i} className="orgp-review-card" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
                            <div className="orgp-review-avatar">
                                <img src={r.avatar} alt="" />
                            </div>
                            <div className="orgp-review-content">
                                <div className="orgp-review-meta">
                                    <span className="orgp-review-name">{r.name}</span>
                                    <span className="orgp-review-time">{r.time}</span>
                                </div>
                                <p className="orgp-review-text">{r.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

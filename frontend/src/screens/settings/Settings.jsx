import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

const ACCOUNT_ITEMS = [
    {
        icon: (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="#94a3b8" strokeWidth="1.2" />
                <path d="M2 15c0-3 2.7-5 6-5s6 2 6 5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        ), label: 'Profile Details'
    },
    {
        icon: (
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <rect x="1" y="1" width="18" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.2" />
                <path d="M1 4l9 5 9-5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ), label: 'Email Address'
    },
    {
        icon: (
            <svg width="16" height="21" viewBox="0 0 16 21" fill="none">
                <rect x="3" y="9" width="10" height="10" rx="2" stroke="#94a3b8" strokeWidth="1.2" />
                <path d="M5 9V6a3 3 0 016 0v3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        ), label: 'Password & Security'
    },
];

export default function Settings() {
    const navigate = useNavigate();
    const { signOut } = useAuth();
    const [pushNotif, setPushNotif] = useState(true);
    const [emailDigests, setEmailDigests] = useState(false);
    const [showLocation, setShowLocation] = useState(false);
    const [showSkills, setShowSkills] = useState(true);
    const [privacy, setPrivacy] = useState('FOLLOWERS');

    return (
        <div className="settings-root">
            <div className="settings-noise" />

            {/* Header */}
            <header className="settings-header">
                <h1 className="settings-title">SETTINGS ◇</h1>
            </header>

            <div className="settings-content">
                {/* Account Controls */}
                <section className="settings-section">
                    <h2 className="settings-section-title">ACCOUNT CONTROLS</h2>
                    <div className="settings-group">
                        {ACCOUNT_ITEMS.map((item, i) => (
                            <motion.button
                                key={i}
                                className="settings-row clickable"
                                whileHover={{ background: 'rgba(255,255,255,0.02)' }}
                                onClick={() => i === 0 ? navigate('/profile/edit') : null}
                            >
                                <div className="settings-row-left">
                                    <span className="settings-icon">{item.icon}</span>
                                    <span className="settings-label">{item.label}</span>
                                </div>
                                <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                                    <path d="M1 1l5 5-5 5" stroke="#64748b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.button>
                        ))}
                    </div>
                </section>

                {/* Notifications */}
                <section className="settings-section">
                    <h2 className="settings-section-title">NOTIFICATIONS</h2>
                    <div className="settings-group">
                        <div className="settings-row">
                            <span className="settings-label">Push Notifications</span>
                            <div
                                className={`toggle ${pushNotif ? 'on' : 'off'}`}
                                onClick={() => setPushNotif(!pushNotif)}
                            >
                                <div className="toggle-thumb">
                                    {pushNotif && (
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="settings-row">
                            <span className="settings-label">Email Digests</span>
                            <div
                                className={`toggle ${emailDigests ? 'on' : 'off'}`}
                                onClick={() => setEmailDigests(!emailDigests)}
                            >
                                <div className="toggle-thumb" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Privacy & Visibility */}
                <section className="settings-section">
                    <h2 className="settings-section-title">PRIVACY & VISIBILITY</h2>
                    <div className="settings-group no-border">
                        <div className="privacy-pills">
                            {['PUBLIC', 'FOLLOWERS', 'PRIVATE'].map((pill) => (
                                <button
                                    key={pill}
                                    className={`privacy-pill ${privacy === pill ? 'active' : ''}`}
                                    onClick={() => setPrivacy(pill)}
                                >
                                    {pill} {pill === 'PUBLIC' ? '○' : pill === 'FOLLOWERS' ? '△' : '□'}
                                </button>
                            ))}
                        </div>
                        <div className="settings-toggle-row">
                            <span className="settings-toggle-label">Show Live Location</span>
                            <div
                                className={`toggle small ${showLocation ? 'on' : 'off'}`}
                                onClick={() => setShowLocation(!showLocation)}
                            >
                                <div className="toggle-thumb" />
                            </div>
                        </div>
                        <div className="settings-toggle-row">
                            <span className="settings-toggle-label">Show Player Skills</span>
                            <div
                                className={`toggle small ${showSkills ? 'on' : 'off'}`}
                                onClick={() => setShowSkills(!showSkills)}
                            >
                                <div className="toggle-thumb">
                                    {showSkills && (
                                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* System Appearance */}
                <section className="settings-section">
                    <h2 className="settings-section-title">SYSTEM APPEARANCE</h2>
                    <div className="settings-group">
                        <div className="settings-row dimmed">
                            <span className="settings-label">Dark Mode</span>
                            <div className="locked-row">
                                <span className="locked-label">LOCKED</span>
                                <svg width="9" height="12" viewBox="0 0 9 12" fill="none">
                                    <rect x="0.5" y="5" width="8" height="7" rx="1" stroke="#00e5cc" strokeWidth="1" />
                                    <path d="M2.5 5V3.5a2 2 0 014 0V5" stroke="#00e5cc" strokeWidth="1" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <div className="settings-row">
                            <span className="settings-label">Language</span>
                            <div className="lang-row">
                                <span className="lang-value">English (US)</span>
                                <svg width="7" height="4" viewBox="0 0 7 4" fill="none">
                                    <path d="M1 0.5l2.5 3 2.5-3" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Log Out / Delete */}
                <div className="settings-danger">
                    <button className="logout-btn" onClick={async () => { await signOut(); navigate('/splash'); }}>
                        LOG OUT <span className="logout-x">✗</span>
                    </button>
                    <button className="delete-account" onClick={async () => { if (window.confirm('Are you sure you want to delete your account?')) { await signOut(); navigate('/splash'); } }}>
                        DELETE ACCOUNT PERMANENTLY
                    </button>
                </div>
            </div>
        </div>
    );
}

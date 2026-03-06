import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './VolunteerMode.css';

export default function VolunteerMode() {
    const { profile } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const data = await api('GET', '/volunteer/applications/my');
            setAssignments(data || []);
        } catch (e) {
            console.error("Error loading volunteer data", e);
        } finally {
            setLoading(false);
        }
    };

    const activeAssignment = assignments.find(a => a.status === 'ACCEPTED') || assignments[0];
    return (
        <div className="vm-root">
            <div className="vm-noise" />

            {/* Header */}
            <header className="vm-header">
                <div className="vm-header-top">
                    <div className="vm-title-wrap">
                        <h1 className="vm-title">VOLUNTEER MODE<br />△</h1>
                    </div>
                    <div className="vm-status-badge">
                        <div className="vm-status-dot" />
                        <span className="vm-status-text">● ON<br />DUTY</span>
                    </div>
                </div>
                <div className="vm-shift-row">
                    <span className="vm-shift-icon">⏱</span>
                    <span className="vm-shift-time">SHIFT: 02:14 REMAINING</span>
                </div>
            </header>

            {/* Main */}
            <div className="vm-main">
                {/* Assignment Card */}
                {loading ? (
                    <div className="vm-assignment" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>LOADING ASSIGNMENTS...</span>
                    </div>
                ) : activeAssignment ? (
                    <motion.div className="vm-assignment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="vm-assign-label">YOUR ASSIGNMENT</span>
                        <div className="vm-assign-header">
                            <div className="vm-assign-info">
                                <h2 className="vm-assign-title">{activeAssignment.role?.toUpperCase() || 'GENERAL STAFF'} △</h2>
                                <div className="vm-assign-loc">
                                    <span className="vm-loc-icon">📍</span>
                                    <span className="vm-loc-text">LOCATION: {activeAssignment.events?.location || 'HQ'}</span>
                                </div>
                            </div>
                            <div className="vm-active-badge">
                                {activeAssignment.status === 'ACCEPTED' ? 'ACTIVE △' : activeAssignment.status?.toUpperCase() || 'PENDING'}
                            </div>
                        </div>
                        <div className="vm-assign-img">
                            <img src={activeAssignment.events?.cover_image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop"} alt="" />
                            <div className="vm-assign-gradient" />
                            <div className="vm-signal-dots">
                                <span className="vm-sig-dot s1" />
                                <span className="vm-sig-dot s2" />
                                <span className="vm-sig-dot s3" />
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="vm-assignment" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>NO ACTIVE ASSIGNMENTS</span>
                    </div>
                )}

                {/* Tasks Checklist - Fallback content, needs specific tasks from DB if implemented */}
                {activeAssignment && (
                    <div className="vm-tasks">
                        <div className="vm-tasks-header">
                            <span className="vm-tasks-title">TASKS CHECKLIST</span>
                            <span className="vm-tasks-count">0/3 COMPLETE</span>
                        </div>
                        <div className="vm-progress-bar">
                            <div className="vm-progress-fill" style={{ width: '0%' }} />
                        </div>
                        <div className="vm-task-list">
                            <div className="vm-task-item">
                                <div className="vm-checkbox"></div>
                                <span className="vm-task-text">Check-in at Location</span>
                            </div>
                            <div className="vm-task-item">
                                <div className="vm-checkbox"></div>
                                <span className="vm-task-text">Receive briefing from lead</span>
                            </div>
                            <div className="vm-task-item">
                                <div className="vm-checkbox"></div>
                                <span className="vm-task-text">Complete shift objectives</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Status */}
                {activeAssignment && (
                    <div className="vm-team">
                        <span className="vm-team-title">SHIFT CONTACTS</span>
                        <div className="vm-team-row">
                            <div className="vm-team-avatars">
                                <div className="vm-team-avatar" style={{ borderColor: '#008080' }}>
                                    <img src="https://i.pravatar.cc/50?img=11" alt="" />
                                    <span className="vm-online-dot online" />
                                </div>
                                <div className="vm-team-avatar" style={{ borderColor: '#475569' }}>
                                    <img src="https://i.pravatar.cc/50?img=25" alt="" />
                                    <span className="vm-online-dot away" />
                                </div>
                            </div>
                            <button className="vm-chat-btn">CONTACT LEAD □</button>
                        </div>
                    </div>
                )}

                {/* XP Reward */}
                <div className="vm-xp-feedback">
                    <span className="vm-xp-earned">+150 XP EARNED</span>
                    <span className="vm-xp-subtitle">Tactical Performance Bonus</span>
                </div>

                {/* Emergency */}
                <button className="vm-emergency-btn">
                    <span>⚠</span>
                    <span>⚠ ALERT ORGANIZER</span>
                </button>
            </div>

            {/* Footer */}
            <div className="vm-footer">
                <div className="vm-footer-btns">
                    <button className="vm-report-btn">
                        <span className="vm-btn-icon">📋</span>
                        <span>REPORT ISSUE ○</span>
                    </button>
                    <button className="vm-backup-btn">
                        <span className="vm-btn-icon">🛡</span>
                        <span>REQUEST BACKUP △</span>
                    </button>
                </div>
                <button className="vm-done-btn">TASK DONE □</button>
            </div>
        </div>
    );
}

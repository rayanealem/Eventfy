import { motion } from 'framer-motion';
import './VolunteerMode.css';

const TASKS = [
    { text: 'Scan VIP Guest QR codes', done: true },
    { text: 'Verify identification documents', done: true },
    { text: 'Hand out event wristbands', done: false },
    { text: 'Update digital guest list', done: false },
];

const TEAM = [
    { img: 'https://i.pravatar.cc/50?img=11', online: true, border: '#008080' },
    { img: 'https://i.pravatar.cc/50?img=25', online: true, border: '#008080' },
    { img: 'https://i.pravatar.cc/50?img=32', online: false, border: '#475569' },
    { img: 'https://i.pravatar.cc/50?img=44', online: true, border: '#008080' },
];

export default function VolunteerMode() {
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
                <motion.div className="vm-assignment" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <span className="vm-assign-label">YOUR ASSIGNMENT</span>
                    <div className="vm-assign-header">
                        <div className="vm-assign-info">
                            <h2 className="vm-assign-title">REGISTRATION △</h2>
                            <div className="vm-assign-loc">
                                <span className="vm-loc-icon">📍</span>
                                <span className="vm-loc-text">LOCATION: DESK A</span>
                            </div>
                        </div>
                        <div className="vm-active-badge">ACTIVE △</div>
                    </div>
                    <div className="vm-assign-img">
                        <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=300&fit=crop" alt="" />
                        <div className="vm-assign-gradient" />
                        <div className="vm-signal-dots">
                            <span className="vm-sig-dot s1" />
                            <span className="vm-sig-dot s2" />
                            <span className="vm-sig-dot s3" />
                        </div>
                    </div>
                </motion.div>

                {/* Tasks Checklist */}
                <div className="vm-tasks">
                    <div className="vm-tasks-header">
                        <span className="vm-tasks-title">TASKS CHECKLIST</span>
                        <span className="vm-tasks-count">2/4 COMPLETE</span>
                    </div>
                    <div className="vm-progress-bar">
                        <div className="vm-progress-fill" />
                    </div>
                    <div className="vm-task-list">
                        {TASKS.map((t, i) => (
                            <motion.div
                                key={i}
                                className={`vm-task-item ${t.done ? 'done' : ''}`}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <div className={`vm-checkbox ${t.done ? 'checked' : ''}`}>
                                    {t.done && <span>✓</span>}
                                </div>
                                <span className="vm-task-text">{t.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Team Status */}
                <div className="vm-team">
                    <span className="vm-team-title">TEAM STATUS</span>
                    <div className="vm-team-row">
                        <div className="vm-team-avatars">
                            {TEAM.map((m, i) => (
                                <div key={i} className="vm-team-avatar" style={{ borderColor: m.border }}>
                                    <img src={m.img} alt="" />
                                    <span className={`vm-online-dot ${m.online ? 'online' : 'away'}`} />
                                </div>
                            ))}
                        </div>
                        <button className="vm-chat-btn">CHAT WITH TEAM □</button>
                    </div>
                </div>

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

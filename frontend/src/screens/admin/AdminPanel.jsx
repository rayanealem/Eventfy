import './AdminPanel.css';

const USERS = [
    { id: '#456', name: 'Seong Gi-hun', role: '○', color: '#ff4d4d', action: 'Ban ✗', actionType: 'ban' },
    { id: '#218', name: 'Cho Sang-woo', role: '△', color: '#10b981', action: 'Verify ✓', actionType: 'verify' },
    { id: '#067', name: 'Kang Sae-byeok', role: '□', color: '#ff4d4d', action: 'Ban ✗', actionType: 'ban' },
];

const HEALTH = [
    { label: 'API Core', value: '99.98%', status: '#10b981' },
    { label: 'Database', value: '99.99%', status: '#10b981' },
    { label: 'Storage', value: '98.42%', status: '#f59e0b' },
];

const EVENTS = [
    { name: 'SQUID_RUN_BEJAIA', loc: 'LOC: 36.7511° N, 5.0567° E' },
    { name: 'NIGHT_WATCH_T3', loc: 'LOC: 36.7390° N, 5.0740° E' },
];

export default function AdminPanel() {
    return (
        <div className="ap-root">
            <div className="ap-noise" />

            {/* Top Bar */}
            <div className="ap-topbar">
                <div className="ap-topbar-left">
                    <span className="ap-terminal-icon">⬡</span>
                    <span className="ap-terminal-ver">Terminal v4.0.2</span>
                </div>
                <div className="ap-live-badge">
                    <div className="ap-live-dot" />
                    <span className="ap-live-text">Live System</span>
                </div>
            </div>

            {/* Main */}
            <div className="ap-main">
                {/* Master View Header */}
                <div className="ap-master-header">
                    <div className="ap-master-top">
                        <h1 className="ap-master-title">MASTER VIEW ◇</h1>
                        <div className="ap-admin-badge">
                            <span className="ap-admin-icon">🛡</span>
                            <span className="ap-admin-text">Admin Access</span>
                        </div>
                    </div>
                    <span className="ap-master-sub">Global Administrative Authority</span>
                </div>

                {/* Stats */}
                <div className="ap-stats-row">
                    <div className="ap-stat-card">
                        <span className="ap-stat-label">Total Users</span>
                        <span className="ap-stat-value">1,248,392</span>
                        <span className="ap-stat-trend green">+14.2% △</span>
                    </div>
                    <div className="ap-stat-card">
                        <span className="ap-stat-label">Active Events</span>
                        <span className="ap-stat-value">482</span>
                        <span className="ap-stat-trend green">+5.8% △</span>
                    </div>
                </div>

                {/* User Management */}
                <div className="ap-section">
                    <div className="ap-section-head">
                        <span className="ap-section-title">User Management ○△□◇</span>
                        <span className="ap-section-filter">FILTER: [ALL_ROLES]</span>
                    </div>
                    <div className="ap-table">
                        <div className="ap-table-header">
                            <span className="ap-th" style={{ width: 45 }}>ID</span>
                            <span className="ap-th" style={{ width: 150 }}>NAME</span>
                            <span className="ap-th center" style={{ width: 56 }}>ROLE</span>
                            <span className="ap-th right" style={{ width: 106 }}>ACTION</span>
                        </div>
                        {USERS.map((u, i) => (
                            <div key={i} className={`ap-table-row ${i > 0 ? 'bordered' : ''}`}>
                                <span className="ap-td id" style={{ width: 45 }}>{u.id}</span>
                                <span className="ap-td name" style={{ width: 150 }}>{u.name}</span>
                                <span className="ap-td center role" style={{ width: 56, color: u.color }}>{u.role}</span>
                                <div className="ap-td right" style={{ width: 106 }}>
                                    <button className={`ap-action-btn ${u.actionType}`}>{u.action}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Moderation Queue */}
                <div className="ap-section">
                    <div className="ap-section-head">
                        <span className="ap-section-title">Moderation Queue [FLAGGED]</span>
                    </div>
                    <div className="ap-moderation-card">
                        <div className="ap-mod-header">
                            <span className="ap-mod-flag">FLAG_0982 / IMG_882</span>
                            <span className="ap-mod-time">2M AGO</span>
                        </div>
                        <div className="ap-mod-image">
                            <div className="ap-mod-blur" />
                        </div>
                        <div className="ap-mod-actions">
                            <button className="ap-mod-btn">[Approve ○]</button>
                            <button className="ap-mod-btn">[Remove □]</button>
                            <button className="ap-mod-btn">[Warn △]</button>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="ap-section">
                    <span className="ap-health-label">System Health Infrastructure</span>
                    <div className="ap-health-row">
                        {HEALTH.map((h, i) => (
                            <div key={i} className="ap-health-card">
                                <div className="ap-health-top">
                                    <span className="ap-health-name">{h.label}</span>
                                    <div className="ap-health-dot" style={{ background: h.status, boxShadow: `0 0 5px ${h.status}` }} />
                                </div>
                                <span className="ap-health-value">{h.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="ap-region-divider">
                    <div className="ap-region-line" />
                    <span className="ap-region-label">Regional Access Point</span>
                    <div className="ap-region-line" />
                </div>

                {/* Local Admin */}
                <div className="ap-local-header">
                    <h2 className="ap-local-title">LOCAL ADMIN — BEJAIA □</h2>
                    <span className="ap-local-sub">Regional Node: North Africa / Sector 06</span>
                </div>

                {/* Local Stats */}
                <div className="ap-stats-row">
                    <div className="ap-stat-card red">
                        <span className="ap-stat-label">Local Events</span>
                        <span className="ap-stat-value">24</span>
                        <span className="ap-stat-trend red">12 Pending Review</span>
                    </div>
                    <div className="ap-stat-card">
                        <span className="ap-stat-label">Local Orgs</span>
                        <span className="ap-stat-value">156</span>
                        <span className="ap-stat-trend green">89% Verified</span>
                    </div>
                </div>

                {/* Org Verification */}
                <div className="ap-section">
                    <div className="ap-section-head">
                        <span className="ap-section-title">Verification Queue [ORGS]</span>
                    </div>
                    <div className="ap-org-card">
                        <div className="ap-org-top">
                            <div className="ap-org-logo">
                                <img src="https://i.pravatar.cc/40?img=20" alt="" />
                            </div>
                            <div className="ap-org-info">
                                <span className="ap-org-name">TECH_NODE_ALG</span>
                                <span className="ap-org-link">View_Documents_PDF.bin</span>
                            </div>
                        </div>
                        <div className="ap-org-actions">
                            <button className="ap-org-approve">Approve ✓</button>
                            <button className="ap-org-reject">Reject ✗</button>
                        </div>
                    </div>
                </div>

                {/* Event Approval */}
                <div className="ap-section">
                    <div className="ap-section-head">
                        <span className="ap-section-title">Event Approval [PENDING]</span>
                    </div>
                    <div className="ap-events-list">
                        {EVENTS.map((e, i) => (
                            <div key={i} className={`ap-event-row ${i > 0 ? 'bordered' : ''}`}>
                                <div className="ap-event-info">
                                    <span className="ap-event-name">{e.name}</span>
                                    <span className="ap-event-loc">{e.loc}</span>
                                </div>
                                <div className="ap-event-actions">
                                    <span className="ap-event-icon">✓</span>
                                    <span className="ap-event-icon">✗</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import './AdminPanel.css';

const HEALTH = [
    { label: 'API Core', value: '99.98%', status: '#10b981' },
    { label: 'Database', value: '99.99%', status: '#10b981' },
    { label: 'Storage', value: '98.42%', status: '#f59e0b' },
];

export default function AdminPanel() {
    const [stats, setStats] = useState({ total_users: 0, total_events: 0, total_orgs: 0 });
    const [users, setUsers] = useState([]);
    const [pendingOrgs, setPendingOrgs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdminData = async () => {
            try {
                const [statsRes, usersRes, orgsRes] = await Promise.all([
                    api.get('/admin/stats'),
                    api.get('/admin/users?page_size=10'),
                    api.get('/admin/orgs/pending')
                ]);
                setStats(statsRes.data);
                setUsers(usersRes.data || []);
                setPendingOrgs(orgsRes.data || []);
            } catch (error) {
                console.error("Admin dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAdminData();
    }, []);

    const handleOrgAction = async (orgId, action) => {
        try {
            if (action === 'approve') {
                await api.patch(`/admin/orgs/${orgId}/approve`);
            } else {
                await api.patch(`/admin/orgs/${orgId}/reject`, { reason: 'Does not meet criteria' });
            }
            // Remove from list
            setPendingOrgs(prev => prev.filter(o => o.id !== orgId));
        } catch (error) {
            console.error(error);
            alert(`Failed to ${action} organization`);
        }
    };

    if (loading) return <div style={{ color: '#f44725', padding: '2rem', fontFamily: 'monospace' }}>INITIATING GLOBAL BYPASS...</div>

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
                        <span className="ap-stat-value">{stats.total_users.toLocaleString()}</span>
                        <span className="ap-stat-trend green">LIVE DB SYNC</span>
                    </div>
                    <div className="ap-stat-card">
                        <span className="ap-stat-label">Total Events</span>
                        <span className="ap-stat-value">{stats.total_events.toLocaleString()}</span>
                        <span className="ap-stat-trend green">LIVE DB SYNC</span>
                    </div>
                    <div className="ap-stat-card">
                        <span className="ap-stat-label">Verified Orgs</span>
                        <span className="ap-stat-value">{stats.total_orgs.toLocaleString()}</span>
                        <span className="ap-stat-trend green">LIVE DB SYNC</span>
                    </div>
                </div>

                {/* User Management */}
                <div className="ap-section">
                    <div className="ap-section-head">
                        <span className="ap-section-title">User Management ○△□◇</span>
                        <span className="ap-section-filter">FILTER: [RECENT 10]</span>
                    </div>
                    <div className="ap-table">
                        <div className="ap-table-header">
                            <span className="ap-th" style={{ width: 80 }}>ID</span>
                            <span className="ap-th" style={{ width: 150 }}>NAME</span>
                            <span className="ap-th center" style={{ width: 80 }}>ROLE</span>
                            <span className="ap-th right" style={{ width: 106 }}>LVL</span>
                        </div>
                        {users.map((u, i) => (
                            <div key={i} className={`ap-table-row ${i > 0 ? 'bordered' : ''}`}>
                                <span className="ap-td id" style={{ width: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.id.substring(0, 6)}</span>
                                <span className="ap-td name" style={{ width: 150 }}>{u.full_name}</span>
                                <span className="ap-td center role" style={{ width: 80, color: u.role === 'global_admin' ? '#f44725' : '#10b981' }}>{u.role}</span>
                                <div className="ap-td right" style={{ width: 106, color: 'rgba(255,255,255,0.6)' }}>
                                    LVL {u.level}
                                </div>
                            </div>
                        ))}
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
                    <span className="ap-region-label">Organization Oversight</span>
                    <div className="ap-region-line" />
                </div>

                {/* Org Verification */}
                <div className="ap-section">
                    <div className="ap-section-head">
                        <span className="ap-section-title">Verification Queue [ORGS]</span>
                        <span className="ap-section-filter">{pendingOrgs.length} PENDING</span>
                    </div>
                    {pendingOrgs.length === 0 ? (
                        <div style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>All clear. No organizations pending verification.</div>
                    ) : (
                        pendingOrgs.map(org => (
                            <div key={org.id} className="ap-org-card" style={{ marginBottom: 12 }}>
                                <div className="ap-org-top">
                                    <div className="ap-org-logo">
                                        <img src={org.logo_url || "https://i.pravatar.cc/40?img=20"} alt="" />
                                    </div>
                                    <div className="ap-org-info">
                                        <span className="ap-org-name">{org.name.toUpperCase()}</span>
                                        <span className="ap-org-link">TYPE: {org.org_type.replace('_', ' ').toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="ap-org-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <button className="ap-org-approve" onClick={() => handleOrgAction(org.id, 'approve')} style={{ cursor: 'pointer', flex: 1 }}>Approve ✓</button>
                                    <button className="ap-org-reject" onClick={() => handleOrgAction(org.id, 'reject')} style={{ cursor: 'pointer', flex: 1 }}>Reject ✗</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import './PlayerPassport.css';

const SKILLS = [
    { name: 'STRATEGY & LOGIC', pct: 88, width: '88%' },
    { name: 'AGILITY & SPEED', pct: 94, width: '94%' },
    { name: 'ENDURANCE', pct: 72, width: '72%' },
];

const TAGS = ['#LEADERSHIP', '#RISK_MGMT', '#TACTICAL'];

const TIMELINE = [
    { title: 'Apex Championship', role: 'PARTICIPANT | Q4 2023', cert: true },
    { title: 'Neon District Protocol', role: 'VOLUNTEER LEAD | Q2 2023', cert: true },
];

const ACHIEVEMENTS = [
    { name: 'Last Man Standing', color: '#11d4c4' },
    { name: 'Team Tactician', color: '#ff5f5f' },
    { name: 'Hyper Focus', color: '#ffd700' },
];

export default function PlayerPassport() {
    const navigate = useNavigate();

    return (
        <div className="pp-root">
            <div className="pp-noise" />

            {/* Header */}
            <header className="pp-header">
                <div className="pp-header-left">
                    <button className="pp-back" onClick={() => navigate(-1)}>‹</button>
                    <div className="pp-header-title">
                        <span>YOUR</span>
                        <span>PASSPORT ○</span>
                    </div>
                </div>
                <div className="pp-header-actions">
                    <button className="pp-dl-btn">Download<br />PDF □</button>
                    <button className="pp-share-btn">Share<br />△</button>
                </div>
            </header>

            {/* Main Card */}
            <div className="pp-card">
                {/* Red Banner */}
                <div className="pp-banner">
                    <span className="pp-banner-title">OFFICIAL PARTICIPATION PASSPORT</span>
                    <span className="pp-banner-sn">SN: 4821-X-99</span>
                </div>

                <div className="pp-card-body">
                    {/* Avatar */}
                    <div className="pp-avatar-section">
                        <div className="pp-avatar-wrap">
                            <div className="pp-avatar-hex">
                                <img src="https://i.pravatar.cc/112?img=12" alt="" />
                            </div>
                            <div className="pp-level-badge">LEVEL 7 GOLD</div>
                        </div>
                        <div className="pp-player-info">
                            <span className="pp-player-number">PLAYER #4821</span>
                            <span className="pp-player-status">Status: Active Participant</span>
                        </div>
                    </div>

                    {/* Verified Skills */}
                    <div className="pp-section">
                        <div className="pp-section-head">
                            <span className="pp-section-title">VERIFIED SKILLS □</span>
                            <div className="pp-divider" />
                        </div>
                        <div className="pp-skills-list">
                            {SKILLS.map((s, i) => (
                                <div key={i} className="pp-skill-item">
                                    <div className="pp-skill-head">
                                        <span className="pp-skill-name">{s.name}</span>
                                        <span className="pp-skill-pct">{s.pct}% □□□□□□□□□□</span>
                                    </div>
                                    <div className="pp-skill-bar">
                                        <div className="pp-skill-fill" style={{ width: s.width }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pp-skill-tags">
                            {TAGS.map((t, i) => (
                                <span key={i} className="pp-skill-tag">{t}</span>
                            ))}
                        </div>
                    </div>

                    {/* Experience Timeline */}
                    <div className="pp-section">
                        <div className="pp-section-head">
                            <span className="pp-section-title">EXPERIENCE TIMELINE △</span>
                            <div className="pp-divider" />
                        </div>
                        <div className="pp-timeline">
                            {TIMELINE.map((t, i) => (
                                <div key={i} className="pp-timeline-item">
                                    <div className="pp-tl-marker">○</div>
                                    <div className="pp-tl-content">
                                        <div className="pp-tl-top">
                                            <div className="pp-tl-info">
                                                <span className="pp-tl-title">{t.title}</span>
                                                <span className="pp-tl-role">{t.role}</span>
                                            </div>
                                            {t.cert && <span className="pp-tl-cert">🛡 CERT ◇</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="pp-section">
                        <div className="pp-section-head">
                            <span className="pp-section-title">ACHIEVEMENTS ◇</span>
                            <div className="pp-divider" />
                        </div>
                        <div className="pp-achievements">
                            {ACHIEVEMENTS.map((a, i) => (
                                <div key={i} className="pp-achievement">
                                    <div className="pp-ach-hex" style={{ borderColor: a.color, background: `${a.color}10` }}>
                                        <span style={{ color: a.color }}>◇</span>
                                    </div>
                                    <span className="pp-ach-name" style={{ color: a.color }}>{a.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Verification */}
                    <div className="pp-verify-section">
                        <div className="pp-verify-meta">
                            <span className="pp-verify-status">System Status: VERIFIED</span>
                            <span className="pp-verify-hash">Hash: 8f92j1k...m90x2</span>
                            <div className="pp-verify-row">
                                <div className="pp-verify-icon">🛡</div>
                                <span className="pp-verify-label">Cryptographically Verified</span>
                            </div>
                        </div>
                        <div className="pp-qr-wrap">
                            <div className="pp-qr-inner">
                                <div className="pp-qr-placeholder">QR</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card Bottom Gradient */}
                <div className="pp-card-gradient" />
            </div>
        </div>
    );
}

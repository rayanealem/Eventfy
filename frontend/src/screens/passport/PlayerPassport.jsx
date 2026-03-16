import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import './PlayerPassport.css';

const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 4500, 7000, 10000, 14000, 19000, 25000];

const getLevelInfo = (xp) => {
    let level = 1, nextThreshold = LEVEL_THRESHOLDS[1], prevThreshold = 0;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (xp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
            prevThreshold = LEVEL_THRESHOLDS[i];
            nextThreshold = LEVEL_THRESHOLDS[i + 1] || Infinity;
        } else break;
    }
    const progress = nextThreshold === Infinity ? 100 : ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    return { level, nextThreshold, progress };
};

export default function PlayerPassport() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    const { data: passport, isLoading } = useQuery({
        queryKey: ['passport', profile?.username],
        queryFn: () => api('GET', `/users/${profile?.username}/passport`),
        enabled: !!profile?.username,
    });

    if (isLoading || !passport) {
        return <div className="pp-root"><div className="pp-noise" /><div style={{ padding: '24px', color: '#fff', textAlign: 'center' }}>LOADING PASSPORT...</div></div>;
    }

    const { profile: userProfile, badges = [], events_attended = [], skills = [] } = passport;

    const xp = userProfile?.xp || 0;
    const { level, nextThreshold, progress } = getLevelInfo(xp);
    const shape = userProfile?.shape || '○';
    const shapeColor = userProfile?.shape_color || '#f472b6';
    const playerNumber = userProfile?.player_number || '0000';

    return (
        <div className="pp-root">
            <div className="pp-noise" />

            {/* Header */}
            <header className="pp-header">
                <div className="pp-header-left">
                    <button className="pp-back" onClick={() => navigate(-1)}>‹</button>
                    <div className="pp-header-title">
                        <span>YOUR</span>
                        <span style={{ color: shapeColor }}>PASSPORT {shape}</span>
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
                    <span className="pp-banner-sn" style={{ fontFamily: 'DM Mono' }}>SN: {playerNumber}-X-99</span>
                </div>

                <div className="pp-card-body">
                    {/* Avatar */}
                    <div className="pp-avatar-section">
                        <div className="pp-avatar-wrap">
                            <div className="pp-avatar-hex" style={{ borderColor: shapeColor }}>
                                <img src={userProfile?.avatar_url || `https://i.pravatar.cc/112?u=${userProfile?.id}`} alt="" />
                            </div>
                            <div className="pp-level-badge" style={{ backgroundColor: shapeColor }}>LEVEL {level}</div>
                        </div>
                        <div className="pp-player-info">
                            <span className="pp-player-number" style={{ fontFamily: 'DM Mono' }}>PLAYER #{playerNumber}</span>
                            <span className="pp-player-status">Status: Active Participant</span>

                            {/* XP Progress */}
                            <div style={{ marginTop: '8px', width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'DM Mono', color: 'rgba(255,255,255,0.6)' }}>
                                    <span>{xp.toLocaleString()} XP</span>
                                    <span>{nextThreshold === Infinity ? 'MAX' : `${nextThreshold.toLocaleString()} XP`}</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: shapeColor, transition: 'width 1s ease-out' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verified Skills */}
                    <div className="pp-section">
                        <div className="pp-section-head">
                            <span className="pp-section-title">VERIFIED SKILLS □</span>
                            <div className="pp-divider" />
                        </div>
                        {skills.length > 0 ? (
                            <div className="pp-skills-list">
                                {skills.map((s, i) => (
                                    <div key={i} className="pp-skill-item">
                                        <div className="pp-skill-head">
                                            <span className="pp-skill-name">{s.skills?.name || 'UNKNOWN SKILL'}</span>
                                            <span className="pp-skill-pct" style={{ fontFamily: 'DM Mono' }}>100% □□□□□□□□□□</span>
                                        </div>
                                        <div className="pp-skill-bar">
                                            <div className="pp-skill-fill" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono', letterSpacing: '1px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                NO VERIFIED SKILLS LOGGED
                            </div>
                        )}
                        <div className="pp-skill-tags">
                            {skills.slice(0, 3).map((s, i) => (
                                <span key={i} className="pp-skill-tag">#{s.skills?.category?.toUpperCase() || 'GENERAL'}</span>
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
                            {events_attended.length > 0 ? events_attended.map((t, i) => (
                                <div key={i} className="pp-timeline-item">
                                    <div className="pp-tl-marker">○</div>
                                    <div className="pp-tl-content">
                                        <div className="pp-tl-top">
                                            <div className="pp-tl-info">
                                                <span className="pp-tl-title">{t.events?.title || 'Unknown Event'}</span>
                                                <span className="pp-tl-role" style={{ fontFamily: 'DM Mono' }}>
                                                    {t.status.toUpperCase()} | {new Date(t.registered_at).getFullYear()}
                                                </span>
                                            </div>
                                            {t.checked_in && <span className="pp-tl-cert">🛡 CERT ◇</span>}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono', letterSpacing: '1px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                    NO EVENT HISTORY FOUND
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="pp-section">
                        <div className="pp-section-head">
                            <span className="pp-section-title">ACHIEVEMENTS ◇</span>
                            <div className="pp-divider" />
                        </div>
                        {badges.length > 0 ? (
                            <div className="pp-achievements">
                                {badges.map((b, i) => {
                                    const badgeColor = b.badges?.color || '#11d4c4';
                                    const badgeName = b.badges?.name || 'Achievement';
                                    const badgeShape = b.badges?.shape || '◇';
                                    return (
                                        <div key={i} className="pp-achievement">
                                            <div className="pp-ach-hex" style={{ borderColor: badgeColor, background: `${badgeColor}10` }}>
                                                <span style={{ color: badgeColor }}>{badgeShape}</span>
                                            </div>
                                            <span className="pp-ach-name" style={{ color: badgeColor }}>{badgeName}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: 'rgba(255,50,50,0.8)', fontFamily: 'DM Mono', letterSpacing: '1px', border: '1px solid rgba(255,50,50,0.2)', borderRadius: '4px', background: 'rgba(255,50,50,0.05)' }}>
                                NO ACHIEVEMENTS UNLOCKED
                            </div>
                        )}
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerifyCertificate.css';

const SKILLS = ['STRATEGY', 'ENDURANCE', 'AGILITY'];

export default function VerifyCertificate() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [verified, setVerified] = useState(true);

    return (
        <div className="vc-root">
            <div className="vc-noise" />

            {/* Header */}
            <header className="vc-header">
                <button className="vc-back" onClick={() => navigate(-1)}>‹</button>
                <h1 className="vc-title">VERIFY CERTIFICATE □</h1>
                <span className="vc-dots">⋮</span>
            </header>

            {/* Main */}
            <div className="vc-main">
                {/* Input */}
                <div className="vc-input-section">
                    <h2 className="vc-input-heading">ENTER CODE</h2>
                    <div className="vc-input-wrap">
                        <div className="vc-input-box">
                            <input
                                className="vc-input"
                                type="text"
                                placeholder="EFY-XXXX-XXXX"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                            <span className="vc-input-shapes">○△□</span>
                        </div>
                        <button className="vc-verify-btn">VERIFY ○</button>
                    </div>
                </div>

                {/* Success State */}
                {verified && (
                    <>
                        <div className="vc-success-header">
                            <span className="vc-success-text">✓ CERTIFICATE VERIFIED</span>
                        </div>

                        {/* Certificate Card */}
                        <div className="vc-cert-card">
                            <div className="vc-cert-glow" />
                            <div className="vc-cert-inner">
                                <div className="vc-coral-strip" />
                                <div className="vc-cert-content">
                                    {/* Header */}
                                    <div className="vc-cert-head">
                                        <div className="vc-cert-meta">
                                            <span className="vc-cert-passport">Official Social Passport</span>
                                            <span className="vc-cert-id">ID-8892-002</span>
                                        </div>
                                        <div className="vc-cert-brand">
                                            <span className="vc-brand-name">EVENTFY </span>
                                            <span className="vc-brand-shapes">○△□</span>
                                        </div>
                                    </div>

                                    {/* Player */}
                                    <div className="vc-player-section">
                                        <span className="vc-player-label">Player Identity</span>
                                        <span className="vc-player-name">Ahmed Benali</span>
                                    </div>

                                    {/* Event Info */}
                                    <div className="vc-event-info">
                                        <div className="vc-event-left">
                                            <span className="vc-event-label">Event Title</span>
                                            <span className="vc-event-name">The Final Elimin…</span>
                                        </div>
                                        <div className="vc-event-badge">○ PARTICIPANT</div>
                                    </div>

                                    {/* Skills */}
                                    <div className="vc-skills-section">
                                        <span className="vc-skills-label">Verified Attributes</span>
                                        <div className="vc-skills-tags">
                                            {SKILLS.map((s, i) => (
                                                <span key={i} className="vc-skill-tag">{s}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seal */}
                                    <div className="vc-seal">
                                        <img src="https://i.pravatar.cc/96?img=5" alt="" />
                                    </div>
                                </div>

                                {/* Card Footer */}
                                <div className="vc-cert-footer">
                                    <div className="vc-cert-dots">
                                        <span className="vc-dot bright" />
                                        <span className="vc-dot medium" />
                                        <span className="vc-dot dim" />
                                    </div>
                                    <span className="vc-auth-text">AUTHENTICATED BY EVENTFY NETWORK PROTOCOL</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="vc-actions">
                            <button className="vc-download-btn">DOWNLOAD PDF □</button>
                            <button className="vc-share-btn">SHARE △</button>
                        </div>
                    </>
                )}

                {/* Invalid State */}
                <div className="vc-invalid-state">
                    <span className="vc-invalid-title">✗ INVALID CODE</span>
                    <p className="vc-invalid-desc">
                        The entered credentials do not match our database records. Access denied to secure vault.
                    </p>
                </div>
            </div>
        </div>
    );
}

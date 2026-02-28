import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Auth.css';

export default function OrgRegisterAuth() {
    const navigate = useNavigate();
    const [isPending, setIsPending] = useState(false);
    const [form, setForm] = useState({
        orgName: '', username: '', taxId: '', email: '', password: '', wilaya: '', orgType: '',
    });
    const [showPass, setShowPass] = useState(false);

    const passwordStrength = () => {
        const len = form.password.length;
        if (len === 0) return 0;
        if (len < 4) return 1;
        if (len < 8) return 2;
        if (len < 12) return 3;
        return 4;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsPending(true);
    };

    if (isPending) {
        return (
            <div className="auth-screen auth-pending" id="org-pending-screen">
                <motion.div
                    className="pending-container"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="pending-spinner">
                        <div className="spinner-ring" />
                        <span className="pending-icon">△</span>
                    </div>
                    <h2 className="auth-heading-large" style={{ fontSize: '2rem' }}>AWAITING APPROVAL</h2>
                    <p className="auth-subheading" style={{ maxWidth: 280 }}>
                        YOUR REGISTRATION IS UNDER REVIEW. AN ADMIN WILL VERIFY YOUR DOCUMENTS.
                    </p>
                    <div className="pending-status">
                        <div className="status-dot" />
                        <span className="text-label" style={{ color: 'var(--color-gold)' }}>
                            VERIFICATION IN PROGRESS
                        </span>
                    </div>
                    <button
                        className="btn btn-outline btn-small"
                        style={{ marginTop: 24 }}
                        onClick={() => navigate('/splash')}
                    >
                        RETURN TO SPLASH
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="auth-screen" id="org-register-screen">
            <div className="auth-header">
                <motion.h1
                    className="auth-heading-large"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    ORG RECRUITMENT
                </motion.h1>
                <p className="auth-subheading">
                    BUILD YOUR ARENA. LEAD THE GAME.
                </p>
            </div>

            {/* Progress bar */}
            <div className="auth-mode-bar">
                <div className="auth-mode-progress" style={{ width: '32%', background: 'var(--color-teal)' }} />
                <div className="auth-mode-labels">
                    <span className="text-label" style={{ color: 'var(--color-teal)' }}>STEP 02: DATA ENTRY</span>
                    <span className="text-label">32% COMPLETE</span>
                </div>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="org-name">ORGANIZATION NAME</label>
                    <input
                        id="org-name"
                        type="text"
                        placeholder="ENTER ORG NAME"
                        value={form.orgName}
                        onChange={e => setForm(f => ({ ...f, orgName: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="org-username">ORG USERNAME</label>
                    <div className="input-with-prefix">
                        <span className="input-prefix">@</span>
                        <input
                            id="org-username"
                            type="text"
                            placeholder="username"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="org-tax">REGISTRATION NUMBER / TAX ID</label>
                    <input
                        id="org-tax"
                        type="text"
                        placeholder="XX-0000-0000"
                        value={form.taxId}
                        onChange={e => setForm(f => ({ ...f, taxId: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="org-email">OFFICIAL EMAIL</label>
                    <input
                        id="org-email"
                        type="email"
                        placeholder="contact@organization.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="org-password">ACCESS PASSWORD</label>
                    <div className="input-password-wrapper">
                        <input
                            id="org-password"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        />
                        <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                            <svg width="16.5" height="11.25" viewBox="0 0 17 12" fill="none">
                                <path d="M8.5 1C4.5 1 1.2 3.7 0 7.5c1.2 3.8 4.5 6.5 8.5 6.5s7.3-2.7 8.5-6.5C15.8 3.7 12.5 1 8.5 1zm0 10.8c-2.5 0-4.5-1.9-4.5-4.3S6 3.2 8.5 3.2 13 5.1 13 7.5s-2 4.3-4.5 4.3zm0-6.9c-1.5 0-2.7 1.2-2.7 2.6s1.2 2.6 2.7 2.6 2.7-1.2 2.7-2.6-1.2-2.6-2.7-2.6z" fill="rgba(255,255,255,0.4)" />
                            </svg>
                        </button>
                    </div>
                    <div className="password-strength">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`strength-bar ${i <= passwordStrength() ? 'active' : ''}`}
                                style={{
                                    background: i <= passwordStrength()
                                        ? i <= 2 ? 'var(--color-teal)' : 'var(--color-blue)' : undefined
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="org-wilaya">WILAYA / REGION</label>
                    <div className="input-select-wrapper">
                        <select
                            id="org-wilaya"
                            value={form.wilaya}
                            onChange={e => setForm(f => ({ ...f, wilaya: e.target.value }))}
                        >
                            <option value="">Select Region</option>
                            <option value="16">16 - Alger</option>
                            <option value="31">31 - Oran</option>
                            <option value="25">25 - Constantine</option>
                            <option value="09">09 - Blida</option>
                            <option value="19">19 - Sétif</option>
                        </select>
                        <span className="select-chevron" style={{ color: 'var(--color-teal)' }}>∨ ∨</span>
                    </div>
                </div>

                {/* Organization Type */}
                <div className="org-type-selector">
                    <label className="text-label" style={{ marginBottom: 12, display: 'block', letterSpacing: '0.15em' }}>ORGANIZATION TYPE</label>
                    <div className="org-type-options">
                        {[
                            { label: 'CLUB', shape: '△', color: 'var(--color-teal)' },
                            { label: 'COMPANY', shape: '□', color: 'var(--color-teal)' },
                            { label: 'NGO', shape: '◇', color: 'var(--color-teal)' },
                        ].map(type => (
                            <button
                                key={type.label}
                                type="button"
                                className={`org-type-btn ${form.orgType === type.label ? 'active' : ''}`}
                                onClick={() => setForm(f => ({ ...f, orgType: type.label }))}
                            >
                                {type.label} {type.shape}
                            </button>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn btn-teal" id="btn-request-access">
                    ESTABLISH YOUR SECTOR △
                </button>
            </form>

            <div className="auth-footer" style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.1em' }}>
                <span className="text-small" style={{ color: 'var(--color-text-muted)' }}>
                    SECURE CONNECTION | ID: 948-220-ORG
                </span>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Auth.css';

export default function OrgLoginAuth() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/feed');
    };

    return (
        <div className="auth-screen" id="org-login-screen">
            <div className="auth-header">
                <motion.h1
                    className="heading-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    ORGANIZATION LOGIN △
                </motion.h1>
                <p className="text-body" style={{ textAlign: 'center' }}>
                    Access your command center and manage your events.
                </p>
            </div>

            <div className="auth-tabs">
                <Link to="/auth/participant/login" className="auth-tab">
                    PARTICIPANT / VOLUNTEER
                </Link>
                <button className="auth-tab active" id="tab-org">
                    ORGANIZATION
                </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="org-email">Organization Email</label>
                    <input
                        id="org-email"
                        type="email"
                        placeholder="admin@club.org"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="org-password">Password</label>
                    <div className="input-password-wrapper">
                        <input
                            id="org-password"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        />
                        <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                            {showPass ? '🙈' : '👁'}
                        </button>
                    </div>
                </div>

                <div className="auth-forgot">
                    <Link to="#">Forgot Password?</Link>
                </div>

                <button type="submit" className="btn btn-teal" id="btn-org-enter">
                    ENTER △
                </button>
            </form>

            <div className="auth-footer">
                New organization?{' '}
                <Link to="/auth/org/register" className="auth-link-teal">Register →</Link>
            </div>
        </div>
    );
}

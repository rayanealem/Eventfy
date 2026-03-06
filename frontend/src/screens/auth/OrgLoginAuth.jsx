import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function OrgLoginAuth() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return;
        setLoading(true);
        setError('');
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });
            if (authError) throw authError;

            // Check onboarding and role
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_done, role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role !== 'organizer') {
                setError('This account is not an organization account. Use participant login.');
                await supabase.auth.signOut();
                return;
            }

            navigate(profile?.onboarding_done ? '/feed' : '/org/setup');
        } catch (err) {
            setError(err.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen" id="org-login-screen">
            <button className="auth-back" onClick={() => navigate('/splash')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
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

                {error && <p className="auth-error" style={{ color: '#FF4D4D', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}

                <button type="submit" className="btn btn-teal" id="btn-org-enter" disabled={loading}>
                    {loading ? 'ENTERING...' : 'ENTER △'}
                </button>
            </form>

            <div className="auth-footer">
                New organization?{' '}
                <Link to="/auth/org/register" className="auth-link-teal">Register →</Link>
            </div>
        </div>
    );
}

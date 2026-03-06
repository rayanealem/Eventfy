import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import './Auth.css';

export default function ParticipantLoginAuth() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!form.email || !form.password) return;
        setLoading(true);
        setError('');
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: form.email,
                password: form.password,
            });
            if (authError) throw authError;
            // Check onboarding status and role
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_done, role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'organizer') {
                navigate(profile?.onboarding_done ? '/feed' : '/org/setup');
            } else {
                navigate(profile?.onboarding_done ? '/feed' : '/onboarding/1');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    // Demo login shortcut for testing
    const handleDemoLogin = async () => {
        setForm({ email: 'ahmed@eventfy.dz', password: 'Demo1234!' });
        setLoading(true);
        setError('');
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: 'ahmed@eventfy.dz',
                password: 'Demo1234!',
            });
            if (authError) throw authError;
            const { data: profile } = await supabase
                .from('profiles')
                .select('onboarding_done, role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'organizer') {
                navigate(profile?.onboarding_done ? '/feed' : '/org/setup');
            } else {
                navigate(profile?.onboarding_done ? '/feed' : '/onboarding/1');
            }
        } catch (err) {
            setError(err.message || 'Demo login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen" id="participant-login-screen">
            <button className="auth-back" onClick={() => navigate('/splash')}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className="auth-header">
                <motion.h1
                    className="auth-heading-large"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    ENTER THE ARENA
                </motion.h1>
                <p className="auth-subheading">
                    THE GAME IS ALREADY IN PROGRESS.
                </p>
            </div>

            {/* Tab Bar */}
            <div className="auth-tabs">
                <button className="auth-tab active" id="tab-participant">
                    <span className="shape-circle">○</span> PARTICIPANT / VOLUNTEER
                </button>
                <Link to="/auth/org/login" className="auth-tab" id="tab-org-login-link">
                    <span className="shape-triangle">△</span> ORGANIZATION
                </Link>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="login-email">EMAIL</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="player_001@eventfy.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="login-password">PASSWORD</label>
                    <div className="input-password-wrapper">
                        <input
                            id="login-password"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        />
                        <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                            <svg width="16.5" height="11.25" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 1C4.5 1 1.2 3.7 0 7.5c1.2 3.8 4.5 6.5 8.5 6.5s7.3-2.7 8.5-6.5C15.8 3.7 12.5 1 8.5 1zm0 10.8c-2.5 0-4.5-1.9-4.5-4.3S6 3.2 8.5 3.2 13 5.1 13 7.5s-2 4.3-4.5 4.3zm0-6.9c-1.5 0-2.7 1.2-2.7 2.6s1.2 2.6 2.7 2.6 2.7-1.2 2.7-2.6-1.2-2.6-2.7-2.6z" fill="rgba(255,255,255,0.4)" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="auth-forgot">
                    <Link to="#">FORGOT ACCESS?</Link>
                </div>

                {error && <p className="auth-error" style={{ color: '#FF4D4D', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}

                <button type="submit" className="btn btn-coral" id="btn-enter" disabled={loading}>
                    {loading ? 'ENTERING...' : 'ENTER □'}
                </button>

                <div className="divider-text">OR</div>

                <button type="button" className="btn btn-google" id="btn-google">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                    CONTINUE WITH GOOGLE
                </button>
            </form>

            <div className="auth-footer">
                NEW RECRUIT? <Link to="/auth/participant/register" className="auth-link-white">REGISTER NOW ○</Link>
            </div>
        </div>
    );
}

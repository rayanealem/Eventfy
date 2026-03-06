import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import './Auth.css';

const INITIAL_SKILLS = ['STRATEGY', 'STRENGTH'];

export default function ParticipantRegisterAuth() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '', username: '', email: '', password: '', location: '', skillInput: '',
        university: '', year: ''
    });
    const [skills, setSkills] = useState([...INITIAL_SKILLS]);
    const [isStudent, setIsStudent] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const passwordStrength = () => {
        const len = form.password.length;
        if (len === 0) return 0;
        if (len < 4) return 1;
        if (len < 8) return 2;
        if (len < 12) return 3;
        return 4;
    };

    const removeSkill = (skill) => setSkills(s => s.filter(x => x !== skill));
    const addSkill = () => {
        if (form.skillInput.trim()) {
            setSkills(s => [...s, form.skillInput.trim().toUpperCase()]);
            setForm(f => ({ ...f, skillInput: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!form.email || !form.password || !form.username || !form.fullName) {
            setError('All fields are required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // Create Supabase auth user (handle_new_user trigger auto-creates profile)
            const { data, error: authError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        username: form.username,
                        full_name: form.fullName,
                    }
                }
            });
            if (authError) throw authError;

            // Check if email confirmation is required
            if (data.user && !data.session) {
                setError('Check your email to confirm your account before logging in.');
                setLoading(false);
                return;
            }

            navigate('/onboarding/1');
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-screen" id="participant-register-screen">
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
                    NEW RECRUIT REGISTRATION
                </motion.h1>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="reg-fullname">FULL NAME</label>
                    <input
                        id="reg-fullname"
                        type="text"
                        placeholder="Seong Gi-hun"
                        value={form.fullName}
                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="reg-username">USERNAME</label>
                    <div className="input-with-prefix">
                        <span className="input-prefix">@</span>
                        <input
                            id="reg-username"
                            type="text"
                            placeholder="player456"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="reg-email">EMAIL</label>
                    <input
                        id="reg-email"
                        type="email"
                        placeholder="player@eventfy.dz"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="reg-password">CREATE PASSWORD</label>
                    <div className="input-password-wrapper">
                        <input
                            id="reg-password"
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
                                        ? i <= 2 ? 'var(--color-coral)' : i === 3 ? 'var(--color-blue)' : 'var(--color-teal)'
                                        : undefined
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="reg-location">LOCATION</label>
                    <div className="input-select-wrapper">
                        <select
                            id="reg-location"
                            value={form.location}
                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        >
                            <option value="">Select Region</option>
                            <option value="16">16 - Alger</option>
                            <option value="31">31 - Oran</option>
                            <option value="25">25 - Constantine</option>
                            <option value="09">09 - Blida</option>
                            <option value="19">19 - Sétif</option>
                        </select>
                        <span className="select-chevron">∨∨</span>
                    </div>
                </div>

                <div className="input-group">
                    <label>SKILLS</label>
                    <div className="skills-tags">
                        {skills.map(skill => (
                            <span key={skill} className="skill-tag">
                                {skill} <button type="button" className="skill-remove" onClick={() => removeSkill(skill)}>×</button>
                            </span>
                        ))}
                    </div>
                    <div className="skill-add-row">
                        <input
                            type="text"
                            placeholder="+ Add Skill"
                            value={form.skillInput}
                            onChange={e => setForm(f => ({ ...f, skillInput: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                    </div>
                </div>

                <div className="student-toggle-row">
                    <span className="text-label" style={{ letterSpacing: '0.15em' }}>I AM A STUDENT</span>
                    <button
                        type="button"
                        className={`toggle-switch ${isStudent ? 'active' : ''}`}
                        onClick={() => setIsStudent(s => !s)}
                    >
                        <div className="toggle-knob" />
                    </button>
                </div>

                {isStudent && (
                    <div className="input-group">
                        <label htmlFor="reg-university">UNIVERSITY / INSTITUTE</label>
                        <input
                            id="reg-university"
                            type="text"
                            placeholder="University of Algiers"
                            value={form.university}
                            onChange={e => setForm(f => ({ ...f, university: e.target.value }))}
                        />
                        <div style={{ marginTop: '16px' }}>
                            <label htmlFor="reg-year">STUDY YEAR</label>
                            <input
                                id="reg-year"
                                type="text"
                                placeholder="3rd Year LMD"
                                value={form.year}
                                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                {error && <p className="auth-error" style={{ color: '#FF4D4D', fontSize: '12px', textAlign: 'center', marginBottom: '12px' }}>{error}</p>}

                <button type="submit" className="btn btn-coral" id="btn-claim-spot" disabled={loading}>
                    {loading ? 'REGISTERING...' : 'CLAIM YOUR SPOT ○'}
                </button>
            </form>

            <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>ALREADY A PLAYER? <Link to="/auth/participant/login" className="auth-link-white">LOGIN △</Link></div>
                <div>WANT TO HOST? <Link to="/auth/org/register" className="auth-link-teal">REGISTER AS ORGANIZATION</Link></div>
            </div>
        </div>
    );
}

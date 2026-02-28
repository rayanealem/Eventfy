import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Auth.css';

const INITIAL_SKILLS = ['STRATEGY', 'STRENGTH'];

export default function ParticipantRegisterAuth() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        fullName: '', username: '', password: '', location: '', skillInput: '',
    });
    const [skills, setSkills] = useState([...INITIAL_SKILLS]);
    const [isStudent, setIsStudent] = useState(true);
    const [showPass, setShowPass] = useState(false);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/onboarding/1');
    };

    return (
        <div className="auth-screen" id="participant-register-screen">
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

                <button type="submit" className="btn btn-coral" id="btn-claim-spot">
                    CLAIM YOUR SPOT ○
                </button>
            </form>

            <div className="auth-footer">
                ALREADY A PLAYER? <Link to="/auth/participant/login" className="auth-link-white">LOGIN △</Link>
            </div>
        </div>
    );
}

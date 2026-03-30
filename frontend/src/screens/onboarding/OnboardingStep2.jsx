import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import './OnboardingSteps.css';

export default function OnboardingStep2() {
    const navigate = useNavigate();
    const { user, profile, refreshProfile } = useAuth();

    const [username, setUsername] = useState(profile?.username || '');
    const [shape, setShape] = useState(profile?.shape || 'triangle');
    const [color, setColor] = useState(profile?.shape_color || '#13ecec');
    const [loading, setLoading] = useState(false);

    const [labelIndex, setLabelIndex] = useState(0);
    const labels = ['Upl0ad Identity', 'Init_Avatar.exe', 'Awaiting_Input...'];

    useEffect(() => {
        const interval = setInterval(() => {
            setLabelIndex((prev) => (prev + 1) % labels.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (profile) {
            if (profile.username) setUsername(profile.username);
            if (profile.shape) setShape(profile.shape);
            if (profile.shape_color) setColor(profile.shape_color);
        }
    }, [profile]);

    const handleNext = async () => {
        if (!user) {
            navigate('/onboarding/3');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ username, shape, shape_color: color })
                .eq('id', user.id);

            if (error) throw error;
            await refreshProfile();
            navigate('/onboarding/3');
        } catch (err) {
            console.error('Error updating profile:', err);
            // Navigate anyway so user doesn't get stuck
            navigate('/onboarding/3');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="obs-root">
            {/* Sticky Header */}
            <header className="obs-sticky-header">
                <span className="obs-brand">EVENTFY</span>
                <div className="obs-header-shapes">
                    <span className="obs-h-shape">○</span>
                    <span className="obs-h-shape active">△</span>
                    <span className="obs-h-shape">□</span>
                    <span className="obs-h-shape">◇</span>
                </div>
            </header>

            {/* Progress */}
            <div className="obs-progress-wrap">
                <div className="obs-progress-bar">
                    <div className="obs-progress-fill" style={{ width: '33%' }} />
                </div>
                <span className="obs-progress-label">STEP 2 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 2: WHO ARE YOU? ○</h2>

                    <div className="obs-avatar-zone">
                        <div className="obs-hex-upload obs-animated-border" style={{ background: color, border: `2px solid ${color}` }}>
                            <span className="obs-upload-icon">↑</span>
                        </div>
                        <span className="obs-upload-label">{labels[labelIndex]}</span>
                    </div>

                    <div className="obs-symbol-section">
                        <span className="obs-sub-label">Select Your Symbol</span>
                        <div className="obs-symbols">
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-sym ${shape === 'circle' ? 'active' : ''}`} onClick={() => setShape('circle')}>○</motion.button>
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-sym ${shape === 'triangle' ? 'active' : ''}`} onClick={() => setShape('triangle')}>△</motion.button>
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-sym ${shape === 'square' ? 'active' : ''}`} onClick={() => setShape('square')}>□</motion.button>
                            <motion.button whileTap={{ scale: 0.85 }} className={`obs-sym ${shape === 'diamond' ? 'active' : ''}`} onClick={() => setShape('diamond')}>◇</motion.button>
                        </div>
                        <div className="obs-colors">
                            <motion.div whileTap={{ scale: 0.85 }} className={`obs-color ${color === '#13ecec' ? 'active' : ''}`} style={{ background: '#13ecec' }} onClick={() => setColor('#13ecec')} />
                            <motion.div whileTap={{ scale: 0.85 }} className={`obs-color ${color === '#ff4d4d' ? 'active' : ''}`} style={{ background: '#ff4d4d' }} onClick={() => setColor('#ff4d4d')} />
                            <motion.div whileTap={{ scale: 0.85 }} className={`obs-color ${color === '#fc0' ? 'active' : ''}`} style={{ background: '#fc0' }} onClick={() => setColor('#fc0')} />
                            <motion.div whileTap={{ scale: 0.85 }} className={`obs-color ${color === '#fff' ? 'active' : ''}`} style={{ background: '#fff' }} onClick={() => setColor('#fff')} />
                        </div>
                    </div>

                    <div className="obs-username-field">
                        <span className="obs-field-label">Username Entry</span>
                        <div className="obs-username-input-wrap">
                            <input
                                className="obs-text-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="@username"
                            />
                            {username.length > 2 && <span className="obs-avail">✓ AVAILABLE</span>}
                        </div>
                    </div>

                    <button className="obs-cta-btn cyan round" onClick={handleNext} disabled={loading}>
                        {loading ? 'SAVING...' : 'SAVE & CONTINUE △'}
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

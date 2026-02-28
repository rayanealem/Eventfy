import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './Splash.css';

const SLIDES = [
    {
        icon: 'circle',
        iconColor: '#ff2d78',
        title: 'DISCOVER EVENTS NEAR YOU.',
        body: 'Find local challenges, tournaments, and social gatherings in your sector. The map is your playground.',
    },
    {
        icon: 'triangle',
        iconColor: '#ffd700',
        title: 'COMPETE. VOLUNTEER. GROW.',
        body: 'Earn prestige through action. Whether competing or contributing, every move increases your rank.',
    },
    {
        icon: 'square',
        iconColor: '#00ffc2',
        title: 'YOUR SKILLS. VERIFIED.',
        body: 'Your profile is your digital legacy. All achievements are permanent and cryptographically secured.',
    },
];

export default function Splash() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide(a => (a + 1) % SLIDES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="splash-root">
            {/* Noise overlay — 4% */}
            <div className="splash-noise" />

            {/* Main container */}
            <div className="splash-container">
                {/* Decorative corner text */}
                <div className="splash-corner-text">
                    <span>SEC_PROTOCOL_882</span>
                </div>

                {/* Decorative left divider */}
                <div className="splash-left-divider" />

                {/* Hero Section */}
                <section className="splash-hero">
                    {/* Geometric shapes background — 40% opacity */}
                    <div className="splash-shapes">
                        {/* Circle (Neon Pink) */}
                        <div className="splash-shape-circle" />
                        {/* Triangle (Gold) */}
                        <div className="splash-shape-triangle">
                            <svg viewBox="0 0 256 222" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M128 0L256 222H0L128 0Z" fill="rgba(255,215,0,0.15)" stroke="#ffd700" strokeWidth="2" />
                            </svg>
                        </div>
                        {/* Square (White) */}
                        <div className="splash-shape-square" />
                    </div>

                    {/* Logo & Subtitle */}
                    <motion.div
                        className="splash-logo"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h1 className="splash-title">EVENTFY</h1>
                        <p className="splash-subtitle">The Game Has Begun</p>
                    </motion.div>
                </section>

                {/* Onboarding Slider */}
                <section className="splash-slides" style={{ position: 'relative', height: '140px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSlide}
                            className="splash-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            style={{ position: 'absolute', width: '100%' }}
                        >
                            <div className="splash-card-header">
                                <div className="splash-card-icon" style={{ borderColor: SLIDES[activeSlide].iconColor }}>
                                    {SLIDES[activeSlide].icon === 'circle' && (
                                        <div className="icon-circle" style={{ background: SLIDES[activeSlide].iconColor }} />
                                    )}
                                    {SLIDES[activeSlide].icon === 'triangle' && (
                                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                            <path d="M6 0L12 10H0L6 0Z" fill={SLIDES[activeSlide].iconColor} />
                                        </svg>
                                    )}
                                    {SLIDES[activeSlide].icon === 'square' && (
                                        <div className="icon-square" style={{ background: SLIDES[activeSlide].iconColor }} />
                                    )}
                                </div>
                                <h2 className="splash-card-title">{SLIDES[activeSlide].title}</h2>
                            </div>
                            <p className="splash-card-body">{SLIDES[activeSlide].body}</p>
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* Footer Actions */}
                <section className="splash-footer">
                    {/* Progress Indicators */}
                    <div className="splash-progress">
                        <span className="progress-shape" onClick={() => setActiveSlide(0)} style={{ cursor: 'pointer', color: activeSlide === 0 ? '#ff2d78' : 'rgba(255,45,120,0.3)' }}>○</span>
                        <span className="progress-shape" onClick={() => setActiveSlide(1)} style={{ cursor: 'pointer', color: activeSlide === 1 ? '#ffd700' : 'rgba(255,215,0,0.3)' }}>△</span>
                        <span className="progress-shape" onClick={() => setActiveSlide(2)} style={{ cursor: 'pointer', color: activeSlide === 2 ? '#00ffc2' : 'rgba(0,255,194,0.3)' }}>□</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="splash-buttons">
                        <motion.button
                            className="splash-btn-primary"
                            onClick={() => navigate('/auth/participant/register')}
                            whileTap={{ scale: 0.98 }}
                        >
                            JOIN THE GAME
                        </motion.button>
                        <motion.button
                            className="splash-btn-outline"
                            onClick={() => setShowModal(true)}
                            whileTap={{ scale: 0.98 }}
                        >
                            I HAVE AN ACCOUNT
                        </motion.button>
                    </div>

                    {/* Bottom Link */}
                    <div className="splash-org-link">
                        <Link to="/auth/org/register">
                            <span className="org-link-text">Join as Organization</span>
                            <span className="org-link-shape">△</span>
                        </Link>
                    </div>
                </section>
            </div>

            {/* Role-Chooser Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="splash-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#0f1119', border: '1px solid rgba(255,255,255,0.1)', padding: '32px 24px', width: '320px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}
                        >
                            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: '#fff', letterSpacing: '2px', textAlign: 'center', margin: 0 }}>WHO ARE YOU?</h2>
                            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textAlign: 'center', margin: 0 }}>SELECT YOUR ROLE TO CONTINUE</p>
                            <button
                                onClick={() => navigate('/auth/participant/login')}
                                style={{ width: '100%', padding: '16px', background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: '#ff2d78', fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px', cursor: 'pointer', textAlign: 'center' }}
                            >
                                ○ PARTICIPANT
                            </button>
                            <button
                                onClick={() => navigate('/auth/org/login')}
                                style={{ width: '100%', padding: '16px', background: 'rgba(19,236,236,0.1)', border: '1px solid rgba(19,236,236,0.3)', color: '#13ecec', fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '2px', cursor: 'pointer', textAlign: 'center' }}
                            >
                                △ ORGANIZATION
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

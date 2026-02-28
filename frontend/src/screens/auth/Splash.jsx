import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
                <section className="splash-slides">
                    {SLIDES.map((slide, i) => (
                        <motion.div
                            key={i}
                            className="splash-card"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
                        >
                            <div className="splash-card-header">
                                <div className="splash-card-icon" style={{ borderColor: slide.iconColor }}>
                                    {slide.icon === 'circle' && (
                                        <div className="icon-circle" style={{ background: slide.iconColor }} />
                                    )}
                                    {slide.icon === 'triangle' && (
                                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                                            <path d="M6 0L12 10H0L6 0Z" fill={slide.iconColor} />
                                        </svg>
                                    )}
                                    {slide.icon === 'square' && (
                                        <div className="icon-square" style={{ background: slide.iconColor }} />
                                    )}
                                </div>
                                <h2 className="splash-card-title">{slide.title}</h2>
                            </div>
                            <p className="splash-card-body">{slide.body}</p>
                        </motion.div>
                    ))}
                </section>

                {/* Footer Actions */}
                <section className="splash-footer">
                    {/* Progress Indicators */}
                    <div className="splash-progress">
                        <span className="progress-shape" style={{ color: '#ff2d78' }}>○</span>
                        <span className="progress-shape" style={{ color: 'rgba(255,215,0,0.5)' }}>△</span>
                        <span className="progress-shape" style={{ color: 'rgba(255,255,255,0.2)' }}>□</span>
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
                            onClick={() => navigate('/auth/participant/login')}
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
        </div>
    );
}

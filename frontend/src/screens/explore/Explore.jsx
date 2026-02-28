import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Explore.css';

const FILTERS = [
    { label: 'ALL', shape: '○', active: true },
    { label: 'SPORT', shape: '△', active: false },
    { label: 'SCIENCE', shape: '□', active: false },
    { label: 'ART', shape: '✦', active: false },
];

const TRENDING = [
    { title: 'Neon Sabotage 2024', tag: '△ SPORT', views: '+340 VIEWS', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=250&fit=crop' },
    { title: 'Deep Mind Synthesis', tag: '□ SCIENCE', views: '+1.2K VIEWS', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=250&fit=crop' },
    { title: 'Cyber Gallery V.2', tag: '▽ ART', views: '+890 VIEWS', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=250&fit=crop' },
];

const ORGS = [
    { name: 'Apex League', image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=64&h=64&fit=crop' },
    { name: 'K-Corp Labs', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=64&h=64&fit=crop' },
    { name: 'Vivid Intel', image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=64&h=64&fit=crop' },
    { name: 'Core Logic', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=64&h=64&fit=crop' },
];

const SKILLS_TEAL = [
    { label: 'React Architecture', size: 'lg' },
    { label: 'Neural Networks', size: 'sm' },
    { label: 'Web3 Systems', size: 'md' },
];

const SKILLS_RED = [
    { label: 'Crisis Mediation', size: 'md' },
    { label: 'Team Strategy', size: 'md' },
    { label: 'Ethical Hack', size: 'sm' },
];

const SKILLS_GOLD = [
    { label: 'Arena Master', size: 'lg' },
    { label: 'Squad Commander', size: 'md' },
    { label: 'Ops Lead', size: 'sm' },
];

export default function Explore() {
    const navigate = useNavigate();

    return (
        <div className="explore-root">
            <div className="explore-noise" />

            {/* Search Header */}
            <header className="explore-header">
                <div className="explore-search">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="7.5" cy="7.5" r="6" stroke="#64748b" strokeWidth="1.5" />
                        <path d="M12 12l4 4" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>SEARCH THE ARENA...</span>
                </div>

                {/* Filter Pills */}
                <div className="explore-filters">
                    {FILTERS.map((f, i) => (
                        <button key={i} className={`explore-pill ${f.active ? 'active' : ''}`}>
                            <span className="pill-shape">{f.shape}</span>
                            <span className="pill-label">{f.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <div className="explore-content">
                {/* Trending Now */}
                <section className="explore-section">
                    <div className="explore-section-header">
                        <h2 className="explore-section-title trending">TRENDING NOW ○</h2>
                        <svg width="17" height="10" viewBox="0 0 17 10" fill="none">
                            <path d="M10 1l6 4-6 4" stroke="#f1f5f9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M0 5h14" stroke="#f1f5f9" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="explore-trending-scroll">
                        {TRENDING.map((item, i) => (
                            <motion.div
                                key={i}
                                className="explore-trending-card"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + i * 0.1 }}
                                onClick={() => navigate('/event/1')}
                            >
                                <div className="trending-image">
                                    <img src={item.image} alt={item.title} />
                                    <div className="trending-tag">{item.tag}</div>
                                </div>
                                <div className="trending-info">
                                    <span className="trending-title">{item.title}</span>
                                    <span className="trending-views">
                                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M4 0l1.5 3H8L5.5 5l1 3L4 6 1.5 8l1-3L0 3h2.5z" fill="#13ecc8" /></svg>
                                        {item.views}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Top Organizations */}
                <section className="explore-section">
                    <h2 className="explore-section-title">TOP ORGANIZATIONS △</h2>
                    <div className="explore-orgs-grid">
                        {ORGS.map((org, i) => (
                            <motion.div
                                key={i}
                                className="explore-org-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.08 }}
                            >
                                <div className="org-avatar-wrap">
                                    <div className="org-avatar-hex">
                                        <img src={org.image} alt={org.name} />
                                    </div>
                                </div>
                                <div className="org-name-row">
                                    <span className="org-name">{org.name}</span>
                                    <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                                        <path d="M7.5 0l2 4.5h5L10 7.5l1.5 5L7.5 10 3.5 12.5 5 7.5 .5 4.5h5z" fill="#13ecc8" />
                                    </svg>
                                </div>
                                <button className="org-follow-btn">FOLLOW +</button>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Skills in Demand */}
                <section className="explore-section">
                    <h2 className="explore-section-title">SKILLS IN DEMAND □</h2>
                    <div className="explore-skills">
                        <div className="skills-row">
                            {SKILLS_TEAL.map((s, i) => (
                                <span key={i} className={`skill-tag teal ${s.size}`}>{s.label}</span>
                            ))}
                        </div>
                        <div className="skills-row">
                            {SKILLS_RED.map((s, i) => (
                                <span key={i} className={`skill-tag red ${s.size}`}>{s.label}</span>
                            ))}
                        </div>
                        <div className="skills-row">
                            {SKILLS_GOLD.map((s, i) => (
                                <span key={i} className={`skill-tag gold ${s.size}`}>{s.label}</span>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import './OnboardingSteps.css';

const SKILLS_DATA = [
    { label: 'Python', active: true },
    { label: 'React', active: false },
    { label: 'Design', active: true },
    { label: 'Cybersec', active: false },
    { label: 'Marketing', active: false },
    { label: 'Gaming', active: true },
    { label: 'AI/ML', active: false },
    { label: 'Blockchain', active: false },
    { label: 'Event Planning', active: false },
];

export default function OnboardingStep3() {
    const navigate = useNavigate();

    return (
        <div className="obs-root">
            <header className="obs-sticky-header">
                <span className="obs-brand">EVENTFY</span>
                <div className="obs-header-shapes">
                    <span className="obs-h-shape">○</span>
                    <span className="obs-h-shape">△</span>
                    <span className="obs-h-shape active">□</span>
                    <span className="obs-h-shape">◇</span>
                </div>
            </header>

            <div className="obs-progress-wrap">
                <div className="obs-progress-bar">
                    <div className="obs-progress-fill" style={{ width: '50%' }} />
                </div>
                <span className="obs-progress-label">STEP 3 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 3: WHAT ARE YOU<br />MADE OF? △</h2>
                    <div className="obs-skills-cloud">
                        {SKILLS_DATA.map((s, i) => (
                            <button key={i} className={`obs-pill ${s.active ? 'active' : ''}`}>{s.label}</button>
                        ))}
                    </div>
                    <button className="obs-cta-btn outline" onClick={() => navigate('/onboarding/4')}>
                        CONTINUE □
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

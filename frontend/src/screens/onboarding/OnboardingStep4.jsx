import { useNavigate } from 'react-router-dom';
import './OnboardingSteps.css';

export default function OnboardingStep4() {
    const navigate = useNavigate();

    return (
        <div className="obs-root">
            <header className="obs-sticky-header">
                <span className="obs-brand">EVENTFY</span>
                <div className="obs-header-shapes">
                    <span className="obs-h-shape">○</span>
                    <span className="obs-h-shape">△</span>
                    <span className="obs-h-shape">□</span>
                    <span className="obs-h-shape active">◇</span>
                </div>
            </header>

            <div className="obs-progress-wrap">
                <div className="obs-progress-bar">
                    <div className="obs-progress-fill" style={{ width: '66%' }} />
                </div>
                <span className="obs-progress-label">STEP 4 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 4: WHERE DO YOU<br />PLAY? □</h2>

                    <div className="obs-field">
                        <span className="obs-field-label">Region Select</span>
                        <div className="obs-dropdown"><span>Algiers (Wilaya 16)</span><span className="obs-dd-arrow">▼</span></div>
                    </div>

                    <div className="obs-field">
                        <span className="obs-field-label">Base of Operations</span>
                        <div className="obs-dropdown"><span>USTHB University</span><span className="obs-dd-arrow">▼</span></div>
                    </div>

                    <div className="obs-field">
                        <span className="obs-field-label">Radar Radius</span>
                        <div className="obs-radar">
                            <button className="obs-radar-btn">10KM</button>
                            <button className="obs-radar-btn active">25KM</button>
                            <button className="obs-radar-btn">50KM</button>
                        </div>
                    </div>

                    <button className="obs-cta-btn gold" onClick={() => navigate('/onboarding/5')}>
                        CONTINUE ◇
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

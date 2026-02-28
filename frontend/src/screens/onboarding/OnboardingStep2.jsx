import { useNavigate } from 'react-router-dom';
import './OnboardingSteps.css';

export default function OnboardingStep2() {
    const navigate = useNavigate();

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
                        <div className="obs-hex-upload">
                            <span className="obs-upload-icon">↑</span>
                        </div>
                        <span className="obs-upload-label">Upl0ad Identity</span>
                    </div>

                    <div className="obs-symbol-section">
                        <span className="obs-sub-label">Select Your Symbol</span>
                        <div className="obs-symbols">
                            <button className="obs-sym">○</button>
                            <button className="obs-sym active">△</button>
                            <button className="obs-sym">□</button>
                            <button className="obs-sym">◇</button>
                        </div>
                        <div className="obs-colors">
                            <div className="obs-color active" style={{ background: '#13ecec' }} />
                            <div className="obs-color" style={{ background: '#ff4d4d' }} />
                            <div className="obs-color" style={{ background: '#fc0' }} />
                            <div className="obs-color" style={{ background: '#fff' }} />
                        </div>
                    </div>

                    <div className="obs-username-field">
                        <span className="obs-field-label">Username Entry</span>
                        <div className="obs-username-input-wrap">
                            <input className="obs-text-input" defaultValue="@ahmed_dev" />
                            <span className="obs-avail">✓ AVAILABLE</span>
                        </div>
                    </div>

                    <button className="obs-cta-btn cyan round" onClick={() => navigate('/onboarding/3')}>
                        SAVE & CONTINUE △
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

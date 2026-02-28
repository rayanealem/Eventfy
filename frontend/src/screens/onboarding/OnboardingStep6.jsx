import { useNavigate } from 'react-router-dom';
import './OnboardingSteps.css';

export default function OnboardingStep6() {
    const navigate = useNavigate();

    return (
        <div className="obs-root">
            <header className="obs-sticky-header">
                <span className="obs-brand">EVENTFY</span>
                <div className="obs-header-shapes">
                    <span className="obs-h-shape active">○</span>
                    <span className="obs-h-shape active">△</span>
                    <span className="obs-h-shape active">□</span>
                    <span className="obs-h-shape active">◇</span>
                </div>
            </header>

            <div className="obs-progress-wrap">
                <div className="obs-progress-bar">
                    <div className="obs-progress-fill" style={{ width: '100%' }} />
                </div>
                <span className="obs-progress-label">STEP 6 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title gold">YOUR FIRST MISSION ○</h2>

                    <div className="obs-mission-card">
                        <div className="obs-mission-img">
                            <img src="https://i.pravatar.cc/400?img=30" alt="" />
                        </div>
                        <div className="obs-mission-body">
                            <div className="obs-mission-meta">
                                <div>
                                    <span className="obs-mission-priority">High Priority</span>
                                    <span className="obs-mission-name">CODE RED: HACKATHON 2024</span>
                                </div>
                                <span className="obs-mission-date">OCT 24</span>
                            </div>
                            <p className="obs-mission-desc">Join the elite 456 developers in Algiers for the ultimate coding survival challenge. 48 hours. No mercy.</p>
                            <button className="obs-register-btn">REGISTER NOW ○</button>
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="obs-final-cta">
                        <button className="obs-enter-btn" onClick={() => navigate('/feed')}>
                            ENTER THE ARENA<br />□
                        </button>
                        <span className="obs-final-status">Initiating sequence... 456 players connected</span>
                    </div>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

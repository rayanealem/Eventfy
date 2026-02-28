import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

export default function Onboarding() {
    const navigate = useNavigate();

    return (
        <div className="onb-root">
            {/* Background Decorative Shapes */}
            <div className="onb-bg-shapes">
                <span className="onb-shape onb-shape-circle left">○</span>
                <span className="onb-shape onb-shape-triangle right">△</span>
                <span className="onb-shape onb-shape-square center">□</span>
                <span className="onb-shape onb-shape-diamond bottom-left">◇</span>
            </div>

            {/* Main Content */}
            <div className="onb-content">
                {/* Header */}
                <div className="onb-header">
                    <div className="onb-header-row">
                        <span className="onb-brand">EVENTFY // OS</span>
                        <span className="onb-step-label">STEP 1 OF 6</span>
                    </div>
                    <div className="onb-progress-bar">
                        <div className="onb-progress-fill" style={{ width: '16%' }} />
                    </div>
                </div>

                {/* Center: Player Number */}
                <div className="onb-center">
                    <div className="onb-number-block">
                        <span className="onb-big-number">4821</span>
                    </div>
                    <div className="onb-player-block">
                        <span className="onb-player-text">PLAYER</span>
                        <span className="onb-player-text">#4821</span>
                    </div>
                    <div className="onb-chosen">
                        <span className="onb-chosen-text">YOU HAVE BEEN CHOSEN.</span>
                    </div>
                    <div className="onb-deco-line" />
                </div>

                {/* ID Card Preview */}
                <div className="onb-preview">
                    <div className="onb-preview-card">
                        <div className="onb-preview-avatar">
                            <span className="onb-preview-icon">◇</span>
                        </div>
                        <div className="onb-preview-lines">
                            <div className="onb-preview-line w96" />
                            <div className="onb-preview-line w64" />
                            <div className="onb-preview-line w128 red" />
                        </div>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="onb-footer" onClick={() => navigate('/onboarding/2')}>
                    <span className="onb-footer-text">BEGIN YOUR JOURNEY</span>
                    <div className="onb-footer-circle">
                        <span>→</span>
                    </div>
                </div>
            </div>

            {/* Bottom safe area */}
            <div className="onb-safe-area" />
        </div>
    );
}

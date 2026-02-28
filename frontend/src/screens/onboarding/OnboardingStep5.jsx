import { useNavigate } from 'react-router-dom';
import './OnboardingSteps.css';

const ALLIES = [
    { name: 'TECH_SQUAD', members: '2.4K MEMBERS', color: 'rgba(19,236,236,0.2)', img: 'https://i.pravatar.cc/56?img=3' },
    { name: 'NEON_CLAN', members: '1.1K MEMBERS', color: 'rgba(255,77,77,0.2)', img: 'https://i.pravatar.cc/56?img=5' },
    { name: 'VOID_WALK', members: '850 MEMBERS', color: 'rgba(255,204,0,0.2)', img: 'https://i.pravatar.cc/56?img=8' },
    { name: 'PROTO_X', members: '4.2K MEMBERS', color: 'rgba(255,255,255,0.2)', img: 'https://i.pravatar.cc/56?img=12' },
];

export default function OnboardingStep5() {
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
                    <div className="obs-progress-fill" style={{ width: '83%' }} />
                </div>
                <span className="obs-progress-label">STEP 5 OF 6</span>
            </div>

            <div className="obs-main single-step">
                <section className="obs-step">
                    <h2 className="obs-step-title">STEP 5: CHOOSE YOUR<br />ALLIES ◇</h2>
                    <div className="obs-allies-grid">
                        {ALLIES.map((a, i) => (
                            <div key={i} className="obs-ally-card">
                                <div className="obs-ally-avatar" style={{ background: a.color }}>
                                    <img src={a.img} alt="" />
                                </div>
                                <span className="obs-ally-name">{a.name}</span>
                                <span className="obs-ally-members">{a.members}</span>
                                <button className="obs-follow-btn">+ Follow</button>
                            </div>
                        ))}
                    </div>
                    <button className="obs-cta-btn cyan-outline round" onClick={() => navigate('/onboarding/6')}>
                        FOLLOW ALL △
                    </button>
                </section>
            </div>

            <div className="obs-glow-cyan" />
            <div className="obs-glow-red" />
        </div>
    );
}

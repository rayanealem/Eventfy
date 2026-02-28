import './Story.css';

const STORIES = [
    { user: 'TECH_SQUAD', color: '#13ecec', img: 'https://i.pravatar.cc/48?img=3', viewed: false },
    { user: 'NEON_CLAN', color: '#ff4d4d', img: 'https://i.pravatar.cc/48?img=5', viewed: false },
    { user: 'VOID_WALK', color: '#ffcc00', img: 'https://i.pravatar.cc/48?img=8', viewed: true },
    { user: 'PROTO_X', color: '#f4257b', img: 'https://i.pravatar.cc/48?img=12', viewed: true },
];

export default function Story() {
    return (
        <div className="story-root">
            {/* Full Screen Story View */}
            <div className="story-viewer">
                {/* Progress Bars */}
                <div className="story-progress">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`story-prog-bar ${i === 0 ? 'active' : ''} ${i < 0 ? 'done' : ''}`}>
                            <div className="story-prog-fill" />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="story-header">
                    <div className="story-user">
                        <div className="story-user-avatar" style={{ borderColor: '#13ecec' }}>
                            <img src="https://i.pravatar.cc/40?img=3" alt="" />
                        </div>
                        <div className="story-user-info">
                            <span className="story-username">TECH_SQUAD</span>
                            <span className="story-time">2h ago</span>
                        </div>
                    </div>
                    <div className="story-actions">
                        <span className="story-action">⋯</span>
                        <span className="story-action">✕</span>
                    </div>
                </div>

                {/* Content */}
                <div className="story-content">
                    <div className="story-bg-gradient" />
                    <div className="story-center-content">
                        <span className="story-event-badge">🔴 LIVE EVENT</span>
                        <h2 className="story-event-title">HACKATHON<br />REGISTRATION<br />OPEN NOW</h2>
                        <p className="story-event-sub">48 hours of pure code chaos.<br />Only 456 spots remaining.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="story-footer">
                    <div className="story-reply-wrap">
                        <input className="story-reply-input" placeholder="Send a message..." />
                    </div>
                    <div className="story-footer-actions">
                        <span className="story-react">♡</span>
                        <span className="story-share">↗</span>
                    </div>
                </div>
            </div>

            {/* Story Bar (bottom overlay for Create) */}
            <div className="story-bar">
                <div className="story-create">
                    <div className="story-create-icon">+</div>
                    <span className="story-create-label">YOUR STORY</span>
                </div>
                {STORIES.map((s, i) => (
                    <div key={i} className="story-item">
                        <div className={`story-item-ring ${s.viewed ? 'viewed' : ''}`} style={{ borderColor: s.viewed ? '#333' : s.color }}>
                            <img src={s.img} alt="" />
                        </div>
                        <span className="story-item-name">{s.user}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

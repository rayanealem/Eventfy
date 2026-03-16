export function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function StoryHeader({ org, story, paused, handlePauseStart, handlePauseEnd, navigate }) {
    const orgName = org?.name?.toUpperCase() || 'ORG';
    const orgLogo = org?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&size=80&background=1e293b&color=fff`;

    return (
        <div className={`story-header ${paused ? 'paused-opacity' : ''}`}>
            <div className="story-user">
                <div className="story-user-avatar" style={{ borderColor: story.accent || '#13ecec' }}>
                    <img src={orgLogo} alt={orgName} />
                </div>
                <div className="story-user-info">
                    <span className="story-username">{orgName}</span>
                    <span className="story-time">{timeAgo(story.created_at)}</span>
                </div>
            </div>
            <div className="story-actions">
                <span className="story-action" onPointerDown={handlePauseStart} onPointerUp={handlePauseEnd}>⏸</span>
                <span className="story-action" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>✕</span>
            </div>
        </div>
    );
}

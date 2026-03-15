export default function StoryFooter({ story, liked, paused, toggleLike, handleReaction, setPaused }) {
    return (
        <div className={`story-footer ${paused ? 'paused-opacity' : ''}`}>
            <div className="story-reply-wrap">
                <input
                    className="story-reply-input"
                    placeholder="Send a message..."
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                />
            </div>
            <div className="story-reaction-bar">
                <button className="reaction-btn" onClick={() => handleReaction('❤️')}>❤️</button>
                <button className="reaction-btn" onClick={() => handleReaction('🔥')}>🔥</button>
                <button className="reaction-btn" onClick={() => handleReaction('🚀')}>🚀</button>
            </div>
            <div className="story-footer-actions">
                <span
                    className="story-react"
                    onClick={toggleLike}
                    style={{ cursor: 'pointer', color: liked[story?.id] ? '#ff4d4d' : undefined }}
                >
                    {liked[story?.id] ? '♥' : '♡'}
                </span>
                <span className="story-share" style={{ cursor: 'pointer' }} onClick={() => {
                    if (navigator.share) navigator.share({ title: 'Story', url: window.location.href });
                }}>↗</span>
            </div>
        </div>
    );
}

import { motion, AnimatePresence } from 'framer-motion';

/**
 * InsightsSheet — Owner analytics bottom sheet with views, reactions,
 * activity list, and delete button.
 */
export default function InsightsSheet({
    showInsights,
    analytics,
    currentFrame,
    onClose,
    onDelete,
}) {
    return (
        <AnimatePresence>
            {showInsights && (
                <>
                    <motion.div
                        className="story-insights-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className="story-insights-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="insights-header">
                            <div className="insights-handle" />
                            <h3>Story Activity</h3>
                        </div>
                        <div className="insights-content">
                            <div className="insights-stats">
                                <div className="stat-box">
                                    <span className="stat-num">{analytics?.total_views || 0}</span>
                                    <span className="stat-label">👁️ Views</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-num">{analytics?.total_reactions || 0}</span>
                                    <span className="stat-label">❤️ Reactions</span>
                                </div>
                                {currentFrame?.overlays?.some(el => el.type === 'poll') && (
                                    <div className="stat-box">
                                        <span className="stat-num">50 / 50</span>
                                        <span className="stat-label">📊 Poll</span>
                                    </div>
                                )}
                            </div>

                            <div className="viewers-list">
                                <h4>Activity</h4>
                                {(() => {
                                    const viewers = (analytics?.views || []).map(v => ({
                                        ...v,
                                        type: 'view',
                                        username: v.profiles?.username || v.username,
                                        avatar_url: v.profiles?.avatar_url || v.avatar_url,
                                    }));
                                    const reactions = (analytics?.reactions || []).map(r => ({
                                        ...r,
                                        type: 'reaction',
                                        username: r.profiles?.username || r.username,
                                        avatar_url: r.profiles?.avatar_url || r.avatar_url,
                                    }));
                                    const activity = [...viewers, ...reactions].sort(
                                        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
                                    );

                                    if (activity.length === 0) {
                                        return <p className="no-viewers">No activity yet.</p>;
                                    }

                                    return activity.map((item, idx) => (
                                        <div key={`${item.type}-${idx}`} className="viewer-item">
                                            <div className="viewer-avatar">
                                                <img
                                                    src={item.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`}
                                                    alt={item.username}
                                                />
                                            </div>
                                            <span className="viewer-name">@{item.username || 'user'}</span>
                                            <span className="viewer-action">
                                                {item.type === 'reaction' ? (
                                                    <span className="reaction-emoji">{item.emoji}</span>
                                                ) : (
                                                    <span className="view-icon">👁️</span>
                                                )}
                                            </span>
                                        </div>
                                    ));
                                })()}
                            </div>
                            <button className="delete-story-btn" onClick={onDelete}>
                                🗑️ Delete Story
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

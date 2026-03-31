import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * InsightsSheet — Instagram-grade story insights for owners.
 *
 * Features:
 * - Viewer list with avatars and timestamps
 * - Reaction breakdown by emoji type
 * - Sticker interaction metrics (poll results, quiz accuracy, slider avg, questions)
 * - Reply list
 * - Delete story
 */
export default function InsightsSheet({ showInsights, analytics, currentFrame, onClose, onDelete }) {
    const [activeTab, setActiveTab] = useState('viewers');

    const viewers = analytics?.viewers || [];
    const reactions = analytics?.reactions || [];
    const replies = analytics?.replies || [];
    const sticker_interactions = analytics?.sticker_interactions || {};

    // Build reaction summary
    const reactionSummary = {};
    reactions.forEach(r => {
        if (!reactionSummary[r.emoji]) reactionSummary[r.emoji] = 0;
        reactionSummary[r.emoji]++;
    });
    const reactionEntries = Object.entries(reactionSummary).sort((a, b) => b[1] - a[1]);

    // Build metrics
    const totalViews = analytics?.view_count || viewers.length || 0;
    const totalReactions = reactions.length || 0;
    const totalReplies = replies.length || 0;

    return (
        <AnimatePresence>
            {showInsights && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="insights-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="insights-sheet"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    >
                        {/* Handle */}
                        <div className="insights-header" onClick={onClose}>
                            <div className="insights-handle" />
                        </div>

                        {/* ─── Stats Overview ─────────────────────────────────── */}
                        <div className="insights-stats-row">
                            <div className="insights-stat">
                                <span className="insights-stat-num">{totalViews}</span>
                                <span className="insights-stat-label">Views</span>
                            </div>
                            <div className="insights-stat">
                                <span className="insights-stat-num">{totalReactions}</span>
                                <span className="insights-stat-label">Reactions</span>
                            </div>
                            <div className="insights-stat">
                                <span className="insights-stat-num">{totalReplies}</span>
                                <span className="insights-stat-label">Replies</span>
                            </div>
                        </div>

                        {/* ─── Reaction Breakdown ─────────────────────────────── */}
                        {reactionEntries.length > 0 && (
                            <div className="insights-reactions-bar">
                                {reactionEntries.map(([emoji, count]) => (
                                    <div key={emoji} className="insights-reaction-chip">
                                        <span className="insights-reaction-emoji">{emoji}</span>
                                        <span className="insights-reaction-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ─── Tab Switcher ────────────────────────────────────── */}
                        <div className="insights-tabs">
                            <button
                                className={`insights-tab ${activeTab === 'viewers' ? 'active' : ''}`}
                                onClick={() => setActiveTab('viewers')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Viewers ({viewers.length})
                            </button>
                            <button
                                className={`insights-tab ${activeTab === 'replies' ? 'active' : ''}`}
                                onClick={() => setActiveTab('replies')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Replies ({replies.length})
                            </button>
                            <button
                                className={`insights-tab ${activeTab === 'interactions' ? 'active' : ''}`}
                                onClick={() => setActiveTab('interactions')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <rect x="18" y="3" width="4" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <rect x="10" y="8" width="4" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
                                    <rect x="2" y="13" width="4" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                Stickers
                            </button>
                        </div>

                        {/* ─── Tab Content ─────────────────────────────────────── */}
                        <div className="insights-tab-content">
                            {/* Viewers Tab */}
                            {activeTab === 'viewers' && (
                                <div className="insights-viewer-list">
                                    {viewers.length === 0 ? (
                                        <div className="insights-empty">
                                            <span>👁️</span>
                                            <p>No viewers yet</p>
                                        </div>
                                    ) : (
                                        viewers.map((viewer, i) => (
                                            <div key={i} className="insights-viewer-item">
                                                <img
                                                    className="insights-viewer-avatar"
                                                    src={viewer.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewer.username || 'U')}&size=40&background=1e293b&color=fff`}
                                                    alt=""
                                                />
                                                <div className="insights-viewer-info">
                                                    <span className="insights-viewer-name">{viewer.username || 'Unknown'}</span>
                                                    <span className="insights-viewer-fullname">{viewer.full_name || ''}</span>
                                                </div>
                                                <div className="insights-viewer-meta">
                                                    {viewer.reaction_emoji && (
                                                        <span className="insights-viewer-reaction">{viewer.reaction_emoji}</span>
                                                    )}
                                                    <span className="insights-viewer-time">{formatTimeAgo(viewer.viewed_at)}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Replies Tab */}
                            {activeTab === 'replies' && (
                                <div className="insights-reply-list">
                                    {replies.length === 0 ? (
                                        <div className="insights-empty">
                                            <span>💬</span>
                                            <p>No replies yet</p>
                                        </div>
                                    ) : (
                                        replies.map((reply, i) => (
                                            <div key={i} className="insights-reply-item">
                                                <img
                                                    className="insights-reply-avatar"
                                                    src={reply.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.username || 'U')}&size=40&background=1e293b&color=fff`}
                                                    alt=""
                                                />
                                                <div className="insights-reply-content">
                                                    <span className="insights-reply-name">{reply.username}</span>
                                                    <p className="insights-reply-text">{reply.content}</p>
                                                </div>
                                                <span className="insights-reply-time">{formatTimeAgo(reply.created_at)}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Interactions Tab (poll results, quiz answers, slider avg, questions) */}
                            {activeTab === 'interactions' && (
                                <div className="insights-interactions">
                                    {/* Poll Results */}
                                    {sticker_interactions.polls?.map((poll, i) => (
                                        <div key={i} className="interaction-card">
                                            <div className="interaction-card-header">
                                                <span className="interaction-card-icon">📊</span>
                                                <span className="interaction-card-title">Poll</span>
                                                <span className="interaction-card-count">{poll.total_votes} votes</span>
                                            </div>
                                            <div className="interaction-card-body">
                                                <div className="poll-result-item">
                                                    <span>{poll.optionA_label}</span>
                                                    <div className="poll-result-bar">
                                                        <div className="poll-result-fill" style={{ width: `${poll.optionA_pct}%` }} />
                                                    </div>
                                                    <span className="poll-result-pct">{poll.optionA_pct}%</span>
                                                </div>
                                                <div className="poll-result-item">
                                                    <span>{poll.optionB_label}</span>
                                                    <div className="poll-result-bar">
                                                        <div className="poll-result-fill" style={{ width: `${poll.optionB_pct}%` }} />
                                                    </div>
                                                    <span className="poll-result-pct">{poll.optionB_pct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Quiz Results */}
                                    {sticker_interactions.quizzes?.map((quiz, i) => (
                                        <div key={i} className="interaction-card">
                                            <div className="interaction-card-header">
                                                <span className="interaction-card-icon">🧠</span>
                                                <span className="interaction-card-title">{quiz.question}</span>
                                                <span className="interaction-card-count">{quiz.total_answers} answers</span>
                                            </div>
                                            <div className="interaction-card-body">
                                                <div className="quiz-accuracy">
                                                    <span className="quiz-accuracy-num">{quiz.correct_pct}%</span>
                                                    <span className="quiz-accuracy-label">got it right</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Slider Results */}
                                    {sticker_interactions.sliders?.map((slider, i) => (
                                        <div key={i} className="interaction-card">
                                            <div className="interaction-card-header">
                                                <span className="interaction-card-icon">{slider.emoji}</span>
                                                <span className="interaction-card-title">{slider.question}</span>
                                                <span className="interaction-card-count">{slider.total_votes} votes</span>
                                            </div>
                                            <div className="interaction-card-body">
                                                <div className="slider-avg">
                                                    <div className="slider-avg-track">
                                                        <div className="slider-avg-fill" style={{ width: `${slider.average_pct}%` }} />
                                                        <div className="slider-avg-marker" style={{ left: `${slider.average_pct}%` }}>
                                                            {slider.emoji}
                                                        </div>
                                                    </div>
                                                    <span className="slider-avg-label">Avg: {slider.average_pct}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Questions Received */}
                                    {sticker_interactions.questions?.map((q, i) => (
                                        <div key={i} className="interaction-card">
                                            <div className="interaction-card-header">
                                                <span className="interaction-card-icon">❓</span>
                                                <span className="interaction-card-title">{q.prompt}</span>
                                                <span className="interaction-card-count">{q.responses?.length || 0} responses</span>
                                            </div>
                                            <div className="interaction-card-body">
                                                {q.responses?.map((resp, j) => (
                                                    <div key={j} className="question-response">
                                                        <span className="question-response-user">{resp.username}</span>
                                                        <span className="question-response-text">{resp.text}</span>
                                                    </div>
                                                ))}
                                                {(!q.responses || q.responses.length === 0) && (
                                                    <div className="insights-empty-inline">No responses yet</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty state */}
                                    {!sticker_interactions.polls?.length &&
                                     !sticker_interactions.quizzes?.length &&
                                     !sticker_interactions.sliders?.length &&
                                     !sticker_interactions.questions?.length && (
                                        <div className="insights-empty">
                                            <span>📊</span>
                                            <p>No interactive stickers on this story</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ─── Delete Button ──────────────────────────────────── */}
                        <button className="insights-delete-btn" onClick={onDelete}>
                            Delete This Story
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { REACTION_EMOJIS } from '../constants';

/**
 * StoryFooter — Instagram-grade story footer.
 *
 * Viewer mode: rounded reply input + heart animation + share button + emoji quick-reactions
 * Owner mode: "Activity" bar with stacked viewer avatars + eye icon
 */
export default function StoryFooter({
    isOwner,
    paused,
    analytics,
    replyText,
    setReplyText,
    sendReply,
    handleReaction,
    openInsights,
}) {
    const [heartBurst, setHeartBurst] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef(null);

    const handleHeartClick = () => {
        handleReaction('❤️');
        setHeartBurst(true);
        if (navigator.vibrate) navigator.vibrate(15);
        setTimeout(() => setHeartBurst(false), 600);
    };

    const handleSend = () => {
        if (replyText.trim()) {
            sendReply();
        }
    };

    // ─── Owner Mode Footer ──────────────────────────────────────────────────
    if (isOwner) {
        const viewCount = analytics?.total_views || 0;
        const viewerAvatars = (analytics?.views || []).slice(0, 3);

        return (
            <div className={`story-footer story-footer--owner ${paused ? 'story-footer--dimmed' : ''}`}>
                <button className="story-owner-activity" onClick={openInsights}>
                    <div className="story-owner-left">
                        {/* Eye icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="story-owner-eye">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.5" />
                        </svg>
                        {/* Stacked avatars */}
                        <div className="story-owner-avatars">
                            {viewerAvatars.map((v, i) => (
                                <img
                                    key={i}
                                    src={v.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${v.profiles?.username || 'U'}&size=28&background=333&color=fff`}
                                    alt=""
                                    className="story-owner-viewer-avatar"
                                    style={{ zIndex: 3 - i, marginLeft: i > 0 ? '-6px' : 0 }}
                                />
                            ))}
                        </div>
                        <span className="story-owner-count">{viewCount}</span>
                    </div>
                    <div className="story-owner-right">
                        <span className="story-owner-label">Activity</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M6 15l6-6 6 6" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </button>
            </div>
        );
    }

    // ─── Viewer Mode Footer ─────────────────────────────────────────────────
    return (
        <div className={`story-footer ${paused ? 'story-footer--dimmed' : ''}`}>
            {/* Reply input area */}
            <div className={`story-reply-wrap ${isInputFocused ? 'focused' : ''}`}>
                <input
                    ref={inputRef}
                    className="story-reply-input"
                    placeholder="Send message..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                {/* Send button (appears when text entered) */}
                <AnimatePresence>
                    {replyText.trim() && (
                        <motion.button
                            className="story-send-btn"
                            onClick={handleSend}
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                <path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Action buttons (hidden when input is focused with text) */}
            <AnimatePresence>
                {!isInputFocused && (
                    <motion.div
                        className="story-footer-actions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* Heart button with burst animation */}
                        <button className="story-footer-action-btn" onClick={handleHeartClick}>
                            <motion.div
                                animate={heartBurst ? { scale: [1, 1.5, 1] } : {}}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                        stroke="#fff"
                                        strokeWidth="1.5"
                                        fill={heartBurst ? '#ff3040' : 'none'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </motion.div>
                        </button>

                        {/* Share / DM button */}
                        <button className="story-footer-action-btn">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M22 2L15 22l-4-9-9-4L22 2z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

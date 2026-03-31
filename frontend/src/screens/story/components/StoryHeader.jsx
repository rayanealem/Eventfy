import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * StoryHeader — Instagram-grade overlaid header.
 * Features: avatar with gradient ring, verified badge, time ago, mute toggle,
 * options menu (share link, mute user, report), and close button.
 */
export function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
}

export default function StoryHeader({ ownerInfo, story, paused, onClose, isMuted, onToggleMute, isVideo }) {
    const [showMenu, setShowMenu] = useState(false);
    const name = ownerInfo?.name || 'User';
    const avatar = ownerInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=80&background=1e293b&color=fff`;

    return (
        <>
            <div className={`story-header ${paused ? 'story-header--dimmed' : ''}`}>
                <div className="story-header-left">
                    {/* Avatar with mini gradient ring */}
                    <div className="story-header-avatar-ring">
                        <div className="story-header-avatar">
                            <img src={avatar} alt={name} />
                        </div>
                    </div>
                    <div className="story-header-info">
                        <span className="story-header-name">{name}</span>
                        <span className="story-header-time">{timeAgo(story?.created_at)}</span>
                    </div>
                </div>
                <div className="story-header-right">
                    {/* Mute button for video stories */}
                    {isVideo && (
                        <button className="story-header-icon-btn" onClick={onToggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                            {isMuted ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="23" y1="9" x2="17" y2="15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="17" y1="9" x2="23" y2="15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15.54 8.46a5 5 0 010 7.07" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M19.07 4.93a10 10 0 010 14.14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            )}
                        </button>
                    )}
                    {/* Options menu */}
                    <button className="story-header-icon-btn" onClick={() => setShowMenu(!showMenu)} aria-label="Options">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="5" r="1.5" fill="#fff" />
                            <circle cx="12" cy="12" r="1.5" fill="#fff" />
                            <circle cx="12" cy="19" r="1.5" fill="#fff" />
                        </svg>
                    </button>
                    {/* Close button */}
                    <button className="story-header-icon-btn" onClick={onClose} aria-label="Close">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                            <line x1="6" y1="6" x2="18" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                            <line x1="18" y1="6" x2="6" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Options dropdown menu */}
            <AnimatePresence>
                {showMenu && (
                    <>
                        <div className="story-menu-backdrop" onClick={() => setShowMenu(false)} />
                        <motion.div
                            className="story-options-menu"
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            transition={{ duration: 0.15 }}
                        >
                            <button className="story-option-item" onClick={() => { navigator.clipboard?.writeText(window.location.href); setShowMenu(false); }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Copy Link
                            </button>
                            <button className="story-option-item" onClick={() => setShowMenu(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                    <polyline points="16,6 12,2 8,6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="12" y1="2" x2="12" y2="15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                                Share
                            </button>
                            <div className="story-option-divider" />
                            <button className="story-option-item story-option-danger" onClick={() => setShowMenu(false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4M12 17h.01" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" />
                                    <circle cx="12" cy="12" r="10" stroke="#ff4757" strokeWidth="1.5" />
                                </svg>
                                Report
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import ProgressBar from '../../components/StoryViewer/ProgressBar';
import StoryHeader from './components/StoryHeader';
import StoryFooter from './components/StoryFooter';
import './StoryViewer.css';

// Fallback stories for when the API isn't available
const FALLBACK_STORIES = [
    {
        id: 1,
        type: 'announcement',
        badge: '🔴 LIVE EVENT',
        title: 'HACKATHON\nREGISTRATION\nOPEN NOW',
        body: '48 hours of pure code chaos.\nOnly 456 spots remaining.',
        bg: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
        accent: '#13ecec',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: 2,
        type: 'highlight',
        badge: '🏆 RESULTS',
        title: 'FINAL\nSCOREBOARD\nIS LIVE',
        body: 'See who dominated the arena.\n1,240 participants ranked.',
        bg: 'linear-gradient(180deg, #0a1a0a 0%, #0a2e1a 50%, #0a1a0a 100%)',
        accent: '#2dd4bf',
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
        id: 3,
        type: 'promo',
        badge: '🎟️ EARLY ACCESS',
        title: 'SUMMER\nFESTIVAL\n2026',
        body: 'Get your tickets before they sell out.\nFirst 100 get VIP upgrades.',
        bg: 'linear-gradient(180deg, #1a0a0a 0%, #2e1a0a 50%, #1a0a0a 100%)',
        accent: '#fbbf24',
        created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
];

const STORY_DURATION = 5000; // 5s per story

export default function Story() {
    const navigate = useNavigate();
    const { orgId } = useParams();
    const { profile } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [liked, setLiked] = useState({});
    const [paused, setPaused] = useState(false);

    // Polls & Reactions State
    const [pollVotes, setPollVotes] = useState({}); // { pollId: { option: 'A', pctA: 80, pctB: 20 } }
    const [flyingEmojis, setFlyingEmojis] = useState([]);

    // Fetch org info
    const { data: org } = useQuery({
        queryKey: ['org', orgId],
        queryFn: async () => {
            try {
                const data = await api('GET', `/organizations/${orgId}`);
                return data;
            } catch {
                return { name: 'EVENTFY ORG', logo_url: null };
            }
        },
        enabled: !!orgId,
    });

    // Fetch org stories
    const { data: stories = FALLBACK_STORIES } = useQuery({
        queryKey: ['stories', orgId],
        queryFn: async () => {
            try {
                const data = await api('GET', `/organizations/${orgId}/stories`);
                return data?.stories?.length ? data.stories : FALLBACK_STORIES;
            } catch {
                return FALLBACK_STORIES;
            }
        },
        enabled: !!orgId,
    });

    const story = stories[currentIndex] || stories[0];
    const totalStories = stories.length;
    const currentFrames = story?.frames || [story]; // Fallback for legacy stories without frames
    const totalFrames = currentFrames.length;
    const currentDuration = currentFrames[currentFrameIndex]?.duration_ms || STORY_DURATION;

    const goNextStory = useCallback(() => {
        if (currentIndex < totalStories - 1) {
            setCurrentIndex(i => i + 1);
            setCurrentFrameIndex(0);
        } else {
            navigate(-1); // Exit stories
        }
    }, [currentIndex, totalStories, navigate]);

    const goPrevStory = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setCurrentFrameIndex(0); // Optional: could go to the *last* frame of previous story
        }
    }, [currentIndex]);

    const nextFrame = useCallback(() => {
        if (currentFrameIndex < totalFrames - 1) {
            setCurrentFrameIndex(i => i + 1);
        } else {
            goNextStory();
        }
    }, [currentFrameIndex, totalFrames, goNextStory]);

    const prevFrame = useCallback(() => {
        if (currentFrameIndex > 0) {
            setCurrentFrameIndex(i => i - 1);
        } else {
            goPrevStory();
        }
    }, [currentFrameIndex, goPrevStory]);

    // Pause/resume on hold
    const handlePauseStart = () => {
        setPaused(true);
    };

    const handlePauseEnd = () => {
        setPaused(false);
    };

    // Tap zones: left 30% = prev, right 70% = next
    const handleTap = (e) => {
        // Prevent tapping if they click a smart sticker or interactive element
        if (e.target.closest('.story-smart-sticker') || e.target.closest('.story-header') || e.target.closest('.story-footer') || e.target.closest('.story-poll-widget')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width * 0.3) {
            prevFrame();
        } else {
            nextFrame();
        }
    };

    // --- Premium Interaction Handlers ---
    const handlePollVote = async (pollId, option) => {
        if (pollVotes[pollId]) return; // Already voted

        setPaused(true); // Pause while voting

        // Optimistic UI update (simulate results quickly for the cinematic feel)
        const isA = option === 'A';
        setPollVotes(prev => ({
            ...prev,
            [pollId]: {
                option: option,
                pctA: isA ? 100 : 0, // In reality, we'd fetch actual counts, simulating a starting jump
                pctB: isA ? 0 : 100
            }
        }));

        try {
            await api('POST', `/stories/${story.id}/frames/${currentFrames[currentFrameIndex].id}/vote`, { option });
            // In a real prod app, you'd fetch the updated aggregate counts here and update the pcts
            setPollVotes(prev => ({
                ...prev,
                [pollId]: { ...prev[pollId], pctA: isA ? 80 : 20, pctB: isA ? 20 : 80 } // Simulated response
            }));
        } catch (e) {
            console.error('Failed to vote:', e);
        }

        setTimeout(() => setPaused(false), 1500); // Resume after viewing results briefly
    };

    const handleReaction = async (emoji) => {
        // 1. Create flying emoji
        const newEmoji = { id: Date.now() + Math.random(), emoji, x: Math.random() * 80 + 10 }; // Random horizontal start (10-90%)
        setFlyingEmojis(prev => [...prev, newEmoji]);

        // 2. Remove after animation finishes
        setTimeout(() => {
            setFlyingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
        }, 1500);

        // 3. Send to backend
        try {
            await api('POST', `/stories/${story.id}/react`, { emoji });
        } catch (e) {
            console.error('Failed to send reaction:', e);
        }
    };

    // Swipe support
    const touchStartX = useRef(0);
    const handleSwipeStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleSwipeEnd = (e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) nextFrame();
        else if (diff < -50) prevFrame();
    };

    const toggleLike = () => {
        setLiked(prev => ({ ...prev, [story.id]: !prev[story.id] }));
    };

    return (
        <div className="story-root">
            <div className="story-viewer"
                style={{ background: story.bg || 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)' }}
            >
                {/* Segmented Progress Bar */}
                <ProgressBar
                    totalSegments={totalFrames}
                    activeSegmentIndex={currentFrameIndex}
                    paused={paused}
                    duration={currentDuration}
                    onComplete={nextFrame}
                />

                {/* Header */}
                <StoryHeader
                    org={org}
                    story={story}
                    paused={paused}
                    handlePauseStart={handlePauseStart}
                    handlePauseEnd={handlePauseEnd}
                    navigate={navigate}
                />

                {/* Tappable Content Zone */}
                <div
                    className="story-content"
                    onClick={handleTap}
                    onTouchStart={handleSwipeStart}
                    onTouchEnd={handleSwipeEnd}
                    onPointerDown={handlePauseStart}
                    onPointerUp={handlePauseEnd}
                    style={{ position: 'relative', overflow: 'hidden' }}
                >
                    {/* Render specific frame media_url if available */}
                    {currentFrames[currentFrameIndex]?.media_url && (
                        currentFrames[currentFrameIndex].media_type === 'video' ? (
                            <video
                                src={currentFrames[currentFrameIndex].media_url}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    filter: currentFrames[currentFrameIndex].filter_css || 'none'
                                }}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={currentFrames[currentFrameIndex].media_url}
                                alt="Story background"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    filter: currentFrames[currentFrameIndex].filter_css || 'none'
                                }}
                            />
                        )
                    )}

                    {/* Render old legacy background gradient if no media_url */}
                    {!currentFrames[currentFrameIndex]?.media_url && <div className="story-bg-gradient" />}

                    {/* Render interactive overlays if available */}
                    {currentFrames[currentFrameIndex]?.overlays?.map((el) => (
                        <div
                            key={el.id}
                            style={{
                                position: 'absolute',
                                zIndex: el.zIndex,
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${el.x}px), calc(-50% + ${el.y}px)) scale(${el.scale}) rotate(${el.rotation}deg)`,
                            }}
                        >
                            {el.type === 'text' && (
                                <div
                                    style={{
                                        color: el.color,
                                        fontFamily: el.fontFamily || "'Space Grotesk', sans-serif",
                                        fontSize: '32px',
                                        fontWeight: 700,
                                        textShadow: el.textStyle === 'solid' ? 'none' : '0 2px 4px rgba(0,0,0,0.8)',
                                        background: el.textStyle === 'solid' ? el.bgColor : 'transparent',
                                        padding: el.textStyle === 'solid' ? '8px 16px' : '0',
                                        borderRadius: el.textStyle === 'solid' ? '12px' : '0',
                                        outline: 'none',
                                        border: 'none',
                                        textAlign: 'center',
                                        minWidth: '150px'
                                    }}
                                >
                                    {el.content}
                                </div>
                            )}
                            {el.type === 'sticker' && (
                                <span
                                    style={{
                                        color: el.color || '#ffffff',
                                        fontSize: '64px',
                                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                                    }}
                                >
                                    {el.content}
                                </span>
                            )}
                            {['mention', 'location', 'link'].includes(el.type) && (
                                <div
                                    className={`story-smart-sticker story-smart-${el.type}`}
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent navigation
                                        if (el.type === 'mention') navigate(`/profile/${el.content.replace('@', '')}`);
                                        if (el.type === 'link') window.open(el.content.startsWith('http') ? el.content : `https://${el.content}`, '_blank');
                                        // location could open a map
                                    }}
                                >
                                    {el.type === 'mention' && '👤 '}
                                    {el.type === 'location' && '📍 '}
                                    {el.type === 'link' && '🔗 '}
                                    {el.content}
                                </div>
                            )}
                            {el.type === 'image' && (
                                <img
                                    src={el.content}
                                    alt="Drawing Overlay"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        pointerEvents: 'none' // allow taps to pass through drawings
                                    }}
                                />
                            )}
                            {el.type === 'poll' && (
                                <div className="story-poll-widget">
                                    <div className="story-poll-question">{el.content.question}</div>
                                    <div className="story-poll-options">
                                        <div
                                            className={`story-poll-option ${pollVotes[el.id]?.option === 'A' ? 'voted' : ''}`}
                                            onClick={() => handlePollVote(el.id, 'A')}
                                        >
                                            {pollVotes[el.id] && (
                                                <div className="story-poll-fill" style={{ width: `${pollVotes[el.id].pctA}%` }} />
                                            )}
                                            <span className="poll-option-text">{el.content.optA}</span>
                                            {pollVotes[el.id] && <span className="poll-pct">{pollVotes[el.id].pctA}%</span>}
                                        </div>
                                        <div
                                            className={`story-poll-option ${pollVotes[el.id]?.option === 'B' ? 'voted' : ''}`}
                                            onClick={() => handlePollVote(el.id, 'B')}
                                        >
                                            {pollVotes[el.id] && (
                                                <div className="story-poll-fill" style={{ width: `${pollVotes[el.id].pctB}%` }} />
                                            )}
                                            <span className="poll-option-text">{el.content.optB}</span>
                                            {pollVotes[el.id] && <span className="poll-pct">{pollVotes[el.id].pctB}%</span>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Render legacy text content if no overlays */}
                    {!currentFrames[currentFrameIndex]?.overlays?.length && (
                        <div className="story-center-content">
                            <span className="story-event-badge">{story.badge || '📢 UPDATE'}</span>
                            <h2 className="story-event-title">
                                {story.title?.split('\n').map((line, i) => (
                                    <span key={i}>{line}{i < story.title.split('\n').length - 1 && <br />}</span>
                                ))}
                            </h2>
                            <p className="story-event-sub">
                                {story.body?.split('\n').map((line, i) => (
                                    <span key={i}>{line}{i < story.body.split('\n').length - 1 && <br />}</span>
                                ))}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer / Reaction Bar */}
                <StoryFooter
                    story={story}
                    liked={liked}
                    paused={paused}
                    toggleLike={toggleLike}
                    handleReaction={handleReaction}
                    setPaused={setPaused}
                />

                {/* Flying Emojis Layer */}
                <AnimatePresence>
                    {flyingEmojis.map((fe) => (
                        <motion.div
                            key={fe.id}
                            className="flying-emoji"
                            initial={{ y: 0, opacity: 1, x: '-50%' }}
                            animate={{ y: -500, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{ left: `${fe.x}%` }}
                        >
                            {fe.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>

            </div>
        </div>
    );
}

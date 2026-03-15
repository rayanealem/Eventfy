import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import ProgressBar from '../../components/StoryViewer/ProgressBar';
import './Story.css';

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

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function Story() {
    const navigate = useNavigate();
    const { orgId } = useParams();
    const { profile } = useAuth();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [liked, setLiked] = useState({});
    const [paused, setPaused] = useState(false);

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
        if (e.target.closest('.story-smart-sticker') || e.target.closest('.story-header') || e.target.closest('.story-footer')) {
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

    const orgName = org?.name?.toUpperCase() || 'ORG';
    const orgLogo = org?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&size=80&background=1e293b&color=fff`;

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
                    duration={STORY_DURATION}
                    onComplete={nextFrame}
                />

                {/* Header */}
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

                {/* Footer */}
                <div className="story-footer">
                    <div className="story-reply-wrap">
                        <input
                            className="story-reply-input"
                            placeholder="Send a message..."
                            onFocus={() => setPaused(true)}
                            onBlur={() => setPaused(false)}
                        />
                    </div>
                    <div className="story-footer-actions">
                        <span
                            className="story-react"
                            onClick={toggleLike}
                            style={{ cursor: 'pointer', color: liked[story.id] ? '#ff4d4d' : undefined }}
                        >
                            {liked[story.id] ? '♥' : '♡'}
                        </span>
                        <span className="story-share" style={{ cursor: 'pointer' }}>↗</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

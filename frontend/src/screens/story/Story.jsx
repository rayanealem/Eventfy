import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
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
    const [liked, setLiked] = useState({});
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const timerRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const elapsedRef = useRef(0);

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

    // Auto-advance timer
    const startTimer = useCallback(() => {
        clearInterval(timerRef.current);
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
            const elapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
            const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(pct);

            if (pct >= 100) {
                clearInterval(timerRef.current);
                goNext();
            }
        }, 50);
    }, [currentIndex, totalStories]);

    const goNext = useCallback(() => {
        if (currentIndex < totalStories - 1) {
            setCurrentIndex(i => i + 1);
            setProgress(0);
            elapsedRef.current = 0;
        } else {
            navigate(-1); // Exit stories
        }
    }, [currentIndex, totalStories, navigate]);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setProgress(0);
            elapsedRef.current = 0;
        }
    }, [currentIndex]);

    // Start timer whenever story changes
    useEffect(() => {
        setProgress(0);
        elapsedRef.current = 0;
        if (!paused) startTimer();
        return () => clearInterval(timerRef.current);
    }, [currentIndex, paused]);

    // Pause/resume on hold
    const handlePauseStart = () => {
        setPaused(true);
        clearInterval(timerRef.current);
        elapsedRef.current += Date.now() - startTimeRef.current;
    };

    const handlePauseEnd = () => {
        setPaused(false);
        startTimer();
    };

    // Tap zones: left 30% = prev, right 70% = next
    const handleTap = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width * 0.3) {
            goPrev();
        } else {
            goNext();
        }
    };

    // Swipe support
    const touchStartX = useRef(0);
    const handleSwipeStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleSwipeEnd = (e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) goNext();
        else if (diff < -50) goPrev();
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
                {/* Progress Bars */}
                <div className="story-progress">
                    {stories.map((_, i) => (
                        <div key={i} className={`story-prog-bar ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''}`}>
                            <div
                                className="story-prog-fill"
                                style={{
                                    width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                                    transition: i === currentIndex ? 'none' : undefined,
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="story-header">
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
                >
                    <div className="story-bg-gradient" />
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

                    {/* Story counter */}
                    <div className="story-counter">
                        {currentIndex + 1} / {totalStories}
                    </div>
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

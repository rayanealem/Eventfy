import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

// Hooks
import useStoryNavigation from './hooks/useStoryNavigation';
import useStoryInteractions from './hooks/useStoryInteractions';
import useStoryData from './hooks/useStoryData';

// Components
import ProgressBar from './components/ProgressBar';
import StoryHeader from './components/StoryHeader';
import StoryFooter from './components/StoryFooter';
import StoryMediaLayer from './components/StoryMediaLayer';
import StoryOverlayLayer from './components/StoryOverlayLayer';
import InsightsSheet from './components/InsightsSheet';
import FlyingEmojis from './components/FlyingEmojis';

import './StoryViewer.css';

/**
 * StoryViewer — Slim orchestrator for viewing stories.
 * All logic lives in hooks, all rendering in sub-components.
 */
export default function StoryViewer() {
    const { orgId } = useParams();
    const { org, stories, profile, isOwner } = useStoryData(orgId);

    const nav = useStoryNavigation(stories);
    const interactions = useStoryInteractions(nav.story, nav.setPaused);

    const ownerMode = isOwner(nav.story);

    // Fetch analytics only for owner
    const { data: analytics } = useQuery({
        queryKey: ['storyAnalytics', nav.story?.id],
        queryFn: () => api('GET', `/stories/${nav.story.id}/analytics`),
        enabled: ownerMode && interactions.showInsights,
    });

    // Audio management
    useEffect(() => {
        if (interactions.audioRef.current) {
            if (nav.paused) {
                interactions.audioRef.current.pause();
            } else {
                interactions.audioRef.current.play().catch(() => {});
            }
        }
    }, [nav.paused, nav.currentFrameIndex, interactions.isMuted]);

    // Legacy text content (for stories without overlays/frames)
    const renderLegacyContent = () => {
        if (nav.currentFrame?.overlays?.length) return null;
        return (
            <div className="story-center-content">
                <span className="story-event-badge">{nav.story.badge || '📢 UPDATE'}</span>
                <h2 className="story-event-title">
                    {nav.story.title?.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < nav.story.title.split('\n').length - 1 && <br />}</span>
                    ))}
                </h2>
                <p className="story-event-sub">
                    {nav.story.body?.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < nav.story.body.split('\n').length - 1 && <br />}</span>
                    ))}
                </p>
            </div>
        );
    };

    return (
        <div className="story-root">
            <div
                className="story-viewer"
                style={{ background: nav.story.bg || 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)' }}
            >
                {/* Segmented Progress Bar */}
                <ProgressBar
                    totalSegments={nav.totalFrames}
                    activeSegmentIndex={nav.currentFrameIndex}
                    paused={nav.paused}
                    duration={nav.currentDuration}
                    onComplete={nav.nextFrame}
                />

                {/* Header */}
                <StoryHeader
                    org={org}
                    story={nav.story}
                    paused={nav.paused}
                    handlePauseStart={nav.handlePauseStart}
                    handlePauseEnd={nav.handlePauseEnd}
                    navigate={nav.navigate}
                />

                {/* Tappable Content Zone */}
                <div
                    className="story-content"
                    onClick={nav.handleTap}
                    onTouchStart={nav.handleSwipeStart}
                    onTouchEnd={nav.handleSwipeEnd}
                    onPointerDown={nav.handlePauseStart}
                    onPointerUp={nav.handlePauseEnd}
                    style={{ position: 'relative', overflow: 'hidden' }}
                >
                    {/* Background Media */}
                    <StoryMediaLayer currentFrame={nav.currentFrame} />

                    {/* Interactive Overlays */}
                    <StoryOverlayLayer
                        currentFrame={nav.currentFrame}
                        pollVotes={interactions.pollVotes}
                        handlePollVote={(pollId, option) =>
                            interactions.handlePollVote(pollId, option, nav.currentFrames, nav.currentFrameIndex)
                        }
                    />

                    {/* Legacy Text Content */}
                    {renderLegacyContent()}

                    {/* Audio Player */}
                    {nav.currentFrame?.audio_url && (
                        <>
                            <audio
                                ref={interactions.audioRef}
                                src={nav.currentFrame.audio_url}
                                loop
                                muted={interactions.isMuted}
                                playsInline
                                autoPlay
                                style={{ display: 'none' }}
                            />
                            <button
                                className="story-unmute-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    interactions.toggleMute();
                                }}
                            >
                                {interactions.isMuted ? '🔇 Tap to Unmute' : '🔊 Mute'}
                            </button>
                        </>
                    )}
                </div>

                {/* Footer / Owner Insights */}
                {ownerMode ? (
                    <div className="story-owner-footer">
                        <button className="story-insights-btn" onClick={interactions.openInsights}>
                            👁️ {analytics?.total_views || 0} Views
                        </button>
                    </div>
                ) : (
                    <StoryFooter
                        story={nav.story}
                        liked={interactions.liked}
                        paused={nav.paused}
                        toggleLike={interactions.toggleLike}
                        handleReaction={interactions.handleReaction}
                        setPaused={nav.setPaused}
                    />
                )}

                {/* Insights Bottom Sheet */}
                <InsightsSheet
                    showInsights={interactions.showInsights}
                    analytics={analytics}
                    currentFrame={nav.currentFrame}
                    onClose={interactions.closeInsights}
                    onDelete={() => interactions.handleDeleteStory(nav.navigate)}
                />

                {/* Flying Emojis */}
                <FlyingEmojis flyingEmojis={interactions.flyingEmojis} />
            </div>
        </div>
    );
}

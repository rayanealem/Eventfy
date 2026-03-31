import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

// Hooks
import useStoryData from './hooks/useStoryData';
import useStoryNavigation from './hooks/useStoryNavigation';
import useStoryInteractions from './hooks/useStoryInteractions';
import useStoryTray from './hooks/useStoryTray';
import useSwipeToDismiss from './hooks/useSwipeToDismiss';

// Components
import ProgressBar from './components/ProgressBar';
import StoryHeader from './components/StoryHeader';
import StoryFooter from './components/StoryFooter';
import StoryMediaLayer from './components/StoryMediaLayer';
import StoryOverlayLayer from './components/StoryOverlayLayer';
import FlyingEmojis from './components/FlyingEmojis';
import InsightsSheet from './components/InsightsSheet';

import './StoryViewer.css';

/**
 * StoryViewer — Full-screen, Instagram-grade story viewing experience.
 *
 * Features:
 * - Story tray navigation (swipe between users, 3D cube transition)
 * - Physics-based swipe-to-dismiss (scale + opacity + border radius)
 * - JS-driven progress bar with precise pause/resume
 * - Tap zones: left 30% = prev, right 70% = next
 * - Hold to pause with dimmed UI
 * - Crossfade transitions between frames
 * - Owner mode: seen-by viewers, insights sheet, delete
 * - Reply + emoji reactions for viewers
 */
export default function StoryViewer() {
    const { orgId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuth();

    // ─── Story Tray (multi-user navigation) ──────────────────────────────────
    const storyTrayData = location.state?.storyTray || null;
    const initialGroupIndex = location.state?.initialGroupIndex || 0;
    const tray = useStoryTray(storyTrayData, initialGroupIndex);

    // In tray mode, the current orgId comes from the tray; otherwise from URL
    const currentOrgId = tray.currentGroup?.id || orgId;

    // ─── Data ───────────────────────────────────────────────────────────────
    const { ownerInfo, stories, allFrames, isLoading, isOwner, recordView } = useStoryData(currentOrgId);

    // ─── Navigation ─────────────────────────────────────────────────────────
    const nav = useStoryNavigation(allFrames, recordView, {
        onGroupComplete: storyTrayData ? tray.onGroupComplete : undefined,
        onGroupPrev: storyTrayData ? tray.goToPrevGroup : undefined,
    });

    // ─── Interactions ───────────────────────────────────────────────────────
    const interactions = useStoryInteractions(nav.currentStory, nav.setPaused);

    // ─── Swipe-to-dismiss ───────────────────────────────────────────────────
    const handleDismiss = () => navigate(-1);
    const dismiss = useSwipeToDismiss(handleDismiss);

    // ─── Audio mute state ───────────────────────────────────────────────────
    const [isMuted, setIsMuted] = useState(true);
    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
    const currentIsVideo = nav.currentFrame?.media_type === 'video';

    // ─── Analytics (for owner mode) ─────────────────────────────────────────
    const isOwnerOfCurrent = nav.currentStory ? isOwner(nav.currentStory) : false;

    const { data: analytics } = useQuery({
        queryKey: ['storyAnalytics', nav.currentStory?.id],
        queryFn: () => api('GET', `/stories/${nav.currentStory.id}/analytics`),
        enabled: isOwnerOfCurrent && !!nav.currentStory?.id,
        staleTime: 30000,
    });

    // ─── Loading State ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="story-viewer-root">
                <div className="story-viewer-loading">
                    <div className="story-viewer-shimmer">
                        <div className="shimmer-bar shimmer-bar-top" />
                        <div className="shimmer-bar shimmer-bar-avatar" />
                        <div className="shimmer-bar shimmer-bar-name" />
                    </div>
                </div>
            </div>
        );
    }

    // ─── Empty State ────────────────────────────────────────────────────────
    if (allFrames.length === 0) {
        return (
            <div className="story-viewer-root">
                <div className="story-viewer-empty">
                    <span className="story-viewer-empty-icon">○</span>
                    <h3>No stories yet</h3>
                    <p>Stories will appear here when shared</p>
                    <button className="story-viewer-back-btn" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // ─── 3D Cube Transition Classes ─────────────────────────────────────────
    const cubeClass = tray.cubeDirection
        ? `story-cube-transitioning story-cube-${tray.cubeDirection}`
        : '';

    return (
        <div className="story-viewer-root">
            {/* Physics dismiss wrapper — scales down as you drag */}
            <motion.div
                className={`story-viewer-dismiss-wrap ${cubeClass}`}
                style={{
                    y: dismiss.y,
                    scale: dismiss.scale,
                    opacity: dismiss.opacity,
                    borderRadius: dismiss.borderRadius,
                    willChange: 'transform',
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 300 }}
                dragElastic={0.2}
                onDragStart={dismiss.handleDragStart}
                onDrag={dismiss.handleDrag}
                onDragEnd={dismiss.handleDragEnd}
            >
                {/* Tap / gesture container */}
                <div
                    className="story-viewer-stage"
                    onClick={nav.handleTap}
                    onPointerDown={nav.handlePauseStart}
                    onPointerUp={nav.handlePauseEnd}
                    onPointerLeave={nav.handlePauseEnd}
                    onTouchStart={nav.handleSwipeStart}
                    onTouchEnd={nav.handleSwipeEnd}
                >
                    {/* Progress bar */}
                    <ProgressBar
                        totalSegments={nav.totalFrames}
                        activeSegmentIndex={nav.currentFrameIndex}
                        progress={nav.progress}
                        paused={nav.paused}
                    />

                    {/* Header */}
                    <StoryHeader
                        ownerInfo={ownerInfo}
                        story={nav.currentStory}
                        paused={nav.paused}
                        onClose={handleDismiss}
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                        isVideo={currentIsVideo}
                    />

                    {/* Media Layer with blurred background plate */}
                    <StoryMediaLayer
                        currentFrame={nav.currentFrame}
                        frameIndex={nav.currentFrameIndex}
                        isMuted={isMuted}
                    />

                    {/* Overlay Layer (text, stickers, polls, interactive) */}
                    <StoryOverlayLayer
                        frame={nav.currentFrame}
                        pollVotes={interactions.pollVotes}
                        onPollVote={interactions.handlePollVote}
                    />

                    {/* Flying Emoji Reactions */}
                    <FlyingEmojis flyingEmojis={interactions.flyingEmojis} />

                    {/* Paused dimming overlay */}
                    {nav.paused && !interactions.showInsights && (
                        <div className="story-viewer-pause-overlay" />
                    )}

                    {/* Tray navigation hint arrows */}
                    {storyTrayData && tray.totalGroups > 1 && (
                        <>
                            {tray.prevGroup && (
                                <div className="story-tray-hint story-tray-hint-left">
                                    <div className="tray-hint-avatar">
                                        <img src={tray.prevGroup.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tray.prevGroup.name || '?')}&size=32&background=1e293b&color=fff`} alt="" />
                                    </div>
                                </div>
                            )}
                            {tray.nextGroup && (
                                <div className="story-tray-hint story-tray-hint-right">
                                    <div className="tray-hint-avatar">
                                        <img src={tray.nextGroup.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tray.nextGroup.name || '?')}&size=32&background=1e293b&color=fff`} alt="" />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>

            {/* Footer */}
            <StoryFooter
                isOwner={isOwnerOfCurrent}
                paused={nav.paused}
                analytics={analytics}
                replyText={interactions.replyText}
                setReplyText={interactions.setReplyText}
                sendReply={interactions.sendReply}
                handleReaction={interactions.handleReaction}
                openInsights={interactions.openInsights}
            />

            {/* Insights Sheet (owner only) */}
            <InsightsSheet
                showInsights={interactions.showInsights}
                analytics={analytics}
                currentFrame={nav.currentFrame}
                onClose={interactions.closeInsights}
                onDelete={() => interactions.handleDeleteStory(navigate)}
            />
        </div>
    );
}

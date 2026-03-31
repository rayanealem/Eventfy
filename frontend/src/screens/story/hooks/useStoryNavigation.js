import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORY_DURATION } from '../constants';

/**
 * useStoryNavigation — Manages frame-level navigation with JS-driven progress timer.
 *
 * Instagram behavior:
 * - Tap left 30% = prev frame
 * - Tap right 70% = next frame
 * - Hold = pause
 * - Progress bar is JS-driven (requestAnimationFrame)
 * - When last frame completes → calls onGroupComplete (for tray mode) or navigates back
 */
export default function useStoryNavigation(allFrames, recordView, { onGroupComplete, onGroupPrev } = {}) {
    const navigate = useNavigate();

    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [progress, setProgress] = useState(0); // 0..1

    const totalFrames = allFrames.length;
    const currentFrame = allFrames[currentFrameIndex] || null;
    const currentStory = currentFrame?._story || null;
    const currentDuration = currentFrame?.duration_ms || STORY_DURATION;

    // Timer refs
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const elapsedRef = useRef(0);

    // Track which stories we've recorded views for
    const viewedStoriesRef = useRef(new Set());

    // Record view for current story
    useEffect(() => {
        if (currentStory?.id && recordView && !viewedStoriesRef.current.has(currentStory.id)) {
            viewedStoriesRef.current.add(currentStory.id);
            recordView(currentStory.id);
        }
    }, [currentStory?.id, recordView]);

    // ─── Progress Timer (JS-driven) ─────────────────────────────────────────
    const handleAutoAdvance = useCallback(() => {
        if (currentFrameIndex < totalFrames - 1) {
            setCurrentFrameIndex(i => i + 1);
        } else {
            // Last frame of this group
            if (onGroupComplete) {
                const advanced = onGroupComplete();
                if (!advanced) {
                    // No more groups, dismiss
                    navigate(-1);
                }
            } else {
                navigate(-1);
            }
        }
    }, [currentFrameIndex, totalFrames, navigate, onGroupComplete]);

    const startTimer = useCallback(() => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        startTimeRef.current = performance.now();

        const tick = (now) => {
            const elapsed = elapsedRef.current + (now - startTimeRef.current);
            const pct = Math.min(elapsed / currentDuration, 1);
            setProgress(pct);

            if (pct >= 1) {
                elapsedRef.current = 0;
                setProgress(0);
                handleAutoAdvance();
                return;
            }
            timerRef.current = requestAnimationFrame(tick);
        };

        timerRef.current = requestAnimationFrame(tick);
    }, [currentDuration, handleAutoAdvance]);

    const pauseTimer = useCallback(() => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
        if (startTimeRef.current) {
            elapsedRef.current += performance.now() - startTimeRef.current;
        }
    }, []);

    // Start/pause timer based on paused state
    useEffect(() => {
        if (totalFrames === 0) return;
        if (paused) {
            pauseTimer();
        } else {
            startTimer();
        }
        return () => {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
        };
    }, [paused, currentFrameIndex, totalFrames]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset elapsed when frame changes
    useEffect(() => {
        elapsedRef.current = 0;
        setProgress(0);
    }, [currentFrameIndex]);

    // Reset frame index when allFrames change (new group)
    const framesKeyRef = useRef(null);
    useEffect(() => {
        const key = allFrames.map(f => f?.id || f?.media_url).join(',');
        if (framesKeyRef.current !== null && framesKeyRef.current !== key) {
            setCurrentFrameIndex(0);
            elapsedRef.current = 0;
            setProgress(0);
        }
        framesKeyRef.current = key;
    }, [allFrames]);

    // ─── Navigation ─────────────────────────────────────────────────────────
    const nextFrame = useCallback(() => {
        if (currentFrameIndex < totalFrames - 1) {
            setCurrentFrameIndex(i => i + 1);
        } else {
            // At last frame — try next group or dismiss
            if (onGroupComplete) {
                const advanced = onGroupComplete();
                if (!advanced) navigate(-1);
            } else {
                navigate(-1);
            }
        }
    }, [currentFrameIndex, totalFrames, navigate, onGroupComplete]);

    const prevFrame = useCallback(() => {
        if (currentFrameIndex > 0) {
            setCurrentFrameIndex(i => i - 1);
        } else {
            // At first frame — try prev group
            if (onGroupPrev) {
                onGroupPrev();
            }
        }
        elapsedRef.current = 0;
        setProgress(0);
    }, [currentFrameIndex, onGroupPrev]);

    // ─── Hold to pause ──────────────────────────────────────────────────────
    const pauseTimeoutRef = useRef(null);

    const handlePauseStart = useCallback(() => {
        pauseTimeoutRef.current = setTimeout(() => setPaused(true), 150);
    }, []);

    const handlePauseEnd = useCallback(() => {
        clearTimeout(pauseTimeoutRef.current);
        setPaused(false);
    }, []);

    // ─── Tap zones: left 30% = prev, right 70% = next ──────────────────────
    const handleTap = useCallback((e) => {
        if (e.target.closest('.story-smart-sticker') ||
            e.target.closest('.story-footer') ||
            e.target.closest('.story-poll-widget') ||
            e.target.closest('.story-quiz-widget') ||
            e.target.closest('.story-question-widget') ||
            e.target.closest('.story-slider-widget') ||
            e.target.closest('.story-unmute-btn') ||
            e.target.closest('button') ||
            e.target.closest('input')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        if (x < rect.width * 0.3) {
            prevFrame();
        } else {
            nextFrame();
        }
    }, [prevFrame, nextFrame]);

    // ─── Swipe support ──────────────────────────────────────────────────────
    const touchStartRef = useRef({ x: 0, y: 0 });

    const handleSwipeStart = useCallback((e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    }, []);

    const handleSwipeEnd = useCallback((e) => {
        const dx = touchStartRef.current.x - e.changedTouches[0].clientX;
        const dy = touchStartRef.current.y - e.changedTouches[0].clientY;

        // Horizontal swipe — navigate groups if available
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx > 0) nextFrame();
            else prevFrame();
        }
        // Vertical swipe down to dismiss
        else if (dy < -80) {
            navigate(-1);
        }
    }, [nextFrame, prevFrame, navigate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) cancelAnimationFrame(timerRef.current);
            clearTimeout(pauseTimeoutRef.current);
        };
    }, []);

    return {
        currentFrameIndex,
        totalFrames,
        currentFrame,
        currentStory,
        currentDuration,
        progress,
        paused,
        setPaused,

        nextFrame,
        prevFrame,

        handleTap,
        handleSwipeStart,
        handleSwipeEnd,
        handlePauseStart,
        handlePauseEnd,

        navigate,
    };
}

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { STORY_DURATION } from '../constants';

/**
 * useStoryNavigation — Manages story/frame index state, navigation (next/prev),
 * tap zones (30/70 split), swipe detection, hold-to-pause, and auto-advance timing.
 */
export default function useStoryNavigation(stories) {
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    const story = stories[currentIndex] || stories[0];
    const totalStories = stories.length;
    const currentFrames = story?.story_frames || story?.frames || [story]; // Support both DB shape and legacy
    const totalFrames = currentFrames.length;
    const currentDuration = currentFrames[currentFrameIndex]?.duration_ms || STORY_DURATION;
    const currentFrame = currentFrames[currentFrameIndex];

    // ─── Story-level navigation ─────────────────────────────────────────────
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
            setCurrentFrameIndex(0);
        }
    }, [currentIndex]);

    // ─── Frame-level navigation ─────────────────────────────────────────────
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

    // ─── Hold to pause ──────────────────────────────────────────────────────
    const handlePauseStart = useCallback(() => setPaused(true), []);
    const handlePauseEnd = useCallback(() => setPaused(false), []);

    // ─── Tap zones: left 30% = prev, right 70% = next ──────────────────────
    const handleTap = useCallback((e) => {
        // Prevent navigation when tapping interactive elements
        if (e.target.closest('.story-smart-sticker') ||
            e.target.closest('.story-header') ||
            e.target.closest('.story-footer') ||
            e.target.closest('.story-poll-widget')) {
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
    const touchStartX = useRef(0);

    const handleSwipeStart = useCallback((e) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleSwipeEnd = useCallback((e) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (diff > 50) nextFrame();
        else if (diff < -50) prevFrame();
    }, [nextFrame, prevFrame]);

    return {
        // State
        currentIndex,
        currentFrameIndex,
        paused,
        setPaused,

        // Derived
        story,
        totalStories,
        currentFrames,
        totalFrames,
        currentDuration,
        currentFrame,

        // Navigation
        nextFrame,
        prevFrame,
        goNextStory,
        goPrevStory,

        // Event handlers
        handleTap,
        handleSwipeStart,
        handleSwipeEnd,
        handlePauseStart,
        handlePauseEnd,

        // Navigate (pass-through for sub-components)
        navigate,
    };
}

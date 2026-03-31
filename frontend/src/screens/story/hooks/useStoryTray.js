import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * useStoryTray — Manages group-level navigation between different users' story groups.
 *
 * Instagram behavior:
 * - Each "group" is one user/org's collection of stories
 * - Swiping LEFT/RIGHT navigates between groups with 3D cube transition
 * - When the last frame of a group finishes → auto-advance to next group
 * - When first group prev is attempted → stay
 * - When last group completes → dismiss viewer
 *
 * Returns: currentGroupIndex, group data, cube animation state, and next/prev methods.
 */
export default function useStoryTray(storyTray, initialGroupIndex = 0) {
    const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
    const [cubeDirection, setCubeDirection] = useState(null); // 'left' | 'right' | null
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionTimeoutRef = useRef(null);

    const totalGroups = storyTray?.length || 0;
    const currentGroup = storyTray?.[groupIndex] || null;
    const nextGroup = storyTray?.[groupIndex + 1] || null;
    const prevGroup = storyTray?.[groupIndex - 1] || null;

    // Preload adjacent group's first frame
    useEffect(() => {
        if (nextGroup?.frames?.[0]?.media_url) {
            const img = new Image();
            img.src = nextGroup.frames[0].media_url;
        }
        if (prevGroup?.frames?.[0]?.media_url) {
            const img = new Image();
            img.src = prevGroup.frames[0].media_url;
        }
    }, [groupIndex, nextGroup, prevGroup]);

    const triggerCubeTransition = useCallback((direction) => {
        setCubeDirection(direction);
        setIsTransitioning(true);
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
            setCubeDirection(null);
            setIsTransitioning(false);
        }, 400);
    }, []);

    const goToNextGroup = useCallback(() => {
        if (groupIndex < totalGroups - 1) {
            triggerCubeTransition('left');
            setGroupIndex(i => i + 1);
            return true;
        }
        return false; // No more groups — should dismiss
    }, [groupIndex, totalGroups, triggerCubeTransition]);

    const goToPrevGroup = useCallback(() => {
        if (groupIndex > 0) {
            triggerCubeTransition('right');
            setGroupIndex(i => i - 1);
            return true;
        }
        return false;
    }, [groupIndex, triggerCubeTransition]);

    // Called when all frames of current group finish
    const onGroupComplete = useCallback(() => {
        return goToNextGroup();
    }, [goToNextGroup]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, []);

    return {
        groupIndex,
        totalGroups,
        currentGroup,
        nextGroup,
        prevGroup,
        cubeDirection,
        isTransitioning,
        goToNextGroup,
        goToPrevGroup,
        onGroupComplete,
    };
}

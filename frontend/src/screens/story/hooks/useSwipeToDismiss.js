import { useCallback, useRef } from 'react';
import { useMotionValue, useTransform, useSpring, useAnimation } from 'framer-motion';

/**
 * useSwipeToDismiss — Physics-based swipe-down gesture for story viewer.
 *
 * Instagram behavior:
 * - Dragging down scales the viewer from 1 → 0.85
 * - Opacity fades from 1 → 0.7
 * - Border radius grows from 0 → 24px
 * - On release: velocity > 500 OR distance > 200px → dismiss
 * - Otherwise → spring back to origin
 */
export default function useSwipeToDismiss(onDismiss) {
    const y = useMotionValue(0);
    const isDragging = useRef(false);

    // Derived transforms
    const scale = useTransform(y, [0, 200], [1, 0.85]);
    const opacity = useTransform(y, [0, 200], [1, 0.7]);
    const borderRadius = useTransform(y, [0, 200], [0, 24]);

    // Spring for snap-back
    const springY = useSpring(y, { damping: 25, stiffness: 300 });

    const handleDragStart = useCallback(() => {
        isDragging.current = true;
    }, []);

    const handleDrag = useCallback((event, info) => {
        // Only allow downward drag
        const newY = Math.max(0, info.offset.y);
        y.set(newY);
    }, [y]);

    const handleDragEnd = useCallback((event, info) => {
        isDragging.current = false;
        const velocity = info.velocity.y;
        const distance = y.get();

        if (velocity > 500 || distance > 200) {
            // Dismiss with animation
            onDismiss?.();
        } else {
            // Snap back
            y.set(0);
        }
    }, [y, onDismiss]);

    return {
        y,
        scale,
        opacity,
        borderRadius,
        isDragging: isDragging.current,
        handleDragStart,
        handleDrag,
        handleDragEnd,
        motionProps: {
            style: {
                y,
                scale,
                opacity,
                borderRadius,
            },
        },
    };
}

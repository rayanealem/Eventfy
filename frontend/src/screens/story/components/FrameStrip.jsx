import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

/**
 * FrameStrip — Horizontal scrollable strip of frame thumbnails.
 * Instagram-style multi-frame story editing bar.
 *
 * Features:
 * - Thumbnails of all frames with active highlight
 * - "+" button to add new frame (up to 10)
 * - Long-press to delete a frame
 * - Tap to switch between frames
 * - Drag to reorder (using Framer Motion Reorder)
 */
const MAX_FRAMES = 10;

export default function FrameStrip({
    frames,
    activeFrameIndex,
    onSelectFrame,
    onAddFrame,
    onDeleteFrame,
    onReorderFrames,
}) {
    const [longPressTarget, setLongPressTarget] = useState(null);
    const longPressTimerRef = useRef(null);

    const handlePointerDown = useCallback((index) => {
        longPressTimerRef.current = setTimeout(() => {
            setLongPressTarget(index);
            if (navigator.vibrate) navigator.vibrate(20);
        }, 500);
    }, []);

    const handlePointerUp = useCallback(() => {
        clearTimeout(longPressTimerRef.current);
    }, []);

    const handleConfirmDelete = useCallback((index) => {
        onDeleteFrame(index);
        setLongPressTarget(null);
    }, [onDeleteFrame]);

    if (!frames || frames.length <= 1) {
        // Show "Add Another" button only when there's exactly 1 frame
        if (frames?.length === 1) {
            return (
                <div className="frame-strip">
                    <div className="frame-strip-inner">
                        <div className="frame-thumb frame-thumb-active">
                            <div className="frame-thumb-img-wrap">
                                {frames[0].isVideo ? (
                                    <video src={frames[0].preview} className="frame-thumb-img" muted />
                                ) : (
                                    <img src={frames[0].preview} alt="Frame 1" className="frame-thumb-img" />
                                )}
                            </div>
                            <span className="frame-thumb-number">1</span>
                        </div>
                        {frames.length < MAX_FRAMES && (
                            <button className="frame-add-btn" onClick={onAddFrame}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="frame-strip">
            <div className="frame-strip-inner">
                {frames.map((frame, index) => (
                    <motion.div
                        key={frame.id}
                        className={`frame-thumb ${index === activeFrameIndex ? 'frame-thumb-active' : ''}`}
                        onClick={() => onSelectFrame(index)}
                        onPointerDown={() => handlePointerDown(index)}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                        <div className="frame-thumb-img-wrap">
                            {frame.isVideo ? (
                                <video src={frame.preview} className="frame-thumb-img" muted />
                            ) : (
                                <img src={frame.preview} alt={`Frame ${index + 1}`} className="frame-thumb-img" />
                            )}
                        </div>
                        <span className="frame-thumb-number">{index + 1}</span>

                        {/* Delete confirmation overlay */}
                        <AnimatePresence>
                            {longPressTarget === index && (
                                <motion.div
                                    className="frame-delete-overlay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <button
                                        className="frame-delete-btn"
                                        onClick={(e) => { e.stopPropagation(); handleConfirmDelete(index); }}
                                    >
                                        ✕
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}

                {/* Add frame button */}
                {frames.length < MAX_FRAMES && (
                    <motion.button
                        className="frame-add-btn"
                        onClick={onAddFrame}
                        whileTap={{ scale: 0.9 }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <span className="frame-add-count">{frames.length}/{MAX_FRAMES}</span>
                    </motion.button>
                )}
            </div>
        </div>
    );
}

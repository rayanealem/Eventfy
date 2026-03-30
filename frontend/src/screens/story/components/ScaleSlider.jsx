import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScaleSlider — Vertical precision slider for element scale or brush size.
 */
export default function ScaleSlider({
    visible,
    isDrawingMode,
    brushSize,
    setBrushSize,
    activeElement,
    updateElement,
    activeElementId,
}) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="story-scale-slider-wrap"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                >
                    {isDrawingMode ? (
                        <input
                            type="range"
                            min="2"
                            max="30"
                            step="1"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="story-scale-slider"
                            orient="vertical"
                        />
                    ) : (
                        <input
                            type="range"
                            min="0.5"
                            max="4.0"
                            step="0.1"
                            value={activeElement ? activeElement.scale : 1}
                            onChange={(e) => updateElement(activeElementId, { scale: parseFloat(e.target.value) })}
                            className="story-scale-slider"
                            orient="vertical"
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

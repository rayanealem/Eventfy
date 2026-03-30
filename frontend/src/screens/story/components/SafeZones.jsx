import { motion, AnimatePresence } from 'framer-motion';

/**
 * SafeZones — Visual safe zone indicators and center alignment guides
 * shown during element dragging.
 */
export default function SafeZones({
    isDragging,
    safeZoneWarning,
    showCenterGuide,
    horizontalCenterGuide,
}) {
    return (
        <>
            {/* Safe Zone Indicators */}
            <AnimatePresence>
                {isDragging && (
                    <>
                        <motion.div
                            className="story-safe-zone story-safe-zone-top"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                backgroundColor: safeZoneWarning ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                                borderBottomColor: safeZoneWarning ? '#ff3b30' : 'rgba(255,255,255,0.3)'
                            }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.div
                            className="story-safe-zone story-safe-zone-bottom"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                backgroundColor: safeZoneWarning ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
                                borderTopColor: safeZoneWarning ? '#ff3b30' : 'rgba(255,255,255,0.3)'
                            }}
                            exit={{ opacity: 0 }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Center Guides */}
            {showCenterGuide && <div className="story-center-guide" />}
            {horizontalCenterGuide && <div className="story-horizontal-guide" />}
        </>
    );
}

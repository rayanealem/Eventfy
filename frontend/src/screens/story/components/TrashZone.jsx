import { motion, AnimatePresence } from 'framer-motion';

/**
 * TrashZone — Magnetic trash zone that appears during element dragging.
 * Elements dropped here are deleted.
 */
export default function TrashZone({ isDragging, dragTrashScale }) {
    return (
        <AnimatePresence>
            {isDragging && (
                <motion.div
                    className="story-trash-zone"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, scale: dragTrashScale }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <div className="trash-icon">🗑️</div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

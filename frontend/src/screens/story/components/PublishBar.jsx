import { motion, AnimatePresence } from 'framer-motion';

/**
 * PublishBar — Bottom publish button bar for story creator.
 */
export default function PublishBar({ visible, bgImage, publishing, onPublish }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    className="story-bottom-bar"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                >
                    <button
                        className="publish-btn"
                        onClick={onPublish}
                        disabled={!bgImage || publishing}
                    >
                        {publishing ? 'PUBLISHING...' : 'PUBLISH'}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

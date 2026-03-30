import { motion, AnimatePresence } from 'framer-motion';

/**
 * FlyingEmojis — Animated emoji reaction layer.
 * Emojis float upward and fade out.
 */
export default function FlyingEmojis({ flyingEmojis }) {
    return (
        <AnimatePresence>
            {flyingEmojis.map((fe) => (
                <motion.div
                    key={fe.id}
                    className="flying-emoji"
                    initial={{ y: 0, opacity: 1, x: '-50%' }}
                    animate={{ y: -500, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ left: `${fe.x}%` }}
                >
                    {fe.emoji}
                </motion.div>
            ))}
        </AnimatePresence>
    );
}

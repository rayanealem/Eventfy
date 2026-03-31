import { motion, AnimatePresence } from 'framer-motion';

/**
 * FlyingEmojis — Physics-based rising emoji reactions with wobble.
 */
export default function FlyingEmojis({ flyingEmojis }) {
    return (
        <AnimatePresence>
            {flyingEmojis.map((fe) => (
                <motion.div
                    key={fe.id}
                    className="flying-emoji"
                    initial={{ y: 0, opacity: 1, scale: 0.5, rotate: -15 + Math.random() * 30 }}
                    animate={{
                        y: -400 - Math.random() * 200,
                        opacity: [1, 1, 0],
                        scale: [0.5, 1.2, 0.8],
                        x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 80],
                        rotate: -30 + Math.random() * 60,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: 1.5 + Math.random() * 0.5,
                        ease: [0.2, 0.6, 0.3, 1],
                        delay: fe.delay || 0,
                    }}
                    style={{ left: `${fe.x}%` }}
                >
                    {fe.emoji}
                </motion.div>
            ))}
        </AnimatePresence>
    );
}

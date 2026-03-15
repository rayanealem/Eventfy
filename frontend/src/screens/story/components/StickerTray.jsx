import { motion, AnimatePresence } from 'framer-motion';

export default function StickerTray({ showStickerTray, addSmartSticker, addSticker, EVENTFY_SHAPES, EMOJIS }) {
    return (
        <AnimatePresence>
            {showStickerTray && (
                <motion.div
                    className="story-sticker-tray"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div className="tray-header">
                        <div className="tray-handle" />
                        <h3>Stickers</h3>
                    </div>
                    <div className="tray-content">
                        <h4>Smart Stickers</h4>
                        <div className="smart-stickers-grid">
                            <button className="smart-sticker-btn" onClick={() => addSmartSticker('mention')}>@ Mention</button>
                            <button className="smart-sticker-btn" onClick={() => addSmartSticker('location')}>📍 Location</button>
                            <button className="smart-sticker-btn" onClick={() => addSmartSticker('link')}>🔗 Link</button>
                        </div>

                        <h4>Eventfy Shapes</h4>
                        <div className="sticker-grid shapes-grid">
                            {EVENTFY_SHAPES.map((s, i) => (
                                <button
                                    key={i}
                                    className="sticker-item"
                                    style={{ color: s.color }}
                                    onClick={() => addSticker(s.content, s.color)}
                                >
                                    {s.content}
                                </button>
                            ))}
                        </div>
                        <h4>Emojis</h4>
                        <div className="sticker-grid">
                            {EMOJIS.map((em, i) => (
                                <button
                                    key={i}
                                    className="sticker-item"
                                    onClick={() => addSticker(em)}
                                >
                                    {em}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

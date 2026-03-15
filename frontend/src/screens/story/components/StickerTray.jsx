import { motion, AnimatePresence } from 'framer-motion';

export default function StickerTray({ showStickerTray, addSmartSticker, addSticker, addPhotoSticker, EVENTFY_SHAPES, EMOJIS }) {
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                addPhotoSticker(reader.result); // Base64 Data URL
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null; // reset
    };

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
                        <h4>Media & Smart Stickers</h4>
                        <div className="smart-stickers-grid">
                            <label className="smart-sticker-btn photo-sticker-btn">
                                🖼️ Add Photo
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
                            </label>
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

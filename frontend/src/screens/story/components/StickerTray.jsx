import { motion, AnimatePresence } from 'framer-motion';

/**
 * StickerTray — Expanded with Interactive Stickers section.
 * Instagram-grade sticker tray: Media, Interactive, Eventfy Shapes, Emojis.
 */
export default function StickerTray({
    showStickerTray,
    addSmartSticker,
    addSticker,
    addPhotoSticker,
    addPoll,
    addQuiz,
    addQuestion,
    addSlider,
    addCountdown,
    EVENTFY_SHAPES,
    EMOJIS,
}) {
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                addPhotoSticker(reader.result);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = null;
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
                        <h3>Stickers & Tools</h3>
                    </div>
                    <div className="tray-content">
                        {/* ─── Interactive Stickers ───────────────────────── */}
                        <h4>📊 Interactive</h4>
                        <div className="interactive-stickers-grid">
                            <button className="interactive-sticker-btn poll-btn" onClick={addPoll}>
                                <span className="isticker-icon">📊</span>
                                <span className="isticker-label">Poll</span>
                            </button>
                            <button className="interactive-sticker-btn quiz-btn" onClick={addQuiz}>
                                <span className="isticker-icon">🧠</span>
                                <span className="isticker-label">Quiz</span>
                            </button>
                            <button className="interactive-sticker-btn question-btn" onClick={addQuestion}>
                                <span className="isticker-icon">❓</span>
                                <span className="isticker-label">Question</span>
                            </button>
                            <button className="interactive-sticker-btn slider-btn" onClick={addSlider}>
                                <span className="isticker-icon">🔥</span>
                                <span className="isticker-label">Slider</span>
                            </button>
                            <button className="interactive-sticker-btn countdown-btn" onClick={addCountdown}>
                                <span className="isticker-icon">⏳</span>
                                <span className="isticker-label">Countdown</span>
                            </button>
                        </div>

                        {/* ─── Media & Smart Stickers ────────────────────── */}
                        <h4>🔗 Media & Smart</h4>
                        <div className="smart-stickers-grid">
                            <label className="smart-sticker-btn photo-sticker-btn">
                                🖼️ Photo
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoSelect} />
                            </label>
                            <button className="smart-sticker-btn" onClick={() => addSmartSticker('mention')}>@ Mention</button>
                            <button className="smart-sticker-btn" onClick={() => addSmartSticker('location')}>📍 Location</button>
                            <button className="smart-sticker-btn" onClick={() => addSmartSticker('link')}>🔗 Link</button>
                        </div>

                        {/* ─── Eventfy Shapes ────────────────────────────── */}
                        <h4>◇ Eventfy Shapes</h4>
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

                        {/* ─── Emojis ────────────────────────────────────── */}
                        <h4>😊 Emojis</h4>
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

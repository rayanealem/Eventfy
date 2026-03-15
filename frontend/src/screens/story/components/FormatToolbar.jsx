import { motion, AnimatePresence } from 'framer-motion';

export default function FormatToolbar({
    activeElement,
    isDrawingMode,
    isDragging,
    updateElement,
    COLORS,
    brushColor,
    setBrushColor,
    ctxRef,
    getContrastColor
}) {
    return (
        <AnimatePresence>
            {((activeElement && activeElement.type === 'text') || isDrawingMode) && !isDragging && (
                <motion.div
                    className="story-format-toolbar"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    {!isDrawingMode && (
                        <div className="format-toggles">
                            <button
                                className="format-btn"
                                onClick={() => updateElement(activeElement.id, {
                                    fontFamily: activeElement.fontFamily === 'Space Grotesk' ? 'Bebas Neue' : 'Space Grotesk'
                                })}
                            >
                                {activeElement.fontFamily === 'Space Grotesk' ? 'Aa' : 'AA'}
                            </button>
                            <button
                                className="format-btn"
                                onClick={() => updateElement(activeElement.id, {
                                    textStyle: activeElement.textStyle === 'plain' ? 'solid' : 'plain'
                                })}
                            >
                                {activeElement.textStyle === 'plain' ? 'A' : 'A*'}
                            </button>
                            <button
                                className="format-btn"
                                onClick={() => {
                                    const aligns = ['center', 'left', 'right'];
                                    const currentIdx = aligns.indexOf(activeElement.textAlign || 'center');
                                    const nextIdx = (currentIdx + 1) % aligns.length;
                                    updateElement(activeElement.id, { textAlign: aligns[nextIdx] });
                                }}
                            >
                                {activeElement.textAlign === 'left' ? '⫷' : activeElement.textAlign === 'right' ? '⫸' : '≡'}
                            </button>
                            <button
                                className="format-btn"
                                onClick={() => {
                                    const anims = ['none', 'pulse', 'wobble'];
                                    const currentIdx = anims.indexOf(activeElement.animationType || 'none');
                                    const nextIdx = (currentIdx + 1) % anims.length;
                                    updateElement(activeElement.id, { animationType: anims[nextIdx] });
                                }}
                            >
                                {activeElement.animationType === 'pulse' ? '💓' : activeElement.animationType === 'wobble' ? '〰️' : '✨'}
                            </button>
                        </div>
                    )}
                    <div className="color-picker">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                className={`color-swatch ${isDrawingMode ? (brushColor === c ? 'active' : '') : (activeElement?.textStyle === 'solid' ? (activeElement.bgColor === c ? 'active' : '') : (activeElement?.color === c ? 'active' : ''))}`}
                                style={{ backgroundColor: c }}
                                onClick={() => {
                                    if (isDrawingMode) {
                                        setBrushColor(c);
                                        if (ctxRef.current) ctxRef.current.strokeStyle = c;
                                    } else if (activeElement) {
                                        if (activeElement.textStyle === 'solid') {
                                            updateElement(activeElement.id, { bgColor: c, color: getContrastColor(c) });
                                        } else {
                                            updateElement(activeElement.id, { color: c });
                                        }
                                    }
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FONT_FAMILIES, TEXT_STYLES, TEXT_ALIGNS, ANIMATION_TYPES, TEXT_SHADOWS, GRADIENT_PRESETS } from '../constants';

/**
 * FormatToolbar — Enhanced editing toolbar with font picker, gradient text,
 * text shadows, animation selector, and color palette.
 */
export default function FormatToolbar({
    activeElement,
    isDrawingMode,
    isDragging,
    updateElement,
    COLORS,
    brushColor,
    setBrushColor,
    ctxRef,
    getContrastColor,
}) {
    const [activeTab, setActiveTab] = useState('color'); // color | font | style | effect

    const isVisible = !isDragging && (activeElement?.type === 'text' || isDrawingMode);
    if (!isVisible) return null;

    const isTextMode = activeElement?.type === 'text';

    // ─── Text Style Cycling ─────────────────────────────────────────────────
    const cycleTextStyle = () => {
        if (!isTextMode) return;
        const idx = TEXT_STYLES.indexOf(activeElement.textStyle || 'plain');
        const next = TEXT_STYLES[(idx + 1) % TEXT_STYLES.length];
        updateElement(activeElement.id, { textStyle: next });
    };

    const cycleTextAlign = () => {
        if (!isTextMode) return;
        const idx = TEXT_ALIGNS.indexOf(activeElement.textAlign || 'center');
        const next = TEXT_ALIGNS[(idx + 1) % TEXT_ALIGNS.length];
        updateElement(activeElement.id, { textAlign: next });
    };

    const cycleAnimation = () => {
        if (!isTextMode) return;
        const idx = ANIMATION_TYPES.indexOf(activeElement.animationType || 'none');
        const next = ANIMATION_TYPES[(idx + 1) % ANIMATION_TYPES.length];
        updateElement(activeElement.id, { animationType: next });
    };

    const applyTextShadow = (shadowCss) => {
        if (!isTextMode) return;
        updateElement(activeElement.id, { textShadow: shadowCss });
    };

    const applyGradientBg = (gradientCss) => {
        if (!isTextMode) return;
        updateElement(activeElement.id, { textStyle: 'gradient', gradientBg: gradientCss });
    };

    const applyFont = (family) => {
        if (!isTextMode) return;
        updateElement(activeElement.id, { fontFamily: family });
    };

    const handleColorChange = (color) => {
        if (isDrawingMode) {
            setBrushColor(color);
            if (ctxRef.current) {
                ctxRef.current.strokeStyle = color;
            }
        } else if (isTextMode) {
            updateElement(activeElement.id, { color });
        }
    };

    const alignIcons = { left: '≡', center: '☰', right: '≡' };

    return (
        <div className="format-toolbar">
            {/* ─── Tab Switcher (text mode only) ─────────────────────────── */}
            {isTextMode && (
                <div className="format-tabs">
                    <button
                        className={`format-tab ${activeTab === 'color' ? 'active' : ''}`}
                        onClick={() => setActiveTab('color')}
                    >
                        🎨
                    </button>
                    <button
                        className={`format-tab ${activeTab === 'font' ? 'active' : ''}`}
                        onClick={() => setActiveTab('font')}
                    >
                        Aa
                    </button>
                    <button
                        className={`format-tab ${activeTab === 'style' ? 'active' : ''}`}
                        onClick={() => setActiveTab('style')}
                    >
                        ✦
                    </button>
                    <button
                        className={`format-tab ${activeTab === 'effect' ? 'active' : ''}`}
                        onClick={() => setActiveTab('effect')}
                    >
                        ✨
                    </button>
                </div>
            )}

            {/* ─── Color Palette ─────────────────────────────────────────── */}
            {(activeTab === 'color' || isDrawingMode) && (
                <div className="format-color-row">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            className={`color-dot ${(isDrawingMode ? brushColor : activeElement?.color) === color ? 'color-dot-active' : ''}`}
                            style={{ background: color }}
                            onClick={() => handleColorChange(color)}
                            aria-label={`Color ${color}`}
                        />
                    ))}
                </div>
            )}

            {/* ─── Font Picker (horizontal scroll) ───────────────────────── */}
            {isTextMode && activeTab === 'font' && (
                <div className="format-font-row">
                    {FONT_FAMILIES.map((font) => (
                        <button
                            key={font.family}
                            className={`font-chip ${activeElement?.fontFamily === font.family ? 'font-chip-active' : ''}`}
                            style={{ fontFamily: font.family }}
                            onClick={() => applyFont(font.family)}
                        >
                            {font.name}
                        </button>
                    ))}
                </div>
            )}

            {/* ─── Style Tab (text style, align, size) ───────────────────── */}
            {isTextMode && activeTab === 'style' && (
                <div className="format-style-row">
                    <button className="format-action-btn" onClick={cycleTextStyle}>
                        <span className="format-action-icon">
                            {activeElement?.textStyle === 'plain' && 'Aa'}
                            {activeElement?.textStyle === 'solid' && '⬛'}
                            {activeElement?.textStyle === 'translucent' && '◻️'}
                            {activeElement?.textStyle === 'glow' && '✦'}
                            {activeElement?.textStyle === 'gradient' && '🌈'}
                        </span>
                        <span className="format-action-label">{activeElement?.textStyle || 'plain'}</span>
                    </button>
                    <button className="format-action-btn" onClick={cycleTextAlign}>
                        <span className="format-action-icon">{alignIcons[activeElement?.textAlign || 'center']}</span>
                        <span className="format-action-label">{activeElement?.textAlign || 'center'}</span>
                    </button>
                    <button className="format-action-btn" onClick={cycleAnimation}>
                        <span className="format-action-icon">🎬</span>
                        <span className="format-action-label">{activeElement?.animationType || 'none'}</span>
                    </button>

                    {/* ── Gradient presets (when gradient style active) ── */}
                    {activeElement?.textStyle === 'gradient' && (
                        <div className="format-gradient-row">
                            {GRADIENT_PRESETS.map((g) => (
                                <button
                                    key={g.name}
                                    className={`gradient-chip ${activeElement?.gradientBg === g.css ? 'gradient-chip-active' : ''}`}
                                    style={{ background: g.css }}
                                    onClick={() => applyGradientBg(g.css)}
                                    title={g.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Effects Tab (text shadow, glow) ───────────────────────── */}
            {isTextMode && activeTab === 'effect' && (
                <div className="format-effect-row">
                    <span className="format-effect-label">Shadow</span>
                    <div className="format-shadow-chips">
                        {TEXT_SHADOWS.map((shadow) => (
                            <button
                                key={shadow.name}
                                className={`shadow-chip ${activeElement?.textShadow === shadow.css ? 'shadow-chip-active' : ''}`}
                                onClick={() => applyTextShadow(shadow.css)}
                            >
                                {shadow.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

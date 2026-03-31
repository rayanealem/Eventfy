/**
 * Story Feature — Shared Constants
 * Single source of truth for all story-related configuration values.
 */

// ─── Duration ───────────────────────────────────────────────────────────────
export const STORY_DURATION = 5000; // 5s per frame default

// ─── Expanded Color Palette (20 colors) ─────────────────────────────────────
export const COLORS = [
    '#ffffff', '#000000',
    '#fb5151', '#ff6b6b',   // Reds
    '#f56e3d', '#ffa94d',   // Oranges
    '#ffd700', '#ffe066',   // Yellows
    '#00ffc2', '#51cf66',   // Greens
    '#3b82f6', '#339af0',   // Blues
    '#a855f7', '#b484ce',   // Purples
    '#f472b6', '#ff6b9d',   // Pinks
    '#13ecec', '#94a3b8',   // Cyan / Gray
];

// ─── Gradient Presets (for text backgrounds) ────────────────────────────────
export const GRADIENT_PRESETS = [
    { name: 'Sunset', css: 'linear-gradient(135deg, #f56e3d 0%, #ff2d78 100%)' },
    { name: 'Ocean', css: 'linear-gradient(135deg, #13ecec 0%, #3b82f6 100%)' },
    { name: 'Neon', css: 'linear-gradient(135deg, #a855f7 0%, #13ecec 100%)' },
    { name: 'Fire', css: 'linear-gradient(135deg, #ffd700 0%, #fb5151 100%)' },
    { name: 'Forest', css: 'linear-gradient(135deg, #00ffc2 0%, #51cf66 100%)' },
    { name: 'Midnight', css: 'linear-gradient(135deg, #1e1e2e 0%, #a855f7 100%)' },
    { name: 'Rose', css: 'linear-gradient(135deg, #f472b6 0%, #fb5151 100%)' },
];

// ─── Eventfy Brand Shapes ───────────────────────────────────────────────────
export const EVENTFY_SHAPES = [
    { content: '○', color: '#fb5151' },
    { content: '△', color: '#00ffc2' },
    { content: '□', color: '#ffd700' },
    { content: '◇', color: '#b484ce' },
];

// ─── Emojis / Stickers ─────────────────────────────────────────────────────
export const EMOJIS = ['🔥', '⚡', '✨', '🎯', '💡', '💯', '🚀', '❤️', '😂', '🤯', '🥳', '👏', '🎉', '🏆', '💪', '🙌'];

// ─── Reaction Emojis (Viewer) ───────────────────────────────────────────────
export const REACTION_EMOJIS = ['❤️', '🔥', '😂', '😮', '😢', '👏'];

// ─── Slider Emojis (for Emoji Slider sticker) ───────────────────────────────
export const SLIDER_EMOJIS = ['🔥', '❤️', '😍', '💯', '👏', '🤩', '🥵', '😈'];

// ─── Filters ────────────────────────────────────────────────────────────────
export const FILTERS = [
    { name: 'Normal', css: 'none' },
    { name: 'Clarendon', css: 'contrast(120%) saturate(125%)' },
    { name: 'Gingham', css: 'brightness(105%) hue-rotate(-10deg)' },
    { name: 'Moon', css: 'grayscale(100%) contrast(110%) brightness(110%)' },
    { name: 'Lark', css: 'contrast(90%) saturate(120%) brightness(110%)' },
    { name: 'Reyes', css: 'sepia(22%) brightness(110%) contrast(85%) saturate(75%)' },
    { name: 'Juno', css: 'contrast(110%) saturate(140%) brightness(105%) hue-rotate(-5deg)' },
    { name: 'Lo-Fi', css: 'contrast(150%) saturate(110%)' },
    { name: 'Valencia', css: 'sepia(8%) contrast(108%) brightness(108%)' },
    { name: 'Nashville', css: 'sepia(25%) contrast(150%) brightness(90%) saturate(120%)' },
];

// ─── Photo Sticker Shape Cycle ──────────────────────────────────────────────
export const PHOTO_SHAPES = ['square', 'rounded', 'circle', 'star'];

// ─── Text Styles Cycle ──────────────────────────────────────────────────────
export const TEXT_STYLES = ['plain', 'solid', 'translucent', 'glow', 'gradient'];

// ─── Text Alignments Cycle ──────────────────────────────────────────────────
export const TEXT_ALIGNS = ['center', 'left', 'right'];

// ─── Animation Types Cycle ──────────────────────────────────────────────────
export const ANIMATION_TYPES = ['none', 'pulse', 'wobble', 'typewriter', 'bounce'];

// ─── Brush Types ────────────────────────────────────────────────────────────
export const BRUSH_TYPES = ['normal', 'neon', 'marker', 'eraser'];

// ─── Font Families (expanded) ───────────────────────────────────────────────
export const FONT_FAMILIES = [
    { name: 'Grotesk', family: 'Space Grotesk' },
    { name: 'Bebas', family: 'Bebas Neue' },
    { name: 'Mono', family: 'DM Mono' },
    { name: 'Serif', family: 'Georgia, serif' },
    { name: 'Script', family: 'Pacifico, cursive' },
    { name: 'Impact', family: 'Impact, sans-serif' },
    { name: 'Mono Alt', family: 'JetBrains Mono, monospace' },
];

// ─── Text Shadow Presets ────────────────────────────────────────────────────
export const TEXT_SHADOWS = [
    { name: 'None', css: 'none' },
    { name: 'Drop', css: '0 2px 8px rgba(0,0,0,0.6)' },
    { name: 'Neon', css: '0 0 10px currentColor, 0 0 20px currentColor' },
    { name: 'Hard', css: '3px 3px 0 rgba(0,0,0,0.8)' },
    { name: 'Outline', css: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000' },
];

// ─── Utility: Contrast Color ────────────────────────────────────────────────
export function getContrastColor(hexColor) {
    if (!hexColor) return '#ffffff';
    const darkColors = ['#ffffff', '#00ffc2', '#ffd700', '#ffe066', '#ffa94d'];
    return darkColors.includes(hexColor.toLowerCase()) ? '#000000' : '#ffffff';
}

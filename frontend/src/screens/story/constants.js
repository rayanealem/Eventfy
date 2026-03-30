/**
 * Story Feature — Shared Constants
 * Single source of truth for all story-related configuration values.
 */

// ─── Duration ───────────────────────────────────────────────────────────────
export const STORY_DURATION = 5000; // 5s per frame

// ─── Color Palette (Creator) ────────────────────────────────────────────────
export const COLORS = ['#ffffff', '#000000', '#fb5151', '#00ffc2', '#ffd700', '#b484ce'];

// ─── Eventfy Brand Shapes ───────────────────────────────────────────────────
export const EVENTFY_SHAPES = [
    { content: '○', color: '#fb5151' },
    { content: '△', color: '#00ffc2' },
    { content: '□', color: '#ffd700' },
    { content: '◇', color: '#b484ce' },
];

// ─── Emojis / Stickers ─────────────────────────────────────────────────────
export const EMOJIS = ['🔥', '⚡', '✨', '🎯', '💡', '💯', '🚀', '❤️'];

// ─── Filters ────────────────────────────────────────────────────────────────
export const FILTERS = [
    { name: 'Normal', css: 'none' },
    { name: 'B&W', css: 'grayscale(100%)' },
    { name: 'Vintage', css: 'sepia(80%)' },
    { name: 'Vivid', css: 'contrast(120%) saturate(150%)' },
    { name: 'Blur', css: 'blur(4px)' },
];

// ─── Photo Sticker Shape Cycle ──────────────────────────────────────────────
export const PHOTO_SHAPES = ['square', 'rounded', 'circle', 'star'];

// ─── Text Styles Cycle ──────────────────────────────────────────────────────
export const TEXT_STYLES = ['plain', 'solid', 'translucent'];

// ─── Text Alignments Cycle ──────────────────────────────────────────────────
export const TEXT_ALIGNS = ['center', 'left', 'right'];

// ─── Animation Types Cycle ──────────────────────────────────────────────────
export const ANIMATION_TYPES = ['none', 'pulse', 'wobble'];

// ─── Brush Types ────────────────────────────────────────────────────────────
export const BRUSH_TYPES = ['normal', 'neon', 'eraser'];

// ─── Utility: Contrast Color ────────────────────────────────────────────────
export function getContrastColor(hexColor) {
    if (!hexColor) return '#ffffff';
    const darkColors = ['#ffffff', '#00ffc2', '#ffd700'];
    return darkColors.includes(hexColor.toLowerCase()) ? '#000000' : '#ffffff';
}

// ─── Fallback Stories (when API is unavailable) ─────────────────────────────
export const FALLBACK_STORIES = [
    {
        id: 1,
        type: 'announcement',
        badge: '🔴 LIVE EVENT',
        title: 'HACKATHON\nREGISTRATION\nOPEN NOW',
        body: '48 hours of pure code chaos.\nOnly 456 spots remaining.',
        bg: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
        accent: '#13ecec',
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: 2,
        type: 'highlight',
        badge: '🏆 RESULTS',
        title: 'FINAL\nSCOREBOARD\nIS LIVE',
        body: 'See who dominated the arena.\n1,240 participants ranked.',
        bg: 'linear-gradient(180deg, #0a1a0a 0%, #0a2e1a 50%, #0a1a0a 100%)',
        accent: '#2dd4bf',
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
        id: 3,
        type: 'promo',
        badge: '🎟️ EARLY ACCESS',
        title: 'SUMMER\nFESTIVAL\n2026',
        body: 'Get your tickets before they sell out.\nFirst 100 get VIP upgrades.',
        bg: 'linear-gradient(180deg, #1a0a0a 0%, #2e1a0a 50%, #1a0a0a 100%)',
        accent: '#fbbf24',
        created_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    },
];

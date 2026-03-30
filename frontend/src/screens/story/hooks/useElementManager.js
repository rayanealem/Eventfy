import { useState, useCallback } from 'react';
import { PHOTO_SHAPES } from '../constants';

/**
 * useElementManager — Manages draggable overlay elements on the story canvas.
 * Handles add/update/delete for text, stickers, polls, smart stickers, photo stickers.
 * Also manages z-index layering, drag state, center-snap guides, and safe zones.
 */
export default function useElementManager() {
    const [elements, setElements] = useState([]);
    const [activeElementId, setActiveElementId] = useState(null);
    const [highestZIndex, setHighestZIndex] = useState(1);

    // Drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragTrashScale, setDragTrashScale] = useState(1);

    // UI trays
    const [showStickerTray, setShowStickerTray] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Snap guides
    const [showCenterGuide, setShowCenterGuide] = useState(false);
    const [horizontalCenterGuide, setHorizontalCenterGuide] = useState(false);
    const [safeZoneWarning, setSafeZoneWarning] = useState(false);

    const activeElement = elements.find(el => el.id === activeElementId);
    const isEditing = activeElementId !== null || isDragging;

    // ─── Core CRUD ──────────────────────────────────────────────────────────
    const updateElement = useCallback((id, updates) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    }, []);

    const removeElement = useCallback((id) => {
        setElements(prev => prev.filter(el => el.id !== id));
    }, []);

    const bringToFront = useCallback((id) => {
        setHighestZIndex(prev => {
            const newZ = prev + 1;
            setElements(els => els.map(el => el.id === id ? { ...el, zIndex: newZ } : el));
            return newZ;
        });
        setActiveElementId(id);
    }, []);

    // ─── Add Helpers ────────────────────────────────────────────────────────
    const nextZ = useCallback(() => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        return newZ;
    }, [highestZIndex]);

    const addText = useCallback(() => {
        const z = nextZ();
        const newText = {
            id: `text_${Date.now()}`,
            type: 'text',
            content: '',
            color: '#ffffff',
            fontFamily: 'Space Grotesk',
            textStyle: 'plain',
            bgColor: 'transparent',
            textAlign: 'center',
            animationType: 'none',
            x: 0, y: 0, scale: 1, rotation: 0, zIndex: z,
        };
        setElements(prev => [...prev, newText]);
        setActiveElementId(newText.id);
        setShowStickerTray(false);
    }, [nextZ]);

    const addSticker = useCallback((content, color = '#ffffff') => {
        const z = nextZ();
        const newSticker = {
            id: `sticker_${Date.now()}`,
            type: 'sticker',
            content, color,
            x: 0, y: 0, scale: 1, rotation: 0, zIndex: z,
        };
        setElements(prev => [...prev, newSticker]);
        setActiveElementId(newSticker.id);
        setShowStickerTray(false);
    }, [nextZ]);

    const addPoll = useCallback(() => {
        const z = nextZ();
        const newPoll = {
            id: `poll_${Date.now()}`,
            type: 'poll',
            content: { question: 'Ask a question...', optA: 'Yes', optB: 'No' },
            color: '#000000',
            x: 0, y: 0, scale: 1, rotation: 0, zIndex: z,
        };
        setElements(prev => [...prev, newPoll]);
        setActiveElementId(newPoll.id);
        setShowStickerTray(false);
    }, [nextZ]);

    const addSmartSticker = useCallback((type) => {
        const z = nextZ();
        let content = '';
        if (type === 'mention') content = '@username';
        if (type === 'location') content = 'City, Country';
        if (type === 'link') content = 'www.example.com';

        const newSticker = {
            id: `smart_${Date.now()}`,
            type, content, color: '#ffffff',
            x: 0, y: 0, scale: 1, rotation: 0, zIndex: z,
        };
        setElements(prev => [...prev, newSticker]);
        setActiveElementId(newSticker.id);
        setShowStickerTray(false);
    }, [nextZ]);

    const addPhotoSticker = useCallback((url) => {
        const z = nextZ();
        const newPhoto = {
            id: `photo_${Date.now()}`,
            type: 'photo_sticker',
            content: url,
            shape: 'square',
            x: 0, y: 0, scale: 1, rotation: 0, zIndex: z,
        };
        setElements(prev => [...prev, newPhoto]);
        setActiveElementId(newPhoto.id);
        setShowStickerTray(false);
    }, [nextZ]);

    const cyclePhotoShape = useCallback((id, currentShape) => {
        const currentIdx = PHOTO_SHAPES.indexOf(currentShape || 'square');
        const nextIdx = (currentIdx + 1) % PHOTO_SHAPES.length;
        updateElement(id, { shape: PHOTO_SHAPES[nextIdx] });
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
            window.navigator.vibrate(10);
        }
    }, [updateElement]);

    // ─── Tray Toggles ───────────────────────────────────────────────────────
    const toggleStickerTray = useCallback(() => {
        setShowStickerTray(prev => !prev);
        setActiveElementId(null);
    }, []);

    const toggleFilters = useCallback(() => {
        setShowFilters(prev => !prev);
        setActiveElementId(null);
        setShowStickerTray(false);
    }, []);

    // ─── Canvas Click (deselect) ────────────────────────────────────────────
    const handleCanvasClick = useCallback((e, canvasRef) => {
        if (e.target === canvasRef.current ||
            e.target.classList.contains('story-canvas-bg') ||
            e.target.classList.contains('story-draw-canvas')) {
            setActiveElementId(null);
            setShowStickerTray(false);
            document.activeElement?.blur();
        }
    }, []);

    // ─── Drag Handlers ──────────────────────────────────────────────────────
    const onDragStart = useCallback((elId) => {
        bringToFront(elId);
        setIsDragging(true);
        setDragTrashScale(1);
        setShowStickerTray(false);
    }, [bringToFront]);

    const onDrag = useCallback((el, info, canvasRef) => {
        // Magnetic Trash
        if (info.point.y > window.innerHeight - 100) {
            setDragTrashScale(1.2);
        } else {
            setDragTrashScale(1);
        }

        // Safe Zone Warning
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const relativeY = info.point.y - canvasRect.top;
        const canvasHeight = canvasRect.height;

        if (relativeY < canvasHeight * 0.15 || relativeY > canvasHeight * 0.85) {
            setSafeZoneWarning(true);
        } else {
            setSafeZoneWarning(false);
        }

        // Vertical Center Guide
        const newX = el.x + info.offset.x;
        if (Math.abs(newX) < 5) {
            if (!showCenterGuide) {
                setShowCenterGuide(true);
                if (typeof window !== 'undefined' && window.navigator?.vibrate) {
                    window.navigator.vibrate(10);
                }
            }
        } else {
            setShowCenterGuide(false);
        }

        // Horizontal Center Guide
        const newY = el.y + info.offset.y;
        if (Math.abs(newY) < 5) {
            if (!horizontalCenterGuide) {
                setHorizontalCenterGuide(true);
                if (typeof window !== 'undefined' && window.navigator?.vibrate) {
                    window.navigator.vibrate(10);
                }
            }
        } else {
            setHorizontalCenterGuide(false);
        }
    }, [showCenterGuide, horizontalCenterGuide]);

    const onDragEnd = useCallback((el, info) => {
        setIsDragging(false);
        setDragTrashScale(1);
        setShowCenterGuide(false);
        setHorizontalCenterGuide(false);
        setSafeZoneWarning(false);

        // Delete if dropped on trash zone
        if (info.point.y > window.innerHeight - 100) {
            removeElement(el.id);
            if (typeof window !== 'undefined' && window.navigator?.vibrate) {
                window.navigator.vibrate(10);
            }
            if (el.id === activeElementId) setActiveElementId(null);
        } else {
            // Magnetic Center Snapping
            let finalX = el.x + info.offset.x;
            let finalY = el.y + info.offset.y;
            let snapped = false;

            if (Math.abs(finalX) < 5) { finalX = 0; snapped = true; }
            if (Math.abs(finalY) < 5) { finalY = 0; snapped = true; }

            if (snapped && typeof window !== 'undefined' && window.navigator?.vibrate) {
                window.navigator.vibrate(10);
            }

            updateElement(el.id, { x: finalX, y: finalY });
        }
    }, [activeElementId, removeElement, updateElement]);

    return {
        // State
        elements,
        activeElementId,
        activeElement,
        isEditing,
        isDragging,
        dragTrashScale,
        showStickerTray,
        showFilters,
        showCenterGuide,
        horizontalCenterGuide,
        safeZoneWarning,

        // Setters
        setActiveElementId,
        setShowStickerTray,
        setShowFilters,

        // CRUD
        updateElement,
        removeElement,
        bringToFront,

        // Add helpers
        addText,
        addSticker,
        addPoll,
        addSmartSticker,
        addPhotoSticker,
        cyclePhotoShape,

        // Toggles
        toggleStickerTray,
        toggleFilters,
        handleCanvasClick,

        // Drag
        onDragStart,
        onDrag,
        onDragEnd,
    };
}

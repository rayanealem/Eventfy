import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { instaSpring } from '../../lib/physics';
import './Story.css';

const COLORS = ['#ffffff', '#000000', '#fb5151', '#00ffc2', '#ffd700', '#b484ce'];
const EVENTFY_SHAPES = [
    { content: '○', color: '#fb5151' },
    { content: '△', color: '#00ffc2' },
    { content: '□', color: '#ffd700' },
    { content: '◇', color: '#b484ce' }
];
const EMOJIS = ['🔥', '⚡', '✨', '🎯', '💡', '💯', '🚀', '❤️'];

function getContrastColor(hexColor) {
    if (!hexColor) return '#ffffff';
    // Simplified contrast logic: if it's white or bright yellow/cyan, return black. Otherwise white.
    const darkColors = ['#ffffff', '#00ffc2', '#ffd700'];
    return darkColors.includes(hexColor.toLowerCase()) ? '#000000' : '#ffffff';
}

export default function StoryCreate() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    // The Layer Manager State
    const [bgImage, setBgImage] = useState(null);
    const [bgImagePreview, setBgImagePreview] = useState(null);
    const [elements, setElements] = useState([]);
    const [activeElementId, setActiveElementId] = useState(null);
    const [highestZIndex, setHighestZIndex] = useState(1);
    const [publishing, setPublishing] = useState(false);

    // Premium Features State
    const [isDragging, setIsDragging] = useState(false);
    const [dragTrashScale, setDragTrashScale] = useState(1);
    const [showStickerTray, setShowStickerTray] = useState(false);
    const [showCenterGuide, setShowCenterGuide] = useState(false);

    const canvasRef = useRef(null);

    // Redirect to feed if user isn't logged in (assuming profile is needed)
    if (!profile) return <Navigate to="/feed" replace />;

    // --- Actions ---

    const handleCancel = () => {
        navigate(-1);
    };

    const handleBgImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBgImage(file);
            setBgImagePreview(URL.createObjectURL(file));
        }
    };

    const bringToFront = (id) => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: newZ } : el));
        setActiveElementId(id);
    };

    const handleCanvasClick = (e) => {
        if (e.target === canvasRef.current || e.target.classList.contains('story-canvas-bg')) {
            setActiveElementId(null);
            setShowStickerTray(false);
        }
    };

    const addText = () => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        const newText = {
            id: `text_${Date.now()}`,
            type: 'text',
            content: '',
            color: '#ffffff',
            fontFamily: 'Space Grotesk',
            textStyle: 'plain',
            bgColor: 'transparent',
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newText]);
        setActiveElementId(newText.id);
        setShowStickerTray(false);
    };

    const addSticker = (content, color = '#ffffff') => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        const newSticker = {
            id: `sticker_${Date.now()}`,
            type: 'sticker',
            content: content,
            color: color,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newSticker]);
        setActiveElementId(newSticker.id);
        setShowStickerTray(false);
    };

    const addSmartSticker = (type) => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);

        let content = '';
        if (type === 'mention') content = '@username';
        if (type === 'location') content = 'City, Country';
        if (type === 'link') content = 'www.example.com';

        const newSticker = {
            id: `smart_${Date.now()}`,
            type: type,
            content: content,
            color: '#ffffff', // Not strictly used by smart stickers as they have default styling, but kept for consistency
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newSticker]);
        setActiveElementId(newSticker.id);
        setShowStickerTray(false);
    };

    const toggleStickerTray = () => {
        setShowStickerTray(!showStickerTray);
        setActiveElementId(null);
    };

    const triggerHaptic = () => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }
    };

    const updateElement = (id, updates) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const handlePublish = async () => {
        if (!bgImage) return;
        setPublishing(true);

        try {
            // Upload the background image
            const fileExt = bgImage.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('stories')
                .upload(filePath, bgImage);

            if (uploadError) {
                console.error('Upload Error:', uploadError);
                alert("Failed to upload image");
                setPublishing(false);
                return;
            }

            // Retrieve the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('stories')
                .getPublicUrl(filePath);

            // Create the parent story
            const storyRes = await api('POST', `/stories`, {
                org_id: profile.managed_orgs?.[0]?.id || profile.id, // Fallback if managed_orgs not available
                type: 'announcement',
                badge: '',
                title: 'Story',
                body: '',
                accent: '#ffffff',
                bg: '#000000',
            });

            const storyId = storyRes.id;

            // Prepare the frames payload
            const payload = {
                media_url: publicUrl,
                overlays: elements
            };

            await api('POST', `/stories/${storyId}/frames`, payload);

            navigate(-1);
        } catch (err) {
            console.error('Failed to publish story:', err);
            // We should still navigate back for now or show error
            navigate(-1);
        } finally {
            setPublishing(false);
        }
    };

    const activeElement = elements.find(el => el.id === activeElementId);

    return (
        <div className="story-create-root">
            {/* Top Toolbar */}
            <div className="story-toolbar">
                <button className="toolbar-btn cancel-btn" onClick={handleCancel}>✕</button>
                <div className="toolbar-actions">
                    <button className="toolbar-btn" onClick={addText}>Aa</button>
                    <button className="toolbar-btn" onClick={toggleStickerTray}>🔥</button>
                </div>
            </div>

            {/* Formatting Toolbar (Only for active text) */}
            <AnimatePresence>
                {activeElement && activeElement.type === 'text' && !isDragging && (
                    <motion.div
                        className="story-format-toolbar"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
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
                        </div>
                        <div className="color-picker">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    className={`color-swatch ${activeElement.textStyle === 'solid' ? (activeElement.bgColor === c ? 'active' : '') : (activeElement.color === c ? 'active' : '')}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => {
                                        if (activeElement.textStyle === 'solid') {
                                            updateElement(activeElement.id, { bgColor: c, color: getContrastColor(c) });
                                        } else {
                                            updateElement(activeElement.id, { color: c });
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Canvas */}
            <div
                className="story-canvas"
                ref={canvasRef}
                onClick={handleCanvasClick}
            >
                {/* Center Guide */}
                {showCenterGuide && <div className="story-center-guide" />}

                {!bgImagePreview ? (
                    <label className="story-add-bg">
                        <div className="add-bg-label">+ ADD BACKGROUND</div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBgImageSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                ) : (
                    <img
                        src={bgImagePreview}
                        className="story-canvas-bg"
                        alt="Background"
                    />
                )}

                {/* Elements */}
                {elements.map((el) => {
                    const isActive = el.id === activeElementId;
                    return (
                        <motion.div
                            key={el.id}
                            drag
                            dragConstraints={canvasRef}
                            dragMomentum={false}
                            onDragStart={() => {
                                bringToFront(el.id);
                                setIsDragging(true);
                                setDragTrashScale(1);
                                setShowStickerTray(false);
                            }}
                            onDrag={(event, info) => {
                                // Magnetic Trash
                                if (info.point.y > window.innerHeight - 100) {
                                    setDragTrashScale(1.2);
                                } else {
                                    setDragTrashScale(1);
                                }

                                // Center Guide snapping logic
                                const newX = el.x + info.offset.x;
                                if (Math.abs(newX) < 5) {
                                    if (!showCenterGuide) {
                                        setShowCenterGuide(true);
                                        triggerHaptic();
                                    }
                                } else {
                                    setShowCenterGuide(false);
                                }
                            }}
                            onDragEnd={(event, info) => {
                                setIsDragging(false);
                                setDragTrashScale(1);
                                setShowCenterGuide(false);

                                if (info.point.y > window.innerHeight - 100) {
                                    setElements(prev => prev.filter(item => item.id !== el.id));
                                    triggerHaptic();
                                    if (isActive) setActiveElementId(null);
                                } else {
                                    // Hard Snap to Center
                                    let finalX = el.x + info.offset.x;
                                    if (Math.abs(finalX) < 5) {
                                        finalX = 0;
                                        triggerHaptic();
                                    }

                                    updateElement(el.id, {
                                        x: finalX,
                                        y: el.y + info.offset.y
                                    });
                                }
                            }}
                            className={`story-element ${isActive ? 'active' : ''}`}
                            style={{
                                zIndex: el.zIndex,
                                x: `calc(-50% + ${el.x}px)`,
                                y: `calc(-50% + ${el.y}px)`,
                                scale: el.scale,
                                rotate: el.rotation,
                            }}
                            transition={instaSpring}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                bringToFront(el.id);
                            }}
                        >
                            {el.type === 'text' && (
                                <input
                                    type="text"
                                    className={`story-text-input ${el.textStyle === 'solid' ? 'solid-bg' : ''}`}
                                    value={el.content}
                                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                    autoFocus={isActive}
                                    style={{
                                        color: el.color,
                                        fontFamily: el.fontFamily,
                                        backgroundColor: el.textStyle === 'solid' ? el.bgColor : 'transparent',
                                        padding: el.textStyle === 'solid' ? '8px 16px' : '0',
                                        borderRadius: el.textStyle === 'solid' ? '12px' : '0'
                                    }}
                                    placeholder="Type something..."
                                />
                            )}
                            {el.type === 'sticker' && (
                                <span className="story-sticker" style={{ color: el.color }}>
                                    {el.content}
                                </span>
                            )}
                            {['mention', 'location', 'link'].includes(el.type) && (
                                <div className={`story-smart-sticker story-smart-${el.type}`}>
                                    {el.type === 'mention' && '👤 '}
                                    {el.type === 'location' && '📍 '}
                                    {el.type === 'link' && '🔗 '}
                                    <input
                                        type="text"
                                        value={el.content}
                                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                        autoFocus={isActive}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: 'inherit',
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                            fontWeight: 'inherit',
                                            width: `${Math.max(el.content.length, 5)}ch` // Auto-grow basic approximation
                                        }}
                                    />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Magnetic Trash Zone */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        className="story-trash-zone"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, scale: dragTrashScale }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <div className="trash-icon">🗑️</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticker Tray Bottom Sheet */}
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

            {/* Bottom Actions (Publish) */}
            <div className="story-bottom-bar">
                <button
                    className="publish-btn"
                    onClick={handlePublish}
                    disabled={!bgImage || publishing}
                >
                    {publishing ? 'PUBLISHING...' : 'PUBLISH'}
                </button>
            </div>
        </div>
    );
}

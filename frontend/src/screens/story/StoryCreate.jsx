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
    const [isVideo, setIsVideo] = useState(false);
    const [videoDuration, setVideoDuration] = useState(5000); // ms, default for images
    const [elements, setElements] = useState([]);
    const [activeElementId, setActiveElementId] = useState(null);
    const [highestZIndex, setHighestZIndex] = useState(1);
    const [publishing, setPublishing] = useState(false);

    // Premium Features State
    const [isDragging, setIsDragging] = useState(false);
    const [dragTrashScale, setDragTrashScale] = useState(1);
    const [showStickerTray, setShowStickerTray] = useState(false);
    const [showCenterGuide, setShowCenterGuide] = useState(false);

    // Draw Engine State
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [strokes, setStrokes] = useState([]); // Array of stroke image data URLs for undo
    const drawCanvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawingRef = useRef(false);
    const [brushColor, setBrushColor] = useState('#ffffff');

    // Filter Engine State
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilter, setActiveFilter] = useState('none');

    const FILTERS = [
        { name: 'Normal', css: 'none' },
        { name: 'B&W', css: 'grayscale(100%)' },
        { name: 'Vintage', css: 'sepia(80%)' },
        { name: 'Vivid', css: 'contrast(120%) saturate(150%)' },
        { name: 'Blur', css: 'blur(4px)' }
    ];

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
            // Video Validation
            if (file.type.startsWith('video/')) {
                if (file.size > 20 * 1024 * 1024) { // 20MB
                    alert("Video exceeds 20MB maximum size limit.");
                    return;
                }

                const tempVideo = document.createElement('video');
                tempVideo.preload = 'metadata';
                tempVideo.onloadedmetadata = function() {
                    window.URL.revokeObjectURL(tempVideo.src);
                    if (tempVideo.duration > 15) {
                        alert("Video exceeds 15 seconds maximum duration limit.");
                    } else {
                        setIsVideo(true);
                        setVideoDuration(Math.round(tempVideo.duration * 1000));
                        setBgImage(file);
                        setBgImagePreview(URL.createObjectURL(file));
                    }
                }
                tempVideo.src = URL.createObjectURL(file);
            } else {
                setIsVideo(false);
                setVideoDuration(5000);
                setBgImage(file);
                setBgImagePreview(URL.createObjectURL(file));
            }
        }
    };

    // --- Drawing Engine Methods ---
    useEffect(() => {
        if (drawCanvasRef.current) {
            const canvas = drawCanvasRef.current;
            // Set explicit dimensions to avoid stretching
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 6;
            ctxRef.current = ctx;
        }
    }, [bgImagePreview]); // Re-init when canvas container mounts

    const saveStrokeState = () => {
        if (!drawCanvasRef.current) return;
        setStrokes(prev => [...prev, drawCanvasRef.current.toDataURL()]);
    };

    const handleUndo = () => {
        if (strokes.length === 0 || !ctxRef.current || !drawCanvasRef.current) return;
        const newStrokes = [...strokes];
        newStrokes.pop(); // Remove current state
        setStrokes(newStrokes);

        const ctx = ctxRef.current;
        const canvas = drawCanvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (newStrokes.length > 0) {
            const img = new Image();
            img.src = newStrokes[newStrokes.length - 1];
            img.onload = () => ctx.drawImage(img, 0, 0);
        }
    };

    const startDrawing = (e) => {
        if (!isDrawingMode || !ctxRef.current) return;
        const { offsetX, offsetY } = getPointerPos(e);
        ctxRef.current.strokeStyle = brushColor;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        isDrawingRef.current = true;
    };

    const draw = (e) => {
        if (!isDrawingRef.current || !ctxRef.current) return;
        const { offsetX, offsetY } = getPointerPos(e);
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawingRef.current || !ctxRef.current) return;
        ctxRef.current.closePath();
        isDrawingRef.current = false;
        saveStrokeState();
    };

    const getPointerPos = (e) => {
        const canvas = drawCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        // Handle both touch and mouse events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const toggleDrawingMode = () => {
        setIsDrawingMode(!isDrawingMode);
        setActiveElementId(null);
        setShowStickerTray(false);
        setShowFilters(false);
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
        setActiveElementId(null);
        setIsDrawingMode(false);
        setShowStickerTray(false);
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

    const addPoll = () => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        const newPoll = {
            id: `poll_${Date.now()}`,
            type: 'poll',
            content: { question: 'Ask a question...', optA: 'Yes', optB: 'No' },
            color: '#000000',
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newPoll]);
        setActiveElementId(newPoll.id);
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
            // Include Drawing Canvas as an overlay element if strokes exist
            let finalElements = [...elements];
            if (strokes.length > 0 && drawCanvasRef.current) {
                const drawDataUrl = drawCanvasRef.current.toDataURL();
                finalElements.push({
                    id: `drawing_${Date.now()}`,
                    type: 'image',
                    content: drawDataUrl, // DataURL of the drawing
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotation: 0,
                    zIndex: 0 // Ensure drawing is behind interactive elements (which start at zIndex 1)
                });
            }

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
                media_type: isVideo ? 'video' : 'image',
                duration_ms: videoDuration,
                overlays: finalElements,
                filter_css: activeFilter
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
                {isDrawingMode ? (
                    <div className="toolbar-actions">
                        <button className="toolbar-btn" onClick={handleUndo}>↩️</button>
                        <button className="toolbar-btn" onClick={toggleDrawingMode}>Done</button>
                    </div>
                ) : (
                    <div className="toolbar-actions">
                        <button className="toolbar-btn" onClick={toggleDrawingMode}>🖌️</button>
                        <button className="toolbar-btn" onClick={toggleFilters}>✨</button>
                        <button className="toolbar-btn" onClick={addPoll}>📊</button>
                        <button className="toolbar-btn" onClick={addText}>Aa</button>
                        <button className="toolbar-btn" onClick={toggleStickerTray}>🔥</button>
                    </div>
                )}
            </div>

            {/* Formatting Toolbar (For active text OR drawing mode) */}
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
                            accept="image/*,video/mp4,video/webm"
                            onChange={handleBgImageSelect}
                            style={{ display: 'none' }}
                        />
                    </label>
                ) : (
                    <>
                        {isVideo ? (
                            <video
                                src={bgImagePreview}
                                className="story-canvas-bg"
                                style={{ filter: activeFilter }}
                                autoPlay
                                loop
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={bgImagePreview}
                                className="story-canvas-bg"
                                style={{ filter: activeFilter }}
                                alt="Background"
                            />
                        )}
                        {/* Drawing Canvas Overlay */}
                        <canvas
                            ref={drawCanvasRef}
                            className={`story-draw-canvas ${isDrawingMode ? 'drawing-active' : ''}`}
                            onPointerDown={startDrawing}
                            onPointerMove={draw}
                            onPointerUp={stopDrawing}
                            onPointerOut={stopDrawing}
                        />
                    </>
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
                            {el.type === 'poll' && (
                                <div className="story-poll-widget">
                                    <input
                                        type="text"
                                        className="story-poll-question"
                                        value={el.content.question}
                                        onChange={(e) => updateElement(el.id, { content: { ...el.content, question: e.target.value } })}
                                        placeholder="Ask a question..."
                                    />
                                    <div className="story-poll-options">
                                        <div className="story-poll-option">
                                            <input
                                                type="text"
                                                value={el.content.optA}
                                                onChange={(e) => updateElement(el.id, { content: { ...el.content, optA: e.target.value } })}
                                            />
                                        </div>
                                        <div className="story-poll-option">
                                            <input
                                                type="text"
                                                value={el.content.optB}
                                                onChange={(e) => updateElement(el.id, { content: { ...el.content, optB: e.target.value } })}
                                            />
                                        </div>
                                    </div>
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

            {/* Filter Tray */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        className="story-filter-tray"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <div className="filter-scroll">
                            {FILTERS.map(f => (
                                <div
                                    key={f.name}
                                    className={`filter-item ${activeFilter === f.css ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(f.css)}
                                >
                                    <div
                                        className="filter-preview"
                                        style={{
                                            backgroundImage: `url(${bgImagePreview})`,
                                            filter: f.css
                                        }}
                                    />
                                    <span>{f.name}</span>
                                </div>
                            ))}
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

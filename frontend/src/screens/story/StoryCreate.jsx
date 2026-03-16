import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { instaSpring } from '../../lib/physics';
import StickerTray from './components/StickerTray';
import FilterTray from './components/FilterTray';
import FormatToolbar from './components/FormatToolbar';
import { downloadStoryImage } from '../../lib/canvasUtils';
import './StoryCreate.css';

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
    const [audioFile, setAudioFile] = useState(null);

    // WebRTC Live Camera State
    const videoRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(false);

    // Premium Features State
    const [isDragging, setIsDragging] = useState(false);
    const [dragTrashScale, setDragTrashScale] = useState(1);
    const [showStickerTray, setShowStickerTray] = useState(false);
    const [showCenterGuide, setShowCenterGuide] = useState(false);
    const [horizontalCenterGuide, setHorizontalCenterGuide] = useState(false);
    const [safeZoneWarning, setSafeZoneWarning] = useState(false);

    // Draw Engine State
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [strokes, setStrokes] = useState([]); // Array of stroke image data URLs for undo
    const drawCanvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawingRef = useRef(false);
    const [brushColor, setBrushColor] = useState('#ffffff');
    const [brushType, setBrushType] = useState('normal'); // 'normal', 'neon', 'eraser'
    const [brushSize, setBrushSize] = useState(6);

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
    const audioInputRef = useRef(null);

    // Redirect to feed if user isn't logged in (assuming profile is needed)
    if (!profile) return <Navigate to="/feed" replace />;

    // --- WebRTC Camera ---
    useEffect(() => {
        if (!bgImage && !cameraError) {
            startCamera();
        }
        return () => stopCamera(); // Cleanup on unmount or when bgImage is set
    }, [bgImage, cameraError]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (err) {
            console.error('WebRTC Camera failed:', err);
            setCameraError(true);
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            setIsCameraActive(false);
        }
    };

    const captureLiveFrame = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setIsVideo(false);
            setVideoDuration(5000);
            setBgImage(file);
            setBgImagePreview(URL.createObjectURL(file));
            stopCamera();
        }, 'image/jpeg', 0.9);
    };

    // --- Actions ---

    const handleCancel = () => {
        navigate(-1);
    };

    const handleDownload = () => {
        const prevActive = activeElementId;
        setActiveElementId(null);
        setShowCenterGuide(false);

        downloadStoryImage(
            canvasRef.current,
            'eventfy_story.png',
            null, // hideUI callback not strictly needed if we just null out state above
            () => { setActiveElementId(prevActive); } // restoreUI
        );
    };

    const handleAudioSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate Audio
            if (file.size > 5 * 1024 * 1024) { // 5MB
                alert("Audio exceeds 5MB maximum size limit.");
                return;
            }

            const tempAudio = document.createElement('audio');
            tempAudio.preload = 'metadata';
            tempAudio.onloadedmetadata = function() {
                window.URL.revokeObjectURL(tempAudio.src);
                if (tempAudio.duration > 15) {
                    alert("Audio exceeds 15 seconds maximum duration limit.");
                } else {
                    setAudioFile(file);
                    triggerHaptic();
                }
            }
            tempAudio.src = URL.createObjectURL(file);
        }
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

        const ctx = ctxRef.current;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (brushType === 'normal') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
            ctx.shadowBlur = 0;
        } else if (brushType === 'neon') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = brushColor;
        } else if (brushType === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
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
        if (e.target === canvasRef.current || e.target.classList.contains('story-canvas-bg') || e.target.classList.contains('story-draw-canvas')) {
            setActiveElementId(null);
            setShowStickerTray(false);
            document.activeElement?.blur();
        }
    };

    const isEditing = activeElementId !== null || isDragging;

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
            textAlign: 'center',
            animationType: 'none',
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

    const addPhotoSticker = (url) => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        const newPhoto = {
            id: `photo_${Date.now()}`,
            type: 'photo_sticker',
            content: url, // Local blob URL or remote URL
            shape: 'square',
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newPhoto]);
        setActiveElementId(newPhoto.id);
        setShowStickerTray(false);
    };

    const cyclePhotoShape = (id, currentShape) => {
        const shapes = ['square', 'rounded', 'circle', 'star'];
        const currentIdx = shapes.indexOf(currentShape || 'square');
        const nextIdx = (currentIdx + 1) % shapes.length;
        updateElement(id, { shape: shapes[nextIdx] });
        triggerHaptic();
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

            let audioUrl = null;
            if (audioFile) {
                const audioExt = audioFile.name.split('.').pop();
                const audioFileName = `audio_${Date.now()}-${Math.random().toString(36).substring(7)}.${audioExt}`;
                const audioFilePath = `uploads/${audioFileName}`;

                const { data: audioUploadData, error: audioUploadError } = await supabase.storage
                    .from('stories')
                    .upload(audioFilePath, audioFile);

                if (!audioUploadError) {
                    const { data: { publicUrl: audioPublicUrl } } = supabase.storage
                        .from('stories')
                        .getPublicUrl(audioFilePath);
                    audioUrl = audioPublicUrl;
                } else {
                    console.error('Audio Upload Error:', audioUploadError);
                }
            }

            // Prepare the frames payload
            const payload = {
                media_url: publicUrl,
                media_type: isVideo ? 'video' : 'image',
                duration_ms: videoDuration,
                overlays: finalElements,
                filter_css: activeFilter,
                audio_url: audioUrl
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
            {/* Top Toolbar (Auto-Hides when editing) */}
            <AnimatePresence>
                {!isEditing && (
                    <motion.div
                        className="story-toolbar"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="toolbar-actions">
                            <button className="toolbar-btn cancel-btn" onClick={handleCancel}>✕</button>
                        </div>
                        {isDrawingMode ? (
                            <div className="toolbar-actions">
                                <button className="toolbar-btn" onClick={handleUndo}>↩️</button>
                                <button
                                    className="toolbar-btn"
                                    style={{ border: brushType === 'normal' ? '2px solid white' : 'none', borderRadius: '50%', width: 32, height: 32 }}
                                    onClick={() => setBrushType('normal')}
                                >🖊️</button>
                                <button
                                    className="toolbar-btn"
                                    style={{ border: brushType === 'neon' ? '2px solid white' : 'none', borderRadius: '50%', width: 32, height: 32 }}
                                    onClick={() => setBrushType('neon')}
                                >✨</button>
                                <button
                                    className="toolbar-btn"
                                    style={{ border: brushType === 'eraser' ? '2px solid white' : 'none', borderRadius: '50%', width: 32, height: 32 }}
                                    onClick={() => setBrushType('eraser')}
                                >🧼</button>
                                <button className="toolbar-btn" onClick={toggleDrawingMode} style={{ marginLeft: 16 }}>Done</button>
                            </div>
                        ) : (
                            <div className="toolbar-actions">
                                <button className="toolbar-btn" onClick={handleDownload} title="Download">⬇️</button>
                                <button className="toolbar-btn" onClick={toggleDrawingMode}>🖌️</button>
                                <button className="toolbar-btn" onClick={toggleFilters}>✨</button>
                                <button
                                    className="toolbar-btn"
                                    onClick={() => audioInputRef.current?.click()}
                                    style={{ color: audioFile ? '#00ffc2' : 'white' }}
                                >
                                    🎵
                                </button>
                                <button className="toolbar-btn" onClick={addPoll}>📊</button>
                                <button className="toolbar-btn" onClick={addText}>Aa</button>
                                <button className="toolbar-btn" onClick={toggleStickerTray}>🔥</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Audio Input */}
            <input
                type="file"
                ref={audioInputRef}
                accept="audio/*"
                onChange={handleAudioSelect}
                style={{ display: 'none' }}
            />

            {/* Formatting Toolbar (For active text OR drawing mode) */}
            <FormatToolbar
                activeElement={activeElement}
                isDrawingMode={isDrawingMode}
                isDragging={isDragging}
                updateElement={updateElement}
                COLORS={COLORS}
                brushColor={brushColor}
                setBrushColor={setBrushColor}
                ctxRef={ctxRef}
                getContrastColor={getContrastColor}
            />

            {/* Canvas */}
            <div
                className="story-canvas"
                ref={canvasRef}
                onClick={handleCanvasClick}
            >
                {/* Safe Zones (Only visible when dragging) */}
                <AnimatePresence>
                    {isDragging && (
                        <>
                            <motion.div
                                className="story-safe-zone story-safe-zone-top"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, backgroundColor: safeZoneWarning ? 'rgba(255, 0, 0, 0.2)' : 'transparent', borderBottomColor: safeZoneWarning ? '#ff3b30' : 'rgba(255,255,255,0.3)' }}
                                exit={{ opacity: 0 }}
                            />
                            <motion.div
                                className="story-safe-zone story-safe-zone-bottom"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, backgroundColor: safeZoneWarning ? 'rgba(255, 0, 0, 0.2)' : 'transparent', borderTopColor: safeZoneWarning ? '#ff3b30' : 'rgba(255,255,255,0.3)' }}
                                exit={{ opacity: 0 }}
                            />
                        </>
                    )}
                </AnimatePresence>

                {/* Center Guides */}
                {showCenterGuide && <div className="story-center-guide" />}
                {horizontalCenterGuide && <div className="story-horizontal-guide" />}

                {!bgImagePreview ? (
                    isCameraActive ? (
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="story-canvas-bg"
                                style={{ objectFit: 'cover' }}
                            />
                            <button className="shutter-btn" onClick={captureLiveFrame}>
                                <div className="shutter-inner" />
                            </button>
                        </>
                    ) : (
                        <label className="story-add-bg">
                            <div className="add-bg-label">+ ADD BACKGROUND</div>
                            <input
                                type="file"
                                accept="image/*,video/mp4,video/webm"
                                onChange={handleBgImageSelect}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )
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

                                // Safe Zone Warning logic
                                const canvasRect = canvasRef.current.getBoundingClientRect();
                                // We need relative Y within the canvas
                                // info.point is relative to the viewport
                                const relativeY = info.point.y - canvasRect.top;
                                const canvasHeight = canvasRect.height;

                                if (relativeY < canvasHeight * 0.15 || relativeY > canvasHeight * 0.85) {
                                    setSafeZoneWarning(true);
                                } else {
                                    setSafeZoneWarning(false);
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

                                const newY = el.y + info.offset.y;
                                if (Math.abs(newY) < 5) {
                                    if (!horizontalCenterGuide) {
                                        setHorizontalCenterGuide(true);
                                        triggerHaptic();
                                    }
                                } else {
                                    setHorizontalCenterGuide(false);
                                }
                            }}
                            onDragEnd={(event, info) => {
                                setIsDragging(false);
                                setDragTrashScale(1);
                                setShowCenterGuide(false);
                                setHorizontalCenterGuide(false);
                                setSafeZoneWarning(false);

                                if (info.point.y > window.innerHeight - 100) {
                                    setElements(prev => prev.filter(item => item.id !== el.id));
                                    triggerHaptic();
                                    if (isActive) setActiveElementId(null);
                                } else {
                                    // True Magnetic Center Snapping
                                    let finalX = el.x + info.offset.x;
                                    let finalY = el.y + info.offset.y;

                                    let snapped = false;
                                    if (Math.abs(finalX) < 5) {
                                        finalX = 0;
                                        snapped = true;
                                    }
                                    if (Math.abs(finalY) < 5) {
                                        finalY = 0;
                                        snapped = true;
                                    }

                                    if (snapped) {
                                        triggerHaptic();
                                    }

                                    updateElement(el.id, {
                                        x: finalX,
                                        y: finalY
                                    });
                                }
                            }}
                            className={`story-element ${isActive ? 'active' : ''}`}
                            style={{
                                zIndex: el.zIndex,
                                x: el.x,
                                y: el.y,
                                scale: el.scale,
                                rotate: el.rotation,
                            }}
                            transition={instaSpring}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                bringToFront(el.id);
                            }}
                        >
                            <div className={`story-element-anchor-content anim-${el.animationType || 'none'}`}>
                            {el.type === 'text' && (
                                <textarea
                                    className={`story-text-input ${el.textStyle === 'solid' ? 'solid-bg' : ''} ${el.textStyle === 'translucent' ? 'translucent-bg' : ''}`}
                                    value={el.content}
                                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                    autoFocus={isActive}
                                    style={{
                                        color: el.color,
                                        fontFamily: el.fontFamily,
                                        backgroundColor: el.textStyle === 'solid' ? el.bgColor : 'transparent',
                                        padding: el.textStyle !== 'plain' ? '8px 16px' : '0',
                                        borderRadius: el.textStyle !== 'plain' ? '12px' : '0',
                                        textAlign: el.textAlign || 'center',
                                        pointerEvents: isDragging ? 'none' : 'auto',
                                        userSelect: isDragging ? 'none' : 'auto',
                                        width: `${Math.max(el.content.length, 5)}ch`, // rudimentary width matching
                                        height: 'auto',
                                        minHeight: '1.2em'
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
                                            width: `${Math.max(el.content.length, 5)}ch`, // Auto-grow basic approximation
                                            pointerEvents: isDragging ? 'none' : 'auto',
                                            userSelect: isDragging ? 'none' : 'auto'
                                        }}
                                    />
                                </div>
                            )}
                            {el.type === 'photo_sticker' && (
                                <img
                                    src={el.content}
                                    alt="Sticker"
                                    className={`story-photo-sticker shape-${el.shape || 'square'}`}
                                    onClick={(e) => {
                                        if (isActive && !isDragging) {
                                            e.stopPropagation();
                                            cyclePhotoShape(el.id, el.shape);
                                        }
                                    }}
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'cover',
                                        pointerEvents: isDragging ? 'none' : 'auto',
                                    }}
                                />
                            )}
                            {el.type === 'poll' && (
                                <div className="story-poll-widget" style={{ pointerEvents: isDragging ? 'none' : 'auto', userSelect: isDragging ? 'none' : 'auto' }}>
                                    <input
                                        type="text"
                                        className="story-poll-question"
                                        value={el.content.question}
                                        onChange={(e) => updateElement(el.id, { content: { ...el.content, question: e.target.value } })}
                                        placeholder="Ask a question..."
                                        style={{ pointerEvents: isDragging ? 'none' : 'auto', userSelect: isDragging ? 'none' : 'auto' }}
                                    />
                                    <div className="story-poll-options">
                                        <div className="story-poll-option">
                                            <input
                                                type="text"
                                                value={el.content.optA}
                                                onChange={(e) => updateElement(el.id, { content: { ...el.content, optA: e.target.value } })}
                                                style={{ pointerEvents: isDragging ? 'none' : 'auto', userSelect: isDragging ? 'none' : 'auto' }}
                                            />
                                        </div>
                                        <div className="story-poll-option">
                                            <input
                                                type="text"
                                                value={el.content.optB}
                                                onChange={(e) => updateElement(el.id, { content: { ...el.content, optB: e.target.value } })}
                                                style={{ pointerEvents: isDragging ? 'none' : 'auto', userSelect: isDragging ? 'none' : 'auto' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            </div>
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
            <StickerTray
                showStickerTray={showStickerTray}
                addSmartSticker={addSmartSticker}
                addSticker={addSticker}
                addPhotoSticker={addPhotoSticker}
                EVENTFY_SHAPES={EVENTFY_SHAPES}
                EMOJIS={EMOJIS}
            />

            {/* Precision Scale Slider (Or Brush Size Slider) */}
            <AnimatePresence>
                {(activeElementId !== null || isDrawingMode) && !isDragging && (
                    <motion.div
                        className="story-scale-slider-wrap"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {isDrawingMode ? (
                            <input
                                type="range"
                                min="2"
                                max="30"
                                step="1"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="story-scale-slider"
                                orient="vertical"
                            />
                        ) : (
                            <input
                                type="range"
                                min="0.5"
                                max="4.0"
                                step="0.1"
                                value={activeElement ? activeElement.scale : 1}
                                onChange={(e) => updateElement(activeElementId, { scale: parseFloat(e.target.value) })}
                                className="story-scale-slider"
                                orient="vertical"
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Tray */}
            <FilterTray
                showFilters={showFilters}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                FILTERS={FILTERS}
                bgImagePreview={bgImagePreview}
            />

            {/* Bottom Actions (Publish) (Auto-Hides when editing) */}
            <AnimatePresence>
                {!isEditing && !isDrawingMode && !showFilters && (
                    <motion.div
                        className="story-bottom-bar"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <button
                            className="publish-btn"
                            onClick={handlePublish}
                            disabled={!bgImage || publishing}
                        >
                            {publishing ? 'PUBLISHING...' : 'PUBLISH'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

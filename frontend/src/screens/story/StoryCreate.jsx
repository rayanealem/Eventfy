import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import useCamera from './hooks/useCamera';
import useDrawingEngine from './hooks/useDrawingEngine';
import useElementManager from './hooks/useElementManager';

// Components
import CameraView from './components/CameraView';
import DrawingCanvas from './components/DrawingCanvas';
import CanvasElements from './components/CanvasElements';
import SafeZones from './components/SafeZones';
import TrashZone from './components/TrashZone';
import StickerTray from './components/StickerTray';
import FilterTray from './components/FilterTray';
import FormatToolbar from './components/FormatToolbar';
import ScaleSlider from './components/ScaleSlider';
import PublishBar from './components/PublishBar';

// Constants
import { COLORS, EVENTFY_SHAPES, EMOJIS, FILTERS, getContrastColor } from './constants';

import './StoryCreate.css';

export default function StoryCreate() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    // Background state
    const [bgImage, setBgImage] = useState(null);
    const [bgImagePreview, setBgImagePreview] = useState(null);
    const [isVideo, setIsVideo] = useState(false);
    const [videoDuration, setVideoDuration] = useState(5000);
    const [publishing, setPublishing] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [activeFilter, setActiveFilter] = useState('none');

    const canvasRef = useRef(null);
    const audioInputRef = useRef(null);

    // Hooks
    const camera = useCamera(bgImage);
    const drawing = useDrawingEngine(bgImagePreview);
    const elements = useElementManager();

    // ─── Media Selection ────────────────────────────────────────────────────
    const handleBgImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('video/')) {
            if (file.size > 20 * 1024 * 1024) { alert("Video exceeds 20MB limit."); return; }
            const tempVideo = document.createElement('video');
            tempVideo.preload = 'metadata';
            tempVideo.onloadedmetadata = function () {
                window.URL.revokeObjectURL(tempVideo.src);
                if (tempVideo.duration > 15) { alert("Video exceeds 15s limit."); return; }
                setIsVideo(true);
                setVideoDuration(Math.round(tempVideo.duration * 1000));
                setBgImage(file);
                setBgImagePreview(URL.createObjectURL(file));
            };
            tempVideo.src = URL.createObjectURL(file);
        } else {
            setIsVideo(false);
            setVideoDuration(5000);
            setBgImage(file);
            setBgImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCameraCapture = async () => {
        const result = await camera.captureLiveFrame();
        if (result) {
            setBgImage(result.file);
            setBgImagePreview(result.preview);
            setIsVideo(result.isVideo);
            setVideoDuration(result.duration);
        }
    };

    const handleAudioSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert("Audio exceeds 5MB limit."); return; }
        const tempAudio = document.createElement('audio');
        tempAudio.preload = 'metadata';
        tempAudio.onloadedmetadata = function () {
            window.URL.revokeObjectURL(tempAudio.src);
            if (tempAudio.duration > 15) { alert("Audio exceeds 15s limit."); return; }
            setAudioFile(file);
        };
        tempAudio.src = URL.createObjectURL(file);
    };

    // ─── Download ───────────────────────────────────────────────────────────
    const handleDownload = () => {
        const prevActive = elements.activeElementId;
        elements.setActiveElementId(null);
        import('../../lib/canvasUtils').then(({ downloadStoryImage }) => {
            downloadStoryImage(canvasRef.current, 'eventfy_story.png', null, () => {
                elements.setActiveElementId(prevActive);
            });
        });
    };

    // ─── Mode Toggles ───────────────────────────────────────────────────────
    const toggleDrawingMode = () => {
        drawing.toggleDrawingMode();
        elements.setActiveElementId(null);
        elements.setShowStickerTray(false);
        elements.setShowFilters(false);
    };

    const toggleFilters = () => {
        elements.toggleFilters();
        drawing.isDrawingMode && drawing.toggleDrawingMode();
    };

    // ─── Publish ────────────────────────────────────────────────────────────
    const handlePublish = async () => {
        if (!bgImage) return;
        setPublishing(true);

        try {
            // Include drawing as overlay if exists
            let finalElements = [...elements.elements];
            const drawingData = drawing.getDrawingDataUrl();
            if (drawingData) {
                finalElements.push({
                    id: `drawing_${Date.now()}`, type: 'image', content: drawingData,
                    x: 0, y: 0, scale: 1, rotation: 0, zIndex: 0
                });
            }

            // Upload background
            const fileExt = bgImage.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('stories').upload(filePath, bgImage);
            if (uploadError) { console.error('Upload Error:', uploadError); alert("Failed to upload image"); setPublishing(false); return; }

            const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(filePath);

            // Create story
            const storyRes = await api('POST', `/stories`, {
                org_id: profile.managed_orgs?.[0]?.id || profile.id,
                type: 'announcement', badge: '', title: 'Story', body: '', accent: '#ffffff', bg: '#000000',
            });

            // Upload audio if present
            let audioUrl = null;
            if (audioFile) {
                const audioExt = audioFile.name.split('.').pop();
                const audioPath = `uploads/audio_${Date.now()}-${Math.random().toString(36).substring(7)}.${audioExt}`;
                const { error: audioErr } = await supabase.storage.from('stories').upload(audioPath, audioFile);
                if (!audioErr) {
                    const { data: { publicUrl: aUrl } } = supabase.storage.from('stories').getPublicUrl(audioPath);
                    audioUrl = aUrl;
                }
            }

            // Create frame
            await api('POST', `/stories/${storyRes.id}/frames`, {
                media_url: publicUrl, media_type: isVideo ? 'video' : 'image',
                duration_ms: videoDuration, overlays: finalElements,
                filter_css: activeFilter, audio_url: audioUrl
            });

            navigate(-1);
        } catch (err) {
            console.error('Failed to publish story:', err);
            navigate(-1);
        } finally {
            setPublishing(false);
        }
    };

    const isEditing = elements.isEditing;

    return (
        <div className="story-create-root">
            {/* Top Toolbar */}
            <AnimatePresence>
                {!isEditing && (
                    <motion.div className="story-toolbar" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div className="toolbar-actions">
                            <button className="toolbar-btn cancel-btn" onClick={() => navigate(-1)}>✕</button>
                        </div>
                        {drawing.isDrawingMode ? (
                            <div className="toolbar-actions">
                                <button className="toolbar-btn" onClick={drawing.handleUndo}>↩️</button>
                                <button className="toolbar-btn" style={{ border: drawing.brushType === 'normal' ? '2px solid white' : 'none', borderRadius: '50%', width: 32, height: 32 }} onClick={() => drawing.setBrushType('normal')}>🖊️</button>
                                <button className="toolbar-btn" style={{ border: drawing.brushType === 'neon' ? '2px solid white' : 'none', borderRadius: '50%', width: 32, height: 32 }} onClick={() => drawing.setBrushType('neon')}>✨</button>
                                <button className="toolbar-btn" style={{ border: drawing.brushType === 'eraser' ? '2px solid white' : 'none', borderRadius: '50%', width: 32, height: 32 }} onClick={() => drawing.setBrushType('eraser')}>🧼</button>
                                <button className="toolbar-btn" onClick={toggleDrawingMode} style={{ marginLeft: 16 }}>Done</button>
                            </div>
                        ) : (
                            <div className="toolbar-actions">
                                <button className="toolbar-btn" onClick={handleDownload} title="Download">⬇️</button>
                                <button className="toolbar-btn" onClick={toggleDrawingMode}>🖌️</button>
                                <button className="toolbar-btn" onClick={toggleFilters}>✨</button>
                                <button className="toolbar-btn" onClick={() => audioInputRef.current?.click()} style={{ color: audioFile ? '#00ffc2' : 'white' }}>🎵</button>
                                <button className="toolbar-btn" onClick={elements.addPoll}>📊</button>
                                <button className="toolbar-btn" onClick={elements.addText}>Aa</button>
                                <button className="toolbar-btn" onClick={elements.toggleStickerTray}>🔥</button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hidden Audio Input */}
            <input type="file" ref={audioInputRef} accept="audio/*" onChange={handleAudioSelect} style={{ display: 'none' }} />

            {/* Format Toolbar */}
            <FormatToolbar
                activeElement={elements.activeElement}
                isDrawingMode={drawing.isDrawingMode}
                isDragging={elements.isDragging}
                updateElement={elements.updateElement}
                COLORS={COLORS}
                brushColor={drawing.brushColor}
                setBrushColor={drawing.setBrushColor}
                ctxRef={drawing.ctxRef}
                getContrastColor={getContrastColor}
            />

            {/* Canvas */}
            <div className="story-canvas" ref={canvasRef} onClick={(e) => elements.handleCanvasClick(e, canvasRef)}>
                <SafeZones isDragging={elements.isDragging} safeZoneWarning={elements.safeZoneWarning} showCenterGuide={elements.showCenterGuide} horizontalCenterGuide={elements.horizontalCenterGuide} />

                {!bgImagePreview ? (
                    <CameraView videoRef={camera.videoRef} isCameraActive={camera.isCameraActive} cameraError={camera.cameraError} onCapture={handleCameraCapture} onSelectFile={handleBgImageSelect} />
                ) : (
                    <>
                        {isVideo ? (
                            <video src={bgImagePreview} className="story-canvas-bg" style={{ filter: activeFilter }} autoPlay loop muted playsInline />
                        ) : (
                            <img src={bgImagePreview} className="story-canvas-bg" style={{ filter: activeFilter }} alt="Background" />
                        )}
                        <DrawingCanvas drawCanvasRef={drawing.drawCanvasRef} isDrawingMode={drawing.isDrawingMode} startDrawing={drawing.startDrawing} draw={drawing.draw} stopDrawing={drawing.stopDrawing} />
                    </>
                )}

                <CanvasElements
                    elements={elements.elements}
                    activeElementId={elements.activeElementId}
                    isDragging={elements.isDragging}
                    canvasRef={canvasRef}
                    updateElement={elements.updateElement}
                    bringToFront={elements.bringToFront}
                    onDragStart={elements.onDragStart}
                    onDrag={elements.onDrag}
                    onDragEnd={elements.onDragEnd}
                    cyclePhotoShape={elements.cyclePhotoShape}
                />
            </div>

            {/* Trash Zone */}
            <TrashZone isDragging={elements.isDragging} dragTrashScale={elements.dragTrashScale} />

            {/* Sticker Tray */}
            <StickerTray showStickerTray={elements.showStickerTray} addSmartSticker={elements.addSmartSticker} addSticker={elements.addSticker} addPhotoSticker={elements.addPhotoSticker} EVENTFY_SHAPES={EVENTFY_SHAPES} EMOJIS={EMOJIS} />

            {/* Scale Slider */}
            <ScaleSlider
                visible={(elements.activeElementId !== null || drawing.isDrawingMode) && !elements.isDragging}
                isDrawingMode={drawing.isDrawingMode}
                brushSize={drawing.brushSize}
                setBrushSize={drawing.setBrushSize}
                activeElement={elements.activeElement}
                updateElement={elements.updateElement}
                activeElementId={elements.activeElementId}
            />

            {/* Filter Tray */}
            <FilterTray showFilters={elements.showFilters} activeFilter={activeFilter} setActiveFilter={setActiveFilter} FILTERS={FILTERS} bgImagePreview={bgImagePreview} />

            {/* Publish Bar */}
            <PublishBar visible={!elements.activeElementId && !drawing.isDrawingMode && !publishing} bgImage={bgImage} publishing={publishing} onPublish={handlePublish} />
        </div>
    );
}

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { COLORS, FILTERS, EMOJIS, EVENTFY_SHAPES, getContrastColor, BRUSH_TYPES } from './constants';

// Hooks
import useCamera from './hooks/useCamera';
import useDrawingEngine from './hooks/useDrawingEngine';
import useElementManager from './hooks/useElementManager';

// Components
import CameraView from './components/CameraView';
import DrawingCanvas from './components/DrawingCanvas';
import CanvasElements from './components/CanvasElements';
import FormatToolbar from './components/FormatToolbar';
import FilterTray from './components/FilterTray';
import StickerTray from './components/StickerTray';
import ScaleSlider from './components/ScaleSlider';
import SafeZones from './components/SafeZones';
import TrashZone from './components/TrashZone';
import FrameStrip from './components/FrameStrip';
import './StoryCreate.css';

/**
 * StoryCreate — Full-screen story creation editor.
 * Instagram-grade creation flow: Camera → Capture/Upload → Edit → Publish.
 *
 * Multi-frame support: add up to 10 frames before publishing.
 * Each frame has its own media, overlays, and filter.
 */
export default function StoryCreate() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const canvasRef = useRef(null);

    // ─── Multi-Frame State ──────────────────────────────────────────────────
    // Each frame: { id, file, preview, isVideo, duration, overlays, filter, elements }
    const [frames, setFrames] = useState([]);
    const [activeFrameIndex, setActiveFrameIndex] = useState(0);

    // ─── Current Frame State (editing the active frame) ─────────────────────
    const [bgImage, setBgImage] = useState(null);        // File object
    const [bgImagePreview, setBgImagePreview] = useState(null); // Data URL for preview
    const [isVideo, setIsVideo] = useState(false);        // Is current media a video?
    const [activeFilter, setActiveFilter] = useState('none');
    const [publishing, setPublishing] = useState(false);
    const [publishProgress, setPublishProgress] = useState(0);

    // ─── Hooks ──────────────────────────────────────────────────────────────
    const camera = useCamera(bgImage);
    const drawing = useDrawingEngine(bgImagePreview);
    const elements = useElementManager();

    const isEditingMode = !!bgImage;
    const hasMultipleFrames = frames.length > 0;

    // ─── Save Current Frame to Array (before switching) ─────────────────────
    const saveCurrentFrame = useCallback(() => {
        if (!bgImage) return null;

        const frameData = {
            id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            file: bgImage,
            preview: bgImagePreview,
            isVideo: isVideo,
            duration: isVideo ? 15000 : 5000,
            filter: activeFilter,
            elements: [...elements.elements],
        };
        return frameData;
    }, [bgImage, bgImagePreview, isVideo, activeFilter, elements.elements]);

    // ─── Load Frame into Editor ─────────────────────────────────────────────
    const loadFrame = useCallback((frame) => {
        setBgImage(frame.file);
        setBgImagePreview(frame.preview);
        setIsVideo(frame.isVideo);
        setActiveFilter(frame.filter || 'none');
        // Restore elements for this frame
        elements.setElements(frame.elements || []);
    }, [elements]);

    // ─── File Selection (Gallery) ───────────────────────────────────────────
    const handleSelectFile = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        setBgImage(file);
        setBgImagePreview(preview);
        setIsVideo(file.type.startsWith('video/'));
        camera.stopCamera();
        e.target.value = null;
    }, [camera]);

    // ─── Camera Capture (tap = photo, hold result = video) ──────────────────
    const handleCameraCapture = useCallback(async (videoResult) => {
        // If called with a video result from hold-to-record
        if (videoResult && videoResult.file) {
            setBgImage(videoResult.file);
            setBgImagePreview(videoResult.preview);
            setIsVideo(videoResult.isVideo || false);
            return;
        }
        // Otherwise, quick tap → capture photo
        const result = await camera.captureLiveFrame();
        if (result) {
            setBgImage(result.file);
            setBgImagePreview(result.preview);
            setIsVideo(false);
        }
    }, [camera]);

    // ─── Back / Discard ─────────────────────────────────────────────────────
    const handleBack = useCallback(() => {
        if (bgImage) {
            // If we have saved frames, go back to last frame
            if (frames.length > 0) {
                const lastFrame = frames[frames.length - 1];
                loadFrame(lastFrame);
                setFrames(prev => prev.slice(0, -1));
                setActiveFrameIndex(Math.max(0, frames.length - 2));
            } else {
                if (URL.revokeObjectURL) URL.revokeObjectURL(bgImagePreview);
                setBgImage(null);
                setBgImagePreview(null);
                setIsVideo(false);
                camera.startCamera();
            }
        } else {
            navigate(-1);
        }
    }, [bgImage, bgImagePreview, camera, navigate, frames, loadFrame]);

    // ─── Add Another Frame ──────────────────────────────────────────────────
    const handleAddFrame = useCallback(() => {
        const currentFrame = saveCurrentFrame();
        if (!currentFrame) return;

        setFrames(prev => {
            const updated = [...prev];
            // If we're editing an existing frame, update it
            if (activeFrameIndex < prev.length) {
                updated[activeFrameIndex] = currentFrame;
            } else {
                updated.push(currentFrame);
            }
            return updated;
        });

        // Reset editor for new frame
        setBgImage(null);
        setBgImagePreview(null);
        setIsVideo(false);
        setActiveFilter('none');
        elements.setElements([]);
        elements.setActiveElementId(null);
        setActiveFrameIndex(frames.length + (activeFrameIndex >= frames.length ? 1 : 0));
        camera.startCamera();
    }, [saveCurrentFrame, frames, activeFrameIndex, elements, camera]);

    // ─── Select Frame in Strip ──────────────────────────────────────────────
    const handleSelectFrame = useCallback((index) => {
        if (index === activeFrameIndex && index < frames.length) return;

        // Save current frame first
        const currentFrame = saveCurrentFrame();
        if (currentFrame) {
            setFrames(prev => {
                const updated = [...prev];
                if (activeFrameIndex < prev.length) {
                    updated[activeFrameIndex] = currentFrame;
                } else {
                    updated.push(currentFrame);
                }
                return updated;
            });
        }

        // Load selected frame
        if (index < frames.length) {
            loadFrame(frames[index]);
            setActiveFrameIndex(index);
        }
    }, [activeFrameIndex, frames, saveCurrentFrame, loadFrame]);

    // ─── Delete Frame ───────────────────────────────────────────────────────
    const handleDeleteFrame = useCallback((index) => {
        setFrames(prev => {
            const updated = prev.filter((_, i) => i !== index);
            if (updated.length === 0) {
                // Last frame deleted, go back to camera
                setBgImage(null);
                setBgImagePreview(null);
                setIsVideo(false);
                camera.startCamera();
            } else if (index <= activeFrameIndex) {
                const newIndex = Math.max(0, activeFrameIndex - 1);
                setActiveFrameIndex(newIndex);
                loadFrame(updated[newIndex]);
            }
            return updated;
        });
    }, [activeFrameIndex, camera, loadFrame]);

    // ─── Publish Story (multi-frame) ────────────────────────────────────────
    const handlePublish = useCallback(async () => {
        if (!bgImage || publishing) return;
        setPublishing(true);
        setPublishProgress(5);

        try {
            // Collect all frames: saved frames + current editing frame
            const currentFrame = saveCurrentFrame();
            const allFrames = [...frames];
            if (currentFrame) {
                if (activeFrameIndex < frames.length) {
                    allFrames[activeFrameIndex] = currentFrame;
                } else {
                    allFrames.push(currentFrame);
                }
            }

            if (allFrames.length === 0) throw new Error('No frames to publish');

            // 1. Create story
            const hasOrg = profile?.managed_orgs?.length > 0;
            const orgId = hasOrg ? profile.managed_orgs[0].id : null;

            const story = await api('POST', '/stories', {
                org_id: orgId,
                audience: 'followers',
            });
            setPublishProgress(15);

            if (!story?.id) throw new Error('Story creation returned no id');

            // 2. Upload & create each frame
            const totalFrames = allFrames.length;
            for (let i = 0; i < totalFrames; i++) {
                const frame = allFrames[i];
                const progressBase = 15 + (i / totalFrames) * 75;

                // Upload media
                const ext = frame.isVideo ? 'webm' : 'jpg';
                const contentType = frame.isVideo ? 'video/webm' : 'image/jpeg';
                const fileName = `story_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

                setPublishProgress(Math.round(progressBase));

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('stories')
                    .upload(fileName, frame.file, { contentType });

                if (uploadError) throw new Error(`Upload failed for frame ${i + 1}: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('stories')
                    .getPublicUrl(fileName);

                setPublishProgress(Math.round(progressBase + (75 / totalFrames) * 0.5));

                // Build overlays from elements
                const overlays = (frame.elements || []).map(el => ({
                    type: el.type,
                    content: el.content,
                    question: el.type === 'poll' ? el.content.question : undefined,
                    optionA: el.type === 'poll' ? el.content.optA : undefined,
                    optionB: el.type === 'poll' ? el.content.optB : undefined,
                    quizQuestion: el.type === 'quiz' ? el.content.question : undefined,
                    quizOptions: el.type === 'quiz' ? el.content.options : undefined,
                    quizCorrectIndex: el.type === 'quiz' ? el.content.correctIndex : undefined,
                    questionPrompt: el.type === 'question' ? el.content.prompt : undefined,
                    questionPlaceholder: el.type === 'question' ? el.content.placeholder : undefined,
                    sliderQuestion: el.type === 'slider' ? el.content.question : undefined,
                    sliderEmoji: el.type === 'slider' ? el.content.emoji : undefined,
                    countdownTitle: el.type === 'countdown' ? el.content.title : undefined,
                    countdownTargetDate: el.type === 'countdown' ? el.content.targetDate : undefined,
                    color: el.color,
                    fontFamily: el.fontFamily,
                    textStyle: el.textStyle,
                    textAlign: el.textAlign,
                    textShadow: el.textShadow,
                    gradientBg: el.gradientBg,
                    bgColor: el.bgColor,
                    animationType: el.animationType,
                    stickerType: ['mention', 'location', 'link'].includes(el.type) ? el.type : undefined,
                    value: ['mention', 'location', 'link'].includes(el.type) ? el.content : undefined,
                    shape: el.shape,
                    src: el.type === 'photo_sticker' ? el.content : undefined,
                    x: el.x,
                    y: el.y,
                    scale: el.scale,
                    rotation: el.rotation,
                    fontSize: el.fontSize,
                }));

                // Create frame
                await api('POST', `/stories/${story.id}/frames`, {
                    media_url: publicUrl,
                    media_type: frame.isVideo ? 'video' : 'image',
                    duration_ms: frame.isVideo ? Math.min(frame.duration || 15000, 15000) : 5000,
                    overlays,
                    filter_css: frame.filter || 'none',
                });

                setPublishProgress(Math.round(progressBase + (75 / totalFrames)));
            }

            setPublishProgress(100);

            // Navigate away
            setTimeout(() => navigate('/feed'), 300);
        } catch (err) {
            console.error('Publish failed:', err);
            alert(`Failed to publish: ${err.message}`);
        } finally {
            setPublishing(false);
            setPublishProgress(0);
        }
    }, [bgImage, publishing, profile, frames, activeFrameIndex, saveCurrentFrame, navigate]);

    // ─── Toolbar Actions ────────────────────────────────────────────────────
    const handleToggleDrawing = () => {
        drawing.toggleDrawingMode();
        elements.setActiveElementId(null);
        elements.setShowStickerTray(false);
    };

    const handleUndo = () => {
        drawing.handleUndo();
    };

    const cycleBrushType = () => {
        const idx = BRUSH_TYPES.indexOf(drawing.brushType);
        const next = BRUSH_TYPES[(idx + 1) % BRUSH_TYPES.length];
        drawing.setBrushType(next);
    };

    // Build frames list for the strip display (saved frames + current)
    const displayFrames = [...frames];
    if (bgImage) {
        const currentDisplay = { id: 'current', file: bgImage, preview: bgImagePreview, isVideo };
        if (activeFrameIndex < frames.length) {
            displayFrames[activeFrameIndex] = currentDisplay;
        } else {
            displayFrames.push(currentDisplay);
        }
    }

    return (
        <div className="story-create-root">
            {/* Canvas Area */}
            <div
                className="story-canvas"
                ref={canvasRef}
                onClick={(e) => elements.handleCanvasClick(e, canvasRef)}
            >
                {/* Background Layer */}
                {isEditingMode ? (
                    <div className="story-canvas-bg" style={{ filter: activeFilter }}>
                        {isVideo ? (
                            <video src={bgImagePreview} autoPlay loop muted playsInline className="story-canvas-bg-img" />
                        ) : (
                            <img src={bgImagePreview} alt="" className="story-canvas-bg-img" />
                        )}
                    </div>
                ) : (
                    <CameraView
                        videoRef={camera.videoRef}
                        isCameraActive={camera.isCameraActive}
                        cameraError={camera.cameraError}
                        isInitializing={camera.isInitializing}
                        onCapture={handleCameraCapture}
                        onSelectFile={handleSelectFile}
                        onFlipCamera={camera.flipCamera}
                        isRecording={camera.isRecording}
                        recordingDuration={camera.recordingDuration}
                        onStartRecording={camera.startRecording}
                        onStopRecording={camera.stopRecording}
                        MAX_RECORD_DURATION={camera.MAX_RECORD_DURATION}
                    />
                )}

                {/* Drawing Layer */}
                {isEditingMode && (
                    <DrawingCanvas
                        drawCanvasRef={drawing.drawCanvasRef}
                        isDrawingMode={drawing.isDrawingMode}
                        startDrawing={drawing.startDrawing}
                        draw={drawing.draw}
                        stopDrawing={drawing.stopDrawing}
                    />
                )}

                {/* Elements Layer */}
                {isEditingMode && (
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
                )}

                {/* Safe Zones & Guides */}
                {isEditingMode && (
                    <SafeZones
                        isDragging={elements.isDragging}
                        safeZoneWarning={elements.safeZoneWarning}
                        showCenterGuide={elements.showCenterGuide}
                        horizontalCenterGuide={elements.horizontalCenterGuide}
                    />
                )}

                {/* Trash Zone */}
                <TrashZone
                    isDragging={elements.isDragging}
                    dragTrashScale={elements.dragTrashScale}
                />
            </div>

            {/* ─── Top Bar ─────────────────────────────────────────────────── */}
            <div className="story-top-bar">
                <button className="story-top-btn" onClick={handleBack}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {isEditingMode && (
                    <div className="story-top-actions">
                        {/* Add Text */}
                        <button className="story-top-btn" onClick={elements.addText}>
                            <span style={{ fontSize: 18, fontWeight: 700 }}>Aa</span>
                        </button>

                        {/* Drawing Toggle */}
                        <button
                            className={`story-top-btn ${drawing.isDrawingMode ? 'active' : ''}`}
                            onClick={handleToggleDrawing}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <path d="M12 20h9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#fff" strokeWidth="2" />
                            </svg>
                        </button>

                        {/* Sticker Tray */}
                        <button className="story-top-btn" onClick={elements.toggleStickerTray}>
                            <span style={{ fontSize: 20 }}>😊</span>
                        </button>

                        {/* Filters */}
                        <button className="story-top-btn" onClick={elements.toggleFilters}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="2" />
                                <path d="M12 3v18" stroke="#fff" strokeWidth="2" />
                                <path d="M12 3a9 9 0 010 18" fill="rgba(255,255,255,0.3)" />
                            </svg>
                        </button>

                        {/* Undo (drawing mode) */}
                        {drawing.isDrawingMode && drawing.strokes.length > 0 && (
                            <button className="story-top-btn" onClick={handleUndo}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 10h13a4 4 0 010 8H8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7 6l-4 4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )}

                        {/* Brush type (drawing mode) */}
                        {drawing.isDrawingMode && (
                            <button className="story-top-btn" onClick={cycleBrushType}>
                                <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                                    {drawing.brushType}
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Format Toolbar (appears for text editing or drawing) ──── */}
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

            {/* ─── Scale Slider ────────────────────────────────────────────── */}
            <ScaleSlider
                visible={isEditingMode && (elements.activeElement || drawing.isDrawingMode) && !elements.isDragging}
                isDrawingMode={drawing.isDrawingMode}
                brushSize={drawing.brushSize}
                setBrushSize={drawing.setBrushSize}
                activeElement={elements.activeElement}
                updateElement={elements.updateElement}
                activeElementId={elements.activeElementId}
            />

            {/* ─── Filter Tray ─────────────────────────────────────────────── */}
            <FilterTray
                showFilters={elements.showFilters}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                FILTERS={FILTERS}
                bgImagePreview={bgImagePreview}
            />

            {/* ─── Sticker Tray ────────────────────────────────────────────── */}
            <StickerTray
                showStickerTray={elements.showStickerTray}
                addSmartSticker={elements.addSmartSticker}
                addSticker={elements.addSticker}
                addPhotoSticker={elements.addPhotoSticker}
                addPoll={elements.addPoll}
                addQuiz={elements.addQuiz}
                addQuestion={elements.addQuestion}
                addSlider={elements.addSlider}
                addCountdown={elements.addCountdown}
                EVENTFY_SHAPES={EVENTFY_SHAPES}
                EMOJIS={EMOJIS}
            />

            {/* ─── Frame Strip (multi-frame) ─────────────────────────────── */}
            {isEditingMode && (
                <FrameStrip
                    frames={displayFrames}
                    activeFrameIndex={activeFrameIndex}
                    onSelectFrame={handleSelectFrame}
                    onAddFrame={handleAddFrame}
                    onDeleteFrame={handleDeleteFrame}
                />
            )}

            {/* ─── Publish Bar ─────────────────────────────────────────────── */}
            {isEditingMode && (
                <div className="story-bottom-bar">
                    {publishing && (
                        <div className="story-publish-progress">
                            <div
                                className="story-publish-progress-fill"
                                style={{ width: `${publishProgress}%` }}
                            />
                        </div>
                    )}
                    <button
                        className="publish-btn"
                        onClick={handlePublish}
                        disabled={!bgImage || publishing}
                    >
                        {publishing
                            ? `Publishing ${publishProgress}%`
                            : displayFrames.length > 1
                                ? `Share ${displayFrames.length} Frames`
                                : 'Share to Story'
                        }
                    </button>
                </div>
            )}
        </div>
    );
}

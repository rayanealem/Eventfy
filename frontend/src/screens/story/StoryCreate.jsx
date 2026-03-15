import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { instaSpring } from '../../lib/physics';
import './Story.css';

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
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newText]);
        setActiveElementId(newText.id);
    };

    const addSticker = () => {
        const newZ = highestZIndex + 1;
        setHighestZIndex(newZ);
        const newSticker = {
            id: `sticker_${Date.now()}`,
            type: 'sticker',
            content: '🔥', // Default sticker
            color: '#ffffff',
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            zIndex: newZ,
        };
        setElements(prev => [...prev, newSticker]);
        setActiveElementId(newSticker.id);
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

    return (
        <div className="story-create-root">
            {/* Top Toolbar */}
            <div className="story-toolbar">
                <button className="toolbar-btn cancel-btn" onClick={handleCancel}>✕</button>
                <div className="toolbar-actions">
                    <button className="toolbar-btn" onClick={addText}>Aa</button>
                    <button className="toolbar-btn" onClick={addSticker}>🔥</button>
                </div>
            </div>

            {/* Canvas */}
            <div
                className="story-canvas"
                ref={canvasRef}
                onClick={handleCanvasClick}
            >
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
                            onDragStart={() => bringToFront(el.id)}
                            onDragEnd={(event, info) => {
                                // Accumulate position
                                updateElement(el.id, {
                                    x: el.x + info.offset.x,
                                    y: el.y + info.offset.y
                                });
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
                                    className="story-text-input"
                                    value={el.content}
                                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                    autoFocus={isActive}
                                    style={{ color: el.color }}
                                    placeholder="Type something..."
                                />
                            )}
                            {el.type === 'sticker' && (
                                <span className="story-sticker">
                                    {el.content}
                                </span>
                            )}
                        </motion.div>
                    );
                })}
            </div>

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

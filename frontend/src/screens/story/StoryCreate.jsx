import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import './Story.css';

const ACCENT_OPTIONS = [
    { label: 'Cyan', color: '#13ecec', bg: 'linear-gradient(180deg, #0a0a1a 0%, #0a1a2e 50%, #0a0a1a 100%)' },
    { label: 'Teal', color: '#2dd4bf', bg: 'linear-gradient(180deg, #0a0a1a 0%, #0a2e1a 50%, #0a0a1a 100%)' },
    { label: 'Gold', color: '#fbbf24', bg: 'linear-gradient(180deg, #1a0a0a 0%, #2e1a0a 50%, #1a0a0a 100%)' },
    { label: 'Pink', color: '#f472b6', bg: 'linear-gradient(180deg, #1a0a1a 0%, #2e0a1a 50%, #1a0a1a 100%)' },
    { label: 'Orange', color: '#f56e3d', bg: 'linear-gradient(180deg, #1a0a0a 0%, #2e0f0a 50%, #1a0a0a 100%)' },
];

const BADGE_OPTIONS = ['📢 ANNOUNCEMENT', '🔴 LIVE EVENT', '🏆 RESULTS', '🎟️ EARLY ACCESS', '🔥 TRENDING', '📸 HIGHLIGHT'];

export default function StoryCreate() {
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [badge, setBadge] = useState(BADGE_OPTIONS[0]);
    const [accentIdx, setAccentIdx] = useState(0);
    const [publishing, setPublishing] = useState(false);

    <Navigate to="/feed" replace />;

    const accent = ACCENT_OPTIONS[accentIdx];

    const handlePublish = async () => {
        if (!title.trim()) return;
        setPublishing(true);

        try {
            await api('POST', `/stories`, {
                org_id: profile.managed_orgs[0].id,
                type: 'announcement',
                badge,
                title: title.trim(),
                body: body.trim(),
                accent: accent.color,
                bg: accent.bg,
            });
            navigate(-1);
        } catch (err) {
            console.error('Failed to publish story:', err);
            // Still navigate back on error for now
            navigate(-1);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="story-root">
            <div className="story-viewer" style={{ background: accent.bg }}>
                {/* Header */}
                <div className="story-header">
                    <div className="story-user">
                        <div className="story-user-avatar" style={{ borderColor: accent.color }}>
                            <img
                                src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.username || 'O')}&size=80&background=1e293b&color=fff`}
                                alt="You"
                            />
                        </div>
                        <div className="story-user-info">
                            <span className="story-username">CREATE STORY</span>
                            <span className="story-time">Preview</span>
                        </div>
                    </div>
                    <div className="story-actions">
                        <span className="story-action" onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>✕</span>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="story-content" style={{ cursor: 'default' }}>
                    <div className="story-bg-gradient" />
                    <div className="story-center-content">
                        <span className="story-event-badge">{badge}</span>
                        <h2 className="story-event-title">
                            {title || 'YOUR TITLE\nGOES HERE'}
                        </h2>
                        <p className="story-event-sub">
                            {body || 'Add a description for your story.'}
                        </p>
                    </div>
                </div>

                {/* Creation Form */}
                <div className="story-create-form">
                    {/* Badge Selector */}
                    <div className="create-form-row">
                        <label className="create-form-label">BADGE</label>
                        <div className="create-badge-scroll">
                            {BADGE_OPTIONS.map(b => (
                                <button
                                    key={b}
                                    className={`create-badge-btn ${badge === b ? 'active' : ''}`}
                                    onClick={() => setBadge(b)}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="create-form-row">
                        <label className="create-form-label">TITLE</label>
                        <input
                            className="create-form-input"
                            placeholder="HACKATHON REGISTRATION OPEN"
                            value={title}
                            onChange={e => setTitle(e.target.value.toUpperCase())}
                            maxLength={60}
                        />
                    </div>

                    {/* Body */}
                    <div className="create-form-row">
                        <label className="create-form-label">DESCRIPTION</label>
                        <textarea
                            className="create-form-textarea"
                            placeholder="48 hours of pure code chaos..."
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={140}
                            rows={2}
                        />
                    </div>

                    {/* Accent Color */}
                    <div className="create-form-row">
                        <label className="create-form-label">THEME</label>
                        <div className="create-accent-row">
                            {ACCENT_OPTIONS.map((a, i) => (
                                <button
                                    key={a.label}
                                    className={`create-accent-btn ${i === accentIdx ? 'active' : ''}`}
                                    style={{ background: a.color }}
                                    onClick={() => setAccentIdx(i)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Publish */}
                    <button
                        className="create-publish-btn"
                        onClick={handlePublish}
                        disabled={publishing || !title.trim()}
                        style={{ opacity: publishing || !title.trim() ? 0.5 : 1 }}
                    >
                        {publishing ? 'PUBLISHING...' : 'PUBLISH STORY'}
                    </button>
                </div>
            </div>
        </div>
    );
}

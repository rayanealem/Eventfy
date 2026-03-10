import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import './NewPost.css';

const POST_TYPES = [
    { icon: '○', label: 'UPDATE' },
    { icon: '△', label: 'ANNOUNCEMENT' },
    { icon: '□', label: 'POLL' },
];

const AUDIENCE_TAGS = [
    { label: 'ALL FOLLOWERS' },
    { label: 'EVENT ATTENDEES' },
];

export default function NewPost() {
    const navigate = useNavigate();
    const [activeType, setActiveType] = useState('ANNOUNCEMENT');
    const [activeAudience, setActiveAudience] = useState('ALL FOLLOWERS');
    const [content, setContent] = useState('');

    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        loadOrg();
    }, []);

    const loadOrg = async () => {
        try {
            const data = await api('GET', '/auth/me');
            if (data?.managed_orgs?.length > 0) {
                setOrg(data.managed_orgs[0]);
            } else {
                console.warn("User has no managed orgs to post from.");
            }
        } catch (error) {
            console.error("Failed to load user org for posting:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!org || !content.trim()) return;
        setPublishing(true);
        try {
            await api('POST', '/posts', {
                org_id: org.id,
                post_type: activeType.toLowerCase(),
                content: content,
                is_draft: false,
            });
            // Go back after publishing
            navigate(-1);
        } catch (error) {
            console.error("Failed to publish post:", error);
            setPublishing(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--color-teal)', padding: '2rem' }}>INITIALIZING TRANSMISSION PROTOCOL...</div>;

    return (
        <div className="np-root">
            <div className="np-noise" />

            {/* Header */}
            <header className="np-header">
                <button className="np-cancel" onClick={() => navigate(-1)}>
                    <span className="np-cancel-text">CANCEL</span>
                    <span className="np-cancel-x">✗</span>
                </button>
                <h1 className="np-title">NEW POST □</h1>
                <button className="np-publish-btn" onClick={handlePublish} disabled={publishing || !content.trim() || !org}>
                    <span className="np-publish-text">{publishing ? 'UPLOADING...' : 'PUBLISH'}</span>
                    <span className="np-publish-icon">△</span>
                </button>
            </header>

            {/* Main */}
            <div className="np-main">
                {/* Author */}
                <div className="np-author">
                    <div className="np-avatar" style={{ backgroundImage: org?.logo_url ? `url(${org.logo_url})` : 'none', backgroundSize: 'cover' }}>
                        {!org?.logo_url && <span>{org ? org.name.substring(0, 2) : '?'}</span>}
                    </div>
                    <div className="np-author-info">
                        <span className="np-author-name">{org ? org.name.toUpperCase() : 'UNKNOWN ORG'}</span>
                        <span className="np-author-level">AUTHORIZED TRANSMISSION</span>
                    </div>
                </div>

                {/* Post Type Selector */}
                <div className="np-types-row">
                    {POST_TYPES.map((t, i) => (
                        <button key={i} type="button" className={`np-type-btn ${activeType === t.label ? 'active' : ''}`} onClick={() => setActiveType(t.label)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Text Area */}
                <div className="np-textarea-wrap">
                    <textarea
                        className="np-textarea"
                        placeholder="Enter your transmission here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        maxLength={280}
                        style={{ background: 'transparent', color: 'var(--color-text)', border: 'none', outline: 'none', width: '100%', height: '120px', resize: 'none', fontFamily: 'var(--font-mono)' }}
                    />
                    <span className="np-char-count">{content.length.toString().padStart(3, '0')} / 280</span>
                </div>

                {/* Audience */}
                <div className="np-audience">
                    <span className="np-audience-title">Audience Targeting</span>
                    <div className="np-audience-tags">
                        {AUDIENCE_TAGS.map((t, i) => (
                            <button key={i} className={`np-aud-tag ${activeAudience === t.label ? 'active' : ''}`} onClick={() => setActiveAudience(t.label)}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="np-footer">
                <button className="np-schedule-btn" onClick={() => navigate(-1)}>SAVE DRAFT ◇</button>
                <button className="np-publish-now-btn" onClick={handlePublish} disabled={publishing || !content.trim() || !org}>PUBLISH NOW □</button>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NewPost.css';

const POST_TYPES = [
    { icon: '○', label: 'UPDATE', active: false },
    { icon: '△', label: 'ANNOUNCEMENT', active: true },
    { icon: '□', label: 'POLL', active: false },
    { icon: '◇', label: 'EVENT PROMO', active: false },
];

const ATTACHMENTS = ['📷', '🎥', '🔗', '═', '📋'];

const AUDIENCE_TAGS = [
    { label: 'ALL FOLLOWERS', active: false },
    { label: 'EVENT ATTENDEES', active: true },
    { label: 'VOLUNTEERS', active: false },
];

const POLL_OPTIONS = [
    { marker: '○', placeholder: 'Option Alpha' },
    { marker: '△', placeholder: 'Option Beta' },
    { marker: '□', placeholder: 'Option Gamma' },
];

export default function NewPost() {
    const navigate = useNavigate();
    const [activeType, setActiveType] = useState('ANNOUNCEMENT');
    const [activeAudience, setActiveAudience] = useState('EVENT ATTENDEES');

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
                <button className="np-publish-btn" onClick={() => navigate(-1)}>
                    <span className="np-publish-text">PUBLISH</span>
                    <span className="np-publish-icon">△</span>
                </button>
            </header>

            {/* Main */}
            <div className="np-main">
                {/* Author */}
                <div className="np-author">
                    <div className="np-avatar">
                        <img src="https://i.pravatar.cc/56?img=12" alt="" />
                    </div>
                    <div className="np-author-info">
                        <span className="np-author-name">Vanguard Operations</span>
                        <span className="np-author-level">LEVEL 04 ADMIN ACCESS</span>
                    </div>
                </div>

                {/* Post Type Selector */}
                <div className="np-types-row">
                    {POST_TYPES.map((t, i) => (
                        <button key={i} className={`np-type-btn ${activeType === t.label ? 'active' : ''}`} onClick={() => setActiveType(t.label)}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Text Area */}
                <div className="np-textarea-wrap">
                    <div className="np-textarea">
                        <span className="np-placeholder">Enter your transmission here...</span>
                    </div>
                    <span className="np-char-count">042 / 280</span>
                </div>

                {/* Attachments */}
                <div className="np-attachments">
                    {ATTACHMENTS.map((a, i) => (
                        <button key={i} className={`np-attach-btn ${i === 2 ? 'active' : ''}`}>
                            {a}
                        </button>
                    ))}
                </div>

                {/* Poll Section */}
                <div className="np-poll-section">
                    <div className="np-poll-q">
                        <span className="np-poll-label">Transmission Question</span>
                        <div className="np-poll-input">
                            <span className="np-placeholder">ENTER QUESTION...</span>
                        </div>
                    </div>
                    <div className="np-poll-opts">
                        <span className="np-poll-opts-label">Options</span>
                        {POLL_OPTIONS.map((o, i) => (
                            <div key={i} className="np-opt-row">
                                <div className="np-opt-marker">
                                    <span>{o.marker}</span>
                                </div>
                                <div className="np-opt-input">
                                    <span className="np-placeholder">{o.placeholder}</span>
                                </div>
                            </div>
                        ))}
                    </div>
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
                <button className="np-schedule-btn">SCHEDULE POST ◇</button>
                <button className="np-publish-now-btn" onClick={() => navigate(-1)}>PUBLISH NOW □</button>
            </div>
        </div>
    );
}

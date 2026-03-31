import { useState, useEffect } from 'react';
import { SLIDER_EMOJIS } from '../constants';

/**
 * StoryOverlayLayer — Renders all overlay elements in the viewer.
 * Supports: text, sticker, poll (with voting), quiz (with answer),
 * question (with submit), slider (with drag), countdown (live),
 * smart stickers, photo stickers.
 */
export default function StoryOverlayLayer({ frame, pollVotes, onPollVote, onQuizAnswer, onQuestionSubmit, onSliderVote }) {
    if (!frame?.overlays) return null;

    return (
        <div className="story-overlay-layer">
            {frame.overlays.map((overlay, i) => (
                <OverlayItem
                    key={i}
                    overlay={overlay}
                    index={i}
                    pollVotes={pollVotes}
                    onPollVote={onPollVote}
                    onQuizAnswer={onQuizAnswer}
                    onQuestionSubmit={onQuestionSubmit}
                    onSliderVote={onSliderVote}
                />
            ))}
        </div>
    );
}

function OverlayItem({ overlay, index, pollVotes, onPollVote, onQuizAnswer, onQuestionSubmit, onSliderVote }) {
    const style = {
        left: `calc(50% + ${overlay.x || 0}px)`,
        top: `calc(50% + ${overlay.y || 0}px)`,
        transform: `translate(-50%, -50%) scale(${overlay.scale || 1}) rotate(${overlay.rotation || 0}deg)`,
    };

    switch (overlay.type) {
        case 'text':
            return <TextOverlay overlay={overlay} style={style} />;
        case 'sticker':
            return <StickerOverlay overlay={overlay} style={style} />;
        case 'poll':
            return <PollOverlay overlay={overlay} style={style} index={index} pollVotes={pollVotes} onPollVote={onPollVote} />;
        case 'quiz':
            return <QuizOverlay overlay={overlay} style={style} onQuizAnswer={onQuizAnswer} />;
        case 'question':
            return <QuestionOverlay overlay={overlay} style={style} onQuestionSubmit={onQuestionSubmit} />;
        case 'slider':
            return <SliderOverlay overlay={overlay} style={style} onSliderVote={onSliderVote} />;
        case 'countdown':
            return <CountdownOverlay overlay={overlay} style={style} />;
        case 'mention':
        case 'location':
        case 'link':
            return <SmartStickerOverlay overlay={overlay} style={style} />;
        case 'photo_sticker':
            return <PhotoStickerOverlay overlay={overlay} style={style} />;
        default:
            return null;
    }
}

// ─── Text ───────────────────────────────────────────────────────────────────
function TextOverlay({ overlay, style }) {
    const textStyle = {
        color: overlay.color || '#ffffff',
        fontFamily: overlay.fontFamily || 'Space Grotesk',
        fontSize: (overlay.fontSize || 24) + 'px',
        textAlign: overlay.textAlign || 'center',
        fontWeight: 700,
        lineHeight: 1.3,
    };

    if (overlay.textStyle === 'solid') {
        textStyle.background = overlay.bgColor || '#000';
        textStyle.padding = '8px 16px';
        textStyle.borderRadius = '8px';
    } else if (overlay.textStyle === 'translucent') {
        textStyle.background = 'rgba(0,0,0,0.5)';
        textStyle.padding = '8px 16px';
        textStyle.borderRadius = '8px';
    } else if (overlay.textStyle === 'glow') {
        textStyle.textShadow = `0 0 10px ${overlay.color}, 0 0 20px ${overlay.color}, 0 0 40px ${overlay.color}`;
    } else if (overlay.textStyle === 'gradient' && overlay.gradientBg) {
        textStyle.background = overlay.gradientBg;
        textStyle.padding = '8px 16px';
        textStyle.borderRadius = '8px';
        textStyle.color = '#fff';
    } else {
        textStyle.textShadow = overlay.textShadow || '0 2px 8px rgba(0,0,0,0.6)';
    }

    const animClass = overlay.animationType && overlay.animationType !== 'none' ? `anim-${overlay.animationType}` : '';

    return (
        <div className={`story-overlay-text ${animClass}`} style={{ ...style, ...textStyle }}>
            {overlay.content}
        </div>
    );
}

// ─── Sticker ────────────────────────────────────────────────────────────────
function StickerOverlay({ overlay, style }) {
    return (
        <div className="story-overlay-sticker" style={{ ...style, fontSize: (overlay.fontSize || 48) + 'px', color: overlay.color }}>
            {overlay.content}
        </div>
    );
}

// ─── Poll ───────────────────────────────────────────────────────────────────
function PollOverlay({ overlay, style, index, pollVotes, onPollVote }) {
    const voted = pollVotes?.[index];
    const totalVotes = voted ? 100 : 0; // Simplified for display

    return (
        <div className="story-poll-widget" style={style}>
            <div className="story-poll-question">{overlay.question || overlay.content?.question}</div>
            <div className="story-poll-options">
                {['optionA', 'optA', 'optionB', 'optB'].filter((k, i) => i < 2).map((_, i) => {
                    const label = i === 0
                        ? (overlay.optionA || overlay.content?.optA || 'Yes')
                        : (overlay.optionB || overlay.content?.optB || 'No');
                    const isVoted = voted === i;
                    const pct = isVoted ? 65 : 35;

                    return (
                        <button
                            key={i}
                            className={`story-poll-option ${voted !== undefined ? 'voted' : ''}`}
                            onClick={() => !voted && onPollVote?.(index, i)}
                        >
                            {voted !== undefined && <div className="story-poll-fill" style={{ width: `${pct}%` }} />}
                            <span className="poll-option-text">{label}</span>
                            {voted !== undefined && <span className="poll-pct">{pct}%</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Quiz ───────────────────────────────────────────────────────────────────
function QuizOverlay({ overlay, style, onQuizAnswer }) {
    const [answered, setAnswered] = useState(null);
    const question = overlay.question || overlay.content?.question;
    const options = overlay.content?.options || ['A', 'B', 'C', 'D'];
    const correctIndex = overlay.content?.correctIndex ?? 0;

    const handleAnswer = (i) => {
        if (answered !== null) return;
        setAnswered(i);
        onQuizAnswer?.(i, i === correctIndex);
    };

    return (
        <div className="story-quiz-widget viewer-quiz" style={style}>
            <div className="quiz-header">
                <span className="quiz-badge">QUIZ</span>
            </div>
            <div className="quiz-question">{question}</div>
            <div className="quiz-options">
                {options.map((opt, i) => {
                    let className = 'quiz-option';
                    if (answered !== null) {
                        if (i === correctIndex) className += ' quiz-option-correct quiz-option-revealed';
                        else if (i === answered) className += ' quiz-option-wrong quiz-option-revealed';
                    }
                    return (
                        <button key={i} className={className} onClick={() => handleAnswer(i)}>
                            <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                            <span className="quiz-option-text">{opt}</span>
                            {answered !== null && i === correctIndex && <span className="quiz-check">✓</span>}
                            {answered !== null && i === answered && i !== correctIndex && <span className="quiz-wrong">✗</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Question ───────────────────────────────────────────────────────────────
function QuestionOverlay({ overlay, style, onQuestionSubmit }) {
    const [text, setText] = useState('');
    const [sent, setSent] = useState(false);
    const prompt = overlay.content?.prompt || 'Ask me anything';

    const handleSubmit = () => {
        if (!text.trim()) return;
        onQuestionSubmit?.(text.trim());
        setSent(true);
    };

    return (
        <div className="story-question-widget viewer-question" style={style}>
            <div className="question-prompt">{prompt}</div>
            {sent ? (
                <div className="question-sent">Sent! ✓</div>
            ) : (
                <div className="question-input-area">
                    <input
                        className="question-viewer-input"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your question..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button className="question-send-btn" onClick={handleSubmit}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Emoji Slider ───────────────────────────────────────────────────────────
function SliderOverlay({ overlay, style, onSliderVote }) {
    const [value, setValue] = useState(0.5);
    const [submitted, setSubmitted] = useState(false);
    const [dragging, setDragging] = useState(false);
    const question = overlay.content?.question || 'How much?';
    const emoji = overlay.content?.emoji || '🔥';

    const handlePointerDown = (e) => {
        if (submitted) return;
        setDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!dragging || submitted) return;
        const rect = e.currentTarget.closest('.slider-track-area').getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        setValue(pct);
    };

    const handlePointerUp = () => {
        if (!dragging) return;
        setDragging(false);
        setSubmitted(true);
        onSliderVote?.(value);
    };

    return (
        <div className="story-slider-widget viewer-slider" style={style}>
            <div className="slider-question">{question}</div>
            <div
                className="slider-track-area"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                style={{ touchAction: 'none' }}
            >
                <div className="slider-track">
                    <div className="slider-track-fill" style={{ width: `${value * 100}%`, background: `linear-gradient(90deg, rgba(255,255,255,0.2), ${overlay.color || '#ffd700'})` }} />
                </div>
                <div
                    className={`slider-emoji-handle ${dragging ? 'dragging' : ''} ${submitted ? 'submitted' : ''}`}
                    style={{ left: `${value * 100}%` }}
                >
                    {emoji}
                </div>
            </div>
            {submitted && (
                <div className="slider-result">{Math.round(value * 100)}%</div>
            )}
        </div>
    );
}

// ─── Countdown ──────────────────────────────────────────────────────────────
function CountdownOverlay({ overlay, style }) {
    const [timeLeft, setTimeLeft] = useState('');
    const title = overlay.content?.title || 'Event';
    const targetDate = overlay.content?.targetDate;

    useEffect(() => {
        if (!targetDate) return;
        const update = () => {
            const diff = new Date(targetDate) - Date.now();
            if (diff <= 0) { setTimeLeft('NOW!'); return; }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="story-countdown-widget viewer-countdown" style={{ ...style, borderColor: overlay.color || '#f56e3d' }}>
            <div className="countdown-title">{title}</div>
            <div className="countdown-timer">{timeLeft}</div>
        </div>
    );
}

// ─── Smart Sticker ──────────────────────────────────────────────────────────
function SmartStickerOverlay({ overlay, style }) {
    const icons = { mention: '@', location: '📍', link: '🔗' };
    const handleClick = () => {
        if (overlay.type === 'link' && overlay.value) {
            window.open(overlay.value.startsWith('http') ? overlay.value : `https://${overlay.value}`, '_blank');
        }
    };

    return (
        <div className={`smart-sticker-${overlay.type}`} style={style} onClick={handleClick}>
            <span>{icons[overlay.type]} {overlay.value || overlay.content}</span>
        </div>
    );
}

// ─── Photo Sticker ──────────────────────────────────────────────────────────
function PhotoStickerOverlay({ overlay, style }) {
    return (
        <div
            className={`story-photo-sticker shape-${overlay.shape || 'rounded'}`}
            style={{ ...style, width: 100, height: 100 }}
        >
            <img src={overlay.src || overlay.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
    );
}

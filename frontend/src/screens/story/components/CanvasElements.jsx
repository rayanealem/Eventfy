import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SLIDER_EMOJIS } from '../constants';

/**
 * CanvasElements — Renders all draggable overlay elements on the story canvas.
 * Supports: text, sticker, poll, quiz, question, slider, countdown,
 *           smart stickers (mention/location/link), photo stickers.
 *           Pinch-to-zoom and two-finger rotate gestures.
 */
export default function CanvasElements({
    elements,
    activeElementId,
    isDragging,
    canvasRef,
    updateElement,
    bringToFront,
    onDragStart,
    onDrag,
    onDragEnd,
    cyclePhotoShape,
}) {
    return (
        <div className="story-elements-layer">
            {elements.map(el => (
                <ElementItem
                    key={el.id}
                    el={el}
                    isActive={el.id === activeElementId}
                    isDragging={isDragging}
                    canvasRef={canvasRef}
                    updateElement={updateElement}
                    bringToFront={bringToFront}
                    onDragStart={onDragStart}
                    onDrag={onDrag}
                    onDragEnd={onDragEnd}
                    cyclePhotoShape={cyclePhotoShape}
                />
            ))}
        </div>
    );
}

// ─── Pinch/Rotate Helpers ───────────────────────────────────────────────
function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTouchAngle(t1, t2) {
    return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI);
}

function ElementItem({ el, isActive, isDragging, canvasRef, updateElement, bringToFront, onDragStart, onDrag, onDragEnd, cyclePhotoShape }) {
    const inputRef = useRef(null);
    const [editingField, setEditingField] = useState(null);

    // Pinch/rotate state
    const pinchRef = useRef({ active: false, initialDist: 0, initialAngle: 0, initialScale: 1, initialRotation: 0 });

    const handleTouchStart = useCallback((e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dist = getTouchDistance(e.touches[0], e.touches[1]);
            const angle = getTouchAngle(e.touches[0], e.touches[1]);
            pinchRef.current = {
                active: true,
                initialDist: dist,
                initialAngle: angle,
                initialScale: el.scale || 1,
                initialRotation: el.rotation || 0,
            };
        }
    }, [el.scale, el.rotation]);

    const handleTouchMove = useCallback((e) => {
        if (e.touches.length === 2 && pinchRef.current.active) {
            e.preventDefault();
            const dist = getTouchDistance(e.touches[0], e.touches[1]);
            const angle = getTouchAngle(e.touches[0], e.touches[1]);
            const { initialDist, initialAngle, initialScale, initialRotation } = pinchRef.current;

            const scaleRatio = dist / initialDist;
            const newScale = Math.max(0.3, Math.min(5, initialScale * scaleRatio));
            const angleDiff = angle - initialAngle;
            let newRotation = initialRotation + angleDiff;

            // Snap to cardinal angles (0, 90, 180, 270) with 5-degree threshold
            const snapAngles = [0, 90, 180, 270, -90, -180, -270];
            for (const snap of snapAngles) {
                if (Math.abs(newRotation - snap) < 5) {
                    newRotation = snap;
                    // Haptic feedback at snap
                    if (navigator.vibrate) navigator.vibrate(5);
                    break;
                }
            }

            updateElement(el.id, { scale: newScale, rotation: newRotation });
        }
    }, [el.id, updateElement]);

    const handleTouchEnd = useCallback(() => {
        pinchRef.current.active = false;
    }, []);

    useEffect(() => {
        if (isActive && el.type === 'text' && el.content === '' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isActive, el.type, el.content]);

    const handleContentChange = (e) => {
        const content = e.target.value;
        if (el.type === 'text') {
            updateElement(el.id, { content });
        }
    };

    const getTextStyle = () => {
        const base = {
            color: el.color || '#ffffff',
            fontFamily: el.fontFamily || 'Space Grotesk',
            fontSize: (el.fontSize || 24) + 'px',
            textAlign: el.textAlign || 'center',
            fontWeight: 700,
            lineHeight: 1.3,
            minWidth: 100,
        };

        // Text styles
        if (el.textStyle === 'solid') {
            base.background = el.bgColor || '#000';
            base.padding = '8px 16px';
            base.borderRadius = '8px';
        } else if (el.textStyle === 'translucent') {
            base.background = 'rgba(0,0,0,0.5)';
            base.padding = '8px 16px';
            base.borderRadius = '8px';
        } else if (el.textStyle === 'glow') {
            base.textShadow = `0 0 10px ${el.color || '#fff'}, 0 0 20px ${el.color || '#fff'}, 0 0 40px ${el.color || '#fff'}`;
        } else if (el.textStyle === 'gradient') {
            if (el.gradientBg) {
                base.background = el.gradientBg;
                base.padding = '8px 16px';
                base.borderRadius = '8px';
                base.color = '#fff';
            }
        } else {
            base.textShadow = el.textShadow || '0 2px 8px rgba(0,0,0,0.6)';
        }

        return base;
    };

    const animClass = el.animationType && el.animationType !== 'none' ? `anim-${el.animationType}` : '';

    return (
        <motion.div
            className={`canvas-element ${isActive ? 'canvas-element-active' : ''} ${animClass}`}
            style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                zIndex: el.zIndex || 1,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
            }}
            initial={false}
            animate={{
                x: el.x,
                y: el.y,
                scale: el.scale || 1,
                rotate: el.rotation || 0,
            }}
            drag
            dragMomentum={false}
            dragElastic={0}
            onDragStart={() => onDragStart(el.id)}
            onDrag={(event, info) => onDrag(el, info, canvasRef)}
            onDragEnd={(event, info) => onDragEnd(el, info)}
            onTap={() => bringToFront(el.id)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* ─── Text ─────────────────────────────────────────── */}
            {el.type === 'text' && (
                <div className="canvas-element-text" style={getTextStyle()}>
                    {isActive ? (
                        <textarea
                            ref={inputRef}
                            className="canvas-text-input"
                            value={el.content}
                            onChange={handleContentChange}
                            placeholder="Type here..."
                            style={{
                                color: 'inherit',
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                textAlign: 'inherit',
                                fontWeight: 'inherit',
                            }}
                            rows={1}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />
                    ) : (
                        <span>{el.content || 'Tap to edit'}</span>
                    )}
                </div>
            )}

            {/* ─── Sticker ──────────────────────────────────────── */}
            {el.type === 'sticker' && (
                <div className="canvas-sticker" style={{ color: el.color, fontSize: (el.fontSize || 48) + 'px' }}>
                    {el.content}
                </div>
            )}

            {/* ─── Poll ─────────────────────────────────────────── */}
            {el.type === 'poll' && (
                <PollEditor el={el} isActive={isActive} updateElement={updateElement} />
            )}

            {/* ─── Quiz ─────────────────────────────────────────── */}
            {el.type === 'quiz' && (
                <QuizEditor el={el} isActive={isActive} updateElement={updateElement} />
            )}

            {/* ─── Question ─────────────────────────────────────── */}
            {el.type === 'question' && (
                <QuestionEditor el={el} isActive={isActive} updateElement={updateElement} />
            )}

            {/* ─── Slider ───────────────────────────────────────── */}
            {el.type === 'slider' && (
                <SliderEditor el={el} isActive={isActive} updateElement={updateElement} />
            )}

            {/* ─── Countdown ────────────────────────────────────── */}
            {el.type === 'countdown' && (
                <CountdownEditor el={el} isActive={isActive} updateElement={updateElement} />
            )}

            {/* ─── Smart Stickers ───────────────────────────────── */}
            {(el.type === 'mention' || el.type === 'location' || el.type === 'link') && (
                <SmartStickerEditor el={el} isActive={isActive} updateElement={updateElement} />
            )}

            {/* ─── Photo Sticker ─────────────────────────────────── */}
            {el.type === 'photo_sticker' && (
                <div
                    className={`story-photo-sticker shape-${el.shape || 'square'}`}
                    style={{ width: 100, height: 100 }}
                    onDoubleClick={() => cyclePhotoShape(el.id, el.shape)}
                >
                    <img src={el.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            )}
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sub-editors for each interactive sticker type
// ═══════════════════════════════════════════════════════════════════════════

function PollEditor({ el, isActive, updateElement }) {
    return (
        <div className="story-poll-widget">
            {isActive ? (
                <textarea
                    className="story-poll-question"
                    value={el.content.question}
                    onChange={(e) => updateElement(el.id, { content: { ...el.content, question: e.target.value } })}
                    placeholder="Ask a question..."
                    rows={1}
                />
            ) : (
                <div className="story-poll-question">{el.content.question}</div>
            )}
            <div className="story-poll-options">
                <div className="story-poll-option">
                    {isActive ? (
                        <input
                            value={el.content.optA}
                            onChange={(e) => updateElement(el.id, { content: { ...el.content, optA: e.target.value } })}
                        />
                    ) : (
                        <span className="poll-option-text">{el.content.optA}</span>
                    )}
                </div>
                <div className="story-poll-option">
                    {isActive ? (
                        <input
                            value={el.content.optB}
                            onChange={(e) => updateElement(el.id, { content: { ...el.content, optB: e.target.value } })}
                        />
                    ) : (
                        <span className="poll-option-text">{el.content.optB}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

function QuizEditor({ el, isActive, updateElement }) {
    const cycleCorrect = () => {
        const next = (el.content.correctIndex + 1) % el.content.options.length;
        updateElement(el.id, { content: { ...el.content, correctIndex: next } });
    };

    return (
        <div className="story-quiz-widget">
            <div className="quiz-header">
                <span className="quiz-badge">QUIZ</span>
            </div>
            {isActive ? (
                <textarea
                    className="quiz-question-input"
                    value={el.content.question}
                    onChange={(e) => updateElement(el.id, { content: { ...el.content, question: e.target.value } })}
                    placeholder="Ask a quiz question..."
                    rows={1}
                />
            ) : (
                <div className="quiz-question">{el.content.question}</div>
            )}
            <div className="quiz-options">
                {el.content.options.map((opt, i) => (
                    <div
                        key={i}
                        className={`quiz-option ${i === el.content.correctIndex ? 'quiz-option-correct' : ''}`}
                        onClick={isActive ? cycleCorrect : undefined}
                    >
                        <span className="quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                        {isActive ? (
                            <input
                                className="quiz-option-input"
                                value={opt}
                                onChange={(e) => {
                                    const options = [...el.content.options];
                                    options[i] = e.target.value;
                                    updateElement(el.id, { content: { ...el.content, options } });
                                }}
                            />
                        ) : (
                            <span className="quiz-option-text">{opt}</span>
                        )}
                        {i === el.content.correctIndex && <span className="quiz-check">✓</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuestionEditor({ el, isActive, updateElement }) {
    return (
        <div className="story-question-widget">
            {isActive ? (
                <input
                    className="question-prompt-input"
                    value={el.content.prompt}
                    onChange={(e) => updateElement(el.id, { content: { ...el.content, prompt: e.target.value } })}
                    placeholder="Ask me anything"
                />
            ) : (
                <div className="question-prompt">{el.content.prompt}</div>
            )}
            <div className="question-input-preview">
                <span className="question-input-placeholder">{el.content.placeholder}</span>
            </div>
        </div>
    );
}

function SliderEditor({ el, isActive, updateElement }) {
    const cycleEmoji = () => {
        const idx = SLIDER_EMOJIS.indexOf(el.content.emoji);
        const next = SLIDER_EMOJIS[(idx + 1) % SLIDER_EMOJIS.length];
        updateElement(el.id, { content: { ...el.content, emoji: next } });
    };

    return (
        <div className="story-slider-widget">
            {isActive ? (
                <input
                    className="slider-question-input"
                    value={el.content.question}
                    onChange={(e) => updateElement(el.id, { content: { ...el.content, question: e.target.value } })}
                    placeholder="How much?"
                />
            ) : (
                <div className="slider-question">{el.content.question}</div>
            )}
            <div className="slider-track">
                <div className="slider-track-fill" style={{ width: '50%' }} />
                <div
                    className="slider-emoji-handle"
                    onClick={isActive ? cycleEmoji : undefined}
                    style={{ left: '50%' }}
                >
                    {el.content.emoji}
                </div>
            </div>
            <div className="slider-track-bg" />
        </div>
    );
}

function CountdownEditor({ el, isActive, updateElement }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const update = () => {
            const diff = new Date(el.content.targetDate) - Date.now();
            if (diff <= 0) {
                setTimeLeft('NOW!');
                return;
            }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [el.content.targetDate]);

    return (
        <div className="story-countdown-widget" style={{ borderColor: el.color }}>
            {isActive ? (
                <input
                    className="countdown-title-input"
                    value={el.content.title}
                    onChange={(e) => updateElement(el.id, { content: { ...el.content, title: e.target.value } })}
                    placeholder="Event name..."
                />
            ) : (
                <div className="countdown-title">{el.content.title}</div>
            )}
            <div className="countdown-timer">{timeLeft}</div>
            {isActive && (
                <input
                    className="countdown-date-input"
                    type="datetime-local"
                    value={el.content.targetDate?.slice(0, 16)}
                    onChange={(e) => updateElement(el.id, { content: { ...el.content, targetDate: new Date(e.target.value).toISOString() } })}
                />
            )}
        </div>
    );
}

function SmartStickerEditor({ el, isActive, updateElement }) {
    const icons = { mention: '@', location: '📍', link: '🔗' };
    const colors = { mention: '#fb5151', location: '#00ffc2', link: '#ffffff' };

    return (
        <div
            className={`story-smart-sticker story-smart-${el.type}`}
            style={{ background: `linear-gradient(135deg, ${colors[el.type]}dd, ${colors[el.type]}88)` }}
        >
            <span className="smart-sticker-icon">{icons[el.type]}</span>
            {isActive ? (
                <input
                    className="smart-sticker-input"
                    value={el.content}
                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                />
            ) : (
                <span className="smart-sticker-text">{el.content}</span>
            )}
        </div>
    );
}

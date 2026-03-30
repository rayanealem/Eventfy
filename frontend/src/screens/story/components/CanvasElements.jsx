import { motion } from 'framer-motion';
import { instaSpring } from '../../../lib/physics';

/**
 * CanvasElements — Renders all draggable overlay elements on the creator canvas.
 * Each element type (text, sticker, smart sticker, photo sticker, poll) has its own renderer.
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
    return elements.map((el) => {
        const isActive = el.id === activeElementId;
        return (
            <motion.div
                key={el.id}
                drag
                dragConstraints={canvasRef}
                dragMomentum={false}
                onDragStart={() => onDragStart(el.id)}
                onDrag={(event, info) => onDrag(el, info, canvasRef)}
                onDragEnd={(event, info) => onDragEnd(el, info)}
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
                    {/* Text Element */}
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
                                width: `${Math.max(el.content.length, 5)}ch`,
                                height: 'auto',
                                minHeight: '1.2em'
                            }}
                            placeholder="Type something..."
                        />
                    )}

                    {/* Emoji / Shape Sticker */}
                    {el.type === 'sticker' && (
                        <span className="story-sticker" style={{ color: el.color }}>
                            {el.content}
                        </span>
                    )}

                    {/* Smart Stickers (mention, location, link) */}
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
                                    width: `${Math.max(el.content.length, 5)}ch`,
                                    pointerEvents: isDragging ? 'none' : 'auto',
                                    userSelect: isDragging ? 'none' : 'auto'
                                }}
                            />
                        </div>
                    )}

                    {/* Photo Sticker */}
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

                    {/* Poll Widget */}
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
    });
}

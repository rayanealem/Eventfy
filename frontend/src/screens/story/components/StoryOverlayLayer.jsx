import { useNavigate } from 'react-router-dom';

/**
 * StoryOverlayLayer — Renders all interactive overlays on a story frame:
 * text, stickers, photo stickers, smart stickers (mention/location/link),
 * images (drawings), and poll widgets.
 */
export default function StoryOverlayLayer({ currentFrame, pollVotes, handlePollVote }) {
    const navigate = useNavigate();
    const overlays = currentFrame?.overlays;

    if (!overlays?.length) return null;

    return overlays.map((el) => (
        <div
            key={el.id}
            style={{
                position: 'absolute',
                zIndex: el.zIndex,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${el.x}px), calc(-50% + ${el.y}px)) scale(${el.scale}) rotate(${el.rotation}deg)`,
            }}
            className={`anim-${el.animationType || 'none'}`}
        >
            {/* Text Overlay */}
            {el.type === 'text' && (
                <div
                    style={{
                        color: el.color,
                        fontFamily: el.fontFamily || "'Space Grotesk', sans-serif",
                        fontSize: '32px',
                        fontWeight: 700,
                        textShadow: el.textStyle === 'solid' ? 'none' : '0 2px 4px rgba(0,0,0,0.8)',
                        background: el.textStyle === 'solid' ? el.bgColor : 'transparent',
                        padding: el.textStyle === 'solid' ? '8px 16px' : '0',
                        borderRadius: el.textStyle === 'solid' ? '12px' : '0',
                        outline: 'none',
                        border: 'none',
                        textAlign: el.textAlign || 'center',
                        width: '100%',
                        minWidth: 'max-content'
                    }}
                >
                    {el.content}
                </div>
            )}

            {/* Photo Sticker */}
            {el.type === 'photo_sticker' && (
                <img
                    src={el.content}
                    alt="Photo Sticker"
                    className={`story-photo-sticker shape-${el.shape || 'square'}`}
                    style={{
                        width: '150px',
                        height: '150px',
                        objectFit: 'cover',
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Emoji / Shape Sticker */}
            {el.type === 'sticker' && (
                <span
                    style={{
                        color: el.color || '#ffffff',
                        fontSize: '64px',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
                    }}
                >
                    {el.content}
                </span>
            )}

            {/* Smart Stickers (mention, location, link) */}
            {['mention', 'location', 'link'].includes(el.type) && (
                <div
                    className={`story-smart-sticker story-smart-${el.type}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (el.type === 'mention') navigate(`/profile/${el.content.replace('@', '')}`);
                        if (el.type === 'link') window.open(el.content.startsWith('http') ? el.content : `https://${el.content}`, '_blank');
                    }}
                >
                    {el.type === 'mention' && '👤 '}
                    {el.type === 'location' && '📍 '}
                    {el.type === 'link' && '🔗 '}
                    {el.content}
                </div>
            )}

            {/* Drawing Image Overlay */}
            {el.type === 'image' && (
                <img
                    src={el.content}
                    alt="Drawing Overlay"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Poll Widget */}
            {el.type === 'poll' && (
                <div className="story-poll-widget">
                    <div className="story-poll-question">{el.content.question}</div>
                    <div className="story-poll-options">
                        <div
                            className={`story-poll-option ${pollVotes[el.id]?.option === 'A' ? 'voted' : ''}`}
                            onClick={() => handlePollVote(el.id, 'A')}
                        >
                            {pollVotes[el.id] && (
                                <div className="story-poll-fill" style={{ width: `${pollVotes[el.id].pctA}%` }} />
                            )}
                            <span className="poll-option-text">{el.content.optA}</span>
                            {pollVotes[el.id] && <span className="poll-pct">{pollVotes[el.id].pctA}%</span>}
                        </div>
                        <div
                            className={`story-poll-option ${pollVotes[el.id]?.option === 'B' ? 'voted' : ''}`}
                            onClick={() => handlePollVote(el.id, 'B')}
                        >
                            {pollVotes[el.id] && (
                                <div className="story-poll-fill" style={{ width: `${pollVotes[el.id].pctB}%` }} />
                            )}
                            <span className="poll-option-text">{el.content.optB}</span>
                            {pollVotes[el.id] && <span className="poll-pct">{pollVotes[el.id].pctB}%</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    ));
}

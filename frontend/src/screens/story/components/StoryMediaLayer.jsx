import { motion, AnimatePresence } from 'framer-motion';

/**
 * StoryMediaLayer — Renders the background media (image or video) with CSS filter.
 * Includes Ken Burns effect on still images, crossfade transitions,
 * and a blurred background plate to fill the viewport behind non-16:9 media.
 */
export default function StoryMediaLayer({ currentFrame, frameIndex, isMuted = true }) {
    if (!currentFrame?.media_url) {
        // Gradient fallback
        return (
            <div className="story-media-gradient">
                <div className="story-media-gradient-inner" />
            </div>
        );
    }

    const filterCss = currentFrame.filter_css || 'none';

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={`media-${frameIndex}`}
                className="story-media-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
            >
                {/* Blurred background plate — fills viewport behind non-16:9 media */}
                {currentFrame.media_type !== 'video' && (
                    <div className="story-media-blur-plate">
                        <img
                            src={currentFrame.media_url}
                            alt=""
                            className="story-media-blur-img"
                            aria-hidden="true"
                        />
                    </div>
                )}

                {/* Video blur plate */}
                {currentFrame.media_type === 'video' && (
                    <div className="story-media-blur-plate">
                        <video
                            src={currentFrame.media_url}
                            className="story-media-blur-img"
                            autoPlay loop muted playsInline
                            aria-hidden="true"
                        />
                    </div>
                )}

                {currentFrame.media_type === 'video' ? (
                    <video
                        key={currentFrame.media_url}
                        className="story-media-content"
                        src={currentFrame.media_url}
                        style={{ filter: filterCss }}
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                    />
                ) : (
                    <div className="story-media-ken-burns">
                        <img
                            key={currentFrame.media_url}
                            className="story-media-content story-media-image"
                            src={currentFrame.media_url}
                            alt="Story"
                            style={{ filter: filterCss }}
                        />
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}


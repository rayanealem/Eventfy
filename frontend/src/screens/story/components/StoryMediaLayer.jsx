import { AnimatePresence, motion } from 'framer-motion';

/**
 * StoryMediaLayer — Renders the background media (image or video) with CSS filter.
 * Also renders the legacy gradient fallback when no media_url exists.
 */
export default function StoryMediaLayer({ currentFrame }) {
    if (!currentFrame?.media_url) {
        return <div className="story-bg-gradient" />;
    }

    if (currentFrame.media_type === 'video') {
        return (
            <video
                src={currentFrame.media_url}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    filter: currentFrame.filter_css || 'none'
                }}
                autoPlay
                loop
                muted
                playsInline
            />
        );
    }

    return (
        <img
            src={currentFrame.media_url}
            alt="Story background"
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                filter: currentFrame.filter_css || 'none'
            }}
        />
    );
}

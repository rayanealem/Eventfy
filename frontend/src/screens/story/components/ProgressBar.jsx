import { useRef, useEffect } from 'react';
import './ProgressBar.css';

/**
 * ProgressBar — JS-driven segmented progress bar (Instagram-style).
 * Uses controlled width instead of CSS animation for reliable pause/resume.
 */
export default function ProgressBar({ totalSegments, activeSegmentIndex, progress, paused }) {
    return (
        <div className={`story-progress-container ${paused ? 'dimmed' : ''}`}>
            {Array.from({ length: totalSegments }).map((_, i) => (
                <div key={i} className="story-prog-segment">
                    <div
                        className="story-prog-fill"
                        style={{
                            width: i < activeSegmentIndex
                                ? '100%'
                                : i === activeSegmentIndex
                                    ? `${progress * 100}%`
                                    : '0%',
                            transition: i === activeSegmentIndex ? 'none' : 'width 0.1s linear',
                        }}
                    />
                </div>
            ))}
        </div>
    );
}

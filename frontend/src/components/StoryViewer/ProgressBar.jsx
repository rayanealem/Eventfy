import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ totalSegments, activeSegmentIndex, paused, duration = 5000, onComplete }) {
    return (
        <div className={`story-progress-container ${paused ? 'paused-opacity' : ''}`}>
            {Array.from({ length: totalSegments }).map((_, i) => (
                <div key={i} className="story-prog-bar">
                    <div
                        className="story-prog-fill"
                        style={{
                            width: i < activeSegmentIndex ? '100%' : '0%',
                            animation: i === activeSegmentIndex
                                ? `fillProgress ${duration}ms linear forwards`
                                : 'none',
                            animationPlayState: paused ? 'paused' : 'running'
                        }}
                        onAnimationEnd={i === activeSegmentIndex ? onComplete : undefined}
                    />
                </div>
            ))}
        </div>
    );
}

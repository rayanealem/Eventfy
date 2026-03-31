import { useRef, useCallback } from 'react';

/**
 * CameraView — Live camera preview with Instagram-style shutter button.
 * TAP = photo, HOLD = video recording with circular progress ring.
 */
export default function CameraView({
    videoRef, isCameraActive, cameraError, isInitializing,
    onCapture, onSelectFile, onFlipCamera,
    isRecording, recordingDuration, onStartRecording, onStopRecording,
    MAX_RECORD_DURATION,
}) {
    const holdTimeoutRef = useRef(null);
    const isHoldRef = useRef(false);

    const handleShutterDown = useCallback((e) => {
        e.preventDefault();
        isHoldRef.current = false;

        // After 300ms of holding → start video recording
        holdTimeoutRef.current = setTimeout(() => {
            isHoldRef.current = true;
            onStartRecording?.();
        }, 300);
    }, [onStartRecording]);

    const handleShutterUp = useCallback(async (e) => {
        e.preventDefault();
        clearTimeout(holdTimeoutRef.current);

        if (isHoldRef.current || isRecording) {
            // Was recording → stop and return video
            const result = await onStopRecording?.();
            if (result) {
                // Return video to parent — parent handles this via the same capture flow
                onCapture?.(result);
            }
        } else {
            // Quick tap → capture photo
            onCapture?.();
        }
        isHoldRef.current = false;
    }, [isRecording, onStopRecording, onCapture]);

    // Progress ring calculations
    const ringRadius = 36;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const recordProgress = recordingDuration / (MAX_RECORD_DURATION || 15000);
    const ringDashoffset = ringCircumference * (1 - recordProgress);

    // Format duration
    const formatDuration = (ms) => {
        const s = Math.floor(ms / 1000);
        return `00:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            {/* Camera feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-feed"
            />

            {/* Loading overlay */}
            {isInitializing && !cameraError && (
                <div className="camera-loading">
                    <div className="camera-loading-spinner" />
                    <span>Starting camera...</span>
                </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
                <div className="camera-recording-indicator">
                    <div className="recording-dot" />
                    <span className="recording-time">{formatDuration(recordingDuration)}</span>
                </div>
            )}

            {/* Error states */}
            {cameraError ? (
                <div className="camera-error">
                    <span className="camera-error-icon">
                        {cameraError === 'permission' ? '🔒' : '📷'}
                    </span>
                    <span className="camera-error-title">
                        {cameraError === 'permission'
                            ? 'Camera access denied'
                            : 'Camera unavailable'}
                    </span>
                    <span className="camera-error-subtitle">
                        {cameraError === 'permission'
                            ? 'Allow camera access in your browser settings'
                            : 'Select a photo or video from your gallery'}
                    </span>
                    <label className="camera-error-btn">
                        Choose from Gallery
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={onSelectFile}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            ) : (
                /* Bottom controls */
                <div className="camera-controls">
                    {/* Gallery picker */}
                    <label className="camera-gallery-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="3" stroke="#fff" strokeWidth="1.5" />
                            <circle cx="8.5" cy="8.5" r="2" stroke="#fff" strokeWidth="1.5" />
                            <path d="M3 15l4-4c.7-.7 1.3-.7 2 0l4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14 14l2-2c.7-.7 1.3-.7 2 0l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={onSelectFile}
                            style={{ display: 'none' }}
                        />
                    </label>

                    {/* Hold-to-record hint */}
                    {!isRecording && (
                        <div className="camera-mode-hint">
                            <span>TAP photo · HOLD video</span>
                        </div>
                    )}

                    {/* Shutter button with recording ring */}
                    <div className="camera-shutter-container">
                        {/* SVG recording progress ring */}
                        <svg className={`camera-shutter-ring ${isRecording ? 'active' : ''}`} width="82" height="82" viewBox="0 0 82 82">
                            <circle
                                cx="41" cy="41" r={ringRadius}
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="4"
                            />
                            {isRecording && (
                                <circle
                                    cx="41" cy="41" r={ringRadius}
                                    fill="none"
                                    stroke="#ff3b30"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeDasharray={ringCircumference}
                                    strokeDashoffset={ringDashoffset}
                                    transform="rotate(-90 41 41)"
                                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                                />
                            )}
                        </svg>

                        <button
                            className={`camera-shutter ${isRecording ? 'recording' : ''}`}
                            onPointerDown={handleShutterDown}
                            onPointerUp={handleShutterUp}
                            onPointerLeave={handleShutterUp}
                            disabled={!isCameraActive}
                        >
                            <div className={`camera-shutter-inner ${isRecording ? 'recording' : ''}`} />
                        </button>
                    </div>

                    {/* Flip camera */}
                    <button className="camera-flip-btn" onClick={onFlipCamera}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 7l-4-4v3H8C5.79 7 4 8.79 4 11" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 17l4 4v-3h8c2.21 0 4-1.79 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            )}
        </>
    );
}

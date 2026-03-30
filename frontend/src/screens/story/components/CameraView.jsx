/**
 * CameraView — Live camera preview with Instagram-style shutter button.
 * Used in StoryCreate when no background image is set.
 */
export default function CameraView({ videoRef, isCameraActive, cameraError, onCapture, onSelectFile }) {
    return (
        <>
            {/* Full-canvas camera feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                    background: '#000',
                }}
            />

            {/* Camera-failed fallback OR shutter controls */}
            {cameraError ? (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 16, zIndex: 2
                }}>
                    <span style={{ fontSize: 48 }}>📷</span>
                    <span style={{
                        color: 'rgba(255,255,255,0.6)', fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: 14, textAlign: 'center', padding: '0 32px'
                    }}>
                        Camera unavailable. Select a photo or video instead.
                    </span>
                    <label style={{
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 24, padding: '12px 24px', color: '#fff',
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, cursor: 'pointer'
                    }}>
                        Choose File
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            onChange={onSelectFile}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
            ) : (
                <>
                    {/* Bottom controls */}
                    <div style={{
                        position: 'absolute', bottom: 24, left: 0, right: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 32, zIndex: 10
                    }}>
                        {/* Gallery picker */}
                        <label style={{
                            width: 44, height: 44, borderRadius: 12,
                            border: '2px solid rgba(255,255,255,0.4)',
                            overflow: 'hidden', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)'
                        }}>
                            <span style={{ fontSize: 20 }}>🖼️</span>
                            <input
                                type="file"
                                accept="image/*,video/mp4,video/webm"
                                onChange={onSelectFile}
                                style={{ display: 'none' }}
                            />
                        </label>

                        {/* Shutter button — Instagram style */}
                        <button
                            onClick={onCapture}
                            disabled={!isCameraActive}
                            style={{
                                width: 72, height: 72, borderRadius: '50%',
                                border: '4px solid #fff',
                                background: 'transparent', padding: 4, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: isCameraActive ? 1 : 0.4,
                                transition: 'transform 0.1s',
                            }}
                            onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                            onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: '#fff',
                            }} />
                        </button>

                        {/* Spacer */}
                        <div style={{ width: 44, height: 44 }} />
                    </div>
                </>
            )}
        </>
    );
}

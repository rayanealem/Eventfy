import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useCamera — WebRTC camera management for story creation.
 * Handles getUserMedia, start/stop, and frame capture to File blob.
 */
export default function useCamera(bgImage) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(false);

    const startCamera = useCallback(async () => {
        // Don't start if already active
        if (streamRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }
            setIsCameraActive(true);
            setCameraError(false);
        } catch (err) {
            console.error('WebRTC Camera failed:', err);
            setCameraError(true);
            setIsCameraActive(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    }, []);

    // Auto-start camera when no background image is set
    useEffect(() => {
        if (!bgImage && !cameraError) {
            startCamera();
        }
        return () => stopCamera();
    }, [bgImage, cameraError, startCamera, stopCamera]);

    const captureLiveFrame = useCallback(() => {
        if (!videoRef.current) return null;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 1080;
        canvas.height = videoRef.current.videoHeight || 1920;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                stopCamera();
                resolve({
                    file,
                    preview: URL.createObjectURL(file),
                    isVideo: false,
                    duration: 5000
                });
            }, 'image/jpeg', 0.9);
        });
    }, [stopCamera]);

    return {
        videoRef,
        isCameraActive,
        cameraError,
        startCamera,
        stopCamera,
        captureLiveFrame,
    };
}

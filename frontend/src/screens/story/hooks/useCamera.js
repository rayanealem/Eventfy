import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useCamera — WebRTC camera management for story creation.
 * Handles getUserMedia, start/stop, front/back toggle, frame capture to File blob,
 * and video recording with MediaRecorder API (hold-to-record).
 */
const MAX_RECORD_DURATION = 15000; // 15 seconds max

export default function useCamera(bgImage) {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const isRequesting = useRef(false);
    const mountedRef = useRef(true);

    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState(null); // null | 'permission' | 'not-found' | 'unknown'
    const [facingMode, setFacingMode] = useState('environment');
    const [isInitializing, setIsInitializing] = useState(true);

    // ─── Video Recording State ──────────────────────────────────────────────
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const recordingStartRef = useRef(null);

    const startCamera = useCallback(async (facing = facingMode) => {
        if (streamRef.current || isRequesting.current) return;
        isRequesting.current = true;
        setIsInitializing(true);

        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: facing }, width: { ideal: 1080 }, height: { ideal: 1920 } },
                    audio: true, // Enable audio for video recording
                });
            } catch {
                // Fallback: try without audio
                try {
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: { ideal: facing }, width: { ideal: 1080 }, height: { ideal: 1920 } },
                        audio: false,
                    });
                } catch {
                    // Fallback: any camera
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                }
            }

            if (!mountedRef.current) {
                stream.getTracks().forEach(t => t.stop());
                return;
            }

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play().catch(() => {});
            }

            setIsCameraActive(true);
            setCameraError(null);
        } catch (err) {
            console.error('Camera failed:', err);
            if (!mountedRef.current) return;

            if (err.name === 'NotAllowedError') {
                setCameraError('permission');
            } else if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
                setCameraError('not-found');
            } else {
                setCameraError('unknown');
            }
            setIsCameraActive(false);
        } finally {
            isRequesting.current = false;
            if (mountedRef.current) setIsInitializing(false);
        }
    }, [facingMode]);

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

    const flipCamera = useCallback(async () => {
        const newFacing = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newFacing);
        stopCamera();
        setTimeout(() => startCamera(newFacing), 100);
    }, [facingMode, stopCamera, startCamera]);

    // Auto-start camera when no background image is set
    useEffect(() => {
        mountedRef.current = true;
        if (!bgImage && !cameraError) {
            startCamera();
        }
        return () => {
            mountedRef.current = false;
            stopCamera();
        };
    }, [bgImage]);  // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Photo Capture ──────────────────────────────────────────────────────
    const captureLiveFrame = useCallback(() => {
        if (!videoRef.current) return null;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1080;
        canvas.height = video.videoHeight || 1920;
        const ctx = canvas.getContext('2d');

        if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                stopCamera();
                resolve({
                    file,
                    preview: URL.createObjectURL(file),
                    isVideo: false,
                    duration: 5000,
                });
            }, 'image/jpeg', 0.92);
        });
    }, [stopCamera, facingMode]);

    // ─── Video Recording ────────────────────────────────────────────────────
    const startRecording = useCallback(() => {
        if (!streamRef.current || isRecording) return;

        recordedChunksRef.current = [];
        setRecordingDuration(0);
        recordingStartRef.current = Date.now();

        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : MediaRecorder.isTypeSupported('video/webm')
                ? 'video/webm'
                : 'video/mp4';

        try {
            const recorder = new MediaRecorder(streamRef.current, { mimeType });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            recorder.start(100); // Collect data every 100ms
            mediaRecorderRef.current = recorder;
            setIsRecording(true);

            // Duration ticker
            recordingTimerRef.current = setInterval(() => {
                const elapsed = Date.now() - recordingStartRef.current;
                setRecordingDuration(Math.min(elapsed, MAX_RECORD_DURATION));

                // Auto-stop at max duration
                if (elapsed >= MAX_RECORD_DURATION) {
                    stopRecording();
                }
            }, 100);
        } catch (err) {
            console.error('MediaRecorder failed:', err);
        }
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        return new Promise((resolve) => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
                resolve(null);
                return;
            }

            clearInterval(recordingTimerRef.current);

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: mediaRecorderRef.current.mimeType || 'video/webm',
                });
                const file = new File([blob], `video_${Date.now()}.webm`, { type: blob.type });
                const duration = Date.now() - recordingStartRef.current;

                stopCamera();
                setIsRecording(false);
                setRecordingDuration(0);

                resolve({
                    file,
                    preview: URL.createObjectURL(file),
                    isVideo: true,
                    duration: Math.min(duration, MAX_RECORD_DURATION),
                });
            };

            mediaRecorderRef.current.stop();
        });
    }, [stopCamera]);

    // Cleanup recording on unmount
    useEffect(() => {
        return () => {
            clearInterval(recordingTimerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    return {
        videoRef,
        isCameraActive,
        cameraError,
        isInitializing,
        facingMode,
        startCamera,
        stopCamera,
        flipCamera,
        captureLiveFrame,
        // Video recording
        isRecording,
        recordingDuration,
        startRecording,
        stopRecording,
        MAX_RECORD_DURATION,
    };
}

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * useDrawingEngine — Canvas drawing engine for story creation.
 * Supports normal, neon, and eraser brush types with undo.
 */
export default function useDrawingEngine(bgImagePreview) {
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [strokes, setStrokes] = useState([]);
    const [brushColor, setBrushColor] = useState('#ffffff');
    const [brushType, setBrushType] = useState('normal');
    const [brushSize, setBrushSize] = useState(6);

    const drawCanvasRef = useRef(null);
    const ctxRef = useRef(null);
    const isDrawingRef = useRef(false);

    // Initialize canvas context when background is loaded
    useEffect(() => {
        if (drawCanvasRef.current) {
            const canvas = drawCanvasRef.current;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 6;
            ctxRef.current = ctx;
        }
    }, [bgImagePreview]);

    const saveStrokeState = useCallback(() => {
        if (!drawCanvasRef.current) return;
        setStrokes(prev => [...prev, drawCanvasRef.current.toDataURL()]);
    }, []);

    const handleUndo = useCallback(() => {
        if (strokes.length === 0 || !ctxRef.current || !drawCanvasRef.current) return;
        const newStrokes = [...strokes];
        newStrokes.pop();
        setStrokes(newStrokes);

        const ctx = ctxRef.current;
        const canvas = drawCanvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (newStrokes.length > 0) {
            const img = new Image();
            img.src = newStrokes[newStrokes.length - 1];
            img.onload = () => ctx.drawImage(img, 0, 0);
        }
    }, [strokes]);

    const getPointerPos = useCallback((e) => {
        const canvas = drawCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    }, []);

    const startDrawing = useCallback((e) => {
        if (!isDrawingMode || !ctxRef.current) return;
        const { offsetX, offsetY } = getPointerPos(e);

        const ctx = ctxRef.current;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (brushType === 'normal') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
            ctx.shadowBlur = 0;
        } else if (brushType === 'neon') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = brushColor;
        } else if (brushType === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        isDrawingRef.current = true;
    }, [isDrawingMode, brushSize, brushType, brushColor, getPointerPos]);

    const draw = useCallback((e) => {
        if (!isDrawingRef.current || !ctxRef.current) return;
        const { offsetX, offsetY } = getPointerPos(e);
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    }, [getPointerPos]);

    const stopDrawing = useCallback(() => {
        if (!isDrawingRef.current || !ctxRef.current) return;
        ctxRef.current.closePath();
        isDrawingRef.current = false;
        saveStrokeState();
    }, [saveStrokeState]);

    const toggleDrawingMode = useCallback(() => {
        setIsDrawingMode(prev => !prev);
    }, []);

    // Get the drawing as a data URL (for publishing)
    const getDrawingDataUrl = useCallback(() => {
        if (strokes.length > 0 && drawCanvasRef.current) {
            return drawCanvasRef.current.toDataURL();
        }
        return null;
    }, [strokes]);

    return {
        // State
        isDrawingMode,
        strokes,
        brushColor,
        brushType,
        brushSize,

        // Refs
        drawCanvasRef,
        ctxRef,

        // Setters
        setBrushColor,
        setBrushType,
        setBrushSize,

        // Actions
        startDrawing,
        draw,
        stopDrawing,
        handleUndo,
        toggleDrawingMode,
        getDrawingDataUrl,
    };
}

/**
 * DrawingCanvas — Canvas overlay for freehand drawing on story creator.
 */
export default function DrawingCanvas({
    drawCanvasRef,
    isDrawingMode,
    startDrawing,
    draw,
    stopDrawing,
}) {
    return (
        <canvas
            ref={drawCanvasRef}
            className={`story-draw-canvas ${isDrawingMode ? 'drawing-active' : ''}`}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerOut={stopDrawing}
        />
    );
}

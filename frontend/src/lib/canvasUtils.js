import html2canvas from 'html2canvas';

/**
 * Captures a specific DOM element using html2canvas and triggers an automatic file download.
 *
 * @param {HTMLElement} elementToCapture The DOM node (e.g. the story canvas container).
 * @param {string} filename The name of the downloaded file.
 * @param {Function} hideUI Callback to temporarily hide the active borders/guides before capturing.
 * @param {Function} restoreUI Callback to restore the UI elements after capturing.
 */
export async function downloadStoryImage(elementToCapture, filename = 'eventfy_story.png', hideUI, restoreUI) {
    if (!elementToCapture) return;

    try {
        // 1. Temporarily hide UI elements (active borders, center guides, etc)
        if (typeof hideUI === 'function') hideUI();

        // 2. Wait a brief moment to ensure React re-renders and the DOM reflects the hidden state
        await new Promise(resolve => setTimeout(resolve, 50));

        // 3. Capture the element
        const canvas = await html2canvas(elementToCapture, {
            useCORS: true, // crucial for loading external images/avatars securely
            backgroundColor: '#0A0A0F', // match the root background to prevent transparent artifacts
            scale: window.devicePixelRatio || 2, // ensure high resolution
            logging: false,
        });

        // 4. Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');

        // 5. Trigger download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error('Failed to download story image:', error);
        alert('An error occurred while saving the image. Please try again.');
    } finally {
        // 6. Always restore UI elements, even if capture fails
        if (typeof restoreUI === 'function') restoreUI();
    }
}

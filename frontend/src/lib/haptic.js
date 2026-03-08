// Haptic feedback utility for Eventfy
// Wraps navigator.vibrate() with guard for unsupported browsers

export function haptic(pattern = 30) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

export function hapticSuccess() {
    haptic(30);
}

export function hapticError() {
    haptic([50, 30, 50]);
}

export function hapticHeavy() {
    haptic([100, 50, 100]);
}

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Haptic feedback utility for Eventfy
// Uses @capacitor/haptics with a fallback to navigator.vibrate() for unsupported web browsers

export async function haptic(pattern = 30) {
    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        if (navigator.vibrate) navigator.vibrate(pattern);
    }
}

export async function hapticSuccess() {
    try {
        await Haptics.notification({ type: NotificationType.Success });
    } catch (e) {
        if (navigator.vibrate) navigator.vibrate(30);
    }
}

export async function hapticError() {
    try {
        await Haptics.notification({ type: NotificationType.Error });
    } catch (e) {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }
}

export async function hapticHeavy() {
    try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

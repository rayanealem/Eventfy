import { Capacitor } from '@capacitor/core';

/**
 * Returns true when the app is running inside a native Capacitor shell
 * (Android/iOS), false when running in a regular browser.
 */
export const isNative = Capacitor.isNativePlatform();

/**
 * Initialize native plugins. Call once at app startup.
 * Gracefully no-ops when running in a browser.
 */
export async function initNative() {
  if (!isNative) return;

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setBackgroundColor({ color: '#0a0a0a' });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    console.warn('[Native] StatusBar init skipped:', e.message);
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.warn('[Native] SplashScreen init skipped:', e.message);
  }

  try {
    const { Keyboard } = await import('@capacitor/keyboard');
    // Prevent keyboard from pushing the viewport on Android
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch (e) {
    console.warn('[Native] Keyboard init skipped:', e.message);
  }
}

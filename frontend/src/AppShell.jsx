import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import { fadeTransition } from './router/transitions';
import { ToastProvider } from './components/Toast';

export default function AppShell() {
    const location = useLocation();

    // Hide BottomNav on auth, onboarding, splash, and full-screen views
    const hideBottomNav = ['/splash', '/auth', '/onboarding', '/stories', '/qr', '/volunteer', '/manage', '/admin', '/event/create', '/post/create']
        .some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    // Fullscreen routes still use the app-shell container but disable scrolling & bottom padding
    const isFullscreen = location.pathname === '/chat' || location.pathname.startsWith('/chat/') || location.pathname.startsWith('/stories/create');

    return (
        <ToastProvider>
            <div
                className={`app-shell ${isFullscreen ? 'app-shell--fullscreen' : ''}`}
                style={hideBottomNav ? undefined : { paddingBottom: '80px' }}
            >
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={location.pathname}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={fadeTransition}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
            {!hideBottomNav && <BottomNav />}
        </ToastProvider>
    );
}

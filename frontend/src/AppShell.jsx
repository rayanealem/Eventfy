import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import { fadeTransition } from './router/transitions';
import { ToastProvider } from './components/Toast';

export default function AppShell() {
    const location = useLocation();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Hide BottomNav on auth, onboarding, splash, and full-screen views
    const hideBottomNav = ['/splash', '/auth', '/onboarding', '/stories', '/qr', '/volunteer', '/manage', '/admin', '/event/create', '/post/create']
        .some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    const isFullscreen = location.pathname === '/chat' || location.pathname.startsWith('/chat/');

    return (
        <ToastProvider>
            <div className={isFullscreen ? "" : "app-shell"} style={isFullscreen ? { height: '100vh', width: '100vw', overflow: 'hidden' } : { paddingBottom: '80px', position: 'relative', height: '100vh' }}>
                <AnimatePresence mode="wait">
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


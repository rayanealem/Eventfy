import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';
import { fadeTransition } from './router/transitions';

export default function AppShell() {
    const location = useLocation();
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Hide BottomNav on auth, onboarding, splash, and full-screen views
    const hideBottomNav = ['/splash', '/auth', '/onboarding', '/chat/', '/stories', '/qr', '/volunteer', '/manage', '/admin', '/event/create', '/post/create']
        .some(p => location.pathname === p || location.pathname.startsWith(p + '/') || location.pathname.startsWith(p));

    useEffect(() => {
        if (!window.visualViewport) return;

        const handleResize = () => {
            const viewportHeight = window.visualViewport.height;
            const windowHeight = window.innerHeight;
            setIsKeyboardOpen(viewportHeight < windowHeight - 150);
        };

        window.visualViewport.addEventListener('resize', handleResize);
        return () => window.visualViewport.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="app-shell" style={{ paddingBottom: 'env(safe-area-inset-bottom)', position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
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
            {!isKeyboardOpen && !hideBottomNav && <BottomNav />}
        </div>
    );
}


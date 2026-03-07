import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const SVGIcon = ({ shape, size, strokeWidth, color, fill }) => {
    switch (shape) {
        case 'circle':
            return <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill={fill} />;
        case 'triangle':
            return <polygon points="12,3 21,19 3,19" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />;
        case 'square':
            return <rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />;
        case 'diamond':
            return <polygon points="12,2 22,12 12,22 2,12" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />;
        case 'hexagon':
            return <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />;
        default: return null;
    }
};

const Icon = ({ shape, size = 24, strokeWidth = 2, color = 'white', fill = 'none' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <SVGIcon shape={shape} size={size} strokeWidth={strokeWidth} color={color} fill={fill} />
    </svg>
);

export default function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();

    // Simulate unread chat count
    const unreadMessagesCount = 1;

    // Hide nav on auth/onboarding/splash screens and full-screen views
    const hideOn = ['/splash', '/auth', '/onboarding', '/chat', '/stories', '/qr', '/volunteer', '/manage', '/admin', '/event/create', '/post/create'];
    const isHidden = hideOn.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    if (isHidden) return null;

    const navItems = [
        { path: '/feed', shape: 'circle', activeColor: '#f472b6' },
        { path: '/explore', shape: 'triangle', activeColor: '#fbbf24' },
        { path: '/scoreboard', shape: 'square', activeColor: '#2dd4bf' },
        { path: '/profile/me', shape: 'diamond', activeColor: '#3b82f6' },
        { path: '/chat', shape: 'hexagon', activeColor: '#f56e3d', badge: unreadMessagesCount }
    ];

    return (
        <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, width: '100%', margin: '0 auto', zIndex: 50, display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '64px', background: 'rgba(26, 29, 46, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {navItems.map(({ path, shape, activeColor, badge }) => {
                const isActive = location.pathname === path || (path === '/profile/me' && location.pathname.startsWith('/profile/'));

                return (
                    <NavLink
                        key={path}
                        to={path}
                        className="nav-item"
                        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '64px' }}
                        onClick={(e) => {
                            if (isActive) {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                    >
                        <motion.div
                            animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
                            transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                            style={{ position: 'relative' }}
                        >
                            <Icon
                                shape={shape}
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                color={isActive ? activeColor : 'rgba(255, 255, 255, 0.5)'}
                                fill={isActive ? activeColor : 'none'}
                            />
                            {badge > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', bounce: 0.5 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-8px',
                                        background: '#f56e3d',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        borderRadius: '9999px',
                                        width: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid #1a1d2e'
                                    }}
                                >
                                    {badge}
                                </motion.div>
                            )}
                        </motion.div>

                        {isActive && (
                            <motion.div
                                layoutId="nav-indicator"
                                style={{
                                    position: 'absolute',
                                    bottom: '0px',
                                    width: '32px',
                                    height: '3px',
                                    background: activeColor,
                                    borderRadius: '3px'
                                }}
                            />
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
}

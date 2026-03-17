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
        case 'hexagon':
            return <path d="M12 2 L21.39 7 L21.39 17 L12 22 L2.61 17 L2.61 7 Z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />;
        case 'diamond':
            return <polygon points="12,2 22,12 12,22 2,12" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill={fill} />;
        case 'chat':
            return <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={fill} />;
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
    const { profile } = useAuth();

    // Simulate unread chat count
    const unreadMessagesCount = 1;

    // Is the user an organizer/admin?
    const isOrg = profile?.role === 'organizer' || profile?.role === 'local_admin' || profile?.role === 'global_admin';

    // Strictly show ONLY on the requested core tabs
    const coreRoutes = ['/feed', '/explore', '/scoreboard', '/profile', '/chat', '/org', '/manage'];
    const isCoreRoute = coreRoutes.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

    if (!isCoreRoute) return null;

    // Map backend shape symbols to our SVGIcon component types
    const getProfileShape = () => {
        if (!profile || !profile.shape) return 'circle'; // fallback
        switch (profile.shape) {
            case '○': return 'circle';
            case '△': return 'triangle';
            case '□': return 'square';
            case '◇': return 'diamond';
            default: return 'circle';
        }
    };

    const profileShape = getProfileShape();
    const profileColor = profile?.shape_color || '#3b82f6';

    const navItems = [
        { path: '/feed', shape: 'circle', activeColor: '#f472b6' },
        { path: '/explore', shape: 'triangle', activeColor: '#fbbf24' },
        isOrg
            ? { path: '/org/dashboard', shape: 'hexagon', activeColor: '#fbbf24' }
            : { path: '/scoreboard', shape: 'square', activeColor: '#2dd4bf' },
        { path: '/profile/me', shape: profileShape, activeColor: profileColor },
        { path: '/chat', shape: 'chat', activeColor: '#f56e3d', badge: unreadMessagesCount }
    ];

    return (
        <>
            <nav
                className="bottom-nav custom-forced-nav"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '100%',
                    height: 'calc(72px + env(safe-area-inset-bottom))',
                    background: 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    zIndex: 99999 // Absolute maximum z-index
                }}
            >
                {navItems.map(({ path, shape, activeColor, badge }) => {
                    const isActive = location.pathname === path ||
                        (path === '/profile/me' && location.pathname.startsWith('/profile/')) ||
                        (path === '/org/dashboard' && (location.pathname.startsWith('/manage/') || location.pathname.startsWith('/org/')));

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
                                whileTap={{ scale: 0.85 }}
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
                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '0px',
                                        width: '32px',
                                        height: '3px',
                                        background: activeColor,
                                        borderRadius: '3px',
                                        boxShadow: `0 0 8px ${activeColor}`
                                    }}
                                />
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );
}

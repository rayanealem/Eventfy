import { NavLink, useLocation } from 'react-router-dom';

export default function BottomNav() {
    const location = useLocation();

    // Hide nav on auth/onboarding screens
    const hideOn = ['/splash', '/auth', '/onboarding'];
    if (hideOn.some(p => location.pathname.startsWith(p))) return null;

    return (
        <nav className="bottom-nav" id="bottom-nav">
            <NavLink to="/feed" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">○</span>
                <span className="nav-label">○ FEED</span>
            </NavLink>
            <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">△</span>
                <span className="nav-label">△ EXPLORE</span>
            </NavLink>
            <NavLink to="/profile/me" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">□</span>
                <span className="nav-label">□ EVENTS</span>
            </NavLink>
            <NavLink to="/profile/me" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">◇</span>
                <span className="nav-label">◇ PROFILE</span>
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">⬡</span>
                <span className="nav-label">⬡ CHAT</span>
            </NavLink>
        </nav>
    );
}

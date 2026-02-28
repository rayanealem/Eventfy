import { Link } from 'react-router-dom';
import './Placeholder.css';

/**
 * Generic placeholder screen for routes not yet implemented.
 * Shows the route name and a back button.
 */
export default function PlaceholderScreen({ title, icon, color }) {
    return (
        <div className="placeholder-screen page-content">
            <div className="placeholder-content">
                <div className="placeholder-icon" style={{ color: color || 'var(--color-coral)' }}>
                    {icon || '◇'}
                </div>
                <h1 className="heading-1">{title || 'COMING SOON'}</h1>
                <p className="text-body" style={{ textAlign: 'center' }}>
                    This screen is under construction. Check back soon.
                </p>
                <Link to="/feed" className="btn btn-outline btn-small" style={{ marginTop: 24 }}>
                    ← BACK TO ARENA
                </Link>
            </div>
        </div>
    );
}

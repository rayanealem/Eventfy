import './SkeletonCard.css';

export default function SkeletonCard({ variant = 'feed' }) {
    if (variant === 'feed') {
        return (
            <div className="skeleton-card">
                <div className="skeleton-image shimmer" />
                <div className="skeleton-body">
                    <div className="skeleton-line shimmer" style={{ width: '75%', height: '20px' }} />
                    <div className="skeleton-row">
                        <div className="skeleton-circle shimmer" />
                        <div className="skeleton-line shimmer" style={{ width: '40%' }} />
                    </div>
                    <div className="skeleton-tags">
                        <div className="skeleton-tag shimmer" />
                        <div className="skeleton-tag shimmer" />
                        <div className="skeleton-tag shimmer" />
                    </div>
                    <div className="skeleton-line shimmer" style={{ width: '100%', height: '4px', marginTop: '8px' }} />
                    <div className="skeleton-btn shimmer" />
                </div>
            </div>
        );
    }

    if (variant === 'profile') {
        return (
            <div className="skeleton-profile">
                <div className="skeleton-profile-avatar shimmer" />
                <div className="skeleton-line shimmer" style={{ width: '50%', height: '16px' }} />
                <div className="skeleton-line shimmer" style={{ width: '30%' }} />
            </div>
        );
    }

    return (
        <div className="skeleton-item">
            <div className="skeleton-circle shimmer" />
            <div className="skeleton-lines">
                <div className="skeleton-line shimmer" style={{ width: '60%' }} />
                <div className="skeleton-line shimmer" style={{ width: '40%' }} />
            </div>
        </div>
    );
}

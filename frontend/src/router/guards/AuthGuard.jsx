import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * AuthGuard — requires authenticated user with completed onboarding.
 * Redirects to /splash if not logged in, or /onboarding/1 (or /org/setup) if onboarding incomplete.
 */
export function AuthGuard({ children }) {
    const { user, profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#0a0a0a', color: '#00ffc2',
                fontFamily: 'Inter, system-ui, sans-serif',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>◆</div>
                    <div>Loading...</div>
                </div>
            </div>
        )
    }

    if (!user) return <Navigate to="/splash" replace />

    if (user && profile && !profile.onboarding_done) {
        if (['organizer', 'local_admin', 'global_admin'].includes(profile.role)) {
            if (!location.pathname.startsWith('/org/setup')) {
                return <Navigate to="/org/setup" replace />
            }
        } else {
            if (!location.pathname.startsWith('/onboarding')) {
                return <Navigate to="/onboarding/1" replace />
            }
        }
    }

    return children
}

/**
 * GuestGuard — only allows unauthenticated users.
 * Redirects authenticated users to /feed or onboarding.
 */
export function GuestGuard({ children }) {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#0a0a0a', color: '#00ffc2',
            }}>
                <div>Loading...</div>
            </div>
        )
    }

    if (user) {
        const isOrg = profile && ['organizer', 'local_admin', 'global_admin'].includes(profile.role);
        if (profile && !profile.onboarding_done) {
            if (isOrg) {
                return <Navigate to="/org/setup" replace />
            }
            return <Navigate to="/onboarding/1" replace />
        }
        if (isOrg) {
            return <Navigate to="/org/dashboard" replace />
        }
        return <Navigate to="/feed" replace />
    }
    return children
}

/**
 * OrgGuard — requires authenticated user with organizer role.
 * Redirects non-organizers to /feed.
 */
export function OrgGuard({ children }) {
    const { profile, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#0a0a0a', color: '#00ffc2',
            }}>
                <div>Loading...</div>
            </div>
        )
    }

    if (!profile || !['organizer', 'local_admin', 'global_admin'].includes(profile.role)) {
        return <Navigate to="/feed" replace />
    }

    if (!profile.onboarding_done && !location.pathname.startsWith('/org/setup')) {
        return <Navigate to="/org/setup" replace />
    }

    return children
}

/**
 * AdminGuard — requires admin role.
 */
export function AdminGuard({ children }) {
    const { profile, loading } = useAuth()

    if (loading) return null

    if (!profile || !['local_admin', 'global_admin'].includes(profile.role)) {
        return <Navigate to="/feed" replace />
    }

    return children
}

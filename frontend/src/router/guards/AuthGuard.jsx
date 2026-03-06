import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * AuthGuard — requires authenticated user with completed onboarding.
 * Redirects to /splash if not logged in, or /onboarding/1 if onboarding incomplete.
 */
export function AuthGuard({ children }) {
    const { user, profile, loading } = useAuth()

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
        return <Navigate to="/onboarding/1" replace />
    }

    return children
}

/**
 * GuestGuard — only allows unauthenticated users.
 * Redirects authenticated users to /feed.
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
        if (profile && !profile.onboarding_done) {
            return <Navigate to="/onboarding/1" replace />
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

    if (!profile || profile.role !== 'organizer') {
        return <Navigate to="/feed" replace />
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

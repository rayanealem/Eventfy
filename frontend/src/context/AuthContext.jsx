import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Get current session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    fetchProfile(session.user.id)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    async function fetchProfile(userId) {
        try {
            // Fetch complete profile including managed_orgs, skills, badges from backend
            const data = await api('GET', '/auth/me')
            setProfile(data)
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            // Fallback to basic profile if backend fails
            const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
            setProfile(data)
        } finally {
            setLoading(false)
        }
    }

    async function signOut() {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    async function refreshProfile() {
        if (user) await fetchProfile(user.id)
    }

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            supabase,
            signOut,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)

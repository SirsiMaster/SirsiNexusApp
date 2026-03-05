/**
 * useAuth — Firebase Authentication Hook
 *
 * Wraps onAuthStateChanged to provide reactive auth state.
 * Supports dev-mode mock auth when VITE_AUTH_MODE=mock.
 */
import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

// ── Auth Context Shape ────────────────────────────────────────────
export interface AuthState {
    user: User | null
    loading: boolean
    error: string | null
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthState | null>(null)

// ── Mock auth for local dev (VITE_AUTH_MODE=mock) ─────────────────
const IS_MOCK = import.meta.env.VITE_AUTH_MODE === 'mock'

const MOCK_USER = {
    uid: 'mock-admin-001',
    email: 'cylton@sirsi.ai',
    displayName: 'Cylton Collymore',
    emailVerified: true,
} as unknown as User

// ── Provider ──────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Listen for auth state changes
    useEffect(() => {
        if (IS_MOCK) {
            // In mock mode, auto-authenticate
            setUser(MOCK_USER)
            setLoading(false)
            return
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setLoading(false)
        }, (err) => {
            console.error('[Auth] onAuthStateChanged error:', err)
            setError(err.message)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const signIn = useCallback(async (email: string, password: string) => {
        setError(null)
        setLoading(true)
        try {
            if (IS_MOCK) {
                setUser(MOCK_USER)
                setLoading(false)
                return
            }
            await signInWithEmailAndPassword(auth, email, password)
            // onAuthStateChanged will update the user
        } catch (err: any) {
            const message = err?.code === 'auth/invalid-credential'
                ? 'Invalid email or password'
                : err?.code === 'auth/too-many-requests'
                    ? 'Too many attempts. Please try again later.'
                    : err?.message || 'Authentication failed'
            setError(message)
            setLoading(false)
            throw new Error(message)
        }
    }, [])

    const signOut = useCallback(async () => {
        try {
            if (IS_MOCK) {
                setUser(null)
                return
            }
            await firebaseSignOut(auth)
            // onAuthStateChanged will clear the user
        } catch (err: any) {
            console.error('[Auth] signOut error:', err)
        }
    }, [])

    const value: AuthState = {
        user,
        loading,
        error,
        signIn,
        signOut,
        isAuthenticated: !!user,
    }

    return (
        <AuthContext.Provider value= { value } >
        { children }
        </AuthContext.Provider>
    )
}

// ── Hook ──────────────────────────────────────────────────────────
export function useAuth(): AuthState {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export { AuthContext }

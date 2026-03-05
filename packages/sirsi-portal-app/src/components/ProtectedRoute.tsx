/**
 * ProtectedRoute — Canonical MFA Hub Gatekeeper
 *
 * Wraps admin content. Redirects unauthenticated users to /login.
 * Shows a loading spinner during auth state resolution.
 */
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'



export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth()
    const nav = useNavigate()

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            nav({ to: '/login' })
        }
    }, [loading, isAuthenticated, nav])

    // Loading state — show branded spinner
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#022c22',
                gap: 16,
            }}>
                <img src="/sirsi-icon.png" alt="Sirsi" style={{ width: 48, height: 48, opacity: 0.8 }} />
                <Loader2
                    size={24}
                    style={{
                        color: '#10b981',
                        animation: 'spin 1s linear infinite',
                    }}
                />
                <span style={{ color: '#94a3b8', fontSize: 13 }}>Verifying credentials...</span>
            </div>
        )
    }

    // Not authenticated — will redirect via useEffect
    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}

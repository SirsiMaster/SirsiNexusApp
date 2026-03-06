/**
 * Login — Firebase Auth + Legacy Demo Credentials
 *
 * Pixel-perfect port of: packages/sirsi-portal/login.html
 * Auth modes:
 *   1. Firebase signInWithEmailAndPassword (production)
 *   2. Demo credentials (Portal ID + Access Code, dev fallback)
 *
 * Routes by role:
 *   admin    → / (admin dashboard)
 *   investor → /investor-portal
 *   client   → /client-portal
 */

import { createRoute } from '@tanstack/react-router'
import { usePageMeta } from '../hooks/usePageMeta'
import { Route as rootRoute } from './__root'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/login',
    component: LoginPage,
})

// ── Canonical Portal Credentials (maps to real Firebase Auth accounts) ──
// Source of truth: governance/user_registry_canon.md
// Portal IDs + Access Codes → Firebase email + password
const PORTAL_CREDENTIALS = [
    { id: 'ADMIN', code: 'ADMIN2025', name: 'Administrator', role: 'admin', email: 'cylton@sirsi.ai' },
    { id: 'INV001', code: 'DEMO2025', name: 'Investor', role: 'investor', email: 'sirsimaster@gmail.com' },
    { id: 'CLIENT', code: 'CLIENT2025', name: 'Client', role: 'client', email: 'sirsimaster@gmail.com' },
]

const ROLE_ROUTES: Record<string, { path: string; label: string }> = {
    admin: { path: '/dashboard', label: 'Admin Portal' },
    investor: { path: '/investor-portal', label: 'Investor Portal' },
    client: { path: '/client-portal', label: 'Client Portal' },
}

function LoginPage() {
    usePageMeta('Login | SirsiNexus', 'Sign in to the SirsiNexus portal. Enterprise infrastructure management.')
    const { isAuthenticated, signIn } = useAuth()
    const [mode, setMode] = useState<'email' | 'demo'>('email')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [portalId, setPortalId] = useState('')
    const [accessCode, setAccessCode] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/dashboard'
        }
    }, [isAuthenticated])

    // ── Firebase Email Login ──
    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            setSuccess('Admin Portal')
            setTimeout(() => {
                window.location.href = '/dashboard'
            }, 1200)
        } catch (err: any) {
            setError(err.message || 'Authentication failed')
            setLoading(false)
        }
    }

    // ── Portal Credentials Login (Firebase Auth — NOT sessionStorage) ──
    const handleDemoLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const cred = PORTAL_CREDENTIALS.find(
            c => c.id === portalId.trim().toUpperCase() && c.code === accessCode.trim()
        )

        if (!cred) {
            setError('Invalid Portal ID or Access Code.')
            setLoading(false)
            return
        }

        try {
            // Use the access code as the Firebase password
            await signIn(cred.email, cred.code)
            setSuccess(ROLE_ROUTES[cred.role]?.label ?? 'Portal')
            const targetPath = ROLE_ROUTES[cred.role]?.path ?? '/dashboard'
            setTimeout(() => {
                window.location.href = targetPath
            }, 1200)
        } catch (err: any) {
            setError(err.message || 'Authentication failed')
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center px-4 py-6 flex-1 bg-gradient-to-br from-blue-50 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950">

            {/* Logo */}
            <div className="mb-4 flex flex-col items-center">
                <img
                    src="/sirsi-logo.png"
                    alt="Sirsi Logo"
                    className="w-16 h-16 object-contain mb-4"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                    }}
                />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">SirsiNexus Portal</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Secure access to financial data, documents, and communications
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6">

                {/* Mode Toggle */}
                <div className="flex mb-6 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => { setMode('email'); setError('') }}
                        className={`flex-1 py-2 text-sm rounded-md transition-all ${mode === 'email' ? 'bg-white dark:bg-slate-600 shadow-sm font-medium text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Email Login
                    </button>
                    <button
                        type="button"
                        onClick={() => { setMode('demo'); setError('') }}
                        className={`flex-1 py-2 text-sm rounded-md transition-all ${mode === 'demo' ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500'}`}
                    >
                        Demo Access
                    </button>
                </div>

                {/* ── Email Login Form ── */}
                {mode === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@sirsi.ai"
                                disabled={loading || !!success}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                                    bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                    disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={loading || !!success}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                                        bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                        disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!success || !email || !password}
                            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: success ? '#059669' : 'linear-gradient(135deg, #059669, #047857)' }}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {success ? '✅ Access Granted!' : loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                )}

                {/* ── Demo Access Form ── */}
                {mode === 'demo' && (
                    <form onSubmit={handleDemoLogin} className="space-y-5">
                        <div>
                            <label htmlFor="portal-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Portal ID
                            </label>
                            <input
                                id="portal-id"
                                type="text"
                                value={portalId}
                                onChange={e => setPortalId(e.target.value)}
                                placeholder="Enter your Portal ID"
                                disabled={loading || !!success}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                                    bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                    disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400"
                            />
                        </div>
                        <div>
                            <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Access Code
                            </label>
                            <div className="relative">
                                <input
                                    id="access-code"
                                    type={showPassword ? 'text' : 'password'}
                                    value={accessCode}
                                    onChange={e => setAccessCode(e.target.value)}
                                    placeholder="Enter your access code"
                                    disabled={loading || !!success}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm
                                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                        disabled:bg-gray-50 disabled:text-gray-400"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !!success || !portalId || !accessCode}
                            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: success ? '#059669' : 'linear-gradient(135deg, #059669, #047857)' }}
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {success ? '✅ Access Granted!' : loading ? 'Verifying...' : 'Access Portal'}
                        </button>

                        {/* Demo Credentials */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                            <strong>Demo Credentials:</strong>
                            <div className="mt-2 space-y-1">
                                <div>• ID: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">ADMIN</code> Code: <code className="bg-blue-100 px-1 rounded">ADMIN2025</code></div>
                                <div>• ID: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">INV001</code> Code: <code className="bg-blue-100 px-1 rounded">DEMO2025</code></div>
                                <div>• ID: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">CLIENT</code> Code: <code className="bg-blue-100 px-1 rounded">CLIENT2025</code></div>
                            </div>
                        </div>
                    </form>
                )}

                {/* Success message */}
                {success && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                        <strong>✅ Login Successful!</strong><br />
                        Redirecting to {success}...
                    </div>
                )}

                {/* Contact */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                    Need access? Contact us at{' '}
                    <a href="mailto:cylton@sirsi.ai" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                        cylton@sirsi.ai
                    </a>
                </p>
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Access requires approval from the administrator.
                </p>
            </div>

            {/* Back link */}
            <a href="/home" className="mt-4 text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors">
                ← Back to Home
            </a>
        </div>
    )
}

/**
 * Login — React port of login.html
 * 
 * Pixel-perfect port of: packages/sirsi-portal/login.html
 * Features: Portal ID + Access Code form, role-based routing,
 * demo credentials display, dark mode
 * 
 * Routes by role:
 *   admin    → / (admin dashboard)
 *   investor → /investor-portal
 *   client   → /client-portal
 */

import { createRoute, useNavigate } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useEffect } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/login',
    component: LoginPage,
})

// ── Canonical accounts (matches login.html VALID_CREDENTIALS) ──
const VALID_CREDENTIALS = [
    { id: 'ADMIN', code: 'ADMIN2025', name: 'Administrator', role: 'admin' },
    { id: 'INV001', code: 'DEMO2025', name: 'Investor', role: 'investor' },
    { id: 'CLIENT', code: 'CLIENT2025', name: 'Client', role: 'client' },
]

const ROLE_ROUTES: Record<string, { path: string; label: string }> = {
    admin: { path: '/', label: 'Admin Portal' },
    investor: { path: '/investor-portal', label: 'Investor Portal' },
    client: { path: '/client-portal', label: 'Client Portal' },
}

function LoginPage() {
    const navigate = useNavigate()
    const [portalId, setPortalId] = useState('')
    const [accessCode, setAccessCode] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<{ name: string; role: string } | null>(null)

    // Check existing auth
    useEffect(() => {
        const auth = sessionStorage.getItem('investorAuth')
        if (auth) {
            try {
                const data = JSON.parse(auth)
                const hours = (Date.now() - new Date(data.loginTime).getTime()) / (1000 * 60 * 60)
                if (hours < 24 && data.role) {
                    const route = ROLE_ROUTES[data.role]
                    if (route) navigate({ to: route.path } as any)
                }
            } catch { /* invalid session */ }
        }
    }, [navigate])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        setTimeout(() => {
            const cred = VALID_CREDENTIALS.find(
                c => c.id === portalId.trim() && c.code === accessCode.trim()
            )

            if (cred) {
                const session = {
                    id: cred.id,
                    name: cred.name,
                    role: cred.role,
                    loginTime: new Date().toISOString(),
                }
                sessionStorage.setItem('investorAuth', JSON.stringify(session))
                setSuccess({ name: cred.name, role: cred.role })

                setTimeout(() => {
                    const route = ROLE_ROUTES[cred.role]
                    navigate({ to: route?.path ?? '/' } as any)
                }, 1500)
            } else {
                setError('Invalid Portal ID or Access Code. Please try again.')
                setLoading(false)
                setPortalId('')
                setAccessCode('')
            }
        }, 1200)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
            style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%)' }}>

            {/* Logo */}
            <div className="mb-6 flex flex-col items-center">
                <img
                    src="/sirsi-logo.png"
                    alt="Sirsi Logo"
                    className="w-16 h-16 object-contain mb-4"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                    }}
                />
                <h1 className="text-2xl font-bold text-gray-900">SirsiNexus Portal</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Secure access to financial data, documents, and communications
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Portal ID */}
                    <div>
                        <label htmlFor="portal-id" className="block text-sm font-medium text-gray-700 mb-1">
                            Portal ID
                        </label>
                        <input
                            id="portal-id"
                            type="text"
                            value={portalId}
                            onChange={e => setPortalId(e.target.value)}
                            placeholder="Enter your Portal ID"
                            disabled={loading || !!success}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                                disabled:bg-gray-50 disabled:text-gray-400"
                        />
                    </div>

                    {/* Access Code */}
                    <div>
                        <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-1">
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
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !!success || !portalId || !accessCode}
                        className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{
                            background: success
                                ? '#059669'
                                : 'linear-gradient(135deg, #059669, #047857)',
                        }}
                    >
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        {success ? '✅ Access Granted!' : loading ? 'Verifying...' : 'Access Portal'}
                    </button>
                </form>

                {/* Success message */}
                {success && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                        <strong>✅ Login Successful!</strong><br />
                        Redirecting to {ROLE_ROUTES[success.role]?.label ?? 'Portal'}...
                    </div>
                )}

                {/* Contact */}
                <p className="text-center text-sm text-gray-500 mt-5">
                    Need access? Contact us at{' '}
                    <a href="mailto:cylton@sirsi.ai" className="text-emerald-600 hover:text-emerald-800 transition-colors">
                        cylton@sirsi.ai
                    </a>
                </p>
                <p className="text-center text-xs text-gray-400 mt-1">
                    Access requires approval from the administrator.
                </p>

                {/* Demo Credentials */}
                <div className="mt-5 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                    <strong>Demo Credentials:</strong>
                    <div className="mt-2 space-y-1">
                        <div>• ID: <code className="bg-blue-100 px-1 rounded">ADMIN</code> Code: <code className="bg-blue-100 px-1 rounded">ADMIN2025</code> (Admin Portal)</div>
                        <div>• ID: <code className="bg-blue-100 px-1 rounded">INV001</code> Code: <code className="bg-blue-100 px-1 rounded">DEMO2025</code> (Investor Portal)</div>
                        <div>• ID: <code className="bg-blue-100 px-1 rounded">CLIENT</code> Code: <code className="bg-blue-100 px-1 rounded">CLIENT2025</code> (Client Portal)</div>
                    </div>
                </div>
            </div>

            {/* Back link */}
            <a href="/" className="mt-6 text-emerald-600 hover:text-emerald-800 text-sm font-medium transition-colors">
                ← Back to Home
            </a>
        </div>
    )
}

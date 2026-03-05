/**
 * Client Portal — Standalone portal for client role
 * 
 * Pixel-perfect port of: packages/sirsi-portal/client/client-portal.html
 * Features: Provisioning placeholder with coming-soon features,
 * session display, sign out
 * 
 * Typography: Inter body ≤ 500 (Rule 21)
 */

import { createRoute, useNavigate } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/client-portal',
    component: ClientPortalPage,
})

const comingSoon = [
    'Contract review and e-signature',
    'Document vault access',
    'Secure messaging with your advisor',
    'Payment and billing history',
]

function ClientPortalPage() {
    const navigate = useNavigate()
    const [userName, setUserName] = useState('')

    useEffect(() => {
        const auth = sessionStorage.getItem('investorAuth')
        if (auth) {
            try {
                const data = JSON.parse(auth)
                setUserName(data.name || '')
            } catch { /* ignore */ }
        }
    }, [])

    const signOut = () => {
        sessionStorage.removeItem('investorAuth')
        navigate({ to: '/login' } as any)
    }

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="page-header">
                <h1>Client Portal</h1>
                <p className="page-subtitle">Your secure portal for contracts, documents, and communications</p>
            </div>

            {/* ── Provisioning Card ── */}
            <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
                <div className="text-center max-w-lg">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-800">
                        <Building2 size={40} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Client Portal</h2>
                    {userName && (
                        <p className="text-sm text-gray-500 mb-4">Welcome, {userName}</p>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm" style={{ fontWeight: 400, lineHeight: 1.7 }}>
                        Your client portal is being provisioned. This space will provide access to your
                        contracts, documents, and communications with Sirsi Technologies.
                    </p>

                    <div className="sirsi-card p-6 text-left space-y-4">
                        <h3 className="text-slate-900 dark:text-slate-100" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                            Coming Soon
                        </h3>
                        <ul className="space-y-3">
                            {comingSoon.map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400" style={{ fontWeight: 400 }}>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={signOut}
                        className="mt-6 text-emerald-600 hover:text-emerald-800 transition-colors text-sm font-medium"
                    >
                        ← Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}

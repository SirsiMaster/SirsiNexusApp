/**
 * System Settings — Theme-aware rewrite using canonical CSS classes
 *
 * Uses: page-header, page-subtitle, sirsi-card, btn-primary (all have .dark variants)
 * ADR: ADR-027 Phase 5 — React is source of truth
 * Typography: Inter, body ≤ 500 weight (Rule 21)
 */
import { createRoute } from '@tanstack/react-router'
import { useSystemSettings, useUpdateSettings } from '../hooks/useAdminService'
import { useState, useEffect } from 'react'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/settings',
    component: Settings,
})

function Settings() {
    const { data: settings } = useSystemSettings()
    const updateSettings = useUpdateSettings()
    const [localMultiplier, setLocalMultiplier] = useState(2.0)

    useEffect(() => {
        if (settings) {
            setLocalMultiplier(settings.sirsiMultiplier)
        }
    }, [settings])

    const handleUpdate = () => {
        updateSettings.mutate({
            settings: {
                maintenanceMode: settings?.maintenanceMode || false,
                activeRegion: settings?.activeRegion || "us-east4",
                sirsiMultiplier: localMultiplier
            }
        } as any)
    }

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="page-header">
                <h1>System Settings</h1>
                <p className="page-subtitle">Platform-wide Infrastructure Configuration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Financial Governance Card */}
                    <div className="sirsi-card" style={{ borderLeft: '3px solid #C8A951' }}>
                        <h3 className="text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: '#C8A951' }} />
                            <span className="text-slate-900 dark:text-slate-100">Financial Governance</span>
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest block mb-2" style={{ color: '#C8A951' }}>
                                    Sirsi Multiplier (Rule 13)
                                </label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="range"
                                        min="1.0"
                                        max="5.0"
                                        step="0.1"
                                        value={localMultiplier}
                                        onChange={(e) => setLocalMultiplier(parseFloat(e.target.value))}
                                        className="flex-1"
                                        style={{ accentColor: '#C8A951' }}
                                    />
                                    <div className="w-12 text-center text-lg text-slate-900 dark:text-slate-100" style={{ fontWeight: 600 }}>
                                        {localMultiplier.toFixed(1)}x
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                                    * Controls the spread between Internal Rate ($125/hr) and Blended Market Rate ($250/hr).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Card */}
                    <div className="sirsi-card">
                        <h3 className="text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-700" />
                            <span className="text-slate-900 dark:text-slate-100">Infrastructure</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Active Gateway Region</span>
                                <span className="text-xs font-mono" style={{ color: '#C8A951' }}>
                                    {settings?.activeRegion || 'us-central1'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 opacity-50">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Audit Persistence</span>
                                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">Cloud SQL / Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Compliance & Security Card */}
                    <div className="sirsi-card" style={{ borderLeft: '3px solid #10B981' }}>
                        <h3 className="text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-slate-900 dark:text-slate-100">Compliance &amp; Security</span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Bipartite MFA Protocol</span>
                                <span className="sirsi-badge sirsi-badge-success">Forced</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-700 dark:text-slate-300">Contract Immutability</span>
                                <span className="sirsi-badge sirsi-badge-success">Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleUpdate}
                            disabled={updateSettings.isPending as any}
                            className="btn-primary"
                        >
                            {updateSettings.isPending ? 'Syncing...' : 'Commit Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

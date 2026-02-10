// src/routes/settings.tsx
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
        // Use casting to satisfy Protobuf v2 type requirements without full constructor
        updateSettings.mutate({
            settings: {
                maintenanceMode: settings?.maintenanceMode || false,
                activeRegion: settings?.activeRegion || "us-east4",
                sirsiMultiplier: localMultiplier
            }
        } as any)
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl">System Settings</h1>
                <p className="text-white/40 mt-1">Platform-wide Infrastructure Configuration</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="glass-panel p-6 gold-border">
                        <h3 className="text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sirsi-gold shadow-[0_0_8px_#C8A951]" />
                            Financial Governance
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-sirsi-gold uppercase tracking-widest block mb-2">Sirsi Multiplier (Rule 13)</label>
                                <div className="flex gap-4">
                                    <input
                                        type="range"
                                        min="1.0"
                                        max="5.0"
                                        step="0.1"
                                        value={localMultiplier}
                                        onChange={(e) => setLocalMultiplier(parseFloat(e.target.value))}
                                        className="flex-1 accent-sirsi-gold"
                                    />
                                    <div className="w-12 text-center font-bold text-lg">{localMultiplier.toFixed(1)}x</div>
                                </div>
                                <p className="text-[10px] text-white/30 mt-2 italic">
                                    * Controls the spread between Internal Rate ($125/hr) and Blended Market Rate ($250/hr).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sirsi-forest shadow-[0_0_8px_#102a22]" />
                            Infrastructure
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
                                <span className="text-sm">Active Gateway Region</span>
                                <span className="text-xs font-mono text-sirsi-gold">us-east4 (N. Virginia)</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10 opacity-50">
                                <span className="text-sm">Audit Persistence</span>
                                <span className="text-xs font-mono">Cloud SQL / Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel p-6 border-sirsi-emerald/20 border">
                        <h3 className="text-lg mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-sirsi-emerald shadow-[0_0_8px_#10B981]" />
                            Compliance & Security
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Bipartite MFA Protocol</span>
                                <span className="text-[10px] text-sirsi-emerald border border-sirsi-emerald/30 px-2 py-0.5 rounded uppercase">Forced</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Contract Immutability</span>
                                <span className="text-[10px] text-sirsi-emerald border border-sirsi-emerald/30 px-2 py-0.5 rounded uppercase">Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleUpdate}
                            disabled={updateSettings.isPending as any}
                            className="action-btn"
                        >
                            {updateSettings.isPending ? 'Syncing...' : 'Commit Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

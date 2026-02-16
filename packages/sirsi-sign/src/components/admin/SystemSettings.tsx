import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../../hooks/useAdmin';

export function SystemSettings() {
    const { data: settings, isLoading, isError } = useSettings();
    const updateSettings = useUpdateSettings();

    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [region, setRegion] = useState('us-central1');
    const [multiplier, setMultiplier] = useState(2.0);

    // Sync local state with backend data
    useEffect(() => {
        if (settings) {
            setMaintenanceMode(settings.maintenanceMode);
            setRegion(settings.activeRegion);
            setMultiplier(settings.sirsiMultiplier);
        }
    }, [settings]);

    const handleSave = () => {
        updateSettings.mutate({
            maintenanceMode,
            activeRegion: region,
            sirsiMultiplier: multiplier
        });
    };

    if (isLoading) return <div className="p-12 text-center text-gold cinzel animate-pulse">Synchronizing with Sirsi Cluster...</div>;
    if (isError) return <div className="p-12 text-center text-red-500 cinzel border border-red-500/20 rounded-xl bg-red-500/5">Failed to acquire system configuration.</div>;

    const hasChanges = settings && (
        maintenanceMode !== settings.maintenanceMode ||
        region !== settings.activeRegion ||
        multiplier !== settings.sirsiMultiplier
    );

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gold/20 pb-4">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest">System Configuration</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Global environment variables & governance</p>
                </div>
                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={updateSettings.isPending}
                        className="px-6 py-2 bg-gold text-navy cinzel font-bold tracking-widest uppercase text-xs rounded hover:bg-gold-bright transition-all shadow-[0_0_15px_rgba(200,169,81,0.3)]"
                    >
                        {updateSettings.isPending ? 'Propagating...' : 'Commit Changes →'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Governance */}
                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6">
                    <h3 className="cinzel text-xs text-gold tracking-widest font-bold uppercase">Governance Controls</h3>

                    <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg">
                        <div className="flex flex-col">
                            <span className="inter text-sm text-white font-medium">Maintenance Mode</span>
                            <span className="inter text-[10px] text-slate-500 uppercase">Stop all new contract generations</span>
                        </div>
                        <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${maintenanceMode ? 'bg-red-500' : 'bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Active Deployment Region</label>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded px-4 py-2 text-white inter text-sm outline-none"
                        >
                            <option value="us-central1">us-central1 (Iowa)</option>
                            <option value="us-east1">us-east1 (S. Carolina)</option>
                            <option value="europe-west1">europe-west1 (Belgium)</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="inter text-[10px] text-slate-500 uppercase tracking-widest">Sirsi Multiplier (Rule 13)</label>
                            <span className="text-gold font-bold font-mono text-sm">{multiplier.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="1.0"
                            max="3.0"
                            step="0.1"
                            value={multiplier}
                            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                            className="w-full accent-gold h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[8px] text-slate-600 inter uppercase font-bold tracking-widest">
                            <span>1.0x (Market)</span>
                            <span>3.0x (Ultra-Tier)</span>
                        </div>
                    </div>
                </div>

                {/* Integration Secrets Status */}
                <div className="neo-glass-panel p-8 border border-white/10 rounded-xl flex flex-col gap-6">
                    <h3 className="cinzel text-xs text-gold tracking-widest font-bold uppercase">Integration Health</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Stripe Live Connect', status: 'Healthy', key: 'pk_live_...4k39' },
                            { name: 'OpenSign API Node', status: 'Healthy', key: 'node_ext_...90bc' },
                            { name: 'Gemini 3.0 (Vertex AI)', status: 'Active', key: 'vertex_sa_...f2e0' },
                            { name: 'Firebase Admin SDK', status: 'Connected', key: 'service-account' },
                        ].map((integration, i) => (
                            <div key={i} className="flex justify-between items-start bg-black/20 p-4 rounded-lg border border-white/5">
                                <div className="flex flex-col">
                                    <span className="inter text-sm text-white font-medium">{integration.name}</span>
                                    <span className="inter text-[9px] text-slate-500 font-mono mt-1">{integration.key}</span>
                                </div>
                                <span className={`inter text-[9px] font-bold uppercase px-2 py-1 rounded bg-white/5 border ${integration.status === 'Healthy' || integration.status === 'Active' || integration.status === 'Connected'
                                    ? 'text-emerald border-emerald/20' : 'text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {integration.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 border border-white/10 text-white inter text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-white/5 transition-all">
                        Rotate All Security Keys
                    </button>
                </div>
            </div>
        </div>
    );
}

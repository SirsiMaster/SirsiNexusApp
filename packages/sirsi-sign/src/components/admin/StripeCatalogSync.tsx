import { useState } from 'react';
import { useSyncCatalog } from '../../hooks/useAdmin';

export interface SyncItem {
    id: string;
    name: string;
    amount: number; // in cents
    description: string;
    recurring: boolean;
}

interface StripeCatalogSyncProps {
    items: SyncItem[];
    projectName?: string;
}

export function StripeCatalogSync({ items, projectName = 'System' }: StripeCatalogSyncProps) {
    const syncMutation = useSyncCatalog();
    const [syncLogs, setSyncLogs] = useState<string[]>([]);

    const handleSync = async () => {
        if (!window.confirm(`Synchronize ${projectName} Catalog with Stripe Live? This will create persistent products and prices in the connected account.`)) return;

        setSyncLogs([`🚀 Initiating ${projectName} Cluster Synchronization...`, '📡 Connecting to Sirsi Admin gRPC Service...']);

        try {
            const resp = await syncMutation.mutateAsync(items);
            if (resp.success) {
                setSyncLogs(prev => [...prev, ...resp.logs, '✅ Synchronization Complete.']);
            }
        } catch (e: any) {
            setSyncLogs(prev => [...prev, `❌ gRPC Error: ${e.message}`]);
        }
    };

    const syncing = syncMutation.isPending;

    return (
        <div className="flex flex-col gap-4">
            <button
                onClick={handleSync}
                disabled={syncing || items.length === 0}
                className="w-full py-3 border border-emerald/20 text-emerald inter text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-emerald/5 transition-all disabled:opacity-50"
            >
                {syncing ? 'Synchronizing Cluster...' : `Sync ${projectName} to Stripe`}
            </button>

            {syncLogs.length > 0 && (
                <div className="bg-black/40 p-4 rounded-lg border border-white/5 font-mono text-[9px] text-emerald/80 max-h-40 overflow-y-auto space-y-1">
                    {syncLogs.map((log, i) => <div key={i}>{log}</div>)}
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { CatalogManager } from './CatalogManager';
import { TemplateArchitect } from './TemplateArchitect';
import { useGovernanceStore } from '../../../store/useGovernanceStore';

type GovernanceTab = 'catalog' | 'templates';

export function GovernancePortal() {
    const [activeTab, setActiveTab] = useState<GovernanceTab>('catalog');
    const resetToDefaults = useGovernanceStore(state => state.resetToDefaults);

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-gold/20 pb-4">
                <div>
                    <h2 className="cinzel text-2xl text-gold tracking-widest uppercase">Studio Governance Engine</h2>
                    <p className="inter text-xs text-slate-500 mt-1 uppercase tracking-tighter">Modify core business logic, pricing, and contract archetypes</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={resetToDefaults}
                        className="px-6 py-2 border border-red-500/20 text-red-500/60 inter font-bold tracking-widest uppercase text-[10px] rounded hover:bg-red-500/5 transition-all"
                    >
                        Reset All to Defaults
                    </button>
                    <button
                        className="px-6 py-2 bg-gold text-navy cinzel font-bold tracking-widest uppercase text-xs rounded hover:bg-gold-bright transition-all shadow-[0_0_15px_rgba(200,169,81,0.3)]"
                    >
                        Snapshot & Propagate →
                    </button>
                </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex gap-8 border-b border-white/5 pb-0">
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`pb-4 inter text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'catalog' ? 'text-gold' : 'text-slate-500 hover:text-white'
                        }`}
                >
                    Product & Addon Catalog
                    {activeTab === 'catalog' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_8px_#C8A951]" />}
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`pb-4 inter text-xs font-bold uppercase tracking-widest transition-all relative ${activeTab === 'templates' ? 'text-gold' : 'text-slate-500 hover:text-white'
                        }`}
                >
                    Contract Base Templates
                    {activeTab === 'templates' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold shadow-[0_0_8px_#C8A951]" />}
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                {activeTab === 'catalog' && <CatalogManager />}
                {activeTab === 'templates' && <TemplateArchitect />}
            </div>
        </div>
    );
}

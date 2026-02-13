import { useState } from 'react';
import { useGovernanceStore } from '../../../store/useGovernanceStore';


const S = {
    card: "bg-black/20 border border-white/10 rounded-xl p-6 hover:border-gold/30 transition-all",
    input: "w-full bg-navy border border-white/10 rounded px-4 py-2 text-white text-sm inter outline-none focus:border-gold/50",
    label: "inter text-[10px] text-slate-500 uppercase tracking-widest mb-1 block font-bold",
    btnPrimary: "px-4 py-2 bg-gold text-navy cinzel font-bold text-[10px] tracking-widest uppercase rounded hover:bg-gold-bright transition-all",
    btnGhost: "px-4 py-2 border border-white/10 text-white inter text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white/5",
    badge: "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter"
};

export function CatalogManager() {
    const { products, bundles, updateProduct, updateBundle } = useGovernanceStore();
    const [filter, setFilter] = useState('');

    const filteredProducts = Object.values(products).filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.id.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            {/* Catalog Controls */}
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                <div>
                    <h3 className="cinzel text-lg text-gold tracking-widest">Addon Registry</h3>
                    <p className="inter text-[10px] text-slate-500 uppercase mt-1">Manage individual service components and pricing</p>
                </div>
                <div className="flex gap-4">
                    <input
                        placeholder="Search addons..."
                        className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 inter text-xs outline-none focus:border-gold/30 w-64"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                    <button className={S.btnPrimary}>+ New Addon</button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className={S.card}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="inter text-sm font-bold text-white">{product.name}</h4>
                                <span className="text-[9px] font-mono text-slate-500 uppercase">{product.id}</span>
                            </div>
                            <span className={`${S.badge} ${product.category === 'platform' ? 'bg-emerald/10 text-emerald border border-emerald/20' :
                                product.category === 'feature' ? 'bg-gold/10 text-gold border border-gold/20' :
                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                }`}>
                                {product.category}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={S.label}>Bundled Price</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gold font-mono text-sm">$</span>
                                        <input
                                            type="number"
                                            className={S.input}
                                            value={product.bundledPrice}
                                            onChange={(e) => updateProduct(product.id, { bundledPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={S.label}>Standalone</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-mono text-sm">$</span>
                                        <input
                                            type="number"
                                            className={S.input}
                                            value={product.standalonePrice || 0}
                                            onChange={(e) => updateProduct(product.id, { standalonePrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={S.label}>Labor Hours</label>
                                    <input
                                        type="number"
                                        className={S.input}
                                        value={product.hours}
                                        onChange={(e) => updateProduct(product.id, { hours: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className={S.label}>Timeline ({product.timelineUnit})</label>
                                    <input
                                        type="number"
                                        className={S.input}
                                        value={product.timeline}
                                        onChange={(e) => updateProduct(product.id, { timeline: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={S.label}>Short Description</label>
                                <textarea
                                    className={`${S.input} h-20 resize-none`}
                                    value={product.shortDescription}
                                    onChange={(e) => updateProduct(product.id, { shortDescription: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2 border-t border-white/5 pt-4">
                            <button className={S.btnGhost}>Scope Items</button>
                            <button className={S.btnGhost}>WBS Logic</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bundles Section */}
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="cinzel text-lg text-gold tracking-widest">Base Bundles</h3>
                        <p className="inter text-[10px] text-slate-500 uppercase mt-1">Comprehensive platform packages</p>
                    </div>
                    <button className={S.btnPrimary}>+ New Bundle</button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {Object.values(bundles).map(bundle => (
                        <div key={bundle.id} className="neo-glass-panel p-8 border border-white/10 rounded-2xl flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h4 className="cinzel text-xl text-white mb-2">{bundle.name}</h4>
                                <p className="inter text-sm text-slate-400 mb-6">{bundle.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className={S.label}>Base Price</label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gold font-mono text-xl">$</span>
                                            <input
                                                type="number"
                                                className="bg-transparent border-b border-gold/30 text-gold cinzel text-xl outline-none w-24"
                                                value={bundle.price}
                                                onChange={(e) => updateBundle(bundle.id, { price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={S.label}>Total Hours</label>
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-white/10 text-white inter text-xl outline-none w-20"
                                            value={bundle.hours}
                                            onChange={(e) => updateBundle(bundle.id, { hours: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className={S.label}>Timeline</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="bg-transparent border-b border-white/10 text-white inter text-xl outline-none w-16"
                                                value={bundle.timeline}
                                                onChange={(e) => updateBundle(bundle.id, { timeline: Number(e.target.value) })}
                                            />
                                            <span className="inter text-xs text-slate-500 uppercase">{bundle.timelineUnit}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={S.label}>Addon Discount</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                className="bg-transparent border-b border-white/10 text-white inter text-xl outline-none w-12"
                                                value={bundle.addonDiscount}
                                                onChange={(e) => updateBundle(bundle.id, { addonDiscount: Number(e.target.value) })}
                                            />
                                            <span className="inter text-xs text-slate-500">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-80 bg-black/30 rounded-xl p-6 border border-white/5">
                                <h5 className={S.label}>Included Products</h5>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {bundle.includedProducts.map(pid => (
                                        <span key={pid} className="inter text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300">
                                            {products[pid]?.name || pid}
                                        </span>
                                    ))}
                                </div>
                                <button className="w-full mt-6 py-2 border border-white/10 text-white inter text-[10px] font-bold uppercase tracking-widest rounded hover:bg-white/5">
                                    Edit Bundle Contents
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

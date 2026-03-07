/**
 * Catalog Manager — Admin CRUD for Products & Bundles
 *
 * Full catalog management via CatalogService gRPC.
 * Swiss Neo-Deco Admin Portal rubric:
 *  - page-header / page-subtitle for header
 *  - sirsi-card for panels
 *  - sirsi-table-wrap / sirsi-table for data tables
 *  - sirsi-badge-* for status
 *  - btn-primary / btn-secondary for actions
 *  - Inter headings (admin convention), body ≤ 500 weight
 */

import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@connectrpc/connect'
import { CatalogService } from '@/gen/sirsi/admin/v2/catalog_pb'
import { transport } from '@/lib/transport'
import { usePageMeta } from '../hooks/usePageMeta'
import {
    Package, Layers, Plus, Archive, RotateCcw, Edit,
    DollarSign, Search, RefreshCw, CheckCircle, XCircle,
    Clock, Tag,
} from 'lucide-react'
import type { CatalogProduct, CatalogBundle } from '@/gen/sirsi/admin/v2/catalog_pb'

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/catalog', component: CatalogManagerPage })

// ── gRPC Client ───────────────────────────────────────────────────
const catalogClient = createClient(CatalogService, transport)

// ── Helpers ───────────────────────────────────────────────────────
function formatCents(cents: bigint | number): string {
    const num = Number(cents) / 100
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
}

function timeAgo(ts: bigint | number | string): string {
    if (!ts) return '—'
    // Backend sends UnixMilli (13 digits). Detect and handle both ms and seconds.
    let msTime: number
    if (typeof ts === 'bigint') {
        const n = Number(ts)
        msTime = n > 1e12 ? n : n * 1000 // 13+ digits = ms, otherwise seconds
    } else if (typeof ts === 'number') {
        msTime = ts > 1e12 ? ts : ts * 1000
    } else {
        const parsed = Number(ts)
        msTime = parsed > 1e12 ? parsed : parsed * 1000
    }
    const diff = Date.now() - msTime
    if (diff < 0) return 'just now'
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

// ── Hooks ──────────────────────────────────────────────────────────
function useProducts(tenantId: string, includeArchived: boolean) {
    const [products, setProducts] = useState<CatalogProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await catalogClient.listProducts({ tenantId, includeArchived, categoryFilter: '' })
            setProducts(res.products)
        } catch (err: any) {
            setError(err?.message || 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }, [tenantId, includeArchived])

    useEffect(() => { refetch() }, [refetch])
    return { products, loading, error, refetch }
}

function useBundles(tenantId: string, includeArchived: boolean) {
    const [bundles, setBundles] = useState<CatalogBundle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refetch = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await catalogClient.listBundles({ tenantId, includeArchived })
            setBundles(res.bundles)
        } catch (err: any) {
            setError(err?.message || 'Failed to load bundles')
        } finally {
            setLoading(false)
        }
    }, [tenantId, includeArchived])

    useEffect(() => { refetch() }, [refetch])
    return { bundles, loading, error, refetch }
}

// ── Main Component ────────────────────────────────────────────────
function CatalogManagerPage() {
    usePageMeta('Catalog Manager | SirsiNexus', 'Manage products, bundles, and pricing across the Sirsi catalog.')

    const [activeTab, setActiveTab] = useState<'products' | 'bundles'>('products')
    const [tenantId, setTenantId] = useState('')
    const [showArchived, setShowArchived] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    const { products, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts(tenantId, showArchived)
    const { bundles, loading: bundlesLoading, error: bundlesError, refetch: refetchBundles } = useBundles(tenantId, showArchived)

    // Derived stats
    const totalProducts = products.length
    const activeProducts = products.filter(p => !p.archived).length
    const archivedProducts = products.filter(p => p.archived).length
    const totalBundles = bundles.length

    // Filtered by search
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    const filteredBundles = bundles.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleArchive = async (id: string) => {
        try {
            await catalogClient.archiveProduct({ id })
            refetchProducts()
        } catch (err) { console.error('Archive failed:', err) }
    }

    const handleRecover = async (id: string) => {
        try {
            await catalogClient.recoverProduct({ id })
            refetchProducts()
        } catch (err) { console.error('Recover failed:', err) }
    }

    return (
        <div>
            {/* ── Page Header ── */}
            <div className="page-header flex justify-between items-end">
                <div>
                    <h1>Catalog Manager</h1>
                    <p className="page-subtitle">
                        Products, Bundles & Stripe Sync — CatalogService gRPC
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="btn-secondary flex items-center gap-2"
                        onClick={() => { refetchProducts(); refetchBundles() }}
                    >
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button
                        className="btn-primary flex items-center gap-2"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus size={14} /> Create {activeTab === 'products' ? 'Product' : 'Bundle'}
                    </button>
                </div>
            </div>

            {/* ── KPI Row ── */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <KPICard icon={Package} label="Total Products" value={totalProducts} color="emerald" />
                <KPICard icon={CheckCircle} label="Active" value={activeProducts} color="green" />
                <KPICard icon={Archive} label="Archived" value={archivedProducts} color="slate" />
                <KPICard icon={Layers} label="Bundles" value={totalBundles} color="amber" />
            </div>

            {/* ── Filter Bar ── */}
            <div className="sirsi-card mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        <button
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'products'
                                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            onClick={() => setActiveTab('products')}
                        >
                            <Package size={14} className="inline mr-1.5 -mt-0.5" /> Products
                        </button>
                        <button
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'bundles'
                                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                            onClick={() => setActiveTab('bundles')}
                        >
                            <Layers size={14} className="inline mr-1.5 -mt-0.5" /> Bundles
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search catalog..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="sirsi-input pl-9 w-full"
                        />
                    </div>

                    {/* Tenant Filter */}
                    <select
                        className="sirsi-select"
                        value={tenantId}
                        onChange={e => setTenantId(e.target.value)}
                    >
                        <option value="">All Tenants</option>
                        <option value="sirsi">Sirsi (Platform)</option>
                        <option value="finalwishes">FinalWishes</option>
                        <option value="assiduous">Assiduous</option>
                    </select>

                    {/* Archived Toggle */}
                    <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={e => setShowArchived(e.target.checked)}
                            className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                        />
                        Show Archived
                    </label>
                </div>
            </div>

            {/* ── Content Area ── */}
            {activeTab === 'products' ? (
                <ProductsTable
                    products={filteredProducts}
                    loading={productsLoading}
                    error={productsError}
                    onArchive={handleArchive}
                    onRecover={handleRecover}
                />
            ) : (
                <BundlesTable
                    bundles={filteredBundles}
                    loading={bundlesLoading}
                    error={bundlesError}
                />
            )}

            {/* ── Create Modal ── */}
            {showCreateModal && (
                <CreateProductModal
                    type={activeTab}
                    tenantId={tenantId || 'sirsi'}
                    onClose={() => setShowCreateModal(false)}
                    onCreated={() => { setShowCreateModal(false); refetchProducts(); refetchBundles() }}
                />
            )}
        </div>
    )
}

// ── KPI Card ──────────────────────────────────────────────────────
function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colorMap: Record<string, string> = {
        emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
        green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30',
        slate: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
        amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
    }
    return (
        <div className="sirsi-card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            </div>
        </div>
    )
}

// ── Products Table ────────────────────────────────────────────────
function ProductsTable({ products, loading, error, onArchive, onRecover }: {
    products: CatalogProduct[]; loading: boolean; error: string | null;
    onArchive: (id: string) => void; onRecover: (id: string) => void
}) {
    if (loading) return <div className="sirsi-card text-center py-12 text-muted-foreground">Loading products...</div>
    if (error) return <div className="sirsi-card text-center py-12 text-red-500">Error: {error}</div>
    if (products.length === 0) return (
        <div className="sirsi-card text-center py-12">
            <Package size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-muted-foreground">No products found. Create your first product to get started.</p>
        </div>
    )

    return (
        <div className="sirsi-table-wrap">
            <table className="sirsi-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Billing</th>
                        <th>Stripe</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Tag size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">{product.name}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{product.shortDescription || '—'}</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className="sirsi-badge">{product.category || 'Uncategorized'}</span>
                            </td>
                            <td className="font-mono text-sm font-medium">{formatCents(product.priceCents)}</td>
                            <td>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${product.recurring
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                    }`}>
                                    {product.recurring ? product.interval || 'monthly' : 'one-time'}
                                </span>
                            </td>
                            <td>
                                {product.stripePriceId ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle size={12} /> Synced
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <XCircle size={12} /> Pending
                                    </span>
                                )}
                            </td>
                            <td>
                                {product.archived ? (
                                    <span className="sirsi-badge-warning">Archived</span>
                                ) : (
                                    <span className="sirsi-badge-success">Active</span>
                                )}
                            </td>
                            <td className="text-xs text-muted-foreground whitespace-nowrap">
                                <Clock size={12} className="inline mr-1" />
                                {timeAgo(product.updatedAt)}
                            </td>
                            <td className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    <button className="btn-ghost p-1.5" title="Edit">
                                        <Edit size={14} />
                                    </button>
                                    {product.archived ? (
                                        <button className="btn-ghost p-1.5 text-emerald-600" title="Recover" onClick={() => onRecover(product.id)}>
                                            <RotateCcw size={14} />
                                        </button>
                                    ) : (
                                        <button className="btn-ghost p-1.5 text-amber-600" title="Archive" onClick={() => onArchive(product.id)}>
                                            <Archive size={14} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// ── Bundles Table ─────────────────────────────────────────────────
function BundlesTable({ bundles, loading, error }: {
    bundles: CatalogBundle[]; loading: boolean; error: string | null
}) {
    if (loading) return <div className="sirsi-card text-center py-12 text-muted-foreground">Loading bundles...</div>
    if (error) return <div className="sirsi-card text-center py-12 text-red-500">Error: {error}</div>
    if (bundles.length === 0) return (
        <div className="sirsi-card text-center py-12">
            <Layers size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-muted-foreground">No bundles found. Create a bundle to group products together.</p>
        </div>
    )

    return (
        <div className="sirsi-table-wrap">
            <table className="sirsi-table">
                <thead>
                    <tr>
                        <th>Bundle</th>
                        <th>Products</th>
                        <th>Bundle Price</th>
                        <th>Discount</th>
                        <th>Stripe</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th className="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bundles.map(bundle => (
                        <tr key={bundle.id}>
                            <td>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                        <Layers size={14} className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">{bundle.name}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{bundle.shortDescription || '—'}</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className="sirsi-badge">{bundle.includedProductIds?.length || 0} products</span>
                            </td>
                            <td className="font-mono text-sm font-medium">{formatCents(bundle.priceCents)}</td>
                            <td>
                                {bundle.addonDiscountPct > 0 ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                                        {bundle.addonDiscountPct}% off
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground text-sm">—</span>
                                )}
                            </td>
                            <td>
                                {bundle.stripePriceId ? (
                                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle size={12} /> Synced
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <XCircle size={12} /> Pending
                                    </span>
                                )}
                            </td>
                            <td>
                                {bundle.archived ? (
                                    <span className="sirsi-badge-warning">Archived</span>
                                ) : (
                                    <span className="sirsi-badge-success">Active</span>
                                )}
                            </td>
                            <td className="text-xs text-muted-foreground whitespace-nowrap">
                                <Clock size={12} className="inline mr-1" />
                                {timeAgo(bundle.updatedAt)}
                            </td>
                            <td className="text-right">
                                <button className="btn-ghost p-1.5" title="Edit">
                                    <Edit size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// ── Create Product Modal ──────────────────────────────────────────
function CreateProductModal({ type, tenantId, onClose, onCreated }: {
    type: 'products' | 'bundles'; tenantId: string; onClose: () => void; onCreated: () => void
}) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [category, setCategory] = useState('service')
    const [price, setPrice] = useState('')
    const [recurring, setRecurring] = useState(false)
    const [interval, setInterval] = useState('monthly')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const priceCents = BigInt(Math.round(parseFloat(price) * 100))

            if (type === 'products') {
                await catalogClient.createProduct({
                    tenantId,
                    name,
                    shortDescription: description,
                    description,
                    category,
                    priceCents,
                    standalonePriceCents: BigInt(0),
                    hours: 0,
                    timelineWeeks: 0,
                    timelineUnit: 'weeks',
                    recurring,
                    interval: recurring ? interval : 'one_time',
                    features: [],
                    detailedScope: [],
                })
            } else {
                await catalogClient.createBundle({
                    tenantId,
                    name,
                    shortDescription: description,
                    description,
                    priceCents,
                    hours: 0,
                    timelineWeeks: 0,
                    timelineUnit: 'weeks',
                    addonDiscountPct: 0,
                    includedProductIds: [],
                })
            }
            onCreated()
        } catch (err) {
            console.error('Create failed:', err)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-foreground">
                        Create {type === 'products' ? 'Product' : 'Bundle'}
                    </h2>
                    <button onClick={onClose} className="btn-ghost p-1.5">
                        <XCircle size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="sirsi-label">Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)}
                            className="sirsi-input w-full" placeholder="e.g. Platform Development" />
                    </div>

                    <div>
                        <label className="sirsi-label">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)}
                            className="sirsi-textarea w-full" rows={3} placeholder="Brief description..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {type === 'products' && (
                            <div>
                                <label className="sirsi-label">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="sirsi-select w-full">
                                    <option value="service">Service</option>
                                    <option value="platform">Platform</option>
                                    <option value="subscription">Subscription</option>
                                    <option value="addon">Add-on</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="sirsi-label">Price (USD)</label>
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="number" required min="0" step="0.01" value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="sirsi-input w-full pl-9" placeholder="0.00" />
                            </div>
                        </div>
                    </div>

                    {type === 'products' && (
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                                <input type="checkbox" checked={recurring} onChange={e => setRecurring(e.target.checked)}
                                    className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500" />
                                Recurring billing
                            </label>
                            {recurring && (
                                <select value={interval} onChange={e => setInterval(e.target.value)} className="sirsi-select">
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                            {submitting ? (
                                <><RefreshCw size={14} className="animate-spin" /> Creating...</>
                            ) : (
                                <><Plus size={14} /> Create {type === 'products' ? 'Product' : 'Bundle'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

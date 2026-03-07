/**
 * useCatalog — gRPC-backed catalog management hooks
 * 
 * Replaces the old Zustand-based useGovernanceStore for product/bundle CRUD.
 * All mutations sync to Stripe automatically via the Go CatalogService backend.
 */
import { useState, useEffect, useCallback } from 'react';
import { catalogClient } from '../lib/grpc';
import type { CatalogProduct, CatalogBundle } from '../gen/sirsi/admin/v2/catalog_pb';

// ═══════════════════════════════════════════════════════════════════
// Product Hooks
// ═══════════════════════════════════════════════════════════════════

export function useProducts(tenantId?: string, options?: { includeArchived?: boolean; categoryFilter?: string }) {
    const [products, setProducts] = useState<CatalogProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogClient.listProducts({
                tenantId: tenantId || '',
                includeArchived: options?.includeArchived ?? false,
                categoryFilter: options?.categoryFilter || '',
            });
            setProducts(res.products);
        } catch (err: any) {
            console.error('[Catalog] Failed to list products:', err);
            setError(err?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [tenantId, options?.includeArchived, options?.categoryFilter]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { products, loading, error, refetch };
}

export function useCreateProduct() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProduct = async (data: {
        tenantId?: string;
        name: string;
        shortDescription?: string;
        description?: string;
        category: string;
        priceCents: bigint;
        standalonePriceCents?: bigint;
        hours?: number;
        timelineWeeks?: number;
        timelineUnit?: string;
        recurring?: boolean;
        interval?: string;
        features?: string[];
        detailedScope?: string[];
    }) => {
        setLoading(true);
        setError(null);
        try {
            const product = await catalogClient.createProduct({
                tenantId: data.tenantId || 'sirsi',
                name: data.name,
                shortDescription: data.shortDescription || '',
                description: data.description || '',
                category: data.category,
                priceCents: data.priceCents,
                standalonePriceCents: data.standalonePriceCents || BigInt(0),
                hours: data.hours || 0,
                timelineWeeks: data.timelineWeeks || 0,
                timelineUnit: data.timelineUnit || 'weeks',
                recurring: data.recurring || false,
                interval: data.interval || 'one_time',
                features: data.features || [],
                detailedScope: data.detailedScope || [],
            });
            console.log(`🟢 [Catalog] Product created: ${product.name} (${product.id})`);
            return product;
        } catch (err: any) {
            console.error('[Catalog] Failed to create product:', err);
            setError(err?.message || 'Failed to create product');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createProduct, loading, error };
}

export function useUpdateProduct() {
    const [loading, setLoading] = useState(false);

    const updateProduct = async (id: string, updates: Partial<CatalogProduct>) => {
        setLoading(true);
        try {
            const product = await catalogClient.updateProduct({
                id,
                product: updates as any,
            });
            console.log(`✏️ [Catalog] Product updated: ${product.name}`);
            return product;
        } catch (err: any) {
            console.error('[Catalog] Failed to update product:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateProduct, loading };
}

export function useArchiveProduct() {
    const [loading, setLoading] = useState(false);

    const archiveProduct = async (id: string) => {
        setLoading(true);
        try {
            const res = await catalogClient.archiveProduct({ id });
            console.log(`🗄️ [Catalog] ${res.message}`);
            return res;
        } catch (err: any) {
            console.error('[Catalog] Failed to archive product:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { archiveProduct, loading };
}

export function useRecoverProduct() {
    const [loading, setLoading] = useState(false);

    const recoverProduct = async (id: string) => {
        setLoading(true);
        try {
            const product = await catalogClient.recoverProduct({ id });
            console.log(`♻️ [Catalog] Recovered: ${product.name}`);
            return product;
        } catch (err: any) {
            console.error('[Catalog] Failed to recover product:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { recoverProduct, loading };
}

// ═══════════════════════════════════════════════════════════════════
// Bundle Hooks
// ═══════════════════════════════════════════════════════════════════

export function useBundles(tenantId?: string, options?: { includeArchived?: boolean }) {
    const [bundles, setBundles] = useState<CatalogBundle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await catalogClient.listBundles({
                tenantId: tenantId || '',
                includeArchived: options?.includeArchived ?? false,
            });
            setBundles(res.bundles);
        } catch (err: any) {
            console.error('[Catalog] Failed to list bundles:', err);
            setError(err?.message || 'Failed to load bundles');
        } finally {
            setLoading(false);
        }
    }, [tenantId, options?.includeArchived]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { bundles, loading, error, refetch };
}

export function useCreateBundle() {
    const [loading, setLoading] = useState(false);

    const createBundle = async (data: {
        tenantId?: string;
        name: string;
        shortDescription?: string;
        description?: string;
        priceCents: bigint;
        hours?: number;
        timelineWeeks?: number;
        timelineUnit?: string;
        addonDiscountPct?: number;
        includedProductIds?: string[];
    }) => {
        setLoading(true);
        try {
            const bundle = await catalogClient.createBundle({
                tenantId: data.tenantId || 'sirsi',
                name: data.name,
                shortDescription: data.shortDescription || '',
                description: data.description || '',
                priceCents: data.priceCents,
                hours: data.hours || 0,
                timelineWeeks: data.timelineWeeks || 0,
                timelineUnit: data.timelineUnit || 'weeks',
                addonDiscountPct: data.addonDiscountPct || 0,
                includedProductIds: data.includedProductIds || [],
            });
            console.log(`🟢 [Catalog] Bundle created: ${bundle.name} (${bundle.id})`);
            return bundle;
        } catch (err: any) {
            console.error('[Catalog] Failed to create bundle:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createBundle, loading };
}

export function useUpdateBundle() {
    const [loading, setLoading] = useState(false);

    const updateBundle = async (id: string, updates: Partial<CatalogBundle>) => {
        setLoading(true);
        try {
            const bundle = await catalogClient.updateBundle({
                id,
                bundle: updates as any,
            });
            console.log(`✏️ [Catalog] Bundle updated: ${bundle.name}`);
            return bundle;
        } catch (err: any) {
            console.error('[Catalog] Failed to update bundle:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateBundle, loading };
}

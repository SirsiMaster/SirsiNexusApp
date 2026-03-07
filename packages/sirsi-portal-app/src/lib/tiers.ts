/**
 * SaaS Tier Definitions — Single Source of Truth
 *
 * Canonical tiers from ADR-030: Free / Solo / Business
 * Used by: pricing page, onboarding wizard, client portal, Stripe integration
 *
 * Static defaults below. Use fetchDynamicTiers() to hydrate with real
 * Stripe Price IDs and dynamic pricing from CatalogService.
 */

import { createClient } from '@connectrpc/connect'
import { CatalogService } from '@/gen/sirsi/admin/v2/catalog_pb'
import { transport } from './transport'

const catalogClient = createClient(CatalogService, transport)

export type PlanId = 'free' | 'solo' | 'business'

export interface PlanLimits {
    users: number          // -1 = unlimited
    contractsPerMonth: number // -1 = unlimited
    storageMB: number
}

export interface SaaSTier {
    id: PlanId
    name: string
    price: number          // Monthly price in cents (4900 = $49.00)
    priceDisplay: string   // Human-readable: "$49"
    interval: 'month'
    stripePriceId: string | null  // null = no Stripe (free tier)
    tagline: string
    features: string[]
    limits: PlanLimits
    popular?: boolean
    cloudOptions: string[]
    githubAccess: 'none' | 'repo' | 'repo-cicd'
    hypervisorLevel: 'basic' | 'standard' | 'full'
}

export const SAAS_TIERS: Record<PlanId, SaaSTier> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        priceDisplay: '$0',
        interval: 'month',
        stripePriceId: 'price_1T8DLDDHFENsYYPyaZdUsTBV', // Live Stripe — Free $0/mo
        tagline: 'Explore the platform',
        features: [
            'Read-only dashboard',
            '1 user',
            'View 3 contracts',
            '100MB document vault',
            'Basic health monitoring',
        ],
        limits: { users: 1, contractsPerMonth: 3, storageMB: 100 },
        cloudOptions: ['gcp'],
        githubAccess: 'none',
        hypervisorLevel: 'basic',
    },
    solo: {
        id: 'solo',
        name: 'Solo',
        price: 50000,
        priceDisplay: '$500',
        interval: 'month',
        stripePriceId: 'price_1T8DLEDHFENsYYPyOPUf4pMJ', // Live Stripe — Solo $500/mo
        tagline: 'For solo founders & startups',
        popular: true,
        features: [
            'Up to 5 users',
            'Full e-signature (10 active)',
            '10GB document vault',
            'Versioned documents',
            'Secure messaging',
            'Private GitHub repo',
            'Dedicated Cloud Run instance',
            'AI optimization recommendations',
        ],
        limits: { users: 5, contractsPerMonth: 25, storageMB: 10240 },
        cloudOptions: ['gcp'],
        githubAccess: 'repo',
        hypervisorLevel: 'standard',
    },
    business: {
        id: 'business',
        name: 'Business',
        price: 250000,
        priceDisplay: '$2,500',
        interval: 'month',
        stripePriceId: 'price_1T8DLEDHFENsYYPyRmUGUGIv', // Live Stripe — Business $2,500/mo
        tagline: 'For scaling businesses',
        features: [
            'Unlimited users',
            'Unlimited e-signature',
            '100GB document vault',
            'Versioned documents',
            'Priority support channel',
            'Custom invoicing + ACH',
            'GitHub repo + CI/CD templates',
            'Multi-cloud (GCP, AWS, Azure)',
            'Full autonomous AI optimization',
            'Custom domain ({slug}.sirsi.ai)',
            'Full-spectrum Hypervisor diagnostics + SLA',
        ],
        limits: { users: -1, contractsPerMonth: -1, storageMB: 102400 },
        cloudOptions: ['gcp', 'aws', 'azure'],
        githubAccess: 'repo-cicd',
        hypervisorLevel: 'full',
    },
}

/** Get a tier by ID (type-safe) */
export function getTier(id: PlanId): SaaSTier {
    return SAAS_TIERS[id]
}

/** Get all tiers as an ordered array */
export function getAllTiers(): SaaSTier[] {
    return [SAAS_TIERS.free, SAAS_TIERS.solo, SAAS_TIERS.business]
}

/** Check if a tier has Stripe integration ready */
export function isStripeReady(id: PlanId): boolean {
    return SAAS_TIERS[id].stripePriceId !== null
}

/**
 * Fetch dynamic tier data from CatalogService and enrich static definitions.
 * 
 * Queries for products with category "platform" and recurring=true (SaaS tiers).
 * Matches by name (case-insensitive) and populates stripePriceId + dynamic pricing.
 * 
 * Falls back gracefully to static SAAS_TIERS if backend is unavailable.
 */
export async function fetchDynamicTiers(): Promise<SaaSTier[]> {
    try {
        const res = await catalogClient.listProducts({
            tenantId: 'sirsi',
            categoryFilter: '',
            includeArchived: false,
        })

        // Create a lookup map from product name → catalog product
        const productMap = new Map<string, { stripePriceId: string; price: bigint }>();
        for (const product of res.products) {
            if (product.recurring && product.stripePriceId) {
                productMap.set(product.name.toLowerCase(), {
                    stripePriceId: product.stripePriceId,
                    price: product.priceCents,
                })
            }
        }

        // Enrich static tiers with dynamic data
        const enrichedTiers = getAllTiers().map(tier => {
            const dynamicData = productMap.get(tier.name.toLowerCase())
            if (dynamicData && !dynamicData.stripePriceId.startsWith('mock_')) {
                const priceCents = Number(dynamicData.price)
                return {
                    ...tier,
                    stripePriceId: dynamicData.stripePriceId,
                    price: priceCents,
                    priceDisplay: `$${(priceCents / 100).toLocaleString()}`,
                }
            }
            return tier
        })

        console.log(`📦 [Tiers] Hydrated ${productMap.size} tiers from CatalogService`)
        return enrichedTiers
    } catch (error) {
        console.warn('⚠️ [Tiers] CatalogService unavailable — using static tier definitions', error)
        return getAllTiers()
    }
}

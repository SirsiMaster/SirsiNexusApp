#!/usr/bin/env node
/**
 * Stripe Product Provisioner — Creates ADR-030 SaaS Tier Products
 *
 * Run with: STRIPE_SECRET_KEY=sk_... node scripts/provision-stripe-products.js
 *
 * Creates:
 *   1. Sirsi Free Plan ($0/mo)
 *   2. Sirsi Solo Plan ($500/mo)
 *   3. Sirsi Business Plan ($2,500/mo)
 *
 * Outputs the Stripe Product/Price IDs for use in .env configuration.
 */

const PRODUCTS = [
    {
        name: 'Sirsi Free Plan',
        description: 'Exploration tier — 1 user, shared infra, view-only contracts (3)',
        priceCents: 0,
        interval: 'month',
        metadata: { plan_id: 'free', tier: 'free', users: '1', contracts: '3', storage_mb: '100' },
    },
    {
        name: 'Sirsi Solo Plan',
        description: 'Independent Professionals — 5 users, dedicated Cloud Run, full e-sign (10 active)',
        priceCents: 50000, // $500.00
        interval: 'month',
        metadata: { plan_id: 'solo', tier: 'solo', users: '5', contracts: '10', storage_gb: '10' },
    },
    {
        name: 'Sirsi Business Plan',
        description: 'Enterprise Operations — unlimited users, dedicated Cloud Run + DB, unlimited contracts',
        priceCents: 250000, // $2,500.00
        interval: 'month',
        metadata: { plan_id: 'business', tier: 'business', users: 'unlimited', contracts: 'unlimited', storage_gb: '100' },
    },
]

async function main() {
    const apiKey = process.env.STRIPE_SECRET_KEY
    if (!apiKey) {
        console.error('❌ STRIPE_SECRET_KEY not set. Run with: STRIPE_SECRET_KEY=sk_... node scripts/provision-stripe-products.js')
        process.exit(1)
    }

    const isTest = apiKey.startsWith('sk_test_')
    console.log(`\n🏦 Stripe Product Provisioner (${isTest ? 'TEST' : 'LIVE'} mode)\n`)

    const results = []

    for (const product of PRODUCTS) {
        console.log(`Creating product: ${product.name}...`)

        // Create Stripe Product
        const productRes = await fetch('https://api.stripe.com/v1/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                name: product.name,
                description: product.description,
                ...Object.fromEntries(
                    Object.entries(product.metadata).map(([k, v]) => [`metadata[${k}]`, v])
                ),
            }),
        })
        const stripeProduct = await productRes.json()
        if (stripeProduct.error) {
            console.error(`  ❌ Error: ${stripeProduct.error.message}`)
            continue
        }

        // Create Stripe Price
        const priceParams = new URLSearchParams({
            product: stripeProduct.id,
            currency: 'usd',
        })

        if (product.priceCents === 0) {
            // Free tier: $0 recurring
            priceParams.set('unit_amount', '0')
            priceParams.set('recurring[interval]', product.interval)
        } else {
            priceParams.set('unit_amount', String(product.priceCents))
            priceParams.set('recurring[interval]', product.interval)
        }

        const priceRes = await fetch('https://api.stripe.com/v1/prices', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: priceParams,
        })
        const stripePrice = await priceRes.json()
        if (stripePrice.error) {
            console.error(`  ❌ Price error: ${stripePrice.error.message}`)
            continue
        }

        results.push({
            plan: product.metadata.plan_id,
            productId: stripeProduct.id,
            priceId: stripePrice.id,
            amount: `$${(product.priceCents / 100).toFixed(2)}/mo`,
        })

        console.log(`  ✅ ${product.name}: product=${stripeProduct.id} price=${stripePrice.id}`)
    }

    console.log('\n\n📋 Environment Variables to Add:\n')
    for (const r of results) {
        console.log(`STRIPE_PRICE_${r.plan.toUpperCase()}=${r.priceId}`)
    }

    console.log('\n📋 For packages/sirsi-portal-app/.env:\n')
    for (const r of results) {
        console.log(`VITE_STRIPE_PRICE_${r.plan.toUpperCase()}=${r.priceId}`)
    }

    console.log('\n✅ Done! Update tiers.ts with these Price IDs.\n')
}

main().catch(console.error)

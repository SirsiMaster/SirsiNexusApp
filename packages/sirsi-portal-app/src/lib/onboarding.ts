/**
 * Onboarding Service — Wires the wizard to real backend services
 *
 * Handles:
 * 1. Firebase Auth signup (createUserWithEmailAndPassword)
 * 2. Slug generation from company name
 * 3. Tenant creation via ConnectRPC TenantService
 * 4. Provisioning kickoff via ConnectRPC TenantService
 *
 * Stripe Checkout is handled separately (redirect-based flow).
 */

import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from './firebase'
import { transport } from './transport'
import { createClient } from '@connectrpc/connect'
import {
    TenantService,
} from '@/gen/sirsi/admin/v2/tenant_pb'
import type { PlanId } from './tiers'

// ── Create the gRPC client ───────────────────────────────────────
const tenantClient = createClient(TenantService, transport)

// ── Types ─────────────────────────────────────────────────────────
export interface OnboardingData {
    email: string
    password: string
    companyName: string
    industry: string
    companySize: string
    plan: PlanId
    cloudProvider: 'gcp' | 'aws' | 'azure'
    region: string
}

export interface OnboardingResult {
    success: boolean
    tenantId?: string
    firebaseUid?: string
    error?: string
}

// ── Slug Generation ───────────────────────────────────────────────
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 64)
}

// ── Plan ID → Proto Enum Mapping ──────────────────────────────────
function planToProto(plan: PlanId): number {
    switch (plan) {
        case 'free': return 1      // PLAN_FREE
        case 'solo': return 2      // PLAN_SOLO
        case 'business': return 3  // PLAN_BUSINESS
        default: return 0          // PLAN_UNSPECIFIED
    }
}

function cloudToProto(cloud: string): number {
    switch (cloud) {
        case 'gcp': return 1       // CLOUD_PROVIDER_GCP
        case 'aws': return 2       // CLOUD_PROVIDER_AWS
        case 'azure': return 3     // CLOUD_PROVIDER_AZURE
        default: return 0          // CLOUD_PROVIDER_UNSPECIFIED
    }
}

// ── Step 1: Firebase Auth Signup ──────────────────────────────────
export async function createAccount(email: string, password: string): Promise<{
    uid: string
} | { error: string }> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        // Send verification email (non-blocking)
        sendEmailVerification(userCredential.user).catch(console.warn)
        return { uid: userCredential.user.uid }
    } catch (error: any) {
        const code = error?.code || ''
        if (code === 'auth/email-already-in-use') {
            return { error: 'An account with this email already exists. Try logging in instead.' }
        }
        if (code === 'auth/weak-password') {
            return { error: 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.' }
        }
        if (code === 'auth/invalid-email') {
            return { error: 'Invalid email address format.' }
        }
        console.error('Firebase signup error:', error)
        return { error: 'Account creation failed. Please try again.' }
    }
}

// ── Step 5: Create Tenant + Start Provisioning ────────────────────
export async function provisionTenant(data: OnboardingData, firebaseUid: string): Promise<OnboardingResult> {
    try {
        const slug = generateSlug(data.companyName)

        // 1. Create the tenant record via ConnectRPC
        const tenant = await tenantClient.createTenant({
            name: data.companyName,
            slug,
            description: `${data.companyName} — ${data.industry}`,
            ownerUid: firebaseUid,
            plan: planToProto(data.plan),
            cloudProvider: cloudToProto(data.cloudProvider),
            region: data.region,
            industry: data.industry,
            companySize: data.companySize,
        })

        // 2. Kick off provisioning
        await tenantClient.startProvisioning({
            tenantId: tenant.id,
        })

        return {
            success: true,
            tenantId: tenant.id,
            firebaseUid,
        }
    } catch (error: any) {
        console.error('Tenant provisioning error:', error)
        return {
            success: false,
            error: error?.message || 'Provisioning failed. Please contact support.',
        }
    }
}

// ── Full Onboarding Flow ──────────────────────────────────────────
export async function runFullOnboarding(data: OnboardingData): Promise<OnboardingResult> {
    // Step 1: Create Firebase account
    const authResult = await createAccount(data.email, data.password)
    if ('error' in authResult) {
        return { success: false, error: authResult.error }
    }

    // Step 5: Provision tenant
    return provisionTenant(data, authResult.uid)
}

// ── Stripe Checkout ───────────────────────────────────────────────
export async function createCheckoutSession(
    ownerUid: string,
    plan: PlanId,
    successUrl: string,
    cancelUrl: string
): Promise<{ checkoutUrl: string } | { error: string }> {
    try {
        const resp = await tenantClient.createCheckoutSession({
            ownerUid,
            plan: planToProto(plan),
            successUrl,
            cancelUrl,
        })
        return { checkoutUrl: resp.checkoutUrl }
    } catch (error: any) {
        console.error('Stripe session error:', error)
        return { error: 'Failed to initiate secure payment. Please try again.' }
    }
}

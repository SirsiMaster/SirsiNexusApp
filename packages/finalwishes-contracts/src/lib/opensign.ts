/**
 * OpenSign REST Client SDK
 * ADR-015: OpenSign Convergence — Phase 6
 *
 * This client communicates directly with the OpenSign API (sign.sirsi.ai)
 * for signing ceremonies, payment sessions, PDF generation, MFA, and
 * wire transfer instructions. It complements (not replaces) the gRPC
 * ContractsService client which handles contract CRUD and config sync.
 *
 * Domain: sign.sirsi.ai → Firebase Functions (sirsi-opensign)
 */

import { auth } from './firebase'

// ─── Configuration ───────────────────────────────────────────────────
const OPENSIGN_BASE = import.meta.env.VITE_OPENSIGN_API_URL
    || 'https://us-central1-sirsi-opensign.cloudfunctions.net/opensignApi'

// ─── Types ───────────────────────────────────────────────────────────

export interface EnvelopeRecipient {
    name: string
    email: string
    role: 'signer' | 'countersigner' | 'viewer'
}

export interface CreateEnvelopeRequest {
    projectId?: string
    docType?: string
    signerName: string
    signerEmail: string
    metadata?: Record<string, unknown>
    documentUrl?: string
    callbackUrl?: string
    redirectUrl?: string
    plan?: string
    amount?: number
}

export interface CreateEnvelopeResponse {
    success: boolean
    envelopeId: string
    projectId: string
    status: string
    signingUrl: string
    message: string
}

export interface SignEnvelopeRequest {
    signatureData?: string
    signerName: string
    signerEmail: string
    signatureImage?: string
}

export interface SignEnvelopeResponse {
    success: boolean
    message: string
    status: 'completed' | 'partially_signed'
    callbackUrl?: string | null
}

export interface EnvelopeDetails {
    id: string
    docType: string
    signerName: string
    signerEmail: string
    status: string
    metadata: Record<string, unknown>
    createdAt: string | null
    updatedAt: string | null
}

export interface CreatePaymentSessionRequest {
    envelopeId: string
    planId?: string
    amount?: number
    projectId?: string
    successUrl?: string
    cancelUrl?: string
    paymentMethodTypes?: string[]
}

export interface CreatePaymentSessionResponse {
    success: boolean
    checkoutUrl: string
    sessionId: string
}

export interface PaymentStatus {
    success: boolean
    status: string
    paymentStatus: string
    paymentMetadata?: {
        stripeSessionId: string
        amountPaid: number
        currency: string
        paidAt: string
    }
}

export interface MFASendRequest {
    method: 'email' | 'sms' | 'totp'
    target: string
    userId?: string
}

export interface MFAVerifyRequest {
    method?: 'email' | 'sms' | 'totp'
    target?: string
    code: string
    email?: string
}

export interface MFAProvisionResponse {
    success: boolean
    secret: string
    qrUrl: string
    enrolled: boolean
    identity: string
}

export interface WireInstructionsRequest {
    email: string
    reference?: string
    envelopeId?: string
}

// ─── Client ──────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    }
    const user = auth.currentUser
    if (user) {
        try {
            const token = await user.getIdToken()
            headers['Authorization'] = `Bearer ${token}`
        } catch (error) {
            console.error('[OpenSign] Failed to get Firebase ID token:', error)
        }
    }
    return headers
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${OPENSIGN_BASE}${path}`
    const headers = await getAuthHeaders()

    const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers as Record<string, string> || {}) }
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(`[OpenSign] ${response.status}: ${error.message || error.error || 'Unknown error'}`)
    }

    return response.json()
}

// ─── Envelope Operations ─────────────────────────────────────────────

/**
 * Create a guest signing envelope (no auth required for the signer).
 * Maps to POST /api/guest/envelopes
 */
export async function createGuestEnvelope(
    req: CreateEnvelopeRequest
): Promise<CreateEnvelopeResponse> {
    return request('/api/guest/envelopes', {
        method: 'POST',
        body: JSON.stringify(req)
    })
}

/**
 * Create an authenticated signing envelope.
 * Maps to POST /api/envelopes
 */
export async function createEnvelope(
    docType: string,
    recipients: EnvelopeRecipient[],
    metadata?: Record<string, unknown>,
    documentUrl?: string,
    callbackUrl?: string
): Promise<CreateEnvelopeResponse> {
    return request('/api/envelopes', {
        method: 'POST',
        body: JSON.stringify({ docType, recipients, metadata, documentUrl, callbackUrl })
    })
}

/**
 * Get envelope details (guest access).
 * Maps to GET /api/guest/envelopes/:id
 */
export async function getGuestEnvelope(
    envelopeId: string
): Promise<{ success: boolean; envelope: EnvelopeDetails }> {
    return request(`/api/guest/envelopes/${envelopeId}`)
}

/**
 * Get envelope details (authenticated).
 * Maps to GET /api/envelopes/:id
 */
export async function getEnvelope(
    envelopeId: string
): Promise<{ success: boolean; envelope: EnvelopeDetails }> {
    return request(`/api/envelopes/${envelopeId}`)
}

/**
 * Record a signature on a guest envelope.
 * Maps to POST /api/guest/envelopes/:id/sign
 */
export async function signGuestEnvelope(
    envelopeId: string,
    data: SignEnvelopeRequest
): Promise<SignEnvelopeResponse> {
    return request(`/api/guest/envelopes/${envelopeId}/sign`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

/**
 * Record a signature on an authenticated envelope.
 * Maps to POST /api/envelopes/:id/sign
 */
export async function signEnvelope(
    envelopeId: string,
    data: SignEnvelopeRequest
): Promise<SignEnvelopeResponse> {
    return request(`/api/envelopes/${envelopeId}/sign`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}

// ─── Payment Operations ──────────────────────────────────────────────

/**
 * Create a Stripe Checkout session via OpenSign.
 * Supports card, ACH (us_bank_account), and wire (customer_balance).
 * Maps to POST /api/payments/create-session
 */
export async function createPaymentSession(
    req: CreatePaymentSessionRequest
): Promise<CreatePaymentSessionResponse> {
    return request('/api/payments/create-session', {
        method: 'POST',
        body: JSON.stringify(req)
    })
}

/**
 * Get payment status for an envelope.
 * Maps to GET /api/payments/status/:envelopeId
 */
export async function getPaymentStatus(
    envelopeId: string
): Promise<PaymentStatus> {
    return request(`/api/payments/status/${envelopeId}`)
}

/**
 * Request secure wire transfer instructions sent to the client's email.
 * Wire details never touch the client — delivered server-side only.
 * Maps to POST /api/payments/request-wire-instructions
 */
export async function requestWireInstructions(
    req: WireInstructionsRequest
): Promise<{ success: boolean; message: string }> {
    return request('/api/payments/request-wire-instructions', {
        method: 'POST',
        body: JSON.stringify(req)
    })
}

// ─── PDF Generation ──────────────────────────────────────────────────

/**
 * Generate a signed contract PDF for an envelope.
 * Returns the PDF as a Blob (not JSON).
 * Maps to GET /api/envelopes/:id/pdf
 */
export async function generateEnvelopePDF(
    envelopeId: string,
    isGuest = false
): Promise<Blob> {
    const url = `${OPENSIGN_BASE}/api/envelopes/${envelopeId}/pdf?guest=${isGuest}`
    const headers = await getAuthHeaders()

    const response = await fetch(url, { headers })

    if (!response.ok) {
        throw new Error(`[OpenSign] PDF generation failed: ${response.statusText}`)
    }

    return response.blob()
}

// ─── MFA Operations ──────────────────────────────────────────────────

/**
 * Provision a TOTP secret for the user's authenticator app.
 * Maps to POST /api/security/mfa/provision
 */
export async function provisionMFA(
    email: string
): Promise<MFAProvisionResponse> {
    return request('/api/security/mfa/provision', {
        method: 'POST',
        body: JSON.stringify({ email })
    })
}

/**
 * Send an MFA code via email or SMS.
 * Maps to POST /api/security/mfa/send
 */
export async function sendMFACode(
    req: MFASendRequest
): Promise<{ success: boolean; message: string }> {
    return request('/api/security/mfa/send', {
        method: 'POST',
        body: JSON.stringify(req)
    })
}

/**
 * Verify an MFA code (TOTP, SMS, or email).
 * Maps to POST /api/security/mfa/verify
 */
export async function verifyMFACode(
    req: MFAVerifyRequest
): Promise<{ success: boolean; message: string }> {
    return request('/api/security/mfa/verify', {
        method: 'POST',
        body: JSON.stringify(req)
    })
}

// ─── Security ────────────────────────────────────────────────────────

/**
 * Verify a signed redirect URL (anti-MITM).
 * Maps to POST /api/security/verify
 */
export async function verifySignedRedirect(
    params: Record<string, string>
): Promise<{
    valid: boolean
    params?: Record<string, string>
    sessionToken?: string
    sessionSignature?: string
    expires?: number
    error?: string
}> {
    return request('/api/security/verify', {
        method: 'POST',
        body: JSON.stringify({ params })
    })
}

/**
 * Health check for OpenSign API.
 * Maps to GET /api/health
 */
export async function healthCheck(): Promise<{
    status: string
    service: string
    stripeConfigured: boolean
    stripeMode: string
    timestamp: string
}> {
    return request('/api/health')
}

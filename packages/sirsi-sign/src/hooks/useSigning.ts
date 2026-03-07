/**
 * useSigning — gRPC-backed signing, payment, MFA, and vault hooks
 *
 * Replaces opensign.ts (406 lines of hand-typed REST client).
 * All types are proto-generated from signing.proto.
 * PDF download stays as direct fetch (binary blob).
 */
import { useState, useEffect, useCallback } from 'react';
import { signingClient } from '../lib/grpc';
import type {
    Envelope,
    EnvelopeRecipient,
    PaymentSession,
    PaymentStatusResponse,
    ProvisionMFAResponse,
    VerifyRedirectResponse,
    VaultFile,
} from '../gen/sirsi/sign/v1/signing_pb';

// ═══════════════════════════════════════════════════════════════════
// Envelope Hooks
// ═══════════════════════════════════════════════════════════════════

export function useCreateEnvelope() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createEnvelope = async (data: {
        docType: string;
        recipients: Array<{ name: string; email: string; role: string }>;
        metadata?: Record<string, string>;
        documentUrl?: string;
        callbackUrl?: string;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const envelope = await signingClient.createEnvelope({
                docType: data.docType,
                recipients: data.recipients.map(r => ({
                    name: r.name,
                    email: r.email,
                    role: r.role,
                })),
                metadata: data.metadata || {},
                documentUrl: data.documentUrl || '',
                callbackUrl: data.callbackUrl || '',
            });
            console.log(`📧 [Signing] Created envelope: ${envelope.id}`);
            return envelope;
        } catch (err: any) {
            setError(err?.message || 'Failed to create envelope');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createEnvelope, loading, error };
}

export function useCreateGuestEnvelope() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGuestEnvelope = async (data: {
        projectId?: string;
        docType?: string;
        signerName: string;
        signerEmail: string;
        metadata?: Record<string, string>;
        documentUrl?: string;
        callbackUrl?: string;
        redirectUrl?: string;
        plan?: string;
        amount?: bigint;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const envelope = await signingClient.createGuestEnvelope({
                projectId: data.projectId || 'sirsi',
                docType: data.docType || '',
                signerName: data.signerName,
                signerEmail: data.signerEmail,
                metadata: data.metadata || {},
                documentUrl: data.documentUrl || '',
                callbackUrl: data.callbackUrl || '',
                redirectUrl: data.redirectUrl || '',
                plan: data.plan || '',
                amount: data.amount || BigInt(0),
            });
            console.log(`📧 [Signing] Created guest envelope: ${envelope.id}`);
            return envelope;
        } catch (err: any) {
            setError(err?.message || 'Failed to create guest envelope');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createGuestEnvelope, loading, error };
}

export function useGetEnvelope(envelopeId: string, options?: { guest?: boolean }) {
    const [envelope, setEnvelope] = useState<Envelope | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        if (!envelopeId) return;
        setLoading(true);
        setError(null);
        try {
            const env = await signingClient.getEnvelope({
                id: envelopeId,
                guest: options?.guest ?? false,
            });
            setEnvelope(env);
        } catch (err: any) {
            setError(err?.message || 'Failed to get envelope');
        } finally {
            setLoading(false);
        }
    }, [envelopeId, options?.guest]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { envelope, loading, error, refetch };
}

export function useSignEnvelope() {
    const [loading, setLoading] = useState(false);

    const signEnvelope = async (data: {
        envelopeId: string;
        signatureData?: string;
        signerName: string;
        signerEmail: string;
        signatureImage?: string;
        guest?: boolean;
    }) => {
        setLoading(true);
        try {
            const result = await signingClient.signEnvelope({
                envelopeId: data.envelopeId,
                signatureData: data.signatureData || '',
                signerName: data.signerName,
                signerEmail: data.signerEmail,
                signatureImage: data.signatureImage || '',
                guest: data.guest ?? false,
            });
            console.log(`✍️ [Signing] Envelope signed: ${data.envelopeId} → ${result.status}`);
            return result;
        } catch (err: any) {
            console.error('[Signing] Failed to sign envelope:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { signEnvelope, loading };
}

// ═══════════════════════════════════════════════════════════════════
// Payment Hooks
// ═══════════════════════════════════════════════════════════════════

export function useCreatePaymentSession() {
    const [loading, setLoading] = useState(false);

    const createPaymentSession = async (data: {
        envelopeId: string;
        planId?: string;
        amount?: bigint;
        projectId?: string;
        successUrl: string;
        cancelUrl: string;
        paymentMethodTypes?: string[];
    }): Promise<PaymentSession> => {
        setLoading(true);
        try {
            const session = await signingClient.createPaymentSession({
                envelopeId: data.envelopeId,
                planId: data.planId || '',
                amount: data.amount || BigInt(0),
                projectId: data.projectId || '',
                successUrl: data.successUrl,
                cancelUrl: data.cancelUrl,
                paymentMethodTypes: data.paymentMethodTypes || ['card', 'us_bank_account'],
            });
            console.log(`💳 [Payment] Session created: ${session.sessionId} → ${session.checkoutUrl}`);
            return session;
        } catch (err: any) {
            console.error('[Payment] Failed to create session:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createPaymentSession, loading };
}

export function useGetPaymentStatus(envelopeId: string) {
    const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        if (!envelopeId) return;
        setLoading(true);
        try {
            const result = await signingClient.getPaymentStatus({ envelopeId });
            setStatus(result);
        } catch (err: any) {
            console.error('[Payment] Failed to get status:', err);
        } finally {
            setLoading(false);
        }
    }, [envelopeId]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { status, loading, refetch };
}

export function useRequestWireInstructions() {
    const [loading, setLoading] = useState(false);

    const requestWireInstructions = async (data: {
        email: string;
        reference?: string;
        envelopeId?: string;
    }) => {
        setLoading(true);
        try {
            const result = await signingClient.requestWireInstructions({
                email: data.email,
                reference: data.reference || '',
                envelopeId: data.envelopeId || '',
            });
            console.log(`🏦 [Wire] Instructions sent to ${data.email}`);
            return result;
        } catch (err: any) {
            console.error('[Wire] Failed to request instructions:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { requestWireInstructions, loading };
}

// ═══════════════════════════════════════════════════════════════════
// MFA Hooks
// ═══════════════════════════════════════════════════════════════════

export function useProvisionMFA() {
    const [loading, setLoading] = useState(false);

    const provisionMFA = async (email: string): Promise<ProvisionMFAResponse> => {
        setLoading(true);
        try {
            const result = await signingClient.provisionMFA({ email });
            console.log(`🔐 [MFA] Provisioned for ${email}`);
            return result;
        } catch (err: any) {
            console.error('[MFA] Failed to provision:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { provisionMFA, loading };
}

export function useSendMFACode() {
    const [loading, setLoading] = useState(false);

    const sendMFACode = async (data: {
        method: string;
        target: string;
        userId?: string;
    }) => {
        setLoading(true);
        try {
            const result = await signingClient.sendMFACode({
                method: data.method,
                target: data.target,
                userId: data.userId || '',
            });
            return result;
        } catch (err: any) {
            console.error('[MFA] Failed to send code:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { sendMFACode, loading };
}

export function useVerifyMFACode() {
    const [loading, setLoading] = useState(false);

    const verifyMFACode = async (data: {
        method?: string;
        target?: string;
        code: string;
        email?: string;
    }) => {
        setLoading(true);
        try {
            const result = await signingClient.verifyMFACode({
                method: data.method || '',
                target: data.target || '',
                code: data.code,
                email: data.email || '',
            });
            return result;
        } catch (err: any) {
            console.error('[MFA] Failed to verify code:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { verifyMFACode, loading };
}

// ═══════════════════════════════════════════════════════════════════
// Security Hooks
// ═══════════════════════════════════════════════════════════════════

export function useVerifySignedRedirect() {
    const [loading, setLoading] = useState(false);

    const verifyRedirect = async (params: Record<string, string>): Promise<VerifyRedirectResponse> => {
        setLoading(true);
        try {
            const result = await signingClient.verifySignedRedirect({ params });
            return result;
        } catch (err: any) {
            console.error('[Security] Failed to verify redirect:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { verifyRedirect, loading };
}

// ═══════════════════════════════════════════════════════════════════
// Vault Hooks
// ═══════════════════════════════════════════════════════════════════

export function useVaultFiles(projectId?: string) {
    const [files, setFiles] = useState<VaultFile[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await signingClient.listVaultFiles({
                projectId: projectId || '',
            });
            setFiles(result.files);
        } catch (err: any) {
            console.error('[Vault] Failed to list files:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { files, loading, refetch };
}

// ═══════════════════════════════════════════════════════════════════
// PDF Download (stays as HTTP — binary blob response)
// ═══════════════════════════════════════════════════════════════════

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080';

/**
 * Download envelope PDF as a Blob (HTTP handler, not gRPC).
 * PDF is binary content — gRPC is not ideal for large blob responses.
 */
export async function downloadEnvelopePDF(envelopeId: string, isGuest = false): Promise<Blob> {
    const url = `${GATEWAY_URL}/api/envelopes/${envelopeId}/pdf?guest=${isGuest}`;

    // Get auth headers
    const headers: Record<string, string> = {};
    const { auth } = await import('../lib/firebase');
    const user = auth.currentUser;
    if (user) {
        try {
            const token = await user.getIdToken();
            headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('[PDF] Failed to get auth token:', error);
        }
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`);
    }
    return response.blob();
}

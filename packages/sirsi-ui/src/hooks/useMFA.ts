/**
 * useMFA Hook - MFA verification state and enforcement for React applications
 * 
 * Implements MFA requirements per AUTHORIZATION_POLICY.md Section 4
 * 
 * @see docs/policies/AUTHORIZATION_POLICY.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAuth, User, getIdTokenResult } from 'firebase/auth';

export interface MFAClaims {
    mfa_verified: boolean;
    mfa_method?: 'totp' | 'sms' | 'hardware_key';
    mfa_timestamp?: number;
    acr?: string;
}

export interface UseMFAResult {
    /** Whether the user has completed MFA verification */
    isMFAVerified: boolean;
    /** Whether MFA verification is still fresh (within maxAge) */
    isMFAFresh: boolean;
    /** The method used for MFA (totp, sms, hardware_key) */
    mfaMethod?: string;
    /** Timestamp when MFA was verified */
    mfaTimestamp?: number;
    /** Age of MFA verification in seconds */
    mfaAge: number;
    /** Whether to require MFA re-verification */
    requiresReauth: boolean;
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: Error | null;
    /** Refresh MFA status from token */
    refreshMFAStatus: () => Promise<void>;
    /** Check if financial operations are allowed (stricter MFA requirements) */
    canAccessFinancial: boolean;
}

export interface UseMFAOptions {
    /** Maximum age of MFA verification in seconds (default: 3600 = 1 hour) */
    maxAge?: number;
    /** Maximum age for financial operations (default: 900 = 15 minutes) */
    financialMaxAge?: number;
    /** Auto-refresh MFA status on mount */
    autoRefresh?: boolean;
}

/**
 * Hook to check and manage MFA verification status
 * 
 * @example
 * ```tsx
 * const { isMFAVerified, canAccessFinancial, requiresReauth } = useMFA();
 * 
 * if (!isMFAVerified) {
 *   return <Navigate to="/auth/mfa" />;
 * }
 * 
 * if (!canAccessFinancial) {
 *   return <MFARequired onVerify={refreshMFAStatus} />;
 * }
 * ```
 */
export function useMFA(options: UseMFAOptions = {}): UseMFAResult {
    const {
        maxAge = 3600,
        financialMaxAge = 900,
        autoRefresh = true
    } = options;

    const [claims, setClaims] = useState<MFAClaims | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const auth = getAuth();

    const refreshMFAStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const user = auth.currentUser;
            if (!user) {
                setClaims(null);
                return;
            }

            // Force token refresh to get latest claims
            const tokenResult = await getIdTokenResult(user, true);

            setClaims({
                mfa_verified: !!tokenResult.claims.mfa_verified,
                mfa_method: tokenResult.claims.mfa_method as MFAClaims['mfa_method'],
                mfa_timestamp: tokenResult.claims.mfa_timestamp as number | undefined,
                acr: tokenResult.claims.acr as string | undefined
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to check MFA status'));
        } finally {
            setIsLoading(false);
        }
    }, [auth]);

    // Auto-refresh on mount and auth state change
    useEffect(() => {
        if (!autoRefresh) {
            setIsLoading(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged((user: User | null) => {
            if (user) {
                refreshMFAStatus();
            } else {
                setClaims(null);
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, autoRefresh, refreshMFAStatus]);

    // Computed values
    const mfaAge = useMemo(() => {
        if (!claims?.mfa_timestamp) return Infinity;
        return Math.floor(Date.now() / 1000) - claims.mfa_timestamp;
    }, [claims?.mfa_timestamp]);

    const isMFAVerified = claims?.mfa_verified === true;
    const isMFAFresh = isMFAVerified && mfaAge <= maxAge;
    const canAccessFinancial = isMFAVerified && mfaAge <= financialMaxAge && claims?.mfa_method !== 'sms';
    const requiresReauth = isMFAVerified && mfaAge > maxAge;

    return {
        isMFAVerified,
        isMFAFresh,
        mfaMethod: claims?.mfa_method,
        mfaTimestamp: claims?.mfa_timestamp,
        mfaAge,
        requiresReauth,
        isLoading,
        error,
        refreshMFAStatus,
        canAccessFinancial
    };
}

/**
 * Hook to protect a route/component with MFA requirement
 * Automatically redirects to MFA page if not verified
 * 
 * @example
 * ```tsx
 * const { isAllowed, redirect } = useMFAProtected({ 
 *   redirectTo: '/auth/mfa',
 *   requireFresh: true 
 * });
 * 
 * if (redirect) return redirect;
 * if (!isAllowed) return <Loading />;
 * 
 * return <ProtectedContent />;
 * ```
 */
export function useMFAProtected(options: {
    redirectTo?: string;
    requireFresh?: boolean;
    requireFinancial?: boolean;
}) {
    const {
        redirectTo = '/auth/mfa',
        requireFresh = false,
        requireFinancial = false
    } = options;

    const mfa = useMFA();

    const isAllowed = useMemo(() => {
        if (mfa.isLoading) return null; // Still loading
        if (!mfa.isMFAVerified) return false;
        if (requireFresh && !mfa.isMFAFresh) return false;
        if (requireFinancial && !mfa.canAccessFinancial) return false;
        return true;
    }, [mfa, requireFresh, requireFinancial]);

    return {
        isAllowed,
        redirectUrl: isAllowed === false ? redirectTo : null,
        isMFAVerified: mfa.isMFAVerified,
        isMFAFresh: mfa.isMFAFresh,
        mfaMethod: mfa.mfaMethod,
        mfaTimestamp: mfa.mfaTimestamp,
        mfaAge: mfa.mfaAge,
        requiresReauth: mfa.requiresReauth,
        isLoading: mfa.isLoading,
        error: mfa.error,
        refreshMFAStatus: mfa.refreshMFAStatus,
        canAccessFinancial: mfa.canAccessFinancial
    };
}

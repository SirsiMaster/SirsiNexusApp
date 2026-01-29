/**
 * useConsent Hook - Privacy consent management for React applications
 * 
 * Implements consent tracking per PRIVACY_POLICY.md and GDPR requirements
 * 
 * @see docs/policies/PRIVACY_POLICY.md
 */

import { useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export interface ConsentRecord {
    policyId: string;
    version: string;
    accepted: boolean;
    timestamp: Date | null;
    ipAddress?: string;
}

export interface ConsentPreferences {
    /** Essential cookies and functionality - always required */
    essential: boolean;
    /** Analytics and performance cookies */
    analytics: boolean;
    /** Marketing and advertising cookies */
    marketing: boolean;
    /** Third-party integrations */
    thirdParty: boolean;
}

export interface UseConsentResult {
    /** Current consent status for each policy */
    consents: Record<string, ConsentRecord>;
    /** Cookie/tracking preferences */
    preferences: ConsentPreferences;
    /** Whether consent has been given for a specific policy */
    hasConsent: (policyId: string, version?: string) => boolean;
    /** Record consent for a policy */
    recordConsent: (policyId: string, version: string, accepted: boolean) => Promise<void>;
    /** Update cookie preferences */
    updatePreferences: (preferences: Partial<ConsentPreferences>) => Promise<void>;
    /** Loading state */
    isLoading: boolean;
    /** Whether consent banner should be shown */
    showBanner: boolean;
    /** Dismiss the consent banner */
    dismissBanner: () => void;
}

const CONSENT_STORAGE_KEY = 'sirsi_consent_preferences';
const POLICIES = ['privacy', 'terms', 'cookies'] as const;

/**
 * Hook to manage user consent for privacy policies
 */
export function useConsent(): UseConsentResult {
    const [consents, setConsents] = useState<Record<string, ConsentRecord>>({});
    const [preferences, setPreferences] = useState<ConsentPreferences>({
        essential: true, // Always true
        analytics: false,
        marketing: false,
        thirdParty: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(false);

    const auth = getAuth();
    const db = getFirestore();

    // Load consent from localStorage and Firestore
    useEffect(() => {
        const loadConsent = async () => {
            setIsLoading(true);

            // First check localStorage for anonymous users
            const storedPrefs = localStorage.getItem(CONSENT_STORAGE_KEY);
            if (storedPrefs) {
                try {
                    const parsed = JSON.parse(storedPrefs);
                    setPreferences(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Failed to parse stored consent:', e);
                }
            }

            // If user is authenticated, load from Firestore
            const user = auth.currentUser;
            if (user) {
                try {
                    const consentDoc = await getDoc(doc(db, 'user_consents', user.uid));
                    if (consentDoc.exists()) {
                        const data = consentDoc.data();
                        setConsents(data.policies || {});
                        if (data.preferences) {
                            setPreferences(prev => ({ ...prev, ...data.preferences }));
                        }
                    }
                } catch (error) {
                    console.error('Failed to load consent from Firestore:', error);
                }
            }

            // Determine if banner should be shown
            const hasStoredConsent = storedPrefs !== null;
            setShowBanner(!hasStoredConsent);
            setIsLoading(false);
        };

        loadConsent();
    }, [auth.currentUser, db]);

    const hasConsent = useCallback((policyId: string, version?: string): boolean => {
        const consent = consents[policyId];
        if (!consent) return false;
        if (!consent.accepted) return false;
        if (version && consent.version !== version) return false;
        return true;
    }, [consents]);

    const recordConsent = useCallback(async (
        policyId: string,
        version: string,
        accepted: boolean
    ): Promise<void> => {
        const consent: ConsentRecord = {
            policyId,
            version,
            accepted,
            timestamp: new Date()
        };

        // Update local state
        setConsents(prev => ({ ...prev, [policyId]: consent }));

        // Store in localStorage for anonymous users
        const currentPrefs = localStorage.getItem(CONSENT_STORAGE_KEY);
        const parsed = currentPrefs ? JSON.parse(currentPrefs) : {};
        parsed[policyId] = consent;
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(parsed));

        // If authenticated, store in Firestore
        const user = auth.currentUser;
        if (user) {
            try {
                await setDoc(doc(db, 'user_consents', user.uid), {
                    policies: { [policyId]: consent },
                    updatedAt: serverTimestamp()
                }, { merge: true });

                // Also log to audit collection
                await setDoc(doc(db, 'consent_audit', `${user.uid}_${policyId}_${Date.now()}`), {
                    userId: user.uid,
                    policyId,
                    version,
                    accepted,
                    timestamp: serverTimestamp(),
                    action: accepted ? 'accepted' : 'declined'
                });
            } catch (error) {
                console.error('Failed to record consent:', error);
                throw error;
            }
        }
    }, [auth.currentUser, db]);

    const updatePreferences = useCallback(async (
        newPreferences: Partial<ConsentPreferences>
    ): Promise<void> => {
        const updated = { ...preferences, ...newPreferences, essential: true };
        setPreferences(updated);

        // Store in localStorage
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
            preferences: updated,
            updatedAt: new Date().toISOString()
        }));

        // If authenticated, store in Firestore
        const user = auth.currentUser;
        if (user) {
            try {
                await setDoc(doc(db, 'user_consents', user.uid), {
                    preferences: updated,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error('Failed to update preferences:', error);
                throw error;
            }
        }
    }, [auth.currentUser, db, preferences]);

    const dismissBanner = useCallback(() => {
        setShowBanner(false);
    }, []);

    return {
        consents,
        preferences,
        hasConsent,
        recordConsent,
        updatePreferences,
        isLoading,
        showBanner,
        dismissBanner
    };
}

/**
 * Hook to require consent before rendering content
 */
export function useRequireConsent(policyId: string, version: string) {
    const consent = useConsent();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!consent.isLoading && !consent.hasConsent(policyId, version)) {
            setShowModal(true);
        }
    }, [consent.isLoading, consent.hasConsent, policyId, version]);

    return {
        hasConsent: consent.hasConsent(policyId, version),
        showModal,
        recordConsent: (accepted: boolean) => consent.recordConsent(policyId, version, accepted),
        closeModal: () => setShowModal(false)
    };
}

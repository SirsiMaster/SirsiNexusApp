import React, { useState } from 'react';
import { UCSFinancialGuard } from './UCSFinancialGuard';

/**
 * StripePay UCS Component
 * 
 * A premium, Royal Neo-Deco payment component for the Sirsi Portfolio.
 * Implements "integrated independence" by providing a standardized
 * interface to the Stripe utility layer.
 * 
 * ADR-005: Wired to /api/payments/create-session for Stripe Checkout
 */

// API Base URL for Cloud Functions
const API_BASE = 'https://api-6kdf4or4qq-uc.a.run.app/api';

export interface StripePayProps {
    /** Amount in dollars (not cents) */
    amount: number;
    currency?: string;
    projectName: string;
    /** Envelope ID from OpenSign flow */
    envelopeId: string;
    /** Optional plan ID for structured payment plans */
    planId?: string;
    /** Project ID for multi-tenant support */
    projectId?: string;
    /** Custom success URL override */
    successUrl?: string;
    /** Custom cancel URL override */
    cancelUrl?: string;
    /** Callback after successful session creation */
    onSuccess?: (sessionId: string) => void;
    /** Callback on error */
    onError?: (error: Error) => void;
}

export const StripePay: React.FC<StripePayProps> = ({
    amount,
    currency = 'USD',
    projectName,
    envelopeId,
    planId,
    projectId = 'finalwishes',
    successUrl,
    cancelUrl,
    onSuccess,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);

    /**
     * Creates a Stripe Checkout Session and redirects to Stripe
     */
    const handleStripeCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            console.log('🔐 Initiating Stripe Checkout via UCS Hypervisor...', {
                envelopeId,
                amount,
                planId,
                projectId
            });

            const response = await fetch(`${API_BASE}/payments/create-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    envelopeId,
                    planId,
                    amount: Math.round(amount * 100), // Convert to cents
                    projectId,
                    successUrl: successUrl || `${window.location.origin}/payment-success.html?envelope=${envelopeId}`,
                    cancelUrl: cancelUrl || `${window.location.origin}/payment-cancelled.html?envelope=${envelopeId}`
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to create checkout session');
            }

            const data = await response.json();

            if (!data.checkoutUrl) {
                throw new Error('No checkout URL returned from server');
            }

            // Callback before redirect
            if (onSuccess) {
                onSuccess(data.sessionId);
            }

            // Redirect to Stripe Checkout
            console.log('✅ Redirecting to Stripe Checkout:', data.checkoutUrl);
            window.location.href = data.checkoutUrl;

        } catch (err) {
            const error = err as Error;
            console.error('❌ Stripe Checkout Error:', error);
            setError(error.message);
            if (onError) {
                onError(error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ucs-stripe-container glass-strong p-6 rounded-xl border border-[#C8A951]/30 relative overflow-hidden">
            {/* Decorative film grain/texture overlay could be added here */}

            <div className="relative z-10">
                <h3 className="text-[#C8A951] font-cinzel text-xl tracking-widest mb-4 uppercase">
                    Secure Settlement
                </h3>

                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-gray-400 text-sm font-inter uppercase tracking-tighter">Project Reference</p>
                        <p className="text-white font-medium">{projectName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-sm font-inter uppercase tracking-tighter">Total Amount</p>
                        <p className="text-white text-2xl font-bold font-inter">{formattedAmount}</p>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                <UCSFinancialGuard
                    rail="STRIPE"
                    actionName="Stripe Checkout Initiation"
                    onSuccess={handleStripeCheckout}
                >
                    <button
                        onClick={handleStripeCheckout}
                        disabled={isLoading || !envelopeId}
                        className={`w-full bg-[#C8A951] hover:bg-[#D4B96A] text-[#0A1128] font-cinzel font-bold py-3 px-6 rounded transition-all duration-300 shadow-lg shadow-gold/20 ${isLoading || !envelopeId
                                ? 'opacity-50 cursor-not-allowed'
                                : 'transform hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Creating Secure Session...
                            </span>
                        ) : (
                            'Proceed to Escrow'
                        )}
                    </button>
                </UCSFinancialGuard>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    Sirsi Vault Protected | Encrypted TLS 1.3
                </div>
            </div>

            <style>{`
        .ucs-stripe-container {
          background: linear-gradient(135deg, rgba(10, 17, 40, 0.9) 0%, rgba(20, 30, 70, 0.8) 100%);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(200, 169, 81, 0.1);
        }
        .font-cinzel {
          font-family: 'Cinzel', serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
        </div>
    );
};

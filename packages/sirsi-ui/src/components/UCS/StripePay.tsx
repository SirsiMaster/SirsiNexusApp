import React from 'react';

/**
 * StripePay UCS Component
 * 
 * A premium, Royal Neo-Deco payment component for the Sirsi Portfolio.
 * Implements "integrated independence" by providing a standardized
 * interface to the Stripe utility layer.
 */

export interface StripePayProps {
    amount: number;
    currency?: string;
    projectName: string;
    onSuccess?: (sessionId: string) => void;
    onError?: (error: Error) => void;
}

export const StripePay: React.FC<StripePayProps> = ({
    amount,
    currency = 'USD',
    projectName,
    onSuccess,
    onError
}) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);

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

                <button
                    className="w-full bg-[#C8A951] hover:bg-[#D4B96A] text-[#0A1128] font-cinzel font-bold py-3 px-6 rounded transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold/20"
                    onClick={() => {
                        console.log('Initiating Stripe Checkout via UCS Hypervisor...');
                        // Implementation would call the centralized Stripe service
                    }}
                >
                    Proceed to Escrow
                </button>

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

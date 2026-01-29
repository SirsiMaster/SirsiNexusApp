import React from 'react';
import { UCSFinancialGuard } from './UCSFinancialGuard';

/**
 * PlaidLink UCS Component
 * 
 * Standardized banking verification interface.
 */

export interface PlaidLinkProps {
    onSuccess?: (publicToken: string, metadata: any) => void;
    onExit?: () => void;
    className?: string;
}

export const PlaidLink: React.FC<PlaidLinkProps> = ({
    onSuccess,
    onExit,
    className = ''
}) => {
    return (
        <div className={`ucs-plaid-link glass-panel p-5 border-l-4 border-[#C8A951] ${className}`}>
            <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#C8A951]/10 flex items-center justify-center text-[#C8A951]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </div>
                <div>
                    <h4 className="text-white font-cinzel text-lg leading-tight">Financial Bridging</h4>
                    <p className="text-gray-400 text-xs font-inter uppercase tracking-widest">Plaid Utility v4.0</p>
                </div>
            </div>

            <p className="text-gray-300 text-sm font-inter mb-4">
                Authenticate your treasury account via encrypted Plaid bridge to enable real-time settlement.
            </p>

            <UCSFinancialGuard
                rail="PLAID"
                actionName="Bank Account Linking"
                onSuccess={() => {
                    console.log('Opening Plaid Link via UCS Hypervisor...');
                }}
            >
                <button
                    className="w-full border border-[#C8A951] text-[#C8A951] hover:bg-[#C8A951] hover:text-[#0A1128] font-cinzel text-sm py-2 px-4 rounded transition-all duration-300"
                >
                    Connect Financial Institution
                </button>
            </UCSFinancialGuard>

            <style>{`
        .glass-panel {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
      `}</style>
        </div>
    );
};

import React from 'react';

/**
 * ChaseSettlement UCS Component
 * 
 * High-value corporate treasury settlement interface.
 */

export interface ChaseSettlementProps {
    txId: string;
    status: 'processing' | 'cleared';
    timestamp: string;
}

export const ChaseSettlement: React.FC<ChaseSettlementProps> = ({
    txId,
    status,
    timestamp
}) => {
    return (
        <div className="ucs-chase-settlement border-t border-b border-[#C8A951]/20 py-4 flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <span className="text-[#C8A951] font-cinzel text-xs tracking-widest uppercase italic">Chase Treasury Bridge</span>
                <span className={`text-[10px] font-inter font-bold px-2 py-0.5 rounded ${status === 'cleared' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-yellow-500/20 text-yellow-500'} uppercase`}>
                    {status}
                </span>
            </div>
            <div className="flex justify-between items-baseline">
                <span className="text-gray-500 text-[10px] font-mono uppercase">Batch: {txId}</span>
                <span className="text-white text-xs font-inter">{timestamp}</span>
            </div>
        </div>
    );
};

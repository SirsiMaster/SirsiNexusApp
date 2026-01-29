import React from 'react';

/**
 * SendGridEmail UCS Component
 * 
 * Standardized omnichannel notification status.
 */

export interface SendGridEmailProps {
    status: 'pending' | 'sent' | 'delivered' | 'failed';
    recipient: string;
}

export const SendGridEmail: React.FC<SendGridEmailProps> = ({
    status,
    recipient
}) => {
    const statusColors = {
        pending: 'text-yellow-500',
        sent: 'text-blue-400',
        delivered: 'text-[#10B981]',
        failed: 'text-red-500'
    };

    return (
        <div className="ucs-sendgrid-status flex items-center gap-3 py-2 px-3 bg-black/30 rounded border border-white/10">
            <div className={`w-2 h-2 rounded-full ${status === 'delivered' ? 'bg-[#10B981]' : 'bg-gray-500'} ${status === 'pending' ? 'animate-pulse' : ''}`} />
            <span className="text-gray-400 text-xs font-inter uppercase tracking-widest">Notification:</span>
            <span className="text-white text-xs font-mono">{recipient}</span>
            <span className={`text-[10px] font-bold uppercase ml-auto ${statusColors[status]}`}>
                {status}
            </span>
        </div>
    );
};

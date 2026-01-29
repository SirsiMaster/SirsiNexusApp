import React, { useState } from 'react';
import { MFARequired } from '../MFARequired';
import { useMFA } from '../../hooks/useMFA';
import { useFinancialAudit } from '../../hooks/useFinancialAudit';

/**
 * UCSFinancialGuard Component
 * 
 * A high-order security gate for all UCS internal financial rails.
 * Enforces MFA requirements and ensures every interaction is audited.
 */

export interface UCSFinancialGuardProps {
    children: React.ReactNode;
    rail: 'STRIPE' | 'PLAID' | 'CHASE';
    actionName: string;
    onSuccess: () => void;
    onCancel?: () => void;
}

export const UCSFinancialGuard: React.FC<UCSFinancialGuardProps> = ({
    children,
    rail,
    actionName,
    onSuccess,
    onCancel
}) => {
    const { canAccessFinancial } = useMFA();
    const { logFinancialEvent } = useFinancialAudit();
    const [showMFA, setShowMFA] = useState(false);

    const handleProtectedAction = async () => {
        // Log the intent before any check
        await logFinancialEvent({
            action: `${rail}_LINK` as any,
            status: 'INTENT',
            details: { actionName, timestamp: Date.now() }
        });

        if (!canAccessFinancial) {
            setShowMFA(true);
            return;
        }

        proceed();
    };

    const proceed = () => {
        onSuccess();
    };

    const handleMFAVerified = () => {
        setShowMFA(false);
        logFinancialEvent({
            action: `${rail}_LINK` as any,
            status: 'SUCCESS',
            details: { actionName, method: 'MFA_GATE' }
        });
        proceed();
    };

    return (
        <div className="ucs-financial-guard">
            <div onClick={handleProtectedAction}>
                {children}
            </div>

            {showMFA && (
                <MFARequired
                    isFinancial
                    title="Financial Rail Verification"
                    message={`Verification required to initiate ${actionName} via ${rail} rail.`}
                    onVerified={handleMFAVerified}
                    onCancel={() => {
                        setShowMFA(false);
                        logFinancialEvent({
                            action: `${rail}_LINK` as any,
                            status: 'CANCELLED',
                            details: { actionName }
                        });
                        onCancel?.();
                    }}
                />
            )}
        </div>
    );
};

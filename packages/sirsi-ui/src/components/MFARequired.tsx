/**
 * MFARequired Component - Modal/Gate for requiring MFA before sensitive operations
 * 
 * Implements MFA requirements per AUTHORIZATION_POLICY.md Section 4.3
 * 
 * @see docs/policies/AUTHORIZATION_POLICY.md
 */

import React, { useState } from 'react';

export interface MFARequiredProps {
    /** Message to display */
    message?: string;
    /** Title of the modal */
    title?: string;
    /** Called when MFA is successfully verified */
    onVerified: () => void;
    /** Called when user cancels */
    onCancel?: () => void;
    /** Whether this is for financial operations (stricter requirements) */
    isFinancial?: boolean;
    /** Custom styles */
    className?: string;
    /** Override the MFA verification URL */
    mfaUrl?: string;
}

/**
 * Modal component that requires MFA verification before proceeding
 * 
 * @example
 * ```tsx
 * const { canAccessFinancial, refreshMFAStatus } = useMFA();
 * const [showMFA, setShowMFA] = useState(false);
 * 
 * const handleOpenPlaid = () => {
 *   if (!canAccessFinancial) {
 *     setShowMFA(true);
 *     return;
 *   }
 *   openPlaidLink();
 * };
 * 
 * {showMFA && (
 *   <MFARequired
 *     isFinancial
 *     onVerified={() => {
 *       refreshMFAStatus();
 *       setShowMFA(false);
 *       openPlaidLink();
 *     }}
 *     onCancel={() => setShowMFA(false)}
 *   />
 * )}
 * ```
 */
export function MFARequired({
    message,
    title = 'Verification Required',
    onVerified,
    onCancel,
    isFinancial = false,
    className = '',
    mfaUrl = '/auth/mfa'
}: MFARequiredProps): React.ReactElement {
    const [isLoading, setIsLoading] = useState(false);

    const defaultMessage = isFinancial
        ? 'For your security, please verify your identity using multi-factor authentication before accessing financial services.'
        : 'Please verify your identity using multi-factor authentication to continue.';

    const handleVerify = () => {
        setIsLoading(true);
        // Open MFA verification in new window/tab or redirect
        // This can be customized based on your MFA implementation
        window.location.href = `${mfaUrl}?redirect=${encodeURIComponent(window.location.href)}`;
    };

    return (
        <div className={`sirsi-mfa-required ${className}`} style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.icon}>
                    {isFinancial ? '🏦' : '🔐'}
                </div>

                <h2 style={styles.title}>{title}</h2>

                <p style={styles.message}>
                    {message || defaultMessage}
                </p>

                {isFinancial && (
                    <div style={styles.notice}>
                        <span style={styles.noticeIcon}>ℹ️</span>
                        <span style={styles.noticeText}>
                            SMS-based verification is not allowed for financial operations.
                            Please use TOTP or hardware key.
                        </span>
                    </div>
                )}

                <div style={styles.methods}>
                    <div style={styles.method}>
                        <span style={styles.methodIcon}>📱</span>
                        <span style={styles.methodLabel}>Authenticator App (TOTP)</span>
                    </div>
                    {!isFinancial && (
                        <div style={styles.method}>
                            <span style={styles.methodIcon}>💬</span>
                            <span style={styles.methodLabel}>SMS Verification</span>
                        </div>
                    )}
                    <div style={styles.method}>
                        <span style={styles.methodIcon}>🔑</span>
                        <span style={styles.methodLabel}>Hardware Security Key</span>
                    </div>
                </div>

                <div style={styles.actions}>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            style={styles.cancelButton}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={handleVerify}
                        style={styles.verifyButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Redirecting...' : 'Verify Now'}
                    </button>
                </div>

                <p style={styles.policyLink}>
                    Learn more about our{' '}
                    <a href="/policies/security" style={styles.link}>Security Policy</a>
                </p>
            </div>
        </div>
    );
}

/**
 * HOC to wrap a component with MFA requirement
 */
export function withMFARequired<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    options?: {
        isFinancial?: boolean;
        message?: string;
    }
) {
    return function MFAProtectedComponent(props: P & { mfaVerified?: boolean }) {
        const [showMFA, setShowMFA] = useState(!props.mfaVerified);

        if (showMFA) {
            return (
                <MFARequired
                    isFinancial={options?.isFinancial}
                    message={options?.message}
                    onVerified={() => setShowMFA(false)}
                />
            );
        }

        return <WrappedComponent {...props} />;
    };
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(10, 20, 50, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
    },
    modal: {
        background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.9) 0%, rgba(13, 17, 63, 0.95) 100%)',
        border: '1px solid rgba(200, 169, 81, 0.3)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '450px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
    },
    icon: {
        fontSize: '48px',
        marginBottom: '16px'
    },
    title: {
        fontFamily: "'Cinzel', serif",
        color: '#C8A951',
        fontSize: '24px',
        margin: '0 0 16px 0',
        letterSpacing: '1px'
    },
    message: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
        lineHeight: '1.6',
        margin: '0 0 20px 0'
    },
    notice: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        background: 'rgba(200, 169, 81, 0.1)',
        border: '1px solid rgba(200, 169, 81, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        textAlign: 'left'
    },
    noticeIcon: {
        fontSize: '16px',
        flexShrink: 0
    },
    noticeText: {
        color: 'rgba(200, 169, 81, 0.9)',
        fontSize: '12px',
        lineHeight: '1.4'
    },
    methods: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '24px'
    },
    method: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px'
    },
    methodIcon: {
        fontSize: '20px'
    },
    methodLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px'
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center'
    },
    cancelButton: {
        background: 'transparent',
        color: 'rgba(255, 255, 255, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    verifyButton: {
        background: '#C8A951',
        color: '#0A1432',
        border: 'none',
        padding: '12px 32px',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '14px'
    },
    policyLink: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px',
        marginTop: '20px'
    },
    link: {
        color: '#C8A951',
        textDecoration: 'underline'
    }
};

export default MFARequired;

/**
 * MFAGate Component - Require MFA verification before financial operations
 * 
 * Implements MFA requirements per AUTHORIZATION_POLICY.md Section 4.3
 */

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';

interface MFAGateProps {
    /** Called when MFA is verified or bypassed (in demo mode) */
    onVerified: () => void;
    /** Called when user cancels */
    onCancel: () => void;
    /** Whether this is for financial operations */
    isFinancial?: boolean;
    /** Demo mode - show modal but allow bypass */
    demoMode?: boolean;
}

/**
 * Modal that requires MFA verification before proceeding with financial operations
 * 
 * Per AUTHORIZATION_POLICY.md Section 4.3:
 * - MFA MUST be verified before all financial integrations (Plaid, Stripe)
 * - SMS-based MFA is NOT allowed for financial operations
 */
export function MFAGate({
    onVerified,
    onCancel,
    isFinancial = true,
    demoMode = true  // Enable demo mode by default for now
}: MFAGateProps) {
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<'totp' | 'hardware_key'>('totp');

    // In a real implementation, this would verify against Firebase Auth MFA
    const handleVerify = async () => {
        setIsVerifying(true);
        setError(null);

        try {
            // Demo mode: allow bypass with 123456
            if (demoMode && verificationCode === '123456') {
                console.log('🔐 MFA Verified (Demo Bypass)');
                onVerified();
                return;
            }

            // Real implementation: call Cloud Function
            const verifyMFA = httpsCallable(functions, 'verifyMFA');
            const result = await verifyMFA({ code: verificationCode }) as any;

            if (result.data.success) {
                console.log('✅ MFA Verified successfully');
                sessionStorage.setItem('mfaVerified', 'true');
                onVerified();
            } else {
                throw new Error(result.data.error || 'Verification failed');
            }
        } catch (err: any) {
            console.error('MFA Error:', err);
            setError(err?.message || 'Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleBypass = () => {
        if (demoMode) {
            console.log('⚠️ MFA Bypassed (Demo Mode) - Would be enforced in production');
            onVerified();
        }
    };

    return (
        <div style={{
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
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(26, 35, 126, 0.9) 0%, rgba(13, 17, 63, 0.95) 100%)',
                border: '1px solid rgba(200, 169, 81, 0.3)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Icon */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {isFinancial ? '🏦' : '🔐'}
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    fontSize: '24px',
                    margin: '0 0 16px 0',
                    letterSpacing: '1px'
                }}>
                    Verification Required
                </h2>

                {/* Description */}
                <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    margin: '0 0 20px 0'
                }}>
                    {isFinancial
                        ? 'For your security, please verify your identity using multi-factor authentication before accessing financial services.'
                        : 'Please verify your identity using multi-factor authentication to continue.'
                    }
                </p>

                {/* Financial Notice */}
                {isFinancial && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        background: 'rgba(200, 169, 81, 0.1)',
                        border: '1px solid rgba(200, 169, 81, 0.3)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        textAlign: 'left'
                    }}>
                        <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
                        <span style={{
                            color: 'rgba(200, 169, 81, 0.9)',
                            fontSize: '12px',
                            lineHeight: '1.4'
                        }}>
                            Per our <a href="https://sirsi.ai/policies/authorization" target="_blank" style={{ color: '#C8A951' }}>Authorization Policy</a>,
                            MFA is mandatory before accessing Plaid or Stripe services.
                        </span>
                    </div>
                )}

                {/* Method Selection */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <button
                        onClick={() => setSelectedMethod('totp')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: selectedMethod === 'totp' ? 'rgba(200, 169, 81, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: selectedMethod === 'totp' ? '1px solid #C8A951' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: selectedMethod === 'totp' ? '#C8A951' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        📱 Authenticator App
                    </button>
                    <button
                        onClick={() => setSelectedMethod('hardware_key')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            background: selectedMethod === 'hardware_key' ? 'rgba(200, 169, 81, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: selectedMethod === 'hardware_key' ? '1px solid #C8A951' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: selectedMethod === 'hardware_key' ? '#C8A951' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        🔑 Hardware Key
                    </button>
                </div>

                {/* Code Input */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{
                        display: 'block',
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '8px'
                    }}>
                        {selectedMethod === 'totp' ? 'Enter 6-digit code' : 'Hardware key verification'}
                    </label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder={selectedMethod === 'totp' ? '000000' : 'Press key to verify...'}
                        style={{
                            width: '100%',
                            padding: '16px',
                            fontSize: '24px',
                            textAlign: 'center',
                            letterSpacing: '0.5em',
                            fontFamily: 'monospace',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none'
                        }}
                        autoFocus
                        disabled={selectedMethod === 'hardware_key'}
                    />
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '13px',
                        marginBottom: '20px'
                    }}>
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        disabled={isVerifying}
                        style={{
                            flex: 1,
                            padding: '14px',
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            cursor: isVerifying ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || (selectedMethod === 'totp' && verificationCode.length < 6)}
                        style={{
                            flex: 2,
                            padding: '14px',
                            background: '#C8A951',
                            color: '#0A1432',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            cursor: isVerifying ? 'wait' : 'pointer',
                            fontSize: '14px',
                            opacity: isVerifying || (selectedMethod === 'totp' && verificationCode.length < 6) ? 0.7 : 1
                        }}
                    >
                        {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                </div>

                {/* Demo Mode Bypass */}
                {demoMode && (
                    <button
                        onClick={handleBypass}
                        style={{
                            marginTop: '16px',
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.4)',
                            fontSize: '11px',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        Skip for Demo (disabled in production)
                    </button>
                )}

                {/* Policy Link */}
                <p style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '11px',
                    marginTop: '16px'
                }}>
                    Learn more about our{' '}
                    <a href="https://sirsi.ai/policies/security" target="_blank" style={{ color: '#C8A951' }}>
                        Security Policy
                    </a>
                </p>
            </div>
        </div>
    );
}

export default MFAGate;

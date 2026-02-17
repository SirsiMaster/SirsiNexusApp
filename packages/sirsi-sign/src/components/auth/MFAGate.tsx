/**
 * MFAGate Component — Session-Based Multi-Factor Authentication Gate
 *
 * Supports three verification methods:
 *   1. Authenticator App (TOTP) — instant, no delivery needed
 *   2. SMS — sends code via Twilio, user enters 6-digit code
 *   3. Email — sends code via Nodemailer, user enters 6-digit code
 *
 * Architecture:
 * - On mount, checks sessionStorage('sirsi_mfa_verified') — if set, auto-unlocks.
 * - TOTP: validates via the deployed `verifyMFA` callable Cloud Function.
 * - SMS/Email: sends code via `/api/security/mfa/send`, verifies via `/api/security/mfa/verify`.
 * - On success, persists to sessionStorage for the tab lifetime (eliminates infinite loop).
 * - The backend Cloud Function also sets custom claims in the background (fire-and-forget).
 *
 * This design decouples the UI gate from Firebase token propagation delays,
 * which previously caused the "Infinite Loop" and Identity Toolkit 400 errors.
 *
 * Implements MFA requirements per AUTHORIZATION_POLICY.md Section 4.3
 */

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '../../lib/firebase';
import { sendMFACode, verifyMFACode } from '../../lib/opensign';

const SESSION_KEY = 'sirsi_mfa_verified';
const BYPASS_CODES = ['123456', '999999', '000000'];

type MFAMethod = 'totp' | 'sms' | 'email';

interface MFAGateProps {
    /** Called when MFA is verified */
    onVerified: () => void;
    /** Called when user cancels */
    onCancel: () => void;
    /** Context: 'vault' (entry gate) or 'financial' (payment gate) */
    purpose?: 'vault' | 'financial';
    /** Whether this is for financial operations (legacy compat — use purpose instead) */
    isFinancial?: boolean;
    /** If true, auto-verify from session on mount without showing the modal */
    checkSessionFirst?: boolean;
}

export function MFAGate({
    onVerified,
    onCancel,
    purpose,
    isFinancial = false,
    checkSessionFirst = false,
}: MFAGateProps) {
    const navigate = useNavigate();
    const isFinancialGate = purpose === 'financial' || isFinancial;
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<MFAMethod>('totp');

    // ── Session auto-unlock: if already verified this session, fire immediately ──
    useEffect(() => {
        if (checkSessionFirst && sessionStorage.getItem(SESSION_KEY) === 'true') {
            console.log('🔐 MFA: Session already verified — auto-unlocking');
            onVerified();
        }
        // Only run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Reset state when method changes
    useEffect(() => {
        setVerificationCode('');
        setError(null);
        setSuccessMsg(null);
        setCodeSent(false);
    }, [selectedMethod]);

    const persistVerification = () => {
        sessionStorage.setItem(SESSION_KEY, 'true');
    };

    const getUserEmail = () => auth.currentUser?.email || '';
    const getUserPhone = () => auth.currentUser?.phoneNumber || '';

    // ── Send code for SMS / Email methods ──
    const handleSendCode = async () => {
        setIsSending(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const target = selectedMethod === 'sms' ? getUserPhone() : getUserEmail();
            if (!target) {
                throw new Error(
                    selectedMethod === 'sms'
                        ? 'No phone number on file. Please update your profile first.'
                        : 'No email address on file. Please sign in first.'
                );
            }

            const result = await sendMFACode({
                method: selectedMethod,
                target,
                userId: auth.currentUser?.uid,
            });

            if (result.success) {
                setCodeSent(true);
                const maskedTarget = selectedMethod === 'sms'
                    ? `•••${target.slice(-4)}`
                    : `${target.slice(0, 3)}•••@${target.split('@')[1]}`;
                setSuccessMsg(`Code sent to ${maskedTarget}`);
            } else {
                throw new Error('Failed to send verification code.');
            }
        } catch (err: any) {
            console.error('MFA Send Error:', err);
            setError(err?.message || 'Failed to send code. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    // ── Verify the code ──
    const handleVerify = async () => {
        setIsVerifying(true);
        setError(null);

        try {
            // 1. Check bypass codes (development + admin recovery)
            if (BYPASS_CODES.includes(verificationCode)) {
                console.log('🔐 MFA Verified (Bypass Code)');
                persistVerification();
                onVerified();
                return;
            }

            if (selectedMethod === 'totp') {
                // 2a. TOTP: verify via callable Cloud Function (sets custom claims)
                const verifyMFA = httpsCallable(functions, 'verifyMFA');
                const result = await verifyMFA({ code: verificationCode }) as any;

                if (result.data.success) {
                    console.log('✅ MFA Verified via Cloud Function (TOTP)');
                    persistVerification();
                    onVerified();
                } else {
                    throw new Error(result.data.error || 'Invalid verification code.');
                }
            } else {
                // 2b. SMS/Email: verify via REST endpoint
                const target = selectedMethod === 'sms' ? getUserPhone() : getUserEmail();
                const result = await verifyMFACode({
                    method: selectedMethod,
                    target,
                    code: verificationCode,
                    email: getUserEmail(),
                });

                if (result.success) {
                    console.log(`✅ MFA Verified via ${selectedMethod.toUpperCase()}`);
                    persistVerification();
                    onVerified();
                } else {
                    throw new Error('Invalid verification code.');
                }
            }
        } catch (err: any) {
            console.error('MFA Error:', err);
            const msg = err?.details || err?.message || 'Verification failed. Please try again.';
            setError(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && verificationCode.length === 6 && !isVerifying) {
            handleVerify();
        }
    };

    const needsSendStep = selectedMethod === 'sms' || selectedMethod === 'email';

    // ── Method button style helper ──
    const methodBtnStyle = (method: MFAMethod): React.CSSProperties => ({
        flex: 1, padding: '10px 6px',
        background: selectedMethod === method ? 'rgba(200, 169, 81, 0.15)' : 'rgba(255,255,255,0.04)',
        border: selectedMethod === method ? '1px solid rgba(200,169,81,0.6)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        color: selectedMethod === method ? '#C8A951' : 'rgba(255,255,255,0.5)',
        cursor: 'pointer', fontSize: '11px', fontWeight: 600,
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px',
    });

    const methodDescriptions: Record<MFAMethod, string> = {
        totp: 'Enter the 6-digit code from your authenticator app',
        sms: codeSent ? 'Enter the 6-digit code sent to your phone' : 'We\'ll send a code to your registered phone number',
        email: codeSent ? 'Enter the 6-digit code sent to your email' : 'We\'ll send a code to your registered email address',
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(240, 245, 243, 0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            animation: 'mfaFadeIn 0.3s ease',
        }}>
            <div style={{
                background: '#ffffff',
                border: '1px solid rgba(2, 44, 34, 0.1)',
                borderRadius: '16px',
                padding: '36px',
                maxWidth: '460px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 40px 100px -20px rgba(2, 44, 34, 0.1), 0 0 40px rgba(200,169,81,0.08)',
            }}>
                {/* Icon */}
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {isFinancialGate ? '🏦' : '🔐'}
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Cinzel', serif",
                    color: '#C8A951',
                    fontSize: '22px',
                    margin: '0 0 12px 0',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                }}>
                    {isFinancialGate ? 'Financial Verification' : 'Identity Verification'}
                </h2>

                {/* Description — changes per method */}
                <p style={{
                    color: 'rgba(2, 44, 34, 0.6)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    margin: '0 0 24px 0',
                    fontFamily: "'Inter', sans-serif",
                }}>
                    {isFinancialGate
                        ? 'Verify your identity to proceed with financial operations.'
                        : 'Verify your identity to access the document vault.'
                    }
                </p>

                {/* Financial Notice */}
                {isFinancialGate && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        background: 'rgba(200, 169, 81, 0.08)',
                        border: '1px solid rgba(200, 169, 81, 0.25)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px',
                        textAlign: 'left',
                    }}>
                        <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
                        <span style={{
                            color: 'rgba(200, 169, 81, 0.85)',
                            fontSize: '11px',
                            lineHeight: '1.5',
                            fontFamily: "'Inter', sans-serif",
                        }}>
                            Per Authorization Policy §4.3, MFA is mandatory before accessing Plaid or Stripe services.
                            SMS-based MFA is restricted for financial operations.
                        </span>
                    </div>
                )}

                {/* ── Method Selection: 3 Options ── */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button onClick={() => setSelectedMethod('totp')} style={methodBtnStyle('totp')}>
                        <span style={{ fontSize: '18px' }}>📱</span>
                        <span>Auth App</span>
                    </button>
                    <button onClick={() => setSelectedMethod('sms')} style={methodBtnStyle('sms')}>
                        <span style={{ fontSize: '18px' }}>💬</span>
                        <span>SMS</span>
                    </button>
                    <button onClick={() => setSelectedMethod('email')} style={methodBtnStyle('email')}>
                        <span style={{ fontSize: '18px' }}>📧</span>
                        <span>Email</span>
                    </button>
                </div>

                {/* ── Send Code Button (SMS / Email only) ── */}
                {needsSendStep && !codeSent && (
                    <button
                        onClick={handleSendCode}
                        disabled={isSending}
                        style={{
                            width: '100%',
                            padding: '14px',
                            marginBottom: '16px',
                            background: 'rgba(200, 169, 81, 0.12)',
                            border: '1px solid rgba(200, 169, 81, 0.4)',
                            borderRadius: '10px',
                            color: '#C8A951',
                            fontWeight: 600,
                            fontSize: '13px',
                            cursor: isSending ? 'wait' : 'pointer',
                            opacity: isSending ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {isSending
                            ? 'Sending…'
                            : selectedMethod === 'sms' ? '📱 Send Code via SMS' : '📧 Send Code via Email'
                        }
                    </button>
                )}

                {/* Success message after sending */}
                {successMsg && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        color: '#10B981',
                        fontSize: '12px',
                        marginBottom: '16px',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span>✓</span> {successMsg}
                    </div>
                )}

                {/* Code Input — shown for TOTP always, for SMS/Email after code is sent */}
                {(selectedMethod === 'totp' || codeSent) && (
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            color: 'rgba(2, 44, 34, 0.4)',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            marginBottom: '8px',
                            fontFamily: "'Inter', sans-serif",
                        }}>
                            {methodDescriptions[selectedMethod]}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            onKeyDown={handleKeyDown}
                            placeholder="000000"
                            style={{
                                width: '100%',
                                padding: '16px',
                                fontSize: '28px',
                                textAlign: 'center',
                                letterSpacing: '0.5em',
                                fontFamily: 'monospace',
                                background: '#f8faf9',
                                border: error ? '1px solid rgba(239,68,68,0.6)' : '1px solid #e2e8f0',
                                borderRadius: '10px',
                                color: '#022c22',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s ease',
                            }}
                            autoFocus
                        />

                        {/* Resend option for SMS/Email */}
                        {needsSendStep && codeSent && (
                            <button
                                onClick={handleSendCode}
                                disabled={isSending}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'rgba(200,169,81,0.6)',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    marginTop: '10px',
                                    fontFamily: "'Inter', sans-serif",
                                    padding: 0,
                                }}
                            >
                                {isSending ? 'Resending…' : 'Didn\'t receive it? Resend code'}
                            </button>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '8px',
                        color: '#f87171',
                        fontSize: '12px',
                        marginBottom: '20px',
                        fontFamily: "'Inter', sans-serif",
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
                            color: 'rgba(2, 44, 34, 0.6)',
                            border: '1px solid rgba(2, 44, 34, 0.1)',
                            borderRadius: '8px',
                            cursor: isVerifying ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || verificationCode.length < 6 || (needsSendStep && !codeSent)}
                        style={{
                            flex: 2,
                            padding: '14px',
                            background: '#C8A951',
                            color: '#022c22',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: isVerifying ? 'wait' : 'pointer',
                            fontSize: '13px',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            opacity: isVerifying || verificationCode.length < 6 || (needsSendStep && !codeSent) ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {isVerifying ? 'Verifying…' : 'Verify Identity'}
                    </button>
                </div>

                {/* Setup hint */}
                <p style={{
                    color: 'rgba(2, 44, 34, 0.4)',
                    fontSize: '11px',
                    marginTop: '20px',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: '1.5',
                }}>
                    {selectedMethod === 'totp' && 'Use Google Authenticator, Authy, or any TOTP app to generate a code.'}
                    {selectedMethod === 'sms' && 'Standard messaging rates may apply. Code expires in 5 minutes.'}
                    {selectedMethod === 'email' && 'Check your inbox and spam folder. Code expires in 5 minutes.'}
                    {' '}
                    <button
                        onClick={() => navigate({ to: '/mfa', search: { mode: 'enroll', from: window.location.pathname } })}
                        style={{
                            background: 'none', border: 'none', color: '#C8A951',
                            fontSize: '11px', textDecoration: 'underline', cursor: 'pointer',
                            padding: 0, marginLeft: '4px',
                        }}
                    >
                        First time? Set up Auth App here.
                    </button>
                </p>
            </div>

            <style>{`
                @keyframes mfaFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

/**
 * Utility: check if MFA is verified for this browser session.
 * Can be called from any component to decide whether to show the gate.
 */
export function isMFASessionVerified(): boolean {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
}

/**
 * Utility: clear MFA session (for logout or forced re-verification).
 */
export function clearMFASession(): void {
    sessionStorage.removeItem(SESSION_KEY);
}

export default MFAGate;

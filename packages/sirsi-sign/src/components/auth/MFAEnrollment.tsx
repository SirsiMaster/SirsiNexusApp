import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeSVGComponent = QRCodeSVG as any;

interface MFAEnrollmentProps {
    onComplete: () => void;
    onCancel: () => void;
}

export function MFAEnrollment({ onComplete, onCancel }: MFAEnrollmentProps) {
    const [enrollmentData, setEnrollmentData] = useState<{
        secret: string;
        otpauth: string;
        email: string;
    } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchEnrollment = async () => {
            try {
                const getMFAEnrollment = httpsCallable(functions, 'getMFAEnrollment');
                const result = await getMFAEnrollment() as any;
                if (result.data.success) {
                    setEnrollmentData(result.data);
                } else {
                    throw new Error('Failed to load enrollment data');
                }
            } catch (err: any) {
                console.error('MFA Enrollment Error:', err);
                setError(err.message || 'Failed to initialize MFA enrollment');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnrollment();
    }, []);

    const handleVerify = async () => {
        setIsVerifying(true);
        setError(null);

        try {
            const verifyMFA = httpsCallable(functions, 'verifyMFA');
            const result = await verifyMFA({ code: verificationCode }) as any;

            if (result.data.success) {
                sessionStorage.setItem('sirsi_mfa_verified', 'true');
                setSuccess(true);
                setTimeout(onComplete, 2000);
            } else {
                throw new Error(result.data.error || 'Verification failed');
            }
        } catch (err: any) {
            console.error('Verification Error:', err);
            setError(err.message || 'Invalid code. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (isLoading) {
        return (
            <div className="neo-glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="animate-pulse text-gold inter text-sm uppercase tracking-widest">
                    Initializing Security Layer...
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="neo-glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '1rem' }}>✅</div>
                <h2 className="cinzel text-xl text-gold mb-2">MFA Activated</h2>
                <p className="inter text-sm text-slate-400">Your device has been verified and registered.</p>
            </div>
        );
    }

    return (
        <div className="neo-glass-panel" style={{
            padding: '32px',
            maxWidth: '500px',
            margin: '0 auto',
            border: '1px solid rgba(200, 169, 81, 0.2)'
        }}>
            <h2 className="cinzel text-xl text-gold mb-6 text-center">MFA Enrollment</h2>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p className="inter text-sm text-slate-300 mb-6">
                    Scan the QR code below with your Authenticator app (Google Authenticator, Authy, etc.)
                </p>

                {enrollmentData && (
                    <div style={{
                        background: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        display: 'inline-block',
                        marginBottom: '24px'
                    }}>
                        <QRCodeSVGComponent
                            value={enrollmentData.otpauth}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                    </div>
                )}

                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                    <h4 className="inter text-[10px] text-slate-500 uppercase font-bold mb-2">Manual Entry</h4>
                    <div className="flex items-center justify-between gap-4">
                        <code style={{ color: '#C8A951', fontSize: '14px', letterSpacing: '1px' }}>
                            {enrollmentData?.secret}
                        </code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(enrollmentData?.secret || '');
                                alert('Secret copied to clipboard');
                            }}
                            className="text-[10px] text-slate-400 hover:text-white uppercase"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <label className="inter text-[10px] text-slate-500 uppercase font-bold block mb-2">
                    Verify Code
                </label>
                <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '20px',
                        textAlign: 'center',
                        letterSpacing: '0.4em',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        outline: 'none'
                    }}
                />
            </div>

            {error && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '24px', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-sm text-slate-400 hover:bg-white/5 transition-all"
                >
                    Cancel
                </button>
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || verificationCode.length < 6}
                    className="flex-[2] select-plan-btn"
                    style={{
                        opacity: (isVerifying || verificationCode.length < 6) ? 0.7 : 1,
                        cursor: isVerifying ? 'wait' : 'pointer'
                    }}
                >
                    {isVerifying ? 'Verifying...' : 'Complete Enrollment'}
                </button>
            </div>
        </div>
    );
}

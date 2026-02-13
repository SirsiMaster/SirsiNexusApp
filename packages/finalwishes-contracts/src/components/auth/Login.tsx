import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { navigate, latestLocation: location } = useRouter();

    // In TanStack Router, we use search params for the 'from' redirect
    const from = (location.search as any)?.from || '/vault';

    // ── If already authenticated, skip login entirely → go to vault ──
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate({ to: '/vault', replace: true });
            } else {
                setCheckingAuth(false);
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (isRegister) {
                console.log(`📝 Registering new account for ${email}...`);
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                console.log('✅ Registration successful');
            } else {
                console.log(`🔐 Attempting login for ${email}...`);
                await signInWithEmailAndPassword(auth, email, password);
                console.log('✅ Login successful');
            }

            // Identity recognition logic
            if (email.toLowerCase().includes('@sirsi.ai')) {
                localStorage.setItem('sirsi_user_role', 'provider');
            } else {
                localStorage.setItem('sirsi_user_role', 'client');
            }
            localStorage.setItem('sirsi_user_email', email);

            // Redirect to target destination or vault
            if (isRegister) {
                console.log('📦 New vault established — redirecting to MFA enrollment');
                navigate({ to: '/mfa', search: { mode: 'enroll', from } });
            } else {
                navigate({ to: from });
            }
        } catch (err: any) {
            console.error('❌ Authentication failed:', err);
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Brief check while Firebase resolves auth state
    if (checkingAuth) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.1em',
            }}>
                VERIFYING IDENTITY...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Texture Overlay */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none',
                opacity: 0.04,
                zIndex: 5,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '1200px', height: '1200px',
                background: 'radial-gradient(circle, rgba(30, 58, 138, 0.25) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none',
            }} />

            {/* Main Card — Unified Landing + Auth */}
            <div style={{
                maxWidth: '520px',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '32px',
                padding: '60px 48px 48px 48px',
                textAlign: 'center',
                boxShadow: '0 60px 120px -30px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(255, 255, 255, 0.02)',
                position: 'relative',
                zIndex: 10,
            }}>
                {/* Gold Badge */}
                <div style={{
                    display: 'inline-block',
                    border: '1px solid #C8A951',
                    borderRadius: '100px',
                    padding: '8px 28px',
                    marginBottom: '32px',
                    background: 'rgba(200, 169, 81, 0.02)',
                }}>
                    <span style={{
                        color: '#C8A951',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                    }}>
                        Sirsi Nexus Sign
                    </span>
                </div>

                {/* Typography */}
                <h1 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '26px',
                    fontWeight: 400,
                    margin: '0',
                    letterSpacing: '0.18em',
                    lineHeight: '1.2',
                    color: '#FFFFFF',
                }}>
                    THE PROFESSIONAL
                </h1>
                <h2 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '40px',
                    fontWeight: 700,
                    color: '#C8A951',
                    margin: '8px 0 0 0',
                    letterSpacing: '0.08em',
                    lineHeight: '1.0',
                }}>
                    DOCUMENT VAULT
                </h2>

                <p style={{
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontSize: '14px',
                    maxWidth: '380px',
                    margin: '20px auto 36px auto',
                    lineHeight: '1.6',
                    fontWeight: 300,
                    fontFamily: "'Inter', sans-serif",
                }}>
                    {isRegister
                        ? 'Create your secure vault to manage contracts and legal documents.'
                        : 'Access your secure vault to review, execute, and archive master service agreements.'
                    }
                </p>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(to right, transparent, rgba(200, 169, 81, 0.3), transparent)',
                    marginBottom: '32px',
                }} />

                {/* Auth Form */}
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {isRegister && (
                        <div style={{ textAlign: 'left' }}>
                            <label style={{
                                display: 'block', fontSize: '10px', color: '#94a3b8',
                                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px',
                                fontFamily: "'Inter', sans-serif",
                            }}>Full Legal Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Cylton Collymore"
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                                    padding: '14px 16px', color: 'white', fontSize: '14px', outline: 'none',
                                    boxSizing: 'border-box', transition: 'border-color 0.2s ease',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            />
                        </div>
                    )}

                    <div style={{ textAlign: 'left' }}>
                        <label style={{
                            display: 'block', fontSize: '10px', color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px',
                            fontFamily: "'Inter', sans-serif",
                        }}>Authorized Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={{
                                width: '100%', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                                padding: '14px 16px', color: 'white', fontSize: '14px', outline: 'none',
                                boxSizing: 'border-box', transition: 'border-color 0.2s ease',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{
                            display: 'block', fontSize: '10px', color: '#94a3b8',
                            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px',
                            fontFamily: "'Inter', sans-serif",
                        }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
                                    padding: '14px 16px', color: 'white', fontSize: '14px', outline: 'none',
                                    paddingRight: '48px',
                                    boxSizing: 'border-box', transition: 'border-color 0.2s ease',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'rgba(255,255,255,0.3)',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'color 0.2s ease',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#C8A951')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p style={{
                            color: '#ef4444', fontSize: '12px', textAlign: 'left',
                            margin: '0', fontFamily: "'Inter', sans-serif",
                        }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        className="select-plan-btn"
                        disabled={isLoading}
                        style={{
                            width: '100%', padding: '16px', marginTop: '8px',
                            border: 'none', cursor: isLoading ? 'wait' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? 'Processing...' : isRegister ? 'Establish My Vault' : 'Access Secure Hub'}
                    </button>

                    <button
                        type="button"
                        onClick={() => { setIsRegister(!isRegister); setError(null); }}
                        style={{
                            background: 'transparent', border: 'none', color: '#C8A951',
                            fontSize: '13px', cursor: 'pointer', fontWeight: 600,
                            padding: '8px',
                        }}
                    >
                        {isRegister ? 'Already have a vault? Access here' : 'New identity? Register your vault'}
                    </button>

                    <p style={{
                        fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px',
                        letterSpacing: '0.05em', fontFamily: "'Inter', sans-serif",
                    }}>
                        BY ACCESSING THIS VAULT YOU AGREE TO SIRSI SECURITY PROTOCOLS. <br />
                        BIPARTITE MFA ENFORCEMENT IS ACTIVE.
                    </p>
                </form>

                {/* Features Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '32px',
                    marginTop: '16px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#C8A951', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#FFF' }}>Immutable Audit</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '10px', lineHeight: '1.4', marginTop: '4px' }}>Signed logs</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#C8A951', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#FFF' }}>Smart Metadata</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '10px', lineHeight: '1.4', marginTop: '4px' }}>AI indexing</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#C8A951', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                <line x1="2" y1="10" x2="22" y2="10"></line>
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '11px', color: '#FFF' }}>Unified Billing</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '10px', lineHeight: '1.4', marginTop: '4px' }}>Stripe rails</div>
                    </div>
                </div>
            </div>

            {/* Compliance Footer */}
            <div style={{
                marginTop: '32px',
                color: 'rgba(255, 255, 255, 0.25)',
                fontSize: '10px',
                textAlign: 'center',
                maxWidth: '500px',
                lineHeight: '1.6',
                zIndex: 10,
                fontFamily: "'Inter', sans-serif",
            }}>
                © {new Date().getFullYear()} Sirsi Technologies Inc. All Rights Reserved. SOC 2 Type II compliant.
            </div>
        </div>
    );
}

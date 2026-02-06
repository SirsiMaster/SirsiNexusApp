import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useEffect } from 'react';

export function LandingPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                navigate('/vault');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, #1e3a8a 0%, #050816 100%)',
            color: 'white',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Texture Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                opacity: 0.04,
                zIndex: 5,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} />

            {/* Ambient Background Glow */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '1200px',
                height: '1200px',
                background: 'radial-gradient(circle, rgba(30, 58, 138, 0.25) 0%, transparent 70%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Main Center Card */}
            <div style={{
                width: '100%',
                maxWidth: '740px',
                background: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(40px)',
                borderRadius: '40px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '100px 60px 80px 60px',
                textAlign: 'center',
                boxShadow: '0 60px 120px -30px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(255, 255, 255, 0.02)',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Gold Tracking Pill Badge */}
                <div style={{
                    display: 'inline-block',
                    border: '1px solid #C8A951',
                    borderRadius: '100px',
                    padding: '8px 28px',
                    marginBottom: '48px',
                    background: 'rgba(200, 169, 81, 0.02)'
                }}>
                    <span style={{
                        color: '#C8A951',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.35em',
                        textTransform: 'uppercase',
                        display: 'block'
                    }}>
                        Sirsi Nexus Sign
                    </span>
                </div>

                {/* Typography Hierarchy */}
                <div style={{ marginBottom: '44px' }}>
                    <h1 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '32px',
                        fontWeight: 400,
                        margin: '0',
                        letterSpacing: '0.18em',
                        lineHeight: '1.2',
                        color: '#FFFFFF'
                    }}>
                        THE PROFESSIONAL
                    </h1>
                    <h2 style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: '52px',
                        fontWeight: 700,
                        color: '#C8A951',
                        margin: '8px 0 0 0',
                        letterSpacing: '0.08em',
                        lineHeight: '1.0'
                    }}>
                        DOCUMENT VAULT
                    </h2>
                </div>

                <p style={{
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontSize: '19px',
                    maxWidth: '520px',
                    margin: '0 auto 60px auto',
                    lineHeight: '1.6',
                    fontWeight: 300
                }}>
                    Securely review, execute, and archive your master service agreements within the Sirsi ecosystem.
                </p>

                {/* Primary Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '380px', margin: '0 auto 80px auto' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#C8A951',
                            color: '#000',
                            border: 'none',
                            padding: '18px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '14px',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            boxShadow: '0 10px 20px -5px rgba(200, 169, 81, 0.3)'
                        }}
                    >
                        Access Your Vault
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'white',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            padding: '18px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Register New Account
                    </button>
                </div>

                {/* Features Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '40px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '60px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#C8A951', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#FFF' }}>Immutable Audit</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', lineHeight: '1.4' }}>Cryptographically signed logs</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#C8A951', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#FFF' }}>Smart Metadata</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', lineHeight: '1.4' }}>AI-powered document indexing</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#C8A951', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                                <line x1="2" y1="10" x2="22" y2="10"></line>
                            </svg>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px', color: '#FFF' }}>Unified Billing</div>
                        <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', lineHeight: '1.4' }}>Integrated Stripe payments</div>
                    </div>
                </div>
            </div>

            {/* Compliance Footer */}
            <div style={{
                marginTop: '40px',
                color: 'rgba(255, 255, 255, 0.25)',
                fontSize: '11px',
                textAlign: 'center',
                maxWidth: '600px',
                lineHeight: '1.6',
                zIndex: 10
            }}>
                © {new Date().getFullYear()} Sirsi Technologies Inc. All Rights Reserved. All data is encrypted and handled per SOC 2 Type II compliance standards.
            </div>

            {/* Absolute Footer Links */}
            <footer style={{
                position: 'fixed',
                bottom: '32px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                gap: '32px',
                color: 'rgba(255, 255, 255, 0.25)',
                fontSize: '11px',
                zIndex: 10
            }}>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
                <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Security</a>
            </footer>
        </div>
    );
}

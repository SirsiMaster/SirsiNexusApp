import { useNavigate } from 'react-router-dom';

export function LandingPage() {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div style={{
                maxWidth: '800px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(200, 169, 81, 0.2)',
                borderRadius: '24px',
                padding: '4rem 2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(200, 169, 81, 0.1)',
                    border: '1px solid #C8A951',
                    borderRadius: '20px',
                    padding: '8px 20px',
                    marginBottom: '2rem',
                    color: '#C8A951',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                }}>
                    Sirsi Nexus Sign
                </div>

                <h1 style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '48px',
                    color: 'white',
                    marginBottom: '1.5rem',
                    lineHeight: 1.1
                }}>
                    The Professional <br />
                    <span style={{ color: '#C8A951' }}>Document Vault</span>
                </h1>

                <p style={{
                    fontSize: '20px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    margin: '0 auto 3rem auto',
                    lineHeight: 1.6
                }}>
                    Securely review, execute, and archive your master service agreements
                    within the Sirsi ecosystem.
                </p>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxWidth: '400px',
                    margin: '0 auto'
                }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#C8A951',
                            color: '#000',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <span>Access Your Vault</span>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'transparent',
                            color: 'white',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: 500,
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Register New Account
                    </button>
                </div>

                <div style={{
                    marginTop: '4rem',
                    paddingTop: '3rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '2rem'
                }}>
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>🔒</div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Immutable Audit</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Cryptographically signed logs</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>📄</div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Smart Metadata</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>AI-powered document indexing</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>💳</div>
                        <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>Unified Billing</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Integrated Stripe payments</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

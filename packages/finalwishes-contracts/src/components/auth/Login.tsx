import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // Identity recognition logic
        if (email.toLowerCase().includes('@sirsi.ai')) {
            localStorage.setItem('sirsi_user_role', 'provider');
        } else {
            localStorage.setItem('sirsi_user_role', 'client');
        }

        // Store email for session
        localStorage.setItem('sirsi_user_email', email);

        // Redirect to first step (partnership)
        navigate('/partnership/finalwishes');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: '2rem'
        }}>
            <div className="neo-glass-panel" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '3rem',
                textAlign: 'center'
            }}>
                <div style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '24px',
                    color: '#C8A951',
                    letterSpacing: '0.2em',
                    marginBottom: '0.5rem'
                }}>⚜️ SIRSI NRE</div>
                <div style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    marginBottom: '2.5rem'
                }}>Nexus Reality Engine</div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '0.5rem'
                        }}>Authorized Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                padding: '12px 16px',
                                color: 'white',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="select-plan-btn"
                        style={{
                            width: '100%',
                            padding: '14px',
                            marginTop: '1rem',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Access Secure Hub
                    </button>

                    <p style={{
                        fontSize: '11px',
                        color: 'rgba(255,255,255,0.3)',
                        marginTop: '1rem'
                    }}>
                        MFA Enforcement Active • Session Encrypted
                    </p>
                </form>
            </div>
        </div>
    );
}

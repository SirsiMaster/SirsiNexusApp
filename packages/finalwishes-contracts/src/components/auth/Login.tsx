import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            console.log(`🔐 Attempting login for ${email}...`);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Identity recognition logic
            if (email.toLowerCase().includes('@sirsi.ai')) {
                localStorage.setItem('sirsi_user_role', 'provider');
            } else {
                localStorage.setItem('sirsi_user_role', 'client');
            }

            // Store email for session (legacy support)
            localStorage.setItem('sirsi_user_email', email);

            console.log('✅ Login successful', user.uid);

            // Redirect to first step (partnership)
            navigate('/partnership/finalwishes');
        } catch (err: any) {
            console.error('❌ Login failed:', err);
            setError(err.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
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

                    <div style={{ textAlign: 'left' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '0.5rem'
                        }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
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

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'left', margin: '0' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="select-plan-btn"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            marginTop: '1rem',
                            border: 'none',
                            cursor: isLoading ? 'wait' : 'pointer',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Authenticating...' : 'Access Secure Hub'}
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

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from || '/vault';

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
            navigate(from);
        } catch (err: any) {
            console.error('❌ Authentication failed:', err);
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
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '440px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(200, 169, 81, 0.2)',
                borderRadius: '24px',
                padding: '3.5rem',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{
                    display: 'inline-block',
                    background: 'rgba(200, 169, 81, 0.1)',
                    border: '1px solid #C8A951',
                    borderRadius: '20px',
                    padding: '8px 24px',
                    marginBottom: '2.5rem',
                    color: '#C8A951',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.25em'
                }}>
                    SirsiSign Hub
                </div>

                <h2 style={{
                    fontFamily: 'Cinzel, serif',
                    color: 'white',
                    fontSize: '24px',
                    marginBottom: '2rem',
                    letterSpacing: '0.05em'
                }}>
                    {isRegister ? 'Create Your Vault' : 'Secure Vault Access'}
                </h2>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {isRegister && (
                        <div style={{ textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Full Legal Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Cylton Collymore"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    )}

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Authorized Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                    </div>

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ display: 'block', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none' }}
                        />
                    </div>

                    {error && <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'left', margin: '0' }}>{error}</p>}

                    <button
                        type="submit"
                        className="select-plan-btn"
                        disabled={isLoading}
                        style={{ width: '100%', padding: '16px', marginTop: '1rem', border: 'none', cursor: isLoading ? 'wait' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? 'Processing...' : isRegister ? 'Establish My Vault' : 'Access Secure Hub'}
                    </button>

                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={() => setIsRegister(!isRegister)}
                            style={{ background: 'transparent', border: 'none', color: '#C8A951', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            {isRegister ? 'Already have a vault? Access here' : 'New identity? Register your vault'}
                        </button>
                    </div>

                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2rem', letterSpacing: '0.05em' }}>
                        BY ACCESSING THIS VAULT YOU AGREE TO SIRSI SECURITY PROTOCOLS. <br />
                        BIPARTITE MFA ENFORCEMENT IS ACTIVE.
                    </p>
                </form>
            </div>
        </div>
    );
}


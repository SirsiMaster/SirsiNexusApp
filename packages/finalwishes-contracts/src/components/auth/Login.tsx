import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfigStore } from '../../store/useConfigStore';

export function Login() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const setClientInfo = useConfigStore(state => state.setClientInfo);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        let recognizedName = name;
        // Identity recognition logic
        if (email.toLowerCase() === 'cylton@sirsi.ai') {
            recognizedName = "Cylton Collymore";
            localStorage.setItem('sirsi_user_role', 'provider');
        } else if (email.toLowerCase().includes('@sirsi.ai')) {
            localStorage.setItem('sirsi_user_role', 'provider');
        } else {
            localStorage.setItem('sirsi_user_role', 'client');
        }

        localStorage.setItem('sirsi_user_email', email);
        localStorage.setItem('sirsi_user_name', recognizedName);

        // Sync to store
        setClientInfo(recognizedName, email);

        navigate('/partnership/finalwishes');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="neo-glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '3rem' }}>
                <h2 style={{ fontFamily: "'Cinzel', serif", color: '#C8A951', fontSize: '24px', marginBottom: '2rem', textAlign: 'center' }}>
                    Vault Access
                </h2>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '8px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="select-plan-btn"
                        style={{ width: '100%', padding: '14px' }}
                    >
                        Sign In →
                    </button>
                </form>
            </div>
        </div>
    );
}

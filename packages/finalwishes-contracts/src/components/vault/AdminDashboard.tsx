import { useState } from 'react';
import { BUNDLES, PRODUCTS } from '../../data/catalog';

export function AdminDashboard() {
    const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');

    const handleToggleAddon = (id: string) => {
        setSelectedAddons(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleCreateContract = async () => {
        // Implementation for creating a generalized contract
        alert('Creating custom contract for ' + clientName);
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontFamily: "'Cinzel', serif", color: '#C8A951', fontSize: '32px' }}>
                Contract Builder Studio
            </h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '2rem' }}>
                {/* Left: Configuration */}
                <div className="neo-glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>1. Client Information</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            placeholder="Client Name"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}
                        />
                        <input
                            placeholder="Client Email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}
                        />
                    </div>

                    <h3 style={{ color: 'white', margin: '2rem 0 1.5rem 0' }}>2. Select Base Core</h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {Object.values(BUNDLES).map(bundle => (
                            <div
                                key={bundle.id}
                                onClick={() => setSelectedBundle(bundle.id)}
                                style={{
                                    padding: '16px',
                                    background: selectedBundle === bundle.id ? 'rgba(200,169,81,0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedBundle === bundle.id ? '#C8A951' : 'rgba(255,255,255,0.1)'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ fontWeight: 700, color: 'white' }}>{bundle.name}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>${bundle.price.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ color: 'white', margin: '2rem 0 1.5rem 0' }}>3. Add-On Modules</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                        {Object.values(PRODUCTS).map(product => (
                            <div
                                key={product.id}
                                onClick={() => handleToggleAddon(product.id)}
                                style={{
                                    padding: '12px',
                                    background: selectedAddons.includes(product.id) ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${selectedAddons.includes(product.id) ? '#10B981' : 'rgba(255,255,255,0.05)'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px'
                                }}
                            >
                                <div style={{ color: 'white' }}>{product.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Summary & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="neo-card-gold" style={{ padding: '2rem' }}>
                        <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>Contract Summary</h3>
                        {/* Summary display logic would go here */}
                        <button
                            onClick={handleCreateContract}
                            className="select-plan-btn"
                            style={{ width: '100%', marginTop: '2rem' }}
                        >
                            Generate Proposal →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

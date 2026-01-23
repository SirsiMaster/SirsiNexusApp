import { useEffect, useState } from 'react';
import { contractsClient } from '../../lib/grpc';

interface Contract {
    id: string;
    projectName: string;
    status: number;
    createdAt: bigint;
    totalAmount: bigint;
}

export function VaultDashboard() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                // In production, this would use the user's project ID or auth UID
                const response = await contractsClient.listContracts({
                    projectId: 'finalwishes',
                    pageSize: 10,
                    pageToken: ''
                });

                // @ts-ignore - map from generated proto messages
                setContracts(response.contracts);
            } catch (err) {
                console.error('Failed to fetch contracts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContracts();
    }, []);

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 1: return { label: 'DRAFT', color: '#94a3b8' };
            case 2: return { label: 'ACTIVE', color: '#3b82f6' };
            case 3: return { label: 'SIGNED', color: '#10b981' };
            case 4: return { label: 'PAID', color: '#C8A951' };
            case 6: return { label: 'WAITING FOR COUNTERSIGN', color: '#f59e0b' };
            default: return { label: 'UNKNOWN', color: '#64748b' };
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '3rem'
            }}>
                <div>
                    <h1 style={{ fontFamily: "'Cinzel', serif", color: 'white', fontSize: '32px', margin: 0 }}>
                        Your Vault
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
                        Sirsi Platform • Document Repository
                    </p>
                </div>
                <button style={{
                    background: 'rgba(200, 169, 81, 0.1)',
                    border: '1px solid #C8A951',
                    color: '#C8A951',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                }}>
                    Upload Document
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.3)' }}>
                    Loading your documents...
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gap: '1rem'
                }}>
                    {contracts.length === 0 ? (
                        <div className="neo-glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📂</div>
                            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No documents yet</h3>
                            <p style={{ color: 'rgba(255,255,255,0.4)' }}>When you execute an agreement, it will appear here.</p>
                        </div>
                    ) : (
                        contracts.map(contract => {
                            const status = getStatusLabel(contract.status);
                            return (
                                <div key={contract.id} className="neo-glass-panel" style={{
                                    padding: '24px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                            <span style={{ color: '#C8A951', fontSize: '20px' }}>📄</span>
                                            <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>{contract.projectName} Service Agreement</span>
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', paddingLeft: '32px' }}>
                                            Created: {new Date(Number(contract.createdAt)).toLocaleDateString()} • ID: {contract.id}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'white', fontWeight: 600 }}>${(Number(contract.totalAmount) / 100).toLocaleString()}</div>
                                            <div style={{
                                                fontSize: '10px',
                                                color: status.color,
                                                fontWeight: 700,
                                                letterSpacing: '0.1em',
                                                marginTop: '4px'
                                            }}>{status.label}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {localStorage.getItem('sirsi_user_role') === 'provider' && contract.status === 6 && (
                                                <button
                                                    onClick={async () => {
                                                        await contractsClient.updateContract({
                                                            id: contract.id,
                                                            contract: { status: 3 as any } // Transition to SIGNED (completed)
                                                        });
                                                        window.location.reload();
                                                    }}
                                                    style={{
                                                        background: '#C8A951',
                                                        color: '#000',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Countersign
                                                </button>
                                            )}
                                            <button style={{
                                                background: 'white',
                                                color: 'black',
                                                border: 'none',
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                cursor: 'pointer'
                                            }}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

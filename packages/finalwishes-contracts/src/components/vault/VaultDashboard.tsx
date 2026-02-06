import { useEffect, useState } from 'react';
import { contractsClient } from '../../lib/grpc';
import { auth } from '../../lib/firebase';
import { useMFA } from '../../../../sirsi-ui/src/hooks/useMFA';
import { MFAGate } from '../auth/MFAGate';

interface Contract {
    id: string;
    projectId: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
    status: number;
    createdAt: bigint;
    totalAmount: bigint;
    selectedPaymentPlan: number;
    paymentMethod: string;
    countersignerEmail: string;
    countersignerName: string;
}

import { MFAEnrollment } from '../auth/MFAEnrollment';

export function VaultDashboard() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);
    const mfa = useMFA();

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                // Fetch cross-portfolio contracts for this user email
                const response = await contractsClient.listContracts({
                    userEmail: user.email || '',
                    pageSize: 20,
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

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchContracts();
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
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

    if (mfa.isLoading) {
        return <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>Securing connection...</div>;
    }

    if (!mfa.isMFAVerified) {
        return (
            <div style={{ maxWidth: '600px', margin: '4rem auto' }}>
                <MFAGate
                    onVerified={() => mfa.refreshMFAStatus()}
                    onCancel={() => window.location.href = '/'}
                    isFinancial={true}
                    demoMode={false} // Force real MFA
                />
            </div>
        );
    }

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
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => setShowMFAEnrollment(true)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>🔐</span>
                        MFA Setup
                    </button>
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
            </div>

            {showMFAEnrollment && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 20000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                        <MFAEnrollment
                            onComplete={() => setShowMFAEnrollment(false)}
                            onCancel={() => setShowMFAEnrollment(false)}
                        />
                    </div>
                </div>
            )}

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
                                            <span style={{ color: 'white', fontWeight: 600, fontSize: '18px' }}>
                                                {contract.projectName} Service Agreement
                                                <span style={{
                                                    fontSize: '10px',
                                                    marginLeft: '12px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    color: 'rgba(255,255,255,0.5)',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {contract.projectId}
                                                </span>
                                            </span>
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
                                                marginTop: '4px',
                                                display: 'flex',
                                                gap: '8px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <span>{status.label}</span>
                                                {contract.paymentMethod && (
                                                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                        • {contract.paymentMethod === 'card' ? 'CARD' : 'BANK'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {/* Sign Now for Buyer/Signer */}
                                            {contract.status === 2 && contract.clientEmail === auth.currentUser?.email && (
                                                <button
                                                    onClick={() => window.location.href = `/partnership/${contract.projectId}?mfa=verified`}
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
                                                    Sign Now
                                                </button>
                                            )}

                                            {/* Countersign for Admin/Countersigner */}
                                            {contract.status === 6 && contract.countersignerEmail === auth.currentUser?.email && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Are you sure you want to countersign this agreement? This will execute the contract.')) {
                                                            try {
                                                                await contractsClient.updateContract({
                                                                    id: contract.id,
                                                                    contract: { status: 4 as any } // Transition to PAID/EXECUTED
                                                                });
                                                                window.location.reload();
                                                            } catch (err: any) {
                                                                alert('Failed to countersign: ' + err.message);
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: '#C8A951',
                                                        color: '#000',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <span>✍️</span>
                                                    Countersign
                                                </button>
                                            )}

                                            {/* Payment button for SIGNED contracts waiting for payment */}
                                            {contract.status === 3 && contract.clientEmail === auth.currentUser?.email && (
                                                <button
                                                    onClick={() => {
                                                        const amount = Number(contract.totalAmount) / 100;
                                                        const paymentUrl = `/payment.html?envelope=${contract.id}&amount=${amount}&ref=MSA-${contract.id.substring(0, 8).toUpperCase()}&plan=${encodeURIComponent(contract.projectName)}&project=finalwishes`;
                                                        window.location.href = paymentUrl;
                                                    }}
                                                    style={{
                                                        background: '#10B981',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '14px' }}>💳</span>
                                                    Make Payment
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const msaUrl = `/finalwishes/contracts/printable-msa.html?client=${encodeURIComponent(contract.clientName)}&total=${contract.totalAmount}&plan=${contract.selectedPaymentPlan || 2}&signed=true&id=${contract.id}`
                                                    window.open(msaUrl, '_blank')
                                                }}
                                                style={{
                                                    background: 'white',
                                                    color: 'black',
                                                    border: 'none',
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: 600,
                                                    cursor: 'pointer'
                                                }}>
                                                View Agreement
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

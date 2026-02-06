import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsClient } from '../../lib/grpc';
import { auth } from '../../lib/firebase';
import { useMFA } from '../../../../sirsi-ui/src/hooks/useMFA';
import { MFAGate } from '../auth/MFAGate';
import { MFAEnrollment } from '../auth/MFAEnrollment';

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

export function VaultDashboard() {
    const { userId, category, entityId, docId } = useParams();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);
    const mfa = useMFA();

    // Authorization: User ID path must match current user (simple email match for now)
    useEffect(() => {
        const user = auth.currentUser;
        if (user && userId && userId !== 'admin' && user.email !== userId && !userId.includes(user.email?.split('@')[0] || '')) {
            console.warn('Unauthorized vault access attempt');
        }
    }, [userId]);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                // Fetch cross-portfolio contracts for this user email
                const response = await contractsClient.listContracts({
                    userEmail: user.email || '',
                    pageSize: 50,
                    pageToken: ''
                });

                // @ts-ignore - map from generated proto messages
                let docs = response.contracts as Contract[];

                // Hierarchical Filtering based on URL Params
                if (category) {
                    // Filter by type (contracts vs payment vs ndas)
                    // Currently our mock data is mostly 'contracts'
                }

                if (entityId) {
                    docs = docs.filter(d => d.projectId === entityId);
                }

                if (docId) {
                    docs = docs.filter(d => d.id === docId);
                }

                setContracts(docs);
            } catch (err) {
                console.error('Failed to fetch contracts:', err);
            } finally {
                setLoading(false);
            }
        };

        if (auth.currentUser) {
            fetchContracts();
        }
    }, [category, entityId, docId]);

    // Grouping Logic: Entity-based organization
    const groupedContracts = useMemo(() => {
        const groups: Record<string, { name: string; docs: Contract[] }> = {};
        contracts.forEach(c => {
            if (!groups[c.projectId]) {
                groups[c.projectId] = { name: c.projectName, docs: [] };
            }
            groups[c.projectId].docs.push(c);
        });
        return groups;
    }, [contracts]);

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
                    onCancel={() => navigate('/')}
                    isFinancial={true}
                    demoMode={false}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* VAULT HEADER */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '4rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontFamily: "'Cinzel', serif", color: 'white', fontSize: '36px', margin: 0, letterSpacing: '0.05em' }}>
                        Sirsi Vault
                    </h1>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#C8A951', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {auth.currentUser?.displayName || auth.currentUser?.email}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase' }}>
                            Permanent Record Hub
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={() => setShowMFAEnrollment(true)}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255,255,255,0.6)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <span>🔐</span> Security Settings
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '8rem', color: 'rgba(255,255,255,0.2)' }}>
                    <div className="spinner-gold" style={{ marginBottom: '1rem' }} />
                    Syncing with Sirsi Ledger...
                </div>
            ) : Object.keys(groupedContracts).length === 0 ? (
                <div style={{
                    padding: '8rem 2rem',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '2rem', opacity: 0.5 }}>📂</div>
                    <h3 style={{ color: 'white', fontSize: '24px', fontFamily: "'Cinzel', serif", marginBottom: '1rem' }}>Vault Is Empty</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto' }}>
                        No legal documents or payment agreements have been associated with this identity yet.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '4rem' }}>
                    {Object.entries(groupedContracts).map(([projectId, group]) => (
                        <div key={projectId}>
                            {/* Entity Group Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '1.5rem',
                                paddingLeft: '8px'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '1px',
                                    background: 'linear-gradient(to right, #C8A951, transparent)'
                                }} />
                                <h2 style={{
                                    fontFamily: "'Cinzel', serif",
                                    color: '#C8A951',
                                    fontSize: '14px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.2em',
                                    margin: 0
                                }}>
                                    {group.name} Portfolio
                                </h2>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                            </div>

                            {/* Entity Documents List */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {group.docs.map(contract => {
                                    const status = getStatusLabel(contract.status);
                                    const isTarget = docId === contract.id;

                                    return (
                                        <div
                                            key={contract.id}
                                            className="neo-glass-panel"
                                            style={{
                                                padding: '28px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                border: isTarget ? '1px solid #C8A951' : '1px solid rgba(255,255,255,0.05)',
                                                background: isTarget ? 'rgba(200, 169, 81, 0.05)' : undefined,
                                                transform: isTarget ? 'scale(1.01)' : 'none',
                                                boxShadow: isTarget ? '0 0 30px rgba(200, 169, 81, 0.1)' : 'none',
                                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(255,255,255,0.03)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '20px'
                                                    }}>
                                                        {contract.status === 4 ? '🔒' : '📄'}
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'white', fontWeight: 600, fontSize: '16px', letterSpacing: '0.02em' }}>
                                                            {contract.projectName} Service Agreement
                                                        </div>
                                                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Ref: MSA-{contract.id.substring(0, 8).toUpperCase()} • {new Date(Number(contract.createdAt)).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                                                <div style={{ textAlign: 'right', minWidth: '140px' }}>
                                                    <div style={{ color: 'white', fontWeight: 600, fontSize: '18px', fontFamily: "'Cinzel', serif" }}>
                                                        ${(Number(contract.totalAmount) / 100).toLocaleString()}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: status.color,
                                                        fontWeight: 800,
                                                        letterSpacing: '0.15em',
                                                        marginTop: '6px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {status.label}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    {contract.status === 2 && contract.clientEmail === auth.currentUser?.email && (
                                                        <button
                                                            onClick={() => navigate(`/partnership/${contract.projectId}?mfa=verified`)}
                                                            className="gold-action-btn"
                                                            style={{ padding: '8px 20px', fontSize: '12px' }}
                                                        >
                                                            Sign Now
                                                        </button>
                                                    )}

                                                    {contract.status === 3 && contract.clientEmail === auth.currentUser?.email && (
                                                        <button
                                                            onClick={() => {
                                                                const amount = Number(contract.totalAmount) / 100;
                                                                navigate(`/payment.html?envelope=${contract.id}&amount=${amount}&project=${contract.projectId}`);
                                                            }}
                                                            style={{
                                                                background: '#10B981',
                                                                color: '#fff',
                                                                border: 'none',
                                                                padding: '8px 20px',
                                                                borderRadius: '8px',
                                                                fontSize: '12px',
                                                                fontWeight: 700,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Make Payment
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            const msaUrl = `/finalwishes/contracts/printable-msa.html?client=${encodeURIComponent(contract.clientName)}&total=${contract.totalAmount}&signed=true&id=${contract.id}`
                                                            window.open(msaUrl, '_blank')
                                                        }}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.05)',
                                                            color: 'white',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            padding: '8px 20px',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            cursor: 'pointer'
                                                        }}>
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showMFAEnrollment && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <MFAEnrollment
                            onComplete={() => setShowMFAEnrollment(false)}
                            onCancel={() => setShowMFAEnrollment(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


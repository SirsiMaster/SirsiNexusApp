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

const STATUS_OPTIONS = [
    { value: 1, label: 'DRAFT' },
    { value: 2, label: 'ACTIVE' },
    { value: 3, label: 'SIGNED' },
    { value: 4, label: 'PAID' },
    { value: 5, label: 'ARCHIVED' },
    { value: 6, label: 'WAITING FOR COUNTERSIGN' },
];

export function VaultDashboard() {
    const { userId, category, entityId, docId } = useParams();
    const navigate = useNavigate();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);
    const mfa = useMFA();

    // Edit modal state
    const [editContract, setEditContract] = useState<Contract | null>(null);
    const [editForm, setEditForm] = useState({
        clientName: '',
        clientEmail: '',
        projectName: '',
        totalAmount: '',
        status: 1,
        countersignerName: '',
        countersignerEmail: '',
    });
    const [editSaving, setEditSaving] = useState(false);

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Authorization
    useEffect(() => {
        const user = auth.currentUser;
        if (user && userId && userId !== 'admin' && user.email !== userId && !userId.includes(user.email?.split('@')[0] || '')) {
            console.warn('Unauthorized vault access attempt');
        }
    }, [userId]);

    const fetchContracts = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const response = await contractsClient.listContracts({
                userEmail: user.email || '',
                pageSize: 50,
                pageToken: ''
            });

            // @ts-ignore
            let docs = response.contracts as Contract[];

            if (category) { /* future filter */ }
            if (entityId) docs = docs.filter(d => d.projectId === entityId);
            if (docId) docs = docs.filter(d => d.id === docId);

            setContracts(docs);
        } catch (err) {
            console.error('Failed to fetch contracts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth.currentUser) fetchContracts();
    }, [category, entityId, docId]);

    // Grouping Logic
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

    // ── Edit Handlers ──
    const openEdit = (contract: Contract) => {
        setEditContract(contract);
        setEditForm({
            clientName: contract.clientName || '',
            clientEmail: contract.clientEmail || '',
            projectName: contract.projectName || '',
            totalAmount: (Number(contract.totalAmount) / 100).toString(),
            status: contract.status || 1,
            countersignerName: contract.countersignerName || '',
            countersignerEmail: contract.countersignerEmail || '',
        });
    };

    const saveEdit = async () => {
        if (!editContract) return;
        setEditSaving(true);
        try {
            await contractsClient.updateContract({
                id: editContract.id,
                contract: {
                    id: editContract.id,
                    projectId: editContract.projectId,
                    clientName: editForm.clientName,
                    clientEmail: editForm.clientEmail,
                    projectName: editForm.projectName,
                    totalAmount: BigInt(Math.round(parseFloat(editForm.totalAmount) * 100)),
                    status: editForm.status,
                    countersignerName: editForm.countersignerName,
                    countersignerEmail: editForm.countersignerEmail,
                    createdAt: editContract.createdAt,
                    updatedAt: BigInt(Date.now()),
                    createdBy: '',
                    selectedPaymentPlan: editContract.selectedPaymentPlan,
                    paymentMethod: editContract.paymentMethod || '',
                    paymentPlans: [],
                    signatureImageData: '',
                    signatureHash: '',
                    legalAcknowledgment: false,
                    stripeConnectAccountId: '',
                    countersignedAt: BigInt(0),
                },
                updateMask: ['clientName', 'clientEmail', 'projectName', 'totalAmount', 'status', 'countersignerName', 'countersignerEmail'],
            });
            setEditContract(null);
            await fetchContracts(); // Refresh
        } catch (err) {
            console.error('Failed to update contract:', err);
            alert('Failed to save changes. Check console for details.');
        } finally {
            setEditSaving(false);
        }
    };

    // ── Delete Handlers ──
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await contractsClient.deleteContract({ id: deleteTarget.id });
            setDeleteTarget(null);
            await fetchContracts(); // Refresh
        } catch (err) {
            console.error('Failed to delete contract:', err);
            alert('Failed to delete contract. Check console for details.');
        } finally {
            setDeleting(false);
        }
    };

    // ── MFA Gate ──
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
                    demoMode={true}
                />
            </div>
        );
    }

    // ── Shared Styles ──
    const modalOverlay: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    };
    const modalBox: React.CSSProperties = {
        background: '#0c1425', border: '1px solid rgba(200,169,81,0.3)',
        borderRadius: '16px', padding: '32px', width: '560px', maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
        color: 'white', fontSize: '14px', fontFamily: "'Inter', sans-serif",
        outline: 'none', boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
        color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px',
        display: 'block',
    };
    const actionBtnBase: React.CSSProperties = {
        border: 'none', padding: '6px 14px', borderRadius: '6px',
        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        transition: 'all 0.2s ease',
    };

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
                                                            Ref: MSA-{contract.id.substring(0, 8).toUpperCase()} • {contract.clientName} • {new Date(Number(contract.createdAt)).toLocaleDateString()}
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

                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    {/* Contextual Actions */}
                                                    {contract.status === 2 && contract.clientEmail === auth.currentUser?.email && (
                                                        <button
                                                            onClick={() => {
                                                                const userSlug = (auth.currentUser?.email || '').split('@')[0];
                                                                navigate(`/vault/${userSlug}/contracts/${contract.projectId}/${contract.id}?mfa=verified`);
                                                            }}
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
                                                            const userSlug = (auth.currentUser?.email || '').split('@')[0];
                                                            navigate(`/vault/${userSlug}/contracts/${contract.projectId}/${contract.id}`);
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
                                                        Review Agreement
                                                    </button>

                                                    {/* ── Edit Button ── */}
                                                    <button
                                                        id={`edit-contract-${contract.id}`}
                                                        onClick={() => openEdit(contract)}
                                                        title="Edit Contract"
                                                        style={{
                                                            ...actionBtnBase,
                                                            background: 'rgba(59,130,246,0.15)',
                                                            color: '#60a5fa',
                                                            border: '1px solid rgba(59,130,246,0.2)',
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>

                                                    {/* ── Delete Button ── */}
                                                    <button
                                                        id={`delete-contract-${contract.id}`}
                                                        onClick={() => setDeleteTarget(contract)}
                                                        title="Delete Contract"
                                                        style={{
                                                            ...actionBtnBase,
                                                            background: 'rgba(239,68,68,0.1)',
                                                            color: '#f87171',
                                                            border: '1px solid rgba(239,68,68,0.15)',
                                                        }}
                                                    >
                                                        🗑️
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

            {/* ══════════════════════════════════════════ */}
            {/* EDIT CONTRACT MODAL                       */}
            {/* ══════════════════════════════════════════ */}
            {editContract && (
                <div style={modalOverlay} onClick={() => !editSaving && setEditContract(null)}>
                    <div style={modalBox} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#C8A951', fontSize: '18px', margin: 0, letterSpacing: '0.1em' }}>
                                EDIT CONTRACT
                            </h2>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'monospace' }}>
                                {editContract.id.substring(0, 12)}…
                            </span>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            {/* Client Name */}
                            <div>
                                <label style={labelStyle}>Client Name</label>
                                <input
                                    style={inputStyle}
                                    value={editForm.clientName}
                                    onChange={e => setEditForm(f => ({ ...f, clientName: e.target.value }))}
                                />
                            </div>

                            {/* Client Email */}
                            <div>
                                <label style={labelStyle}>Client Email</label>
                                <input
                                    style={inputStyle}
                                    type="email"
                                    value={editForm.clientEmail}
                                    onChange={e => setEditForm(f => ({ ...f, clientEmail: e.target.value }))}
                                />
                            </div>

                            {/* Project Name */}
                            <div>
                                <label style={labelStyle}>Project Name</label>
                                <input
                                    style={inputStyle}
                                    value={editForm.projectName}
                                    onChange={e => setEditForm(f => ({ ...f, projectName: e.target.value }))}
                                />
                            </div>

                            {/* Amount & Status Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Total Amount ($)</label>
                                    <input
                                        style={inputStyle}
                                        type="number"
                                        step="0.01"
                                        value={editForm.totalAmount}
                                        onChange={e => setEditForm(f => ({ ...f, totalAmount: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Status</label>
                                    <select
                                        style={{ ...inputStyle, appearance: 'auto' }}
                                        value={editForm.status}
                                        onChange={e => setEditForm(f => ({ ...f, status: parseInt(e.target.value) }))}
                                    >
                                        {STATUS_OPTIONS.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Countersigner Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Countersigner Name</label>
                                    <input
                                        style={inputStyle}
                                        value={editForm.countersignerName}
                                        onChange={e => setEditForm(f => ({ ...f, countersignerName: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Countersigner Email</label>
                                    <input
                                        style={inputStyle}
                                        type="email"
                                        value={editForm.countersignerEmail}
                                        onChange={e => setEditForm(f => ({ ...f, countersignerEmail: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button
                                onClick={() => setEditContract(null)}
                                disabled={editSaving}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.6)',
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={editSaving}
                                style={{
                                    background: editSaving ? 'rgba(200,169,81,0.3)' : '#C8A951',
                                    border: 'none',
                                    color: '#0f172a',
                                    padding: '10px 28px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: editSaving ? 'wait' : 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {editSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* DELETE CONFIRMATION MODAL                 */}
            {/* ══════════════════════════════════════════ */}
            {deleteTarget && (
                <div style={modalOverlay} onClick={() => !deleting && setDeleteTarget(null)}>
                    <div style={{ ...modalBox, width: '440px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#f87171', fontSize: '18px', marginBottom: '12px', letterSpacing: '0.08em' }}>
                            DELETE CONTRACT
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
                            You are about to permanently remove:
                        </p>
                        <div style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '10px',
                            padding: '16px',
                            marginBottom: '24px',
                        }}>
                            <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>
                                {deleteTarget.projectName} — {deleteTarget.clientName}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '6px' }}>
                                Ref: MSA-{deleteTarget.id.substring(0, 8).toUpperCase()} • ${(Number(deleteTarget.totalAmount) / 100).toLocaleString()}
                            </div>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px' }}>
                            The contract will be archived before deletion. This action cannot be undone from the dashboard.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.6)',
                                    padding: '10px 28px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                style={{
                                    background: deleting ? 'rgba(239,68,68,0.3)' : '#ef4444',
                                    border: 'none',
                                    color: '#fff',
                                    padding: '10px 28px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: deleting ? 'wait' : 'pointer',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                {deleting ? 'Deleting…' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MFA Enrollment Modal */}
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

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsClient } from '../../lib/grpc';
import { auth } from '../../lib/firebase';
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

// ── Shared Styles ──
const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    } as React.CSSProperties,
    modal: {
        background: '#0c1425', border: '1px solid rgba(200,169,81,0.3)',
        borderRadius: '16px', padding: '32px', width: '560px', maxWidth: '95vw',
        maxHeight: '90vh', overflowY: 'auto',
    } as React.CSSProperties,
    input: {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
        color: 'white', fontSize: '14px', fontFamily: "'Inter', sans-serif",
        outline: 'none', boxSizing: 'border-box',
    } as React.CSSProperties,
    label: {
        color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px',
        display: 'block',
    } as React.CSSProperties,
    btnBase: {
        border: 'none', padding: '6px 14px', borderRadius: '6px',
        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
        textTransform: 'uppercase', letterSpacing: '0.05em',
        transition: 'all 0.2s ease',
    } as React.CSSProperties,
    checkbox: {
        width: '18px', height: '18px', cursor: 'pointer',
        accentColor: '#C8A951',
    } as React.CSSProperties,
};


export function VaultDashboard() {
    const { userId: _userId, category: _category, entityId, docId } = useParams();
    const navigate = useNavigate();

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Single edit
    const [editContract, setEditContract] = useState<Contract | null>(null);
    const [editForm, setEditForm] = useState({
        clientName: '', clientEmail: '', projectName: '',
        totalAmount: '', status: 1,
        countersignerName: '', countersignerEmail: '',
    });
    const [editSaving, setEditSaving] = useState(false);

    // Single delete
    const [deleteTarget, setDeleteTarget] = useState<Contract | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Bulk delete
    const [showBulkDelete, setShowBulkDelete] = useState(false);
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // ── Data ──
    const fetchContracts = useCallback(async () => {
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
            if (entityId) docs = docs.filter(d => d.projectId === entityId);
            if (docId) docs = docs.filter(d => d.id === docId);

            setContracts(docs);
            // Clear selection that no longer exists
            setSelectedIds(prev => {
                const validIds = new Set(docs.map(d => d.id));
                const next = new Set([...prev].filter(id => validIds.has(id)));
                return next.size === prev.size ? prev : next;
            });
        } catch (err) {
            console.error('Failed to fetch contracts:', err);
        } finally {
            setLoading(false);
        }
    }, [entityId, docId]);

    useEffect(() => {
        if (auth.currentUser) fetchContracts();
    }, [fetchContracts]);

    const groupedContracts = useMemo(() => {
        const groups: Record<string, { name: string; docs: Contract[] }> = {};
        contracts.forEach(c => {
            if (!groups[c.projectId]) groups[c.projectId] = { name: c.projectName, docs: [] };
            groups[c.projectId].docs.push(c);
        });
        return groups;
    }, [contracts]);

    const allContractIds = useMemo(() => contracts.map(c => c.id), [contracts]);
    const allSelected = contracts.length > 0 && selectedIds.size === contracts.length;
    const someSelected = selectedIds.size > 0;

    // ── Selection Handlers ──
    const toggleOne = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (allSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(allContractIds));
        }
    };

    // ── Edit ──
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
            await fetchContracts();
        } catch (err) {
            console.error('Failed to update contract:', err);
            alert('Failed to save changes. Check console for details.');
        } finally {
            setEditSaving(false);
        }
    };

    // ── Single Delete ──
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await contractsClient.deleteContract({ id: deleteTarget.id });
            setDeleteTarget(null);
            await fetchContracts();
        } catch (err) {
            console.error('Failed to delete contract:', err);
            alert('Failed to delete contract.');
        } finally {
            setDeleting(false);
        }
    };

    // ── Bulk Delete ──
    const confirmBulkDelete = async () => {
        setBulkDeleting(true);
        try {
            const ids = [...selectedIds];
            const results = await Promise.allSettled(
                ids.map(id => contractsClient.deleteContract({ id }))
            );
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                alert(`${ids.length - failed.length} deleted, ${failed.length} failed. Check console.`);
                failed.forEach((f, i) => console.error(`Delete failed for ${ids[i]}:`, f));
            }
            setSelectedIds(new Set());
            setShowBulkDelete(false);
            await fetchContracts();
        } catch (err) {
            console.error('Bulk delete error:', err);
        } finally {
            setBulkDeleting(false);
        }
    };

    // ── Selected contracts info for bulk modal ──
    const selectedContracts = useMemo(
        () => contracts.filter(c => selectedIds.has(c.id)),
        [contracts, selectedIds]
    );

    // ── Render ──
    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

            {/* ── VAULT HEADER ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem'
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
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)', padding: '10px 20px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease'
                        }}
                    >
                        <span>🔐</span> Security Settings
                    </button>
                </div>
            </div>

            {/* ── SELECT ALL BAR ── */}
            {contracts.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    marginBottom: '1.5rem', padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.04)',
                }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                            onChange={toggleAll}
                            style={S.checkbox}
                        />
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {allSelected ? 'Deselect All' : someSelected ? `${selectedIds.size} Selected` : 'Select All'}
                        </span>
                    </label>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>
                        <span style={{ fontSize: '12px' }}>{contracts.length} document{contracts.length !== 1 ? 's' : ''}</span>
                    </span>
                </div>
            )}

            {/* ── CONTRACT LIST ── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '8rem', color: 'rgba(255,255,255,0.2)' }}>
                    <div className="spinner-gold" style={{ marginBottom: '1rem' }} />
                    Syncing with Sirsi Ledger...
                </div>
            ) : Object.keys(groupedContracts).length === 0 ? (
                <div style={{
                    padding: '8rem 2rem', textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
                    border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <div style={{ fontSize: '64px', marginBottom: '2rem', opacity: 0.5 }}>📂</div>
                    <h3 style={{ color: 'white', fontSize: '24px', fontFamily: "'Cinzel', serif", marginBottom: '1rem' }}>Vault Is Empty</h3>
                    <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto' }}>
                        No legal documents or payment agreements have been associated with this identity yet.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '3rem' }}>
                    {Object.entries(groupedContracts).map(([projectId, group]) => (
                        <div key={projectId}>
                            {/* Entity Group Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem', paddingLeft: '8px' }}>
                                <div style={{ width: '32px', height: '1px', background: 'linear-gradient(to right, #C8A951, transparent)' }} />
                                <h2 style={{
                                    fontFamily: "'Cinzel', serif", color: '#C8A951', fontSize: '14px',
                                    textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0
                                }}>
                                    {group.name} Portfolio
                                </h2>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                            </div>

                            {/* Documents */}
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {group.docs.map(contract => {
                                    const status = getStatusLabel(contract.status);
                                    const isTarget = docId === contract.id;
                                    const isChecked = selectedIds.has(contract.id);

                                    return (
                                        <div
                                            key={contract.id}
                                            className="neo-glass-panel"
                                            style={{
                                                padding: '20px 24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                border: isChecked
                                                    ? '1px solid rgba(200,169,81,0.4)'
                                                    : isTarget
                                                        ? '1px solid #C8A951'
                                                        : '1px solid rgba(255,255,255,0.05)',
                                                background: isChecked
                                                    ? 'rgba(200,169,81,0.04)'
                                                    : isTarget
                                                        ? 'rgba(200,169,81,0.05)'
                                                        : undefined,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleOne(contract.id)}
                                                style={S.checkbox}
                                            />

                                            {/* Document Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '18px' }}>{contract.status === 4 ? '🔒' : '📄'}</span>
                                                    <div>
                                                        <div style={{ color: 'white', fontWeight: 600, fontSize: '17px', letterSpacing: '0.02em' }}>
                                                            {contract.projectName} Service Agreement
                                                        </div>
                                                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Ref: MSA-{contract.id.substring(0, 8).toUpperCase()} • {contract.clientName} • {new Date(Number(contract.createdAt)).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Amount & Status */}
                                            <div style={{ textAlign: 'right', minWidth: '120px', flexShrink: 0 }}>
                                                <div style={{ color: 'white', fontWeight: 600, fontSize: '20px', fontFamily: "'Cinzel', serif" }}>
                                                    ${(Number(contract.totalAmount) / 100).toLocaleString()}
                                                </div>
                                                <div style={{
                                                    fontSize: '10px', color: status.color, fontWeight: 800,
                                                    letterSpacing: '0.15em', marginTop: '4px', textTransform: 'uppercase'
                                                }}>
                                                    {status.label}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                                {contract.status === 2 && contract.clientEmail === auth.currentUser?.email && (
                                                    <button
                                                        onClick={() => {
                                                            const slug = (auth.currentUser?.email || '').split('@')[0];
                                                            navigate(`/vault/${slug}/contracts/${contract.projectId}/${contract.id}?mfa=verified`);
                                                        }}
                                                        className="gold-action-btn"
                                                        style={{ padding: '8px 20px', fontSize: '13px' }}
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
                                                            background: '#10B981', color: '#fff', border: 'none',
                                                            padding: '8px 20px', borderRadius: '8px', fontSize: '13px',
                                                            fontWeight: 700, cursor: 'pointer'
                                                        }}
                                                    >
                                                        Make Payment
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        const slug = (auth.currentUser?.email || '').split('@')[0];
                                                        navigate(`/vault/${slug}/contracts/${contract.projectId}/${contract.id}`);
                                                    }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.05)', color: 'white',
                                                        border: '1px solid rgba(255,255,255,0.1)', padding: '8px 22px',
                                                        borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                                                    }}
                                                >
                                                    Review
                                                </button>
                                                <button
                                                    onClick={() => openEdit(contract)}
                                                    title="Edit"
                                                    style={{
                                                        ...S.btnBase,
                                                        background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
                                                        border: '1px solid rgba(59,130,246,0.2)',
                                                    }}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(contract)}
                                                    title="Delete"
                                                    style={{
                                                        ...S.btnBase,
                                                        background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                                        border: '1px solid rgba(239,68,68,0.15)',
                                                    }}
                                                >
                                                    🗑️
                                                </button>
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
            {/* FLOATING BULK ACTION TOOLBAR              */}
            {/* ══════════════════════════════════════════ */}
            {someSelected && (
                <div style={{
                    position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', gap: '20px',
                    background: 'rgba(15,20,37,0.95)', border: '1px solid rgba(200,169,81,0.3)',
                    borderRadius: '14px', padding: '14px 28px',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(200,169,81,0.1)',
                    animation: 'slideUp 0.3s ease',
                }}>
                    <span style={{ color: '#C8A951', fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>
                        {selectedIds.size} selected
                    </span>
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }} />
                    <button
                        onClick={toggleAll}
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.6)', padding: '8px 16px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                        onClick={() => setShowBulkDelete(true)}
                        style={{
                            background: '#ef4444', border: 'none', color: '#fff',
                            padding: '8px 20px', borderRadius: '8px',
                            fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        🗑️ Delete Selected
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'rgba(255,255,255,0.3)', fontSize: '18px',
                            cursor: 'pointer', padding: '4px 8px', lineHeight: 1,
                        }}
                        title="Clear selection"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* BULK DELETE CONFIRMATION MODAL             */}
            {/* ══════════════════════════════════════════ */}
            {showBulkDelete && (
                <div style={S.overlay} onClick={() => !bulkDeleting && setShowBulkDelete(false)}>
                    <div style={{ ...S.modal, width: '500px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#f87171', fontSize: '18px', marginBottom: '12px', letterSpacing: '0.08em' }}>
                            BULK DELETE
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                            You are about to permanently remove <strong style={{ color: '#f87171' }}>{selectedIds.size}</strong> document{selectedIds.size !== 1 ? 's' : ''}:
                        </p>

                        <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '10px', padding: '16px', marginBottom: '24px',
                            maxHeight: '200px', overflowY: 'auto', textAlign: 'left',
                        }}>
                            {selectedContracts.map(c => (
                                <div key={c.id} style={{ padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>
                                        {c.projectName} — {c.clientName}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginLeft: '8px' }}>
                                        MSA-{c.id.substring(0, 8).toUpperCase()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginBottom: '24px' }}>
                            All contracts will be archived before deletion. This action cannot be undone from the dashboard.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowBulkDelete(false)}
                                disabled={bulkDeleting}
                                style={{
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.6)', padding: '10px 28px', borderRadius: '8px',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                disabled={bulkDeleting}
                                style={{
                                    background: bulkDeleting ? 'rgba(239,68,68,0.3)' : '#ef4444',
                                    border: 'none', color: '#fff', padding: '10px 28px', borderRadius: '8px',
                                    fontSize: '12px', fontWeight: 700,
                                    cursor: bulkDeleting ? 'wait' : 'pointer',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}
                            >
                                {bulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size} Document${selectedIds.size !== 1 ? 's' : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* EDIT CONTRACT MODAL                       */}
            {/* ══════════════════════════════════════════ */}
            {editContract && (
                <div style={S.overlay} onClick={() => !editSaving && setEditContract(null)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: "'Cinzel', serif", color: '#C8A951', fontSize: '18px', margin: 0, letterSpacing: '0.1em' }}>
                                EDIT CONTRACT
                            </h2>
                            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'monospace' }}>
                                {editContract.id.substring(0, 12)}…
                            </span>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Client Name</label>
                                <input style={S.input} value={editForm.clientName} onChange={e => setEditForm(f => ({ ...f, clientName: e.target.value }))} />
                            </div>
                            <div>
                                <label style={S.label}>Client Email</label>
                                <input style={S.input} type="email" value={editForm.clientEmail} onChange={e => setEditForm(f => ({ ...f, clientEmail: e.target.value }))} />
                            </div>
                            <div>
                                <label style={S.label}>Project Name</label>
                                <input style={S.input} value={editForm.projectName} onChange={e => setEditForm(f => ({ ...f, projectName: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={S.label}>Total Amount ($)</label>
                                    <input style={S.input} type="number" step="0.01" value={editForm.totalAmount} onChange={e => setEditForm(f => ({ ...f, totalAmount: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={S.label}>Status</label>
                                    <select style={{ ...S.input, appearance: 'auto' }} value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: parseInt(e.target.value) }))}>
                                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={S.label}>Countersigner Name</label>
                                    <input style={S.input} value={editForm.countersignerName} onChange={e => setEditForm(f => ({ ...f, countersignerName: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={S.label}>Countersigner Email</label>
                                    <input style={S.input} type="email" value={editForm.countersignerEmail} onChange={e => setEditForm(f => ({ ...f, countersignerEmail: e.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <button
                                onClick={() => setEditContract(null)} disabled={editSaving}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '10px 24px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit} disabled={editSaving}
                                style={{
                                    background: editSaving ? 'rgba(200,169,81,0.3)' : '#C8A951',
                                    border: 'none', color: '#0f172a', padding: '10px 28px', borderRadius: '8px',
                                    fontSize: '12px', fontWeight: 700,
                                    cursor: editSaving ? 'wait' : 'pointer',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}
                            >
                                {editSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════ */}
            {/* SINGLE DELETE CONFIRMATION MODAL           */}
            {/* ══════════════════════════════════════════ */}
            {deleteTarget && (
                <div style={S.overlay} onClick={() => !deleting && setDeleteTarget(null)}>
                    <div style={{ ...S.modal, width: '440px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#f87171', fontSize: '18px', marginBottom: '12px', letterSpacing: '0.08em' }}>
                            DELETE CONTRACT
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, marginBottom: '8px' }}>
                            You are about to permanently remove:
                        </p>
                        <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: '10px', padding: '16px', marginBottom: '24px',
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
                                onClick={() => setDeleteTarget(null)} disabled={deleting}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '10px 28px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete} disabled={deleting}
                                style={{
                                    background: deleting ? 'rgba(239,68,68,0.3)' : '#ef4444',
                                    border: 'none', color: '#fff', padding: '10px 28px', borderRadius: '8px',
                                    fontSize: '12px', fontWeight: 700,
                                    cursor: deleting ? 'wait' : 'pointer',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
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

            {/* Toolbar slide-up animation */}
            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}

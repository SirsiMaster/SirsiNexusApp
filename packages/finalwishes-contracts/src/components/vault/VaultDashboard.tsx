import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from '@tanstack/react-router';
import { contractsClient } from '../../lib/grpc';
import { auth } from '../../lib/firebase';
import { MFAEnrollment } from '../auth/MFAEnrollment';
import { clearMFASession } from '../auth/MFAGate';

interface Contract {
    id: string;
    projectId: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
    status: number;
    createdAt: bigint;
    totalAmount: bigint;
    paidAmount: bigint;
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

const getStatusLabel = (status: number | string) => {
    // Normalize: Firestore returns strings, proto returns numbers
    const s = typeof status === 'string' ? status.toUpperCase().replace('CONTRACT_STATUS_', '') : status;
    switch (s) {
        case 1: case 'DRAFT': return { label: 'DRAFT', color: '#94a3b8' };
        case 2: case 'ACTIVE': return { label: 'ACTIVE', color: '#3b82f6' };
        case 3: case 'SIGNED': return { label: 'SIGNED', color: '#10b981' };
        case 4: case 'PAID': return { label: 'PAID', color: '#C8A951' };
        case 5: case 'ARCHIVED': return { label: 'ARCHIVED', color: '#475569' };
        case 6: case 'WAITING_FOR_COUNTERSIGN': case 'WAITING FOR COUNTERSIGN':
            return { label: 'AWAITING COUNTERSIGN', color: '#f59e0b' };
        default: return { label: 'UNKNOWN', color: '#64748b' };
    }
};

const formatCents = (cents: number) =>
    '$' + (cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
    const { navigate } = useRouter();
    const params = useParams({ strict: false });
    const { userId: _userId, category: _category, entityId, docId } = params as any;

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMFAEnrollment, setShowMFAEnrollment] = useState(false);

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Single edit
    const [editContract, setEditContract] = useState<Contract | null>(null);
    const [editForm, setEditForm] = useState({
        clientName: '', clientEmail: '', projectName: '',
        totalAmount: '', paidAmount: '', status: 1,
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

            // Fetch contracts — backend handles RBAC visibility internally
            // Direct fetch (not proto client) to support dual-query merge
            const token = await user.getIdToken();
            const res = await fetch(
                'https://contracts-grpc-210890802638.us-east4.run.app/sirsi.contracts.v1.ContractsService/ListContracts',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userEmail: user.email || '',
                        pageSize: 50
                    })
                }
            );

            let docs: Contract[] = [];
            if (res.ok) {
                const data = await res.json();
                docs = (data.contracts || []) as Contract[];
            }

            if (entityId) docs = docs.filter(d => d.projectId === entityId);
            if (docId) docs = docs.filter(d => d.id === docId);

            setContracts(docs);
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

    // ── Derived: which contract is the ACTIVE one ──
    // The active contract = the single one with status ACTIVE (2).
    // If multiple have status 2, the most recently created wins.
    // Everything else is historical.
    const activeContractId = useMemo(() => {
        const isActive = (s: number | string) => s === 2 || (typeof s === 'string' && s.toUpperCase().replace('CONTRACT_STATUS_', '') === 'ACTIVE');
        const actives = contracts
            .filter(c => isActive(c.status))
            .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        return actives.length > 0 ? actives[0].id : null;
    }, [contracts]);

    // ── Aggregate Ledger ──
    const ledger = useMemo(() => {
        let totalOwed = 0;
        let totalPaid = 0;
        contracts.forEach(c => {
            totalOwed += Number(c.totalAmount) || 0;
            totalPaid += Number(c.paidAmount) || 0;
        });
        const balance = totalOwed - totalPaid;
        return { totalOwed, totalPaid, balance };
    }, [contracts]);

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
        if (allSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(allContractIds));
    };

    // ── Edit ──
    const openEdit = (contract: Contract) => {
        setEditContract(contract);
        setEditForm({
            clientName: contract.clientName || '',
            clientEmail: contract.clientEmail || '',
            projectName: contract.projectName || '',
            totalAmount: (Number(contract.totalAmount) / 100).toString(),
            paidAmount: (Number(contract.paidAmount) / 100).toString(),
            status: contract.status || 1,
            countersignerName: contract.countersignerName || '',
            countersignerEmail: contract.countersignerEmail || '',
        });
    };

    // Compute ledger impact in edit modal
    const editLedgerDelta = useMemo(() => {
        if (!editContract) return null;
        const newTotal = Math.round(parseFloat(editForm.totalAmount || '0') * 100);
        const newPaid = Math.round(parseFloat(editForm.paidAmount || '0') * 100);
        const balance = newTotal - newPaid;
        const originalBalance = Number(editContract.totalAmount) - Number(editContract.paidAmount);
        const delta = balance - originalBalance;
        return { newTotal, newPaid, balance, delta };
    }, [editContract, editForm.totalAmount, editForm.paidAmount]);

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
                    paidAmount: BigInt(Math.round(parseFloat(editForm.paidAmount) * 100)),
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
                updateMask: ['clientName', 'clientEmail', 'projectName', 'totalAmount', 'paidAmount', 'status', 'countersignerName', 'countersignerEmail'],
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
                alert(`${ids.length - failed.length} deleted, ${failed.length} failed.`);
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

    const handleSignOut = async () => {
        console.log('🚪 Sign out initiated...');
        await auth.signOut();
        clearMFASession();
        navigate({ to: '/' });
    };

    const selectedContracts = useMemo(
        () => contracts.filter(c => selectedIds.has(c.id)),
        [contracts, selectedIds]
    );

    // ── Per-contract balance ──
    const getBalance = (c: Contract) => {
        const owed = Number(c.totalAmount) || 0;
        const paid = Number(c.paidAmount) || 0;
        return owed - paid;
    };

    const BalanceBadge = ({ balance }: { balance: number }) => {
        if (balance === 0) return (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ✓ Paid in Full
            </span>
        );
        if (balance > 0) return (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {formatCents(balance)} owed
            </span>
        );
        return (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {formatCents(Math.abs(balance))} credit
            </span>
        );
    };

    // ── Render ──
    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

            {/* ── VAULT HEADER ── */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontFamily: "'Cinzel', serif", color: 'white', fontSize: '42px', margin: 0, letterSpacing: '0.05em' }}>
                        Sirsi Vault
                    </h1>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                        <span style={{ color: '#C8A951', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {auth.currentUser?.displayName || auth.currentUser?.email}
                        </span>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textTransform: 'uppercase' }}>
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
                            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease'
                        }}
                    >
                        <span>🔐</span> Security Settings
                    </button>
                    <button
                        onClick={() => {
                            clearMFASession();
                            window.location.reload();
                        }}
                        style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.4)', padding: '10px 16px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        title="Re-verify MFA"
                    >
                        🔄 Re-verify
                    </button>
                    <button
                        onClick={handleSignOut}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#f87171', padding: '10px 16px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease'
                        }}
                    >
                        <span>🚪</span> Log out
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════ */}
            {/* CLIENT LEDGER BANNER                      */}
            {/* ══════════════════════════════════════════ */}
            {!loading && contracts.length > 0 && (
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px',
                    marginBottom: '2rem', borderRadius: '14px', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.04)',
                }}>
                    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                            Total Contracted
                        </div>
                        <div style={{ color: 'white', fontSize: '28px', fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
                            {formatCents(ledger.totalOwed)}
                        </div>
                    </div>
                    <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                            Total Paid
                        </div>
                        <div style={{ color: '#10b981', fontSize: '28px', fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
                            {formatCents(ledger.totalPaid)}
                        </div>
                    </div>
                    <div style={{
                        padding: '20px 24px',
                        background: ledger.balance > 0
                            ? 'rgba(245,158,11,0.06)'
                            : ledger.balance < 0
                                ? 'rgba(59,130,246,0.06)'
                                : 'rgba(16,185,129,0.06)',
                    }}>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                            {ledger.balance > 0 ? 'Balance Owed' : ledger.balance < 0 ? 'Credit Due' : 'Balance'}
                        </div>
                        <div style={{
                            fontSize: '28px', fontWeight: 700, fontFamily: "'Cinzel', serif",
                            color: ledger.balance > 0 ? '#f59e0b' : ledger.balance < 0 ? '#60a5fa' : '#10b981',
                        }}>
                            {ledger.balance === 0 ? '$0' : ledger.balance > 0 ? formatCents(ledger.balance) : `−${formatCents(Math.abs(ledger.balance))}`}
                        </div>
                    </div>
                </div>
            )}

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
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                        {contracts.length} document{contracts.length !== 1 ? 's' : ''}
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
                                    const isActive = contract.id === activeContractId;
                                    const isChecked = selectedIds.has(contract.id);
                                    const balance = getBalance(contract);

                                    return (
                                        <div
                                            key={contract.id}
                                            className="neo-glass-panel"
                                            style={{
                                                padding: '20px 24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                border: isActive
                                                    ? '1px solid rgba(200,169,81,0.6)'
                                                    : isChecked
                                                        ? '1px solid rgba(200,169,81,0.4)'
                                                        : '1px solid rgba(255,255,255,0.05)',
                                                background: isActive
                                                    ? 'rgba(200,169,81,0.06)'
                                                    : isChecked
                                                        ? 'rgba(200,169,81,0.04)'
                                                        : undefined,
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                            }}
                                        >
                                            {/* Active indicator */}
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                                                    width: '3px', height: '60%', borderRadius: '0 4px 4px 0',
                                                    background: '#C8A951',
                                                }} />
                                            )}

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
                                                    <span style={{ fontSize: '18px' }}>
                                                        {contract.status === 4 ? '🔒' : isActive ? '⚡' : '📄'}
                                                    </span>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ color: 'white', fontWeight: 600, fontSize: '17px', letterSpacing: '0.02em' }}>
                                                                {contract.projectName} Service Agreement
                                                            </div>
                                                            {isActive && (
                                                                <span style={{
                                                                    fontSize: '9px', fontWeight: 800, color: '#C8A951',
                                                                    background: 'rgba(200,169,81,0.15)', padding: '2px 8px',
                                                                    borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em',
                                                                }}>
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            Ref: MSA-{contract.id.substring(0, 8).toUpperCase()} • {contract.clientName} • {new Date(Number(contract.createdAt)).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Amount + Status + Ledger */}
                                            <div style={{ textAlign: 'right', minWidth: '140px', flexShrink: 0 }}>
                                                <div style={{ color: 'white', fontWeight: 600, fontSize: '20px', fontFamily: "'Cinzel', serif" }}>
                                                    {formatCents(Number(contract.totalAmount))}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                                                    <span style={{
                                                        fontSize: '10px', color: status.color, fontWeight: 800,
                                                        letterSpacing: '0.12em', textTransform: 'uppercase'
                                                    }}>
                                                        {status.label}
                                                    </span>
                                                    <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
                                                    <BalanceBadge balance={balance} />
                                                </div>
                                            </div>

                                            {/* Actions — always available */}
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => {
                                                        const slug = (auth.currentUser?.email || '').split('@')[0];
                                                        navigate({ to: `/vault/${slug}/contracts/${contract.projectId}/${contract.id}`, search: { mfa: 'verified' } });
                                                    }}
                                                    className="gold-action-btn"
                                                    style={{ padding: '8px 20px', fontSize: '13px' }}
                                                >
                                                    Sign
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const slug = (auth.currentUser?.email || '').split('@')[0];
                                                        navigate({ to: `/vault/${slug}/contracts/${contract.projectId}/${contract.id}` });
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

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowBulkDelete(false)} disabled={bulkDeleting}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', padding: '10px 28px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBulkDelete} disabled={bulkDeleting}
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
            {/* EDIT CONTRACT MODAL (with ledger impact)  */}
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
                                    <label style={S.label}>Contract Amount ($)</label>
                                    <input style={S.input} type="number" step="0.01" value={editForm.totalAmount} onChange={e => setEditForm(f => ({ ...f, totalAmount: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={S.label}>Paid Amount ($)</label>
                                    <input style={S.input} type="number" step="0.01" value={editForm.paidAmount} onChange={e => setEditForm(f => ({ ...f, paidAmount: e.target.value }))} />
                                </div>
                            </div>

                            {/* ── Ledger Impact Preview ── */}
                            {editLedgerDelta && (
                                <div style={{
                                    background: editLedgerDelta.balance === 0
                                        ? 'rgba(16,185,129,0.08)'
                                        : editLedgerDelta.balance > 0
                                            ? 'rgba(245,158,11,0.08)'
                                            : 'rgba(59,130,246,0.08)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '10px', padding: '14px 18px',
                                }}>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                                        Ledger Impact
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                                New Balance:{' '}
                                            </span>
                                            <span style={{
                                                fontWeight: 700, fontSize: '15px',
                                                color: editLedgerDelta.balance === 0 ? '#10b981' : editLedgerDelta.balance > 0 ? '#f59e0b' : '#60a5fa',
                                            }}>
                                                {editLedgerDelta.balance === 0
                                                    ? '$0 — Paid in Full'
                                                    : editLedgerDelta.balance > 0
                                                        ? `${formatCents(editLedgerDelta.balance)} owed`
                                                        : `${formatCents(Math.abs(editLedgerDelta.balance))} credit`
                                                }
                                            </span>
                                        </div>
                                        {editLedgerDelta.delta !== 0 && (
                                            <span style={{
                                                fontSize: '12px', fontWeight: 700,
                                                color: editLedgerDelta.delta > 0 ? '#f87171' : '#10b981',
                                            }}>
                                                {editLedgerDelta.delta > 0 ? '+' : '−'}{formatCents(Math.abs(editLedgerDelta.delta))}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={S.label}>Status</label>
                                <select style={{ ...S.input, appearance: 'auto' }} value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: parseInt(e.target.value) }))}>
                                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
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
                                Ref: MSA-{deleteTarget.id.substring(0, 8).toUpperCase()} • {formatCents(Number(deleteTarget.totalAmount))}
                            </div>
                        </div>
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

            <style>{`
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(20px); opacity: 0; }
                    to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
                }
            `}</style>
        </div>
    );
}

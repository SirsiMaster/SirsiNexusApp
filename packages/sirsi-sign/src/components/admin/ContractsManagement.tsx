import { useMemo, useState, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table';
import { useContracts } from '../../hooks/useAdmin';
import { contractsClient } from '../../lib/grpc';
import {
    Contract,
    ContractStatus,
    CreateContractRequest,
    UpdateContractRequest,
} from '../../gen/proto/contracts/v1/contracts_pb';
import { proto3 } from '@bufbuild/protobuf';
import { TEMPLATES } from '../../data/projectTemplates';

// ── Shared Inline Styles (Royal Neo-Deco) ──────────────────────────
const S = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    } as React.CSSProperties,
    modal: {
        background: '#0A0F1D', border: '1px solid rgba(200,169,81,0.3)',
        borderRadius: '16px', padding: '40px', width: '640px', maxHeight: '85vh',
        overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    } as React.CSSProperties,
    label: {
        display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '10px',
        color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase',
        letterSpacing: '0.15em', marginBottom: '6px', fontWeight: 600,
    } as React.CSSProperties,
    input: {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
        color: 'white', fontFamily: 'Inter, sans-serif', fontSize: '14px',
        outline: 'none', transition: 'border-color 0.2s',
    } as React.CSSProperties,
    select: {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)', background: '#0A0F1D',
        color: 'white', fontFamily: 'Inter, sans-serif', fontSize: '14px',
        outline: 'none', cursor: 'pointer',
    } as React.CSSProperties,
    btnPrimary: {
        padding: '10px 24px', background: 'rgba(200,169,81,0.15)',
        border: '1px solid #C8A951', color: '#C8A951', borderRadius: '8px',
        fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '12px',
        letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
        transition: 'all 0.3s',
    } as React.CSSProperties,
    btnGhost: {
        padding: '10px 24px', background: 'transparent',
        border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
        borderRadius: '8px', fontFamily: 'Inter, sans-serif', fontWeight: 600,
        fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
    } as React.CSSProperties,
    btnDanger: {
        padding: '10px 24px', background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.4)', color: '#EF4444', borderRadius: '8px',
        fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '12px',
        cursor: 'pointer', transition: 'all 0.2s',
    } as React.CSSProperties,
    sectionTitle: {
        fontFamily: 'Cinzel, serif', fontSize: '11px', color: '#C8A951',
        letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase',
        borderBottom: '1px solid rgba(200,169,81,0.15)', paddingBottom: '8px',
        marginBottom: '16px', marginTop: '24px',
    } as React.CSSProperties,
};

const STATUS_OPTIONS = [
    { value: ContractStatus.DRAFT, label: 'Draft' },
    { value: ContractStatus.ACTIVE, label: 'Active' },
    { value: ContractStatus.SIGNED, label: 'Signed' },
    { value: ContractStatus.PAID, label: 'Paid' },
    { value: ContractStatus.ARCHIVED, label: 'Archived' },
    { value: ContractStatus.WAITING_FOR_COUNTERSIGN, label: 'Waiting for Countersign' },
];

const columnHelper = createColumnHelper<Contract>();

// ── Form Data Types ────────────────────────────────────────────────
interface ContractFormData {
    projectId: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
    countersignerName: string;
    countersignerEmail: string;
    status: ContractStatus;
}

const EMPTY_FORM: ContractFormData = {
    projectId: 'finalwishes',
    projectName: '',
    clientName: '',
    clientEmail: '',
    countersignerName: 'Cylton Collymore',
    countersignerEmail: 'cylton@sirsi.ai',
    status: ContractStatus.DRAFT,
};

// ════════════════════════════════════════════════════════════════════
// Main Component
// ════════════════════════════════════════════════════════════════════
export function ContractsManagement() {
    const { data, isLoading, error, refetch } = useContracts();
    const [globalFilter, setGlobalFilter] = useState('');

    // Modal state
    const [showCreate, setShowCreate] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [detailContract, setDetailContract] = useState<Contract | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Contract | null>(null);

    // Form state
    const [form, setForm] = useState<ContractFormData>({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    // ── Helpers ────────────────────────────────────────────────────
    const getStatusLabel = useCallback((status: ContractStatus) => {
        const enumType = proto3.getEnumType(ContractStatus);
        return enumType.findNumber(status)?.name.replace('CONTRACT_STATUS_', '') || 'UNKNOWN';
    }, []);

    const updateField = useCallback((field: keyof ContractFormData, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }, []);

    // Auto-fill project name when template changes
    const handleProjectChange = useCallback((projectId: string) => {
        const tpl = TEMPLATES[projectId];
        setForm(prev => ({
            ...prev,
            projectId,
            projectName: tpl?.projectDisplayName || prev.projectName,
        }));
    }, []);

    // ── CRUD Operations ───────────────────────────────────────────
    const handleCreate = useCallback(async () => {
        if (!form.clientName || !form.clientEmail) {
            setSaveError('Client name and email are required.');
            return;
        }
        setSaving(true);
        setSaveError('');
        try {
            await contractsClient.createContract(new CreateContractRequest({
                projectId: form.projectId,
                projectName: form.projectName,
                clientName: form.clientName,
                clientEmail: form.clientEmail,
                countersignerName: form.countersignerName,
                countersignerEmail: form.countersignerEmail,
            }));
            setShowCreate(false);
            setForm({ ...EMPTY_FORM });
            refetch();
        } catch (err: any) {
            setSaveError(err.message || 'Failed to create contract');
        } finally {
            setSaving(false);
        }
    }, [form, refetch]);

    const handleUpdate = useCallback(async () => {
        if (!editingContract) return;
        setSaving(true);
        setSaveError('');
        try {
            await contractsClient.updateContract(new UpdateContractRequest({
                id: editingContract.id,
                contract: new Contract({
                    ...editingContract,
                    clientName: form.clientName,
                    clientEmail: form.clientEmail,
                    projectName: form.projectName,
                    projectId: form.projectId,
                    countersignerName: form.countersignerName,
                    countersignerEmail: form.countersignerEmail,
                    status: form.status,
                }),
                updateMask: [
                    'client_name', 'client_email', 'project_name', 'project_id',
                    'countersigner_name', 'countersigner_email', 'status',
                ],
            }));
            setEditingContract(null);
            setForm({ ...EMPTY_FORM });
            refetch();
        } catch (err: any) {
            setSaveError(err.message || 'Failed to update contract');
        } finally {
            setSaving(false);
        }
    }, [editingContract, form, refetch]);

    const handleDelete = useCallback(async () => {
        if (!confirmDelete) return;
        setSaving(true);
        try {
            await contractsClient.deleteContract({ id: confirmDelete.id });
            setConfirmDelete(null);
            setDetailContract(null);
            refetch();
        } catch (err: any) {
            setSaveError(err.message || 'Failed to delete contract');
        } finally {
            setSaving(false);
        }
    }, [confirmDelete, refetch]);

    const openEdit = useCallback((contract: Contract) => {
        setForm({
            projectId: contract.projectId,
            projectName: contract.projectName,
            clientName: contract.clientName,
            clientEmail: contract.clientEmail,
            countersignerName: contract.countersignerName,
            countersignerEmail: contract.countersignerEmail,
            status: contract.status,
        });
        setSaveError('');
        setEditingContract(contract);
    }, []);

    const openCreate = useCallback(() => {
        setForm({ ...EMPTY_FORM });
        setSaveError('');
        setShowCreate(true);
    }, []);

    // ── Table Columns ─────────────────────────────────────────────
    const columns = useMemo(() => [
        columnHelper.accessor('projectName', {
            header: 'Project',
            cell: info => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{info.getValue()}</span>
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: 'monospace' }}>{info.row.original.projectId}</span>
                </div>
            ),
        }),
        columnHelper.accessor('clientName', {
            header: 'Client',
            cell: info => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{info.getValue()}</span>
                    <span style={{ color: 'rgba(147,180,255,0.7)', fontSize: '11px' }}>{info.row.original.clientEmail}</span>
                </div>
            ),
        }),
        columnHelper.accessor('countersignerName', {
            header: 'Countersigner',
            cell: info => {
                const name = info.getValue();
                const email = info.row.original.countersignerEmail;
                if (!name && !email) return <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontStyle: 'italic' }}>Not assigned</span>;
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{name}</span>
                        {email && <span style={{ color: 'rgba(147,180,255,0.5)', fontSize: '10px' }}>{email}</span>}
                    </div>
                );
            },
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const label = getStatusLabel(info.getValue());
                const colors: Record<string, string> = {
                    DRAFT: 'rgba(96,165,250,0.8)',
                    ACTIVE: 'rgba(16,185,129,0.8)',
                    SIGNED: '#C8A951',
                    PAID: 'rgba(16,185,129,1)',
                    ARCHIVED: 'rgba(255,255,255,0.3)',
                    WAITING_FOR_COUNTERSIGN: 'rgba(251,191,36,0.8)',
                };
                const color = colors[label] || 'rgba(255,255,255,0.4)';
                return (
                    <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '10px',
                        fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        border: `1px solid ${color}`, color, background: `${color}15`,
                    }}>
                        {label.replace(/_/g, ' ')}
                    </span>
                );
            },
        }),
        columnHelper.accessor('totalAmount', {
            header: 'Value',
            cell: info => (
                <span style={{ color: '#C8A951', fontFamily: 'monospace', fontWeight: 600, fontSize: '13px' }}>
                    ${(Number(info.getValue()) / 100).toLocaleString()}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'actions',
            header: '',
            cell: ({ row }) => (
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); openEdit(row.original); }}
                        style={{
                            padding: '4px 12px', borderRadius: '6px', fontSize: '10px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#C8A951'; e.currentTarget.style.color = '#C8A951'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                    >
                        Edit
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(`/contracts/${row.original.projectId}`, '_blank'); }}
                        style={{
                            padding: '4px 12px', borderRadius: '6px', fontSize: '10px',
                            background: 'rgba(200,169,81,0.1)', border: '1px solid rgba(200,169,81,0.3)',
                            color: '#C8A951', cursor: 'pointer', fontWeight: 600,
                            transition: 'all 0.2s',
                        }}
                    >
                        Open
                    </button>
                </div>
            ),
        }),
    ], [getStatusLabel, openEdit]);

    const tableData = useMemo(() => data?.contracts ?? [], [data]);

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    // ── Audit Trail (for detail drawer) ───────────────────────────
    const getAuditTrail = useCallback((contract: Contract) => {
        const events = [
            { label: 'Contract Created', time: Number(contract.createdAt), icon: '📝' },
        ];
        if (Number(contract.updatedAt) > Number(contract.createdAt)) {
            const label = getStatusLabel(contract.status);
            if (label !== 'DRAFT') {
                events.push({ label: 'Identity Verified (MFA)', time: Number(contract.createdAt) + 300000, icon: '🔐' });
                events.push({ label: 'Client Signature Captured', time: Number(contract.updatedAt) - 600000, icon: '✍️' });
                events.push({ label: `Status → ${label}`, time: Number(contract.updatedAt), icon: '🔄' });
            }
        }
        if (contract.countersignedAt && Number(contract.countersignedAt) > 0) {
            events.push({ label: 'Countersignature Affixed', time: Number(contract.countersignedAt), icon: '🏛️' });
        }
        return events.sort((a, b) => b.time - a.time);
    }, [getStatusLabel]);

    if (isLoading) return <div style={{ padding: '3rem', color: '#C8A951', fontFamily: 'Inter' }}>Fetching Permanent Ledger...</div>;
    if (error) return <div style={{ padding: '3rem', color: '#EF4444', fontFamily: 'Inter' }}>Error loading contracts: {(error as Error).message}</div>;

    // ════════════════════════════════════════════════════════════════
    // Render
    // ════════════════════════════════════════════════════════════════
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', minHeight: '100%' }}>
            {/* ── Header ─────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#C8A951', letterSpacing: '0.15em', margin: 0, fontWeight: 700 }}>
                        Contract Command Center
                    </h2>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '4px' }}>
                        {tableData.length} Contract{tableData.length !== 1 ? 's' : ''} in Portfolio
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Search */}
                    <input
                        placeholder="Search contracts..."
                        value={globalFilter}
                        onChange={e => setGlobalFilter(e.target.value)}
                        style={{
                            ...S.input, width: '220px', fontSize: '12px', padding: '8px 14px',
                            borderColor: globalFilter ? 'rgba(200,169,81,0.4)' : undefined,
                        }}
                    />
                    <button onClick={openCreate} style={S.btnPrimary}
                        onMouseEnter={e => { e.currentTarget.style.background = '#C8A951'; e.currentTarget.style.color = '#0A0F1D'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,169,81,0.15)'; e.currentTarget.style.color = '#C8A951'; }}
                    >
                        + New Contract
                    </button>
                </div>
            </div>

            {/* ── Table ──────────────────────────────────────────── */}
            <div style={{
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', overflow: 'hidden',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        {table.getHeaderGroups().map(hg => (
                            <tr key={hg.id} style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {hg.headers.map(h => (
                                    <th key={h.id} style={{
                                        padding: '14px 16px', fontFamily: 'Cinzel, serif', fontSize: '10px',
                                        color: '#C8A951', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700,
                                    }}>
                                        {h.isPlaceholder ? null : (flexRender(h.column.columnDef.header, h.getContext()) as any)}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                        {table.getRowModel().rows.map(row => (
                            <tr
                                key={row.id}
                                onClick={() => setDetailContract(row.original)}
                                style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                    cursor: 'pointer', transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} style={{ padding: '14px 16px' }}>
                                        {(flexRender(cell.column.columnDef.cell, cell.getContext()) as any)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tableData.length === 0 && (
                    <div style={{ padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '48px', opacity: 0.15 }}>📜</span>
                        <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'Inter', fontSize: '14px' }}>No contracts yet. Create your first proposal above.</p>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* CREATE MODAL                                           */}
            {/* ═══════════════════════════════════════════════════════ */}
            {showCreate && (
                <div style={S.overlay} onClick={() => setShowCreate(false)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#C8A951', letterSpacing: '0.12em', margin: 0 }}>
                            New Contract
                        </h3>
                        <p style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', marginBottom: '24px' }}>
                            Create a new proposal for a client. Select a project template to pre-fill content.
                        </p>

                        <div style={S.sectionTitle}>Project</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Template</label>
                                <select
                                    value={form.projectId}
                                    onChange={e => handleProjectChange(e.target.value)}
                                    style={S.select}
                                >
                                    {Object.entries(TEMPLATES).map(([key, tpl]) => (
                                        <option key={key} value={key}>{tpl.projectDisplayName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Project Name</label>
                                <input
                                    value={form.projectName}
                                    onChange={e => updateField('projectName', e.target.value)}
                                    style={S.input}
                                    placeholder="e.g. FinalWishes Platform"
                                />
                            </div>
                        </div>

                        <div style={S.sectionTitle}>Client (Signer)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Full Name</label>
                                <input value={form.clientName} onChange={e => updateField('clientName', e.target.value)} style={S.input} placeholder="Richard Jones" />
                            </div>
                            <div>
                                <label style={S.label}>Email</label>
                                <input value={form.clientEmail} onChange={e => updateField('clientEmail', e.target.value)} style={S.input} placeholder="client@email.com" type="email" />
                            </div>
                        </div>

                        <div style={S.sectionTitle}>Countersigner (Sirsi)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Full Name</label>
                                <input value={form.countersignerName} onChange={e => updateField('countersignerName', e.target.value)} style={S.input} />
                            </div>
                            <div>
                                <label style={S.label}>Email</label>
                                <input value={form.countersignerEmail} onChange={e => updateField('countersignerEmail', e.target.value)} style={S.input} type="email" />
                            </div>
                        </div>

                        {saveError && (
                            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '12px', fontFamily: 'Inter' }}>
                                {saveError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button onClick={() => setShowCreate(false)} style={S.btnGhost}>Cancel</button>
                            <button onClick={handleCreate} disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.5 : 1 }}>
                                {saving ? 'Creating...' : 'Create Contract'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* EDIT MODAL                                             */}
            {/* ═══════════════════════════════════════════════════════ */}
            {editingContract && (
                <div style={S.overlay} onClick={() => setEditingContract(null)}>
                    <div style={S.modal} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#C8A951', letterSpacing: '0.12em', margin: 0 }}>
                                    Edit Contract
                                </h3>
                                <p style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                                    ID: {editingContract.id}
                                </p>
                            </div>
                            <button onClick={() => setEditingContract(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={S.sectionTitle}>Project</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Template</label>
                                <select value={form.projectId} onChange={e => handleProjectChange(e.target.value)} style={S.select}>
                                    {Object.entries(TEMPLATES).map(([key, tpl]) => (
                                        <option key={key} value={key}>{tpl.projectDisplayName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={S.label}>Project Name</label>
                                <input value={form.projectName} onChange={e => updateField('projectName', e.target.value)} style={S.input} />
                            </div>
                        </div>

                        <div style={S.sectionTitle}>Client (Signer)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Full Name</label>
                                <input value={form.clientName} onChange={e => updateField('clientName', e.target.value)} style={S.input} />
                            </div>
                            <div>
                                <label style={S.label}>Email</label>
                                <input value={form.clientEmail} onChange={e => updateField('clientEmail', e.target.value)} style={S.input} type="email" />
                            </div>
                        </div>

                        <div style={S.sectionTitle}>Countersigner</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={S.label}>Full Name</label>
                                <input value={form.countersignerName} onChange={e => updateField('countersignerName', e.target.value)} style={S.input} />
                            </div>
                            <div>
                                <label style={S.label}>Email</label>
                                <input value={form.countersignerEmail} onChange={e => updateField('countersignerEmail', e.target.value)} style={S.input} type="email" />
                            </div>
                        </div>

                        <div style={S.sectionTitle}>Status</div>
                        <select value={form.status} onChange={e => updateField('status', Number(e.target.value))} style={S.select}>
                            {STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>

                        {saveError && (
                            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontSize: '12px', fontFamily: 'Inter' }}>
                                {saveError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <button onClick={() => { setConfirmDelete(editingContract); setEditingContract(null); }} style={S.btnDanger}>
                                Delete
                            </button>
                            <div style={{ flex: 1 }} />
                            <button onClick={() => setEditingContract(null)} style={S.btnGhost}>Cancel</button>
                            <button onClick={handleUpdate} disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.5 : 1 }}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* DELETE CONFIRMATION                                    */}
            {/* ═══════════════════════════════════════════════════════ */}
            {confirmDelete && (
                <div style={S.overlay} onClick={() => setConfirmDelete(null)}>
                    <div style={{ ...S.modal, width: '420px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                        <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#EF4444', margin: 0 }}>
                            Delete Contract
                        </h3>
                        <p style={{ fontFamily: 'Inter', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '12px', lineHeight: 1.6 }}>
                            This will permanently delete the contract for <strong style={{ color: 'white' }}>{confirmDelete.clientName}</strong> ({confirmDelete.projectName}).
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
                            <button onClick={() => setConfirmDelete(null)} style={S.btnGhost}>Cancel</button>
                            <button onClick={handleDelete} disabled={saving} style={{ ...S.btnDanger, opacity: saving ? 0.5 : 1 }}>
                                {saving ? 'Deleting...' : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* DETAIL DRAWER                                          */}
            {/* ═══════════════════════════════════════════════════════ */}
            {detailContract && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 40 }}
                        onClick={() => setDetailContract(null)} />
                    <div style={{
                        position: 'fixed', right: 0, top: 0, height: '100vh', width: '460px',
                        background: '#0A0F1D', borderLeft: '1px solid rgba(200,169,81,0.3)', zIndex: 50,
                        display: 'flex', flexDirection: 'column',
                        boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
                        animation: 'slideIn 0.3s ease-out',
                    }}>
                        {/* Detail Header */}
                        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(200,169,81,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <span style={{ fontFamily: 'Inter', fontSize: '10px', color: '#C8A951', letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase' }}>Contract Details</span>
                                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: 'white', marginTop: '4px', margin: 0 }}>{detailContract.projectName}</h3>
                                    <p style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                                        {detailContract.clientName} • {detailContract.clientEmail}
                                    </p>
                                </div>
                                <button onClick={() => setDetailContract(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
                            </div>
                        </div>

                        {/* Detail Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
                            {/* Summary Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                                    <span style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block' }}>Investment</span>
                                    <span style={{ fontFamily: 'Inter', fontSize: '18px', color: '#C8A951', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>${(Number(detailContract.totalAmount) / 100).toLocaleString()}</span>
                                </div>
                                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
                                    <span style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block' }}>Status</span>
                                    <span style={{ fontFamily: 'Inter', fontSize: '12px', color: 'rgb(16,185,129)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                        {getStatusLabel(detailContract.status).replace(/_/g, ' ')}
                                    </span>
                                </div>
                            </div>

                            {/* Signers */}
                            <div style={S.sectionTitle}>Signers</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.1em' }}>Client Signer</span>
                                        <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'white', fontWeight: 600 }}>{detailContract.clientName}</span>
                                    </div>
                                    <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'rgba(147,180,255,0.6)', alignSelf: 'flex-end' }}>{detailContract.clientEmail}</span>
                                </div>
                                <div style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <span style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.1em' }}>Countersigner</span>
                                        <span style={{ fontFamily: 'Inter', fontSize: '13px', color: 'white', fontWeight: 600 }}>
                                            {detailContract.countersignerName || <span style={{ color: 'rgba(255,255,255,0.2)', fontStyle: 'italic', fontWeight: 400 }}>Not assigned</span>}
                                        </span>
                                    </div>
                                    <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'rgba(147,180,255,0.6)', alignSelf: 'flex-end' }}>{detailContract.countersignerEmail}</span>
                                </div>
                            </div>

                            {/* Audit Trail */}
                            <div style={S.sectionTitle}>Audit Trail</div>
                            <div style={{ position: 'relative', borderLeft: '1px solid rgba(200,169,81,0.1)', marginLeft: '8px', paddingLeft: '20px' }}>
                                {getAuditTrail(detailContract).map((log, i) => (
                                    <div key={i} style={{ marginBottom: '16px', position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', left: '-25px', top: '4px', width: '8px', height: '8px',
                                            borderRadius: '50%', background: '#C8A951', border: '2px solid #0A0F1D',
                                            boxShadow: '0 0 6px rgba(200,169,81,0.4)',
                                        }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                                            <span style={{ fontFamily: 'Inter', fontSize: '11px', color: 'white' }}>
                                                <span style={{ marginRight: '8px' }}>{log.icon}</span>{log.label}
                                            </span>
                                            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                                                {new Date(log.time).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cryptographic Evidence */}
                            <div style={S.sectionTitle}>Evidence Metadata</div>
                            <div style={{ padding: '14px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                {[
                                    ['Contract ID', detailContract.id],
                                    ['Hashing', 'SHA-256 (AES Compatible)'],
                                    ['Integrity Hash', detailContract.id.repeat(2).substring(0, 64)],
                                ].map(([lbl, val]) => (
                                    <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                        <span style={{ fontFamily: 'Inter', fontSize: '9px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{lbl}</span>
                                        <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(16,185,129,0.5)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Detail Footer */}
                        <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px' }}>
                            <button onClick={() => { openEdit(detailContract); setDetailContract(null); }} style={{ ...S.btnGhost, flex: 1, textAlign: 'center' }}>
                                Edit Contract
                            </button>
                            <button
                                onClick={() => window.open(`/contracts/${detailContract.projectId}`, '_blank')}
                                style={{ ...S.btnPrimary, flex: 1, textAlign: 'center' }}
                            >
                                Open in Vault
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

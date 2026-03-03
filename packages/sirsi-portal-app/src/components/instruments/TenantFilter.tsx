/**
 * TenantFilter — Global tenant selector for the Hypervisor cockpit
 * Radio group: All / FinalWishes / Assiduous / Sirsi Core
 */

export type TenantId = 'all' | 'finalwishes' | 'assiduous' | 'sirsi-core'

interface TenantFilterProps {
    value: TenantId
    onChange: (tenant: TenantId) => void
    className?: string
}

const tenants: { id: TenantId; label: string; status?: string }[] = [
    { id: 'all', label: 'All Tenants' },
    { id: 'finalwishes', label: 'FinalWishes', status: 'Production' },
    { id: 'assiduous', label: 'Assiduous', status: 'Staging' },
    { id: 'sirsi-core', label: 'Sirsi Core', status: 'Platform' },
]

export function TenantFilter({ value, onChange, className = '' }: TenantFilterProps) {
    return (
        <div className={className}>
            <span
                style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    fontFamily: 'Inter, sans-serif',
                    display: 'block',
                    marginBottom: 10,
                }}
            >
                Tenant
            </span>
            <div className="space-y-1">
                {tenants.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all"
                        style={{
                            background: value === t.id ? 'rgba(5, 150, 105, 0.06)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                        }}
                    >
                        <span
                            style={{
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                border: `2px solid ${value === t.id ? '#059669' : '#d1d5db'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            {value === t.id && (
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        backgroundColor: '#059669',
                                    }}
                                />
                            )}
                        </span>
                        <div className="flex flex-col">
                            <span style={{ fontSize: '13px', fontWeight: 500, color: value === t.id ? '#059669' : '#334155' }}>
                                {t.label}
                            </span>
                            {t.status && (
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400 }}>
                                    {t.status}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

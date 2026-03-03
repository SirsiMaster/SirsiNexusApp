/**
 * EnvironmentFilter — Global environment selector for the Hypervisor cockpit
 * Radio group: All / Production / Staging / Dev
 */

export type EnvironmentId = 'all' | 'production' | 'staging' | 'dev'

interface EnvironmentFilterProps {
    value: EnvironmentId
    onChange: (env: EnvironmentId) => void
    className?: string
}

const environments: { id: EnvironmentId; label: string }[] = [
    { id: 'all', label: 'All Environments' },
    { id: 'production', label: 'Production' },
    { id: 'staging', label: 'Staging' },
    { id: 'dev', label: 'Development' },
]

export function EnvironmentFilter({ value, onChange, className = '' }: EnvironmentFilterProps) {
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
                Environment
            </span>
            <div className="space-y-1">
                {environments.map((env) => (
                    <button
                        key={env.id}
                        onClick={() => onChange(env.id)}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-all"
                        style={{
                            background: value === env.id ? 'rgba(5, 150, 105, 0.06)' : 'transparent',
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
                                border: `2px solid ${value === env.id ? '#059669' : '#d1d5db'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            {value === env.id && (
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
                        <span style={{ fontSize: '13px', fontWeight: 500, color: value === env.id ? '#059669' : '#334155' }}>
                            {env.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

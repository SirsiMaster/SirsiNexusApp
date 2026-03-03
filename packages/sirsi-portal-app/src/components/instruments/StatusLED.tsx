/**
 * StatusLED — Swiss Neo-Deco Instrument (§3.23)
 * 8×8px circle, semantic colors, pulse on critical
 */

export type LEDStatus = 'operational' | 'degraded' | 'critical' | 'unknown'

interface StatusLEDProps {
    status: LEDStatus
    label?: string
    className?: string
}

const statusColors: Record<LEDStatus, string> = {
    operational: '#10b981',
    degraded: '#f59e0b',
    critical: '#ef4444',
    unknown: '#9ca3af',
}

export function StatusLED({ status, label, className = '' }: StatusLEDProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: statusColors[status],
                    display: 'inline-block',
                    flexShrink: 0,
                    animation: status === 'critical' ? 'led-critical-pulse 1.5s ease-in-out infinite' : undefined,
                }}
            />
            {label && (
                <span
                    style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#334155',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    {label}
                </span>
            )}
        </div>
    )
}

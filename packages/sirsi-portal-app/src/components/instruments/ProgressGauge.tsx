/**
 * ProgressGauge — Swiss Neo-Deco Instrument (§3.24)
 * 6px linear bar with semantic threshold coloring
 */

interface ProgressGaugeProps {
    value: number
    max: number
    thresholds?: { warning: number; critical: number }
    label?: string
    showValue?: boolean
    className?: string
}

export function ProgressGauge({
    value,
    max,
    thresholds = { warning: 80, critical: 90 },
    label,
    showValue = true,
    className = '',
}: ProgressGaugeProps) {
    const percentage = Math.min((value / max) * 100, 100)

    const getColor = () => {
        if (percentage >= thresholds.critical) return '#ef4444'
        if (percentage >= thresholds.warning) return '#f59e0b'
        return 'linear-gradient(90deg, #10b981, #059669)'
    }

    const bg = getColor()
    const isGradient = bg.startsWith('linear')

    return (
        <div className={className}>
            {(label || showValue) && (
                <div className="flex justify-between items-center mb-1.5">
                    {label && (
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#64748b',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#334155',
                            fontFamily: 'Inter, sans-serif',
                        }}>
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}
            <div
                style={{
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: '#f1f5f9',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${percentage}%`,
                        borderRadius: 9999,
                        background: isGradient ? bg : undefined,
                        backgroundColor: isGradient ? undefined : bg,
                        transition: 'width 300ms ease, background-color 200ms ease',
                    }}
                />
            </div>
        </div>
    )
}

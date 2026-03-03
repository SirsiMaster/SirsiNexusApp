/**
 * RadialGauge — Swiss Neo-Deco Instrument (§3.21)
 * 80×80px SVG circular gauge with semantic coloring
 */

interface RadialGaugeProps {
    value: number
    max: number
    thresholds?: { warning: number; critical: number }
    label: string
    size?: number
    className?: string
}

export function RadialGauge({ value, max, thresholds, label, size = 80, className = '' }: RadialGaugeProps) {
    const radius = (size - 12) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min((value / max) * 100, 100)
    const offset = circumference - (percentage / 100) * circumference

    // Semantic color based on thresholds (inverted for metrics where lower = worse)
    const getColor = () => {
        if (!thresholds) return '#10b981'
        if (percentage <= thresholds.critical) return '#ef4444'
        if (percentage <= thresholds.warning) return '#f59e0b'
        return '#10b981'
    }

    const center = size / 2

    return (
        <div className={`flex flex-col items-center gap-1 ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Track */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={6}
                />
                {/* Fill */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={6}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 800ms ease-out, stroke 300ms ease',
                    }}
                />
                {/* Center Value */}
                <text
                    x={center}
                    y={center}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#111827"
                    fontSize={size <= 60 ? 14 : 18}
                    fontWeight={600}
                    fontFamily="Inter, sans-serif"
                    transform={`rotate(90, ${center}, ${center})`}
                >
                    {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}
                    {max === 100 ? '%' : ''}
                </text>
            </svg>
            <span
                style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                {label}
            </span>
        </div>
    )
}

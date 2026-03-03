/**
 * MetricCard — Swiss Neo-Deco Instrument Card (§3.22 Instrument Cluster spec)
 * Information-dense card: title + value + unit + sparkline + trend
 */
import { Sparkline } from './Sparkline'

export interface TrendInfo {
    direction: 'up' | 'down' | 'flat'
    percent: number
    label?: string
}

interface MetricCardProps {
    label: string
    value: string | number
    unit?: string
    trend?: TrendInfo
    sparkData?: number[]
    accentColor?: string
    className?: string
}

const trendColors = {
    up: '#10b981',
    down: '#ef4444',
    flat: '#64748b',
}

const trendArrows = {
    up: '▲',
    down: '▼',
    flat: '—',
}

export function MetricCard({
    label,
    value,
    unit,
    trend,
    sparkData,
    accentColor = '#059669',
    className = '',
}: MetricCardProps) {
    return (
        <div
            className={`sirsi-card ${className}`}
            style={{
                padding: 16,
                borderLeft: `3px solid ${accentColor}`,
            }}
        >
            {/* Title */}
            <span
                style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    fontFamily: 'Inter, sans-serif',
                    display: 'block',
                    marginBottom: 8,
                }}
            >
                {label}
            </span>

            {/* Value + Sparkline Row */}
            <div className="flex items-end justify-between">
                <div className="flex items-end gap-2">
                    <span
                        style={{
                            fontSize: '24px',
                            fontWeight: 600,
                            color: '#111827',
                            fontFamily: 'Inter, sans-serif',
                            lineHeight: 1,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {value}
                    </span>
                    {unit && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: accentColor,
                                fontFamily: 'Inter, sans-serif',
                                marginBottom: 2,
                            }}
                        >
                            {unit}
                        </span>
                    )}
                </div>
                {sparkData && sparkData.length > 1 && (
                    <Sparkline data={sparkData} color={accentColor} width={100} height={24} />
                )}
            </div>

            {/* Trend */}
            {trend && (
                <div
                    className="flex items-center gap-1 mt-2"
                    style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: trendColors[trend.direction],
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    <span style={{ fontSize: '10px' }}>{trendArrows[trend.direction]}</span>
                    <span>{trend.percent}%</span>
                    {trend.label && (
                        <span style={{ color: '#94a3b8', marginLeft: 4 }}>{trend.label}</span>
                    )}
                </div>
            )}
        </div>
    )
}

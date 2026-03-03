/**
 * Sparkline — Swiss Neo-Deco Instrument (§3.22)
 * 120×24px inline SVG trend, smooth bezier, no axes
 */

interface SparklineProps {
    data: number[]
    width?: number
    height?: number
    color?: string
    showFill?: boolean
    className?: string
}

export function Sparkline({
    data,
    width = 120,
    height = 24,
    color = '#10b981',
    showFill = true,
    className = '',
}: SparklineProps) {
    if (!data || data.length < 2) return null

    const padding = 2
    const w = width - padding * 2
    const h = height - padding * 2
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    // Generate smooth path points
    const points = data.map((val, i) => ({
        x: padding + (i / (data.length - 1)) * w,
        y: padding + h - ((val - min) / range) * h,
    }))

    // Create smooth bezier curve
    const pathData = points.reduce((acc, point, i) => {
        if (i === 0) return `M ${point.x},${point.y}`
        const prev = points[i - 1]
        const cp1x = prev.x + (point.x - prev.x) * 0.4
        const cp1y = prev.y
        const cp2x = point.x - (point.x - prev.x) * 0.4
        const cp2y = point.y
        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`
    }, '')

    // Fill area path (closes to bottom)
    const fillPath = `${pathData} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`

    const gradientId = `sparkline-fill-${Math.random().toString(36).slice(2, 8)}`

    return (
        <svg
            width={width}
            height={height}
            className={className}
            style={{ display: 'block' }}
        >
            {showFill && (
                <>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>
                    <path
                        d={fillPath}
                        fill={`url(#${gradientId})`}
                    />
                </>
            )}
            <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

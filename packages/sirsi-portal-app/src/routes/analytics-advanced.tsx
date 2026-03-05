/**
 * Advanced Analytics Dashboard — Port of dashboard/analytics-advanced.html
 * Replaces D3.js with recharts v3 for React 19 compatibility.
 * 
 * Visualizations:
 * 1. User Activity Heatmap (custom SVG)
 * 2. Revenue Treemap (recharts Treemap)
 * 3. User Journey Flow (custom SVG Sankey-style)
 * 4. Engagement Radar (recharts RadarChart)
 * 5. Real-Time Stream Graph (recharts AreaChart stacked)
 * 6. Geographic Distribution (recharts custom bubble)
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { useState, useEffect, useMemo } from 'react'
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Treemap
} from 'recharts'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/analytics-advanced',
    component: AdvancedAnalytics,
})

// ── Color Palettes ──────────────────────────────────────────────
const MIXED_PALETTE = ['#059669', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444']
const STREAM_COLORS = ['#064e3b', '#047857', '#059669', '#10b981']

// ── Data Generators ─────────────────────────────────────────────

function generateHeatmapData() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data: { day: string; hour: number; value: number }[] = []
    // Use seeded-like random for consistent renders
    let seed = 42
    const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646 }
    days.forEach(day => {
        for (let hour = 0; hour < 24; hour++) {
            // Simulate realistic patterns: higher activity during business hours
            const baseActivity = (hour >= 9 && hour <= 17) ? 60 : 20
            const dayBoost = (day !== 'Sun' && day !== 'Sat') ? 20 : 0
            data.push({ day, hour, value: Math.round(baseActivity + dayBoost + rand() * 30) })
        }
    })
    return data
}

const treemapData = [
    {
        name: 'Subscriptions', size: 855000, fill: MIXED_PALETTE[0],
        children: [
            { name: 'Basic Plan', size: 125000, fill: MIXED_PALETTE[0] },
            { name: 'Pro Plan', size: 280000, fill: MIXED_PALETTE[1] },
            { name: 'Enterprise', size: 450000, fill: MIXED_PALETTE[0] },
        ]
    },
    {
        name: 'Services', size: 420000, fill: MIXED_PALETTE[2],
        children: [
            { name: 'Consulting', size: 180000, fill: MIXED_PALETTE[2] },
            { name: 'Training', size: 95000, fill: MIXED_PALETTE[3] },
            { name: 'Support', size: 145000, fill: MIXED_PALETTE[2] },
        ]
    },
    {
        name: 'Products', size: 195000, fill: MIXED_PALETTE[4],
        children: [
            { name: 'Add-ons', size: 85000, fill: MIXED_PALETTE[4] },
            { name: 'Integrations', size: 110000, fill: MIXED_PALETTE[5] },
        ]
    }
]

const radarData = [
    { axis: 'User Retention', value: 85, fullMark: 100 },
    { axis: 'Page Views', value: 72, fullMark: 100 },
    { axis: 'Session Duration', value: 68, fullMark: 100 },
    { axis: 'Feature Adoption', value: 90, fullMark: 100 },
    { axis: 'Support Tickets', value: 45, fullMark: 100 },
    { axis: 'User Satisfaction', value: 88, fullMark: 100 },
]

const journeyData = {
    nodes: ['Homepage', 'Product Page', 'Documentation', 'Sign Up', 'Trial', 'Purchase', 'Support', 'Churn'],
    flows: [
        { from: 'Homepage', to: 'Product Page', value: 1000 },
        { from: 'Homepage', to: 'Documentation', value: 500 },
        { from: 'Homepage', to: 'Sign Up', value: 800 },
        { from: 'Product Page', to: 'Sign Up', value: 600 },
        { from: 'Product Page', to: 'Trial', value: 400 },
        { from: 'Documentation', to: 'Support', value: 300 },
        { from: 'Sign Up', to: 'Trial', value: 900 },
        { from: 'Trial', to: 'Purchase', value: 700 },
        { from: 'Trial', to: 'Churn', value: 200 },
        { from: 'Purchase', to: 'Support', value: 150 },
    ]
}

const geoData = [
    { region: 'North America', code: 'NA', value: 450000, z: 60, fill: MIXED_PALETTE[0] },
    { region: 'Europe', code: 'EU', value: 380000, z: 55, fill: MIXED_PALETTE[1] },
    { region: 'Asia Pacific', code: 'APAC', value: 320000, z: 50, fill: MIXED_PALETTE[2] },
    { region: 'Latin America', code: 'LATAM', value: 180000, z: 35, fill: MIXED_PALETTE[3] },
    { region: 'Middle East', code: 'ME', value: 120000, z: 30, fill: MIXED_PALETTE[4] },
    { region: 'Africa', code: 'AF', value: 95000, z: 25, fill: MIXED_PALETTE[5] },
]

function generateStreamData() {
    const now = Date.now()
    return Array.from({ length: 50 }, (_, i) => ({
        time: new Date(now - (50 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        Documents: Math.round(Math.random() * 50 + 20),
        Users: Math.round(Math.random() * 50 + 20),
        Sessions: Math.round(Math.random() * 50 + 20),
        Transactions: Math.round(Math.random() * 50 + 20),
    }))
}

// ── Heatmap Component (Custom SVG) ──────────────────────────────

function HeatmapChart() {
    const data = useMemo(() => generateHeatmapData(), [])
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

    const cellWidth = 28
    const cellHeight = 32
    const marginLeft = 48
    const marginTop = 10
    const width = marginLeft + cellWidth * 24 + 20
    const height = marginTop + cellHeight * 7 + 40

    const maxVal = Math.max(...data.map(d => d.value))

    const getColor = (value: number) => {
        const t = value / maxVal
        // Viridis-like interpolation: dark purple → teal → yellow
        const r = Math.round(68 + t * 187)
        const g = Math.round(1 + t * 189)
        const b = Math.round(84 + t * (t < 0.5 ? 78 : -84))
        return `rgb(${r},${g},${b})`
    }

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: 360 }}>
            {days.map((day, di) => (
                <text key={day} x={marginLeft - 8} y={marginTop + di * cellHeight + cellHeight / 2 + 4}
                    textAnchor="end" fontSize="11" fill="currentColor" opacity={0.6}>{day}</text>
            ))}
            {data.map((d, i) => {
                const di = days.indexOf(d.day)
                return (
                    <rect key={i}
                        x={marginLeft + d.hour * cellWidth + 1}
                        y={marginTop + di * cellHeight + 1}
                        width={cellWidth - 2}
                        height={cellHeight - 2}
                        rx={3}
                        fill={getColor(d.value)}
                        opacity={0.9}
                        onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, text: `${d.day} ${d.hour}:00 — ${d.value} sessions` })}
                        onMouseLeave={() => setTooltip(null)}
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                    />
                )
            })}
            {Array.from({ length: 24 }, (_, h) => (
                <text key={h} x={marginLeft + h * cellWidth + cellWidth / 2}
                    y={marginTop + 7 * cellHeight + 16}
                    textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.5}>
                    {h % 3 === 0 ? `${h}:00` : ''}
                </text>
            ))}
            {tooltip && (
                <foreignObject x={0} y={0} width={width} height={height} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 32,
                        background: '#1e293b', color: 'white', padding: '6px 10px',
                        borderRadius: 4, fontSize: 12, whiteSpace: 'nowrap', zIndex: 50
                    }}>
                        {tooltip.text}
                    </div>
                </foreignObject>
            )}
        </svg>
    )
}

// ── Sankey-Style Journey Flow (Custom SVG) ──────────────────────

function JourneyFlow() {
    const columns: string[][] = [
        ['Homepage'],
        ['Product Page', 'Documentation', 'Sign Up'],
        ['Trial', 'Support'],
        ['Purchase', 'Churn'],
    ]

    const nodePositions: Record<string, { x: number; y: number }> = {}
    const colWidth = 200
    const nodeHeight = 40
    const svgWidth = columns.length * colWidth + 100
    const svgHeight = 320

    columns.forEach((col, ci) => {
        const totalHeight = col.length * (nodeHeight + 30) - 30
        const startY = (svgHeight - totalHeight) / 2
        col.forEach((name, ni) => {
            nodePositions[name] = {
                x: 50 + ci * colWidth,
                y: startY + ni * (nodeHeight + 30)
            }
        })
    })

    const maxFlow = Math.max(...journeyData.flows.map(f => f.value))

    return (
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full" style={{ maxHeight: 320 }}>
            {/* Links */}
            {journeyData.flows.map((flow, i) => {
                const from = nodePositions[flow.from]
                const to = nodePositions[flow.to]
                if (!from || !to) return null
                const strokeWidth = Math.max(2, (flow.value / maxFlow) * 18)
                const x1 = from.x + 120
                const y1 = from.y + nodeHeight / 2
                const x2 = to.x
                const y2 = to.y + nodeHeight / 2
                const midX = (x1 + x2) / 2
                return (
                    <path key={i}
                        d={`M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                        stroke="#059669" strokeWidth={strokeWidth} fill="none" opacity={0.3}
                    />
                )
            })}
            {/* Nodes */}
            {journeyData.nodes.map(name => {
                const pos = nodePositions[name]
                if (!pos) return null
                const totalValue = journeyData.flows
                    .filter(f => f.from === name || f.to === name)
                    .reduce((sum, f) => sum + f.value, 0)
                return (
                    <g key={name}>
                        <rect x={pos.x} y={pos.y} width={120} height={nodeHeight}
                            rx={6} fill="#10b981" opacity={0.85} />
                        <text x={pos.x + 60} y={pos.y + 16} textAnchor="middle"
                            fontSize="11" fill="white" fontWeight={500}>{name}</text>
                        <text x={pos.x + 60} y={pos.y + 30} textAnchor="middle"
                            fontSize="9" fill="white" opacity={0.7}>{totalValue.toLocaleString()}</text>
                    </g>
                )
            })}
        </svg>
    )
}

// ── Custom Treemap Content ──────────────────────────────────────

function TreemapContent(props: any) {
    const { x, y, width: w, height: h, name, size } = props
    if (w < 40 || h < 30) return null
    return (
        <g>
            <rect x={x} y={y} width={w} height={h} rx={4}
                fill={props.fill || '#059669'} stroke="#fff" strokeWidth={2} opacity={0.85} />
            {w > 60 && (
                <>
                    <text x={x + 8} y={y + 18} fontSize="12" fill="white" fontWeight={500}>{name}</text>
                    <text x={x + 8} y={y + 32} fontSize="10" fill="white" opacity={0.7}>
                        ${(size || 0).toLocaleString()}
                    </text>
                </>
            )}
        </g>
    )
}

// ── Main Advanced Analytics Component ───────────────────────────

function AdvancedAnalytics() {
    const [streamData, setStreamData] = useState(generateStreamData)

    // Real-time stream graph updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStreamData(prev => {
                const next = [...prev.slice(1)]
                next.push({
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    Documents: Math.round(Math.random() * 50 + 20),
                    Users: Math.round(Math.random() * 50 + 20),
                    Sessions: Math.round(Math.random() * 50 + 20),
                    Transactions: Math.round(Math.random() * 50 + 20),
                })
                return next
            })
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-cinzel tracking-wide">Advanced Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">Deep-dive performance data, cohort analysis, and predictive insights.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* 1. User Activity Heatmap */}
                <VisualizationCard title="User Activity Heatmap" subtitle="Sessions by hour and day of week" fullWidth>
                    <HeatmapChart />
                </VisualizationCard>

                {/* 2. Revenue Treemap */}
                <VisualizationCard title="Revenue Distribution" subtitle="Revenue breakdown by category">
                    <ResponsiveContainer width="100%" height={350}>
                        <Treemap data={treemapData} dataKey="size" nameKey="name"
                            content={<TreemapContent />}
                        />
                    </ResponsiveContainer>
                </VisualizationCard>

                {/* 3. User Journey Flow */}
                <VisualizationCard title="User Journey Flow" subtitle="Navigation path analysis across platform">
                    <JourneyFlow />
                </VisualizationCard>

                {/* 4. Engagement Radar */}
                <VisualizationCard title="Engagement Radar" subtitle="Multi-dimensional engagement scoring">
                    <ResponsiveContainer width="100%" height={350}>
                        <RadarChart data={radarData} outerRadius="75%">
                            <PolarGrid stroke="currentColor" opacity={0.15} />
                            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'currentColor' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                            <Radar name="Engagement" dataKey="value" stroke="#059669"
                                fill="#059669" fillOpacity={0.3} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                </VisualizationCard>

                {/* 5. Real-Time Stream Graph */}
                <VisualizationCard title="Real-Time Activity Stream" subtitle="Live activity across 4 categories — updates every 3s" fullWidth>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={streamData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }}
                                interval={Math.floor(streamData.length / 6)} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                            {['Documents', 'Users', 'Sessions', 'Transactions'].map((key, i) => (
                                <Area key={key} type="monotone" dataKey={key}
                                    stackId="1" stroke={STREAM_COLORS[i]}
                                    fill={STREAM_COLORS[i]} fillOpacity={0.6} />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </VisualizationCard>

                {/* 6. Geographic Distribution */}
                <VisualizationCard title="Geographic Revenue Distribution" subtitle="Revenue concentration by region" fullWidth>
                    <div className="flex flex-wrap justify-center gap-6 py-4">
                        {geoData.map(region => (
                            <div key={region.code} className="flex flex-col items-center gap-2 group cursor-pointer">
                                <div className="relative flex items-center justify-center transition-transform group-hover:scale-110"
                                    style={{ width: region.z * 2, height: region.z * 2 }}>
                                    <div className="absolute inset-0 rounded-full opacity-70"
                                        style={{ background: region.fill }} />
                                    <span className="relative text-white font-semibold text-sm z-10">{region.code}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{region.region}</span>
                                <span className="text-xs font-medium">${(region.value / 1000).toFixed(0)}K</span>
                            </div>
                        ))}
                    </div>
                </VisualizationCard>
            </div>
        </div>
    )
}

// ── Visualization Card Wrapper ──────────────────────────────────

function VisualizationCard({ title, subtitle, children, fullWidth }: {
    title: string; subtitle: string; children: React.ReactNode; fullWidth?: boolean
}) {
    return (
        <div className={`sirsi-card p-6 ${fullWidth ? 'xl:col-span-2' : ''}`}>
            <div className="mb-4">
                <h3 className="text-base font-medium">{title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            {children}
        </div>
    )
}

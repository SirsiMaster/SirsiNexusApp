/**
 * LoadingSkeleton — Shimmer-effect loading states for route transitions
 * 
 * Provides branded, contextual loading states instead of generic spinners.
 * Matches the glass-panel aesthetic of the admin console.
 */

/** Generic skeleton block with shimmer animation */
export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5 
                        bg-[length:200%_100%] ${className}`}
            style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
        />
    )
}

/** Full-page loading skeleton for route transitions */
export function PageSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in-0 duration-300">
            {/* Header skeleton */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* KPI cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="glass-panel p-6 space-y-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-28" />
                        <Skeleton className="h-3 w-36" />
                    </div>
                ))}
            </div>

            {/* Content area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-48 w-full" />
                </div>
                <div className="glass-panel p-6 space-y-4">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        </div>
    )
}

/** Table skeleton for data-heavy pages */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="glass-panel p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            {/* Header row */}
            <div className="flex gap-4 px-2 py-3 border-b border-white/10">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16 ml-auto" />
            </div>
            {/* Data rows */}
            {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="flex gap-4 px-2 py-3 border-b border-white/5">
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                </div>
            ))}
        </div>
    )
}

/** Chart skeleton for visualization panels */
export function ChartSkeleton() {
    return (
        <div className="glass-panel p-6 space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
        </div>
    )
}

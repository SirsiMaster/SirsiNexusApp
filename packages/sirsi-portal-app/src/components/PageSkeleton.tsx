/**
 * PageSkeleton — Loading skeleton for route transitions
 *
 * Swiss Neo-Deco aesthetic: subtle pulse animation on slate-colored blocks.
 * Used as pendingComponent on lazy-loaded routes.
 */

export function PageSkeleton() {
    const bar = (w: string, h = 'h-4') =>
        `${h} ${w} bg-slate-200 dark:bg-slate-700 rounded animate-pulse`

    return (
        <div className="sidebar-content">
            <div className="content-wrapper">
                <div className="space-y-6 py-8">
                    {/* Title skeleton */}
                    <div className="space-y-3">
                        <div className={bar('w-1/3', 'h-8')} />
                        <div className={bar('w-2/3')} />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
                                <div className={bar('w-1/2', 'h-3')} />
                                <div className={bar('w-2/3', 'h-7')} />
                                <div className={bar('w-full', 'h-2')} />
                            </div>
                        ))}
                    </div>

                    {/* Content area */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                        <div className={bar('w-1/4', 'h-5')} />
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={bar(i === 5 ? 'w-3/4' : 'w-full')} />
                            ))}
                        </div>
                    </div>

                    {/* Table skeleton */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="border-b border-slate-200 dark:border-slate-700 p-4 flex gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={bar('w-24', 'h-3')} />
                            ))}
                        </div>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="border-b border-slate-100 dark:border-slate-700/50 p-4 flex gap-6">
                                {[1, 2, 3, 4].map(j => (
                                    <div key={j} className={bar(j === 1 ? 'w-32' : 'w-24')} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * PublicPageSkeleton — Loading skeleton for public pages (no sidebar)
 */
export function PublicPageSkeleton() {
    const bar = (w: string, h = 'h-4') =>
        `${h} ${w} bg-slate-200 dark:bg-slate-700 rounded animate-pulse`

    return (
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
            {/* Hero skeleton */}
            <div className="text-center space-y-4">
                <div className={`${bar('w-1/2', 'h-10')} mx-auto`} />
                <div className={`${bar('w-3/4', 'h-5')} mx-auto`} />
            </div>

            {/* Content blocks */}
            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-3">
                        <div className={bar('w-1/3', 'h-5')} />
                        <div className="space-y-2">
                            <div className={bar('w-full')} />
                            <div className={bar('w-full')} />
                            <div className={bar('w-2/3')} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

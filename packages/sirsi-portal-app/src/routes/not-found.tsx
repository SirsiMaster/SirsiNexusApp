/**
 * 404 Not Found — Branded error page for unmatched routes
 *
 * PUBLIC page — uses PublicLayout (no sidebar, no admin header).
 * Swiss Neo-Deco aesthetic consistent with rest of sirsi.ai.
 */

import { Link } from '@tanstack/react-router'

const LinkComp = Link as any

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24 flex-1 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-slate-900">
            {/* Error Code */}
            <div className="relative mb-8">
                <span className="text-[160px] md:text-[200px] font-bold text-slate-100 dark:text-slate-800 leading-none select-none">
                    404
                </span>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">
                Page Not Found
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md text-center">
                The page you're looking for doesn't exist or has been moved.
                Check the URL or navigate back to a known page.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
                <LinkComp to="/"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Home
                </LinkComp>
                <LinkComp to="/documentation"
                    className="inline-flex items-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documentation
                </LinkComp>
            </div>

            {/* Help text */}
            <p className="mt-12 text-sm text-slate-400 dark:text-slate-500">
                If you believe this is an error, contact{' '}
                <a href="mailto:cylton@sirsi.ai" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                    cylton@sirsi.ai
                </a>
            </p>
        </div>
    )
}

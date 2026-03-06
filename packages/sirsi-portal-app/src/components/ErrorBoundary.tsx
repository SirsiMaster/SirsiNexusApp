/**
 * ErrorBoundary — Production error containment for route-level isolation
 * 
 * Catches render errors in child components and displays a branded fallback
 * instead of the React white screen of death.
 * Logs to console (future: POST to audit trail endpoint).
 */
import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryProps {
    children: ReactNode
    /** Optional label for which section/route this boundary wraps */
    section?: string
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error(`[ErrorBoundary${this.props.section ? `: ${this.props.section}` : ''}]`, error, info.componentStack)
        // Future: POST to /sirsi.admin.v2.AdminService/LogError
    }

    render() {
        if (this.state.hasError) {
            const timestamp = new Date().toISOString()
            return (
                <div className="flex items-center justify-center min-h-[400px] px-4">
                    <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-xl p-8 max-w-lg text-center space-y-4 shadow-lg">
                        <div className="flex justify-center">
                            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-500 dark:text-red-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Module Error</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {this.props.section
                                    ? `The ${this.props.section} module encountered an error.`
                                    : 'An unexpected error occurred in this module.'}
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 text-left">
                                <p className="text-xs font-mono text-red-600 dark:text-red-300/80 break-all">
                                    {this.state.error.message}
                                </p>
                                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-600 mt-2">
                                    {timestamp}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null })
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700
                                           text-white rounded-lg text-sm font-medium
                                           transition-colors duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry
                            </button>
                            <a
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600
                                           text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700
                                           rounded-lg text-sm font-medium transition-colors duration-200"
                            >
                                ← Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

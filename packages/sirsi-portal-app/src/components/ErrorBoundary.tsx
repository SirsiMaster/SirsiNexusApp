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
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="glass-panel p-8 max-w-md text-center space-y-4 border border-red-500/20">
                        <div className="flex justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-red-400">Module Error</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                {this.props.section
                                    ? `The ${this.props.section} module encountered an error.`
                                    : 'An unexpected error occurred in this module.'}
                            </p>
                        </div>
                        {this.state.error && (
                            <div className="bg-black/20 rounded-lg p-3 text-left">
                                <p className="text-xs font-mono text-red-300/80 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-sirsi-emerald/20 hover:bg-sirsi-emerald/30 
                                       text-sirsi-emerald border border-sirsi-emerald/30 rounded-lg text-sm 
                                       transition-colors duration-200"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

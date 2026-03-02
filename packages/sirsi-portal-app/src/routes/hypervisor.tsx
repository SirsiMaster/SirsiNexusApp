/** Hypervisor — AI Orchestration Engine */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Sparkles, Cpu, GitBranch, BarChart3, Clock, Zap } from 'lucide-react'

const SparklesIcon = Sparkles as any
const CpuIcon = Cpu as any
const GitBranchIcon = GitBranch as any
const BarChart3Icon = BarChart3 as any
const ClockIcon = Clock as any
const ZapIcon = Zap as any

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/hypervisor', component: Hypervisor })

const pipelines = [
    { id: '1', name: 'Contract Analysis Pipeline', status: 'running', steps: 4, completed: 3, latency: '1.4s' },
    { id: '2', name: 'Cost Optimization Scan', status: 'completed', steps: 6, completed: 6, latency: '0.8s' },
    { id: '3', name: 'Compliance Audit Check', status: 'running', steps: 5, completed: 2, latency: '2.1s' },
    { id: '4', name: 'Document Ingestion Queue', status: 'queued', steps: 3, completed: 0, latency: '-' },
]

function Hypervisor() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="border-b border-gray-200 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="w-6 h-6 text-amber-500" />
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: "'Cinzel', serif" }}>HYPERVISOR</h1>
                </div>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">AI Orchestration Engine — Pipeline monitoring</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MiniCard icon={<CpuIcon className="w-5 h-5 text-blue-600" />} title="Pipelines" value="4" bg="blue" />
                <MiniCard icon={<ZapIcon className="w-5 h-5 text-emerald-600" />} title="Running" value="2" bg="emerald" />
                <MiniCard icon={<BarChart3Icon className="w-5 h-5 text-purple-600" />} title="Avg Latency" value="1.3s" bg="purple" />
                <MiniCard icon={<ClockIcon className="w-5 h-5 text-amber-600" />} title="Uptime" value="99.1%" bg="amber" />
            </div>

            <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4" style={{ fontFamily: "'Cinzel', serif" }}>ACTIVE PIPELINES</h2>
                <div className="space-y-4">
                    {pipelines.map(p => (
                        <div key={p.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <GitBranchIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400">{p.latency}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${p.status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                            p.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                                'bg-gray-100 dark:bg-slate-800 text-gray-400'
                                        }`}>{p.status}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${p.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${(p.completed / p.steps) * 100}%` }} />
                                </div>
                                <span className="text-xs text-gray-400">{p.completed}/{p.steps}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function MiniCard({ icon, title, value, bg }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 bg-${bg}-100 dark:bg-${bg}-900/30 rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{title}</div>
        </div>
    )
}

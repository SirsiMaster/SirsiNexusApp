/** AI Agents — AI agent management */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import { Bot, Zap, Activity, Settings } from 'lucide-react'

const BotIcon = Bot as any
const ZapIcon = Zap as any
const ActivityIcon = Activity as any
const SettingsIcon = Settings as any

export const Route = createRoute({ getParentRoute: () => rootRoute as any, path: '/ai-agents', component: AIAgents })

const agents = [
    { id: '1', name: 'Guidance Engine', status: 'active', model: 'Gemini 2.5', tasks: 142, rate: '98.7%', desc: 'Primary AI assistant for contract guidance' },
    { id: '2', name: 'Document Analyzer', status: 'active', model: 'Gemini 2.5', tasks: 89, rate: '99.2%', desc: 'Legal document parsing and risk analysis' },
    { id: '3', name: 'Cost Optimizer', status: 'idle', model: 'Gemini 2.5', tasks: 34, rate: '97.1%', desc: 'Cloud cost analysis and optimization' },
    { id: '4', name: 'Compliance Monitor', status: 'active', model: 'Gemini 2.5', tasks: 67, rate: '100%', desc: 'SOC 2 compliance monitoring' },
]

function AIAgents() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="border-b border-gray-200 dark:border-slate-800 pb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ fontFamily: "'Cinzel', serif" }}>AI AGENTS</h1>
                <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Sirsi Guidance Engine — Vertex AI powered intelligence</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SC icon={<BotIcon className="w-5 h-5 text-purple-600" />} title="Active Agents" value="3" bg="purple" />
                <SC icon={<ZapIcon className="w-5 h-5 text-emerald-600" />} title="Tasks Today" value="332" bg="emerald" />
                <SC icon={<ActivityIcon className="w-5 h-5 text-blue-600" />} title="Avg Latency" value="1.2s" bg="blue" />
                <SC icon={<SettingsIcon className="w-5 h-5 text-amber-600" />} title="Success Rate" value="98.9%" bg="amber" />
            </div>

            <div className="space-y-4">
                {agents.map(a => (
                    <div key={a.id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                    <BotIcon className={`w-6 h-6 ${a.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{a.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded text-gray-500">{a.model}</span>
                                        <span className="text-[10px] text-gray-400">{a.tasks} tasks</span>
                                        <span className="text-[10px] font-bold text-emerald-600">{a.rate}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${a.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                                {a.status}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function SC({ icon, title, value, bg }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <div className={`w-9 h-9 bg-${bg}-100 dark:bg-${bg}-900/30 rounded-lg flex items-center justify-center mb-3`}>{icon}</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{title}</div>
        </div>
    )
}

// src/routes/telemetry.tsx
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'
import {
    Users as UsersIcon,
    Eye,
    MousePointer2,
    Download,
    ArrowRight
} from 'lucide-react'

const UsersComp = UsersIcon as any
const EyeComp = Eye as any
const MouseComp = MousePointer2 as any
const DownloadComp = Download as any
const ArrowRightComp = ArrowRight as any

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/telemetry',
    component: Telemetry,
})

function Telemetry() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex justify-between items-end border-b border-gray-200 dark:border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Telemetry & Behavioral Intelligence</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm tracking-wide">Real-time session monitoring and engagement analytics</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="pulse-dot" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Tracking</span>
                </div>
            </header>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Users Now"
                    value="247"
                    trend="+12.5%"
                    icon={<UsersComp className="w-5 h-5 text-blue-600" />}
                    subtext="Across 12 countries"
                    bgColor="bg-blue-50 dark:bg-blue-950/20"
                />
                <MetricCard
                    title="Page Views Today"
                    value="15,832"
                    trend="+8.3%"
                    icon={<EyeComp className="w-5 h-5 text-emerald-600" />}
                    subtext="Avg. session: 12m 34s"
                    bgColor="bg-emerald-50 dark:bg-emerald-950/20"
                />
                <MetricCard
                    title="Total Interactions"
                    value="9,421"
                    trend="-3.2%"
                    icon={<MouseComp className="w-5 h-5 text-amber-600" />}
                    subtext="CTR: 4.2%"
                    bgColor="bg-amber-50 dark:bg-amber-950/20"
                    trendColor="text-red-600"
                />
                <MetricCard
                    title="Downloads Today"
                    value="523"
                    trend="+22.1%"
                    icon={<DownloadComp className="w-5 h-5 text-purple-600" />}
                    subtext="Top: Report_Q4.pdf"
                    bgColor="bg-purple-50 dark:bg-purple-950/20"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Journey Paths */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        User Journey Paths
                    </h2>
                    <div className="space-y-6">
                        <JourneyPath
                            title="Most Common Path (42%)"
                            steps={['Landing Page', 'Data Room', 'Download File', 'Success']}
                            color="border-emerald-500"
                        />
                        <JourneyPath
                            title="High Drop-off Path (18%)"
                            steps={['Landing Page', 'Login', 'Exit']}
                            color="border-amber-500"
                        />
                    </div>
                </div>

                {/* Engagement Metrics */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Engagement Health
                    </h2>
                    <div className="space-y-5">
                        <HealthStat label="Page Load Time" value="1.2s" progress={85} color="bg-emerald-500" />
                        <HealthStat label="Bounce Rate" value="32%" progress={32} color="bg-amber-500" />
                        <HealthStat label="Form Completion" value="78%" progress={78} color="bg-blue-500" />
                        <HealthStat label="Error Rate" value="2.1%" progress={2} color="bg-red-500" />
                    </div>
                </div>
            </div>

            {/* Live activity placeholder */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-6">Live Session Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xs">JD</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm">john.doe@example.com <span className="text-gray-400 font-medium ml-2 text-xs">#4521</span></h4>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Just Now</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">New York, US • Desktop • Firefox</p>
                            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                <ActivityBadge label="Dashboard" time="12s" />
                                <ActivityBadge label="Reports" time="45s" />
                                <ActivityBadge label="Download" time="Success" status="success" />
                                <ActivityBadge label="Data Room" time="Active" status="active" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, trend, icon, subtext, bgColor, trendColor = 'text-green-600' }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
                    {icon}
                </div>
                <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{title}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800">
                <span className="text-[10px] text-gray-500 font-medium italic">{subtext}</span>
            </div>
        </div>
    )
}

function JourneyPath({ title, steps, color }: any) {
    return (
        <div className={`border-l-4 ${color} pl-4 py-1`}>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{title}</h4>
            <div className="flex flex-wrap items-center gap-2">
                {steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-tighter">
                            {step}
                        </span>
                        {i < steps.length - 1 && <ArrowRightComp className="w-3 h-3 text-gray-300" />}
                    </div>
                ))}
            </div>
        </div>
    )
}

function HealthStat({ label, value, progress, color }: any) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{label}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    )
}

function ActivityBadge({ label, time, status }: any) {
    return (
        <div className={`px-3 py-1 rounded border text-[10px] font-bold flex flex-col gap-0.5 ${status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-800/30' :
            status === 'active' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-200 dark:border-blue-800/30' :
                'bg-gray-50 dark:bg-slate-800/50 text-gray-500 border-gray-100 dark:border-slate-700'
            }`}>
            <span className="opacity-60">{label}</span>
            <span>{time}</span>
        </div>
    )
}

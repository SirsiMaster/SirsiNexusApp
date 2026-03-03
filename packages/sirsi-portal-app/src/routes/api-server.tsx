/**
 * API Server Status — Port of system-status/api-server.html
 * Canonical CSS: page-header, page-subtitle, sirsi-card
 * Features: Current status banner, historical data table, API server logs
 */
import { createRoute } from '@tanstack/react-router'
import { Route as rootRoute } from './__root'

export const Route = createRoute({
    getParentRoute: () => rootRoute as any,
    path: '/api-server',
    component: ApiServer,
})

const historicalData = [
    { date: '2025-07-01', status: 'Operational', statusBg: 'bg-green-100 text-green-800', time: '200ms', detail: 'Normal operation' },
    { date: '2025-07-02', status: 'Minor Issues', statusBg: 'bg-yellow-100 text-yellow-800', time: '350ms', detail: 'Slow API response times observed' },
    { date: '2025-07-03', status: 'Operational', statusBg: 'bg-green-100 text-green-800', time: '190ms', detail: 'All systems healthy' },
]

const logs = [
    '2025-07-01 10:00 AM: Regular system check completed',
    '2025-07-02 03:15 PM: Notification of increased response times',
    '2025-07-03 09:45 AM: All issues resolved; system optimal',
]

function ApiServer() {
    return (
        <div>
            <div className="page-header">
                <h1>API Server Status</h1>
                <p className="page-subtitle">Historical performance data and real-time operational status for the gRPC & REST gateway.</p>
            </div>

            {/* current status */}
            <div className="sirsi-card mb-8">
                <p className="mb-2">Current Status: <span className="text-green-600 font-medium">Operational</span></p>
                <p style={{ color: '#6b7280' }}>The API server is functioning optimally with no reported issues. See detailed statistics below.</p>
            </div>

            {/* historical */}
            <div className="sirsi-card mb-8">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Historical Data</h3>
                <table className="w-full">
                    <thead>
                        <tr style={{ background: '#f9fafb' }}>
                            {['Date', 'Status', 'Response Time', 'Details'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: '#374151' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {historicalData.map(row => (
                            <tr key={row.date}>
                                <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{row.date}</td>
                                <td style={{ padding: '12px 16px' }}><span className={`px-2 py-1 text-xs rounded-full ${row.statusBg}`}>{row.status}</span></td>
                                <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{row.time}</td>
                                <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280' }}>{row.detail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* logs */}
            <div className="sirsi-card">
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>API Server Logs</h3>
                <ul className="list-disc list-inside space-y-2" style={{ color: '#374151' }}>
                    {logs.map(l => <li key={l}>{l}</li>)}
                </ul>
            </div>
        </div>
    )
}

/**
 * Hypervisor Mock Data (ADR-026 — Tier 3)
 *
 * Contract-first mock data for instruments whose backend infrastructure
 * is not yet provisioned. Every interface here mirrors the future protobuf
 * response shape. Swapping to live is a single queryFn change.
 *
 * TIER 1 (LIVE) data comes from useAdminService.ts / useTenantService.ts
 * TIER 2 (BUILDABLE) data will come from HypervisorService Go handlers
 * TIER 3 (THIS FILE) data is realistic simulation until backend exists
 */

import type { LEDStatus } from '../components/instruments/StatusLED'

// ── Shared Types ──────────────────────────────────────────────────

export interface TenantSummary {
    id: string
    name: string
    slug: string
    status: LEDStatus
    environment: string
    uptime30d: number
    deployments24h: number
    openIncidents: number
    uptimeTrend: number[]
}

export interface ActivityEvent {
    id: string
    timestamp: string
    type: 'deploy' | 'security' | 'incident' | 'config' | 'user'
    tenant: string
    message: string
    severity: 'info' | 'warning' | 'critical'
}

export interface Incident {
    id: string
    title: string
    severity: 'critical' | 'warning' | 'info'
    status: 'open' | 'investigating' | 'resolved'
    openedAt: string
    tenant: string
    assignee: string
}

// ── Tab 1: Overview ───────────────────────────────────────────────

export interface OverviewData {
    uptime: { current: number; target: number; trend: number[] }
    deployments24h: { count: number; trend: number[] }
    cloudSpendMTD: { current: number; budget: number; trend: number[] }
    tenants: TenantSummary[]
    recentActivity: ActivityEvent[]
    openIncidents: Incident[]
}

// ── Tab 2: DevOps ─────────────────────────────────────────────────

export interface DORAMetric {
    tenant: string
    value: number
    unit: string
    doraLevel: 'elite' | 'high' | 'medium' | 'low'
    trend: number[]
}

export interface Deployment {
    id: string
    sha: string
    tenant: string
    environment: string
    version: string
    status: 'success' | 'failed' | 'rolling'
    deployer: string
    duration: string
    timestamp: string
}

export interface PipelineStatus {
    tenant: string
    environment: string
    status: LEDStatus
    lastRun: string
    branch: string
}

export interface DevOpsData {
    deploymentFrequency: { tenant: string; dailyCounts: number[] }[]
    changeFailureRate: DORAMetric[]
    mttr: DORAMetric[]
    leadTime: DORAMetric[]
    pipelineMatrix: PipelineStatus[]
    recentDeployments: Deployment[]
    buildHealth: { tenant: string; successRate: number; trend: number[] }[]
}

// ── Tab 3: Infrastructure ─────────────────────────────────────────

export interface ResourceState {
    inSync: number
    drifted: number
    pending: number
}

export interface DriftItem {
    resource: string
    type: string
    tenant: string
    detected: string
    severity: 'critical' | 'warning' | 'info'
}

export interface EnvironmentEntry {
    tenant: string
    environment: string
    version: string
    status: LEDStatus
    lastDeploy: string
}

export interface CloudRunService {
    name: string
    tenant: string
    instances: number
    maxInstances: number
    cpu: number
    memory: number
}

export interface InfrastructureData {
    resources: ResourceState
    driftItems: DriftItem[]
    environmentMatrix: EnvironmentEntry[]
    cloudRunServices: CloudRunService[]
    costByResource: { name: string; cost: number }[]
}

// ── Tab 4: Security ───────────────────────────────────────────────

export interface CertificateStatus {
    domain: string
    issuer: string
    expiresAt: string
    daysRemaining: number
    status: LEDStatus
}

export interface SecurityData {
    mfaCompliance: { tenant: string; enrolled: number; total: number }[]
    authActivity24h: { hour: number; successful: number; failed: number }[]
    vulnerabilityScore: { score: number; critical: number; high: number; medium: number; low: number }
    certificates: CertificateStatus[]
    secretRotationCompliance: number
    soc2Score: number
}

// ── Tab 5: Database ───────────────────────────────────────────────

export interface ConnectionPool {
    database: string
    active: number
    idle: number
    max: number
}

export interface SlowQuery {
    query: string
    avgTime: number
    frequency: number
    lastSeen: string
}

export interface DatabaseData {
    connectionPools: ConnectionPool[]
    slowQueries: SlowQuery[]
    replicationLag: { replica: string; lagMs: number }[]
    tableStats: { name: string; rowCount: number; diskMB: number; indexMB: number; lastVacuum: string }[]
    firestoreCollections: { name: string; documentCount: number; readsTrend: number[]; writesTrend: number[] }[]
    backupStatus: { database: string; lastBackup: string; status: LEDStatus; lastRestoreTest: string }[]
}

// ── Tab 6: Frontend ───────────────────────────────────────────────

export interface WebVital {
    name: string
    value: number
    unit: string
    rating: 'good' | 'needs-improvement' | 'poor'
    thresholds: { good: number; poor: number }
}

export interface FrontendData {
    webVitals: WebVital[]
    bundleSize: { current: number; budget: number; byModule: { name: string; size: number }[] }
    pageInventory: { route: string; componentCount: number; loadTimeMs: number; errorRate: number; traffic: number }[]
    errorTracking: { component: string; frequency: number; affectedUsers: number; severity: 'critical' | 'warning' | 'info' }[]
}

// ── Tab 7: Backend ────────────────────────────────────────────────

export interface APIEndpoint {
    method: string
    path: string
    requestCount: number
    avgLatencyMs: number
    errorRate: number
    p95Trend: number[]
}

export interface BackendData {
    apiEndpoints: APIEndpoint[]
    serviceHealth: { service: string; status: LEDStatus; uptime: number }[]
    grpcThroughput: { service: string; rps: number; trend: number[] }[]
    goRuntime: { goroutines: number; heapMB: number; gcPauseMs: number }
    rateLimits: { service: string; used: number; limit: number }[]
}

// ── Tab 8: Integrations ───────────────────────────────────────────

export interface IntegrationData {
    serviceHealth: { name: string; status: LEDStatus; lastCheck: string; responseTimeMs: number }[]
    webhooks: { url: string; eventTypes: string[]; successRate: number; avgResponseMs: number; retryCount: number }[]
    apiKeys: { service: string; expiresAt: string; daysRemaining: number; rotationStatus: string }[]
    scheduledJobs: { name: string; schedule: string; lastRun: string; nextRun: string; status: LEDStatus }[]
}

// ── Tab 9: Cost ───────────────────────────────────────────────────

export interface CostData {
    monthlyByService: { service: string; tenant: string; cost: number }[]
    budgetVsActual: { budget: number; actual: number; forecast: number }
    costTrend6m: { month: string; finalwishes: number; assiduous: number; sirsiCore: number }[]
    costPerUser: number
    idleResources: { name: string; type: string; monthlyCost: number; recommendation: string }[]
}

// ── Tab 10: Incidents ─────────────────────────────────────────────

export interface IncidentDetail {
    id: string
    title: string
    severity: 'critical' | 'warning' | 'info'
    status: 'open' | 'investigating' | 'mitigated' | 'resolved'
    openedAt: string
    resolvedAt?: string
    tenant: string
    assignee: string
    description: string
}

export interface IncidentData {
    openIncidents: IncidentDetail[]
    slaCompliance: { current: number; target: number; trend: number[] }
    incidentHistory: IncidentDetail[]
    runbookLog: { name: string; trigger: string; result: 'success' | 'failed'; duration: string; timestamp: string }[]
}


// ═══════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS — Tier 3 (contract-first, realistic values)
// ═══════════════════════════════════════════════════════════════════

export function getMockOverviewData(): OverviewData {
    return {
        uptime: { current: 99.98, target: 99.9, trend: [99.95, 99.97, 99.96, 99.99, 99.98, 99.97, 99.98] },
        deployments24h: { count: 8, trend: [3, 5, 4, 8, 6, 7, 8] },
        cloudSpendMTD: { current: 2340, budget: 5000, trend: [1200, 1500, 1800, 2000, 2100, 2200, 2340] },
        tenants: [
            {
                id: 'tenant_fw', name: 'FinalWishes', slug: 'finalwishes',
                status: 'operational', environment: 'Production',
                uptime30d: 99.9, deployments24h: 5, openIncidents: 0,
                uptimeTrend: [99.8, 99.9, 99.95, 99.9, 99.85, 99.9, 99.9],
            },
            {
                id: 'tenant_as', name: 'Assiduous', slug: 'assiduous',
                status: 'degraded', environment: 'Staging',
                uptime30d: 98.2, deployments24h: 3, openIncidents: 1,
                uptimeTrend: [99.0, 98.5, 98.0, 97.5, 98.0, 98.2, 98.2],
            },
        ],
        recentActivity: [
            { id: '1', timestamp: '2 min ago', type: 'deploy', tenant: 'FinalWishes', message: 'Deployed v6.0.5 to production', severity: 'info' },
            { id: '2', timestamp: '15 min ago', type: 'security', tenant: 'Sirsi Core', message: 'MFA enrollment completed for new admin', severity: 'info' },
            { id: '3', timestamp: '1 hour ago', type: 'config', tenant: 'FinalWishes', message: 'Updated Stripe webhook endpoint', severity: 'info' },
            { id: '4', timestamp: '2 hours ago', type: 'deploy', tenant: 'Assiduous', message: 'Deployed v1.2.0 to staging', severity: 'info' },
            { id: '5', timestamp: '3 hours ago', type: 'incident', tenant: 'Assiduous', message: 'Elevated error rate detected in staging', severity: 'warning' },
            { id: '6', timestamp: '4 hours ago', type: 'user', tenant: 'Sirsi Core', message: 'New user provisioned: analyst@sirsi.ai', severity: 'info' },
            { id: '7', timestamp: '6 hours ago', type: 'deploy', tenant: 'FinalWishes', message: 'Deployed v6.0.4 to production', severity: 'info' },
            { id: '8', timestamp: '8 hours ago', type: 'security', tenant: 'FinalWishes', message: 'SSL certificate renewed for sign.sirsi.ai', severity: 'info' },
        ],
        openIncidents: [
            {
                id: 'inc_1', title: 'Elevated staging error rate — Assiduous',
                severity: 'warning', status: 'investigating',
                openedAt: '3 hours ago', tenant: 'Assiduous', assignee: 'Cylton Collymore',
            },
        ],
    }
}

export function getMockDevOpsData(): DevOpsData {
    return {
        deploymentFrequency: [
            { tenant: 'FinalWishes', dailyCounts: [4, 6, 3, 5, 7, 2, 5] },
            { tenant: 'Assiduous', dailyCounts: [1, 2, 0, 3, 1, 2, 3] },
        ],
        changeFailureRate: [
            { tenant: 'FinalWishes', value: 3.2, unit: '%', doraLevel: 'elite', trend: [4, 3.5, 3, 3.2, 3.1, 3.2, 3.2] },
            { tenant: 'Assiduous', value: 8.5, unit: '%', doraLevel: 'high', trend: [10, 9, 8, 9, 8.5, 8.5, 8.5] },
        ],
        mttr: [
            { tenant: 'FinalWishes', value: 22, unit: 'min', doraLevel: 'elite', trend: [30, 25, 22, 28, 24, 22, 22] },
            { tenant: 'Assiduous', value: 48, unit: 'min', doraLevel: 'high', trend: [60, 55, 50, 48, 52, 48, 48] },
        ],
        leadTime: [
            { tenant: 'FinalWishes', value: 4.2, unit: 'hours', doraLevel: 'elite', trend: [6, 5, 4.5, 4, 4.2, 4.2, 4.2] },
            { tenant: 'Assiduous', value: 18, unit: 'hours', doraLevel: 'medium', trend: [24, 20, 18, 22, 18, 18, 18] },
        ],
        pipelineMatrix: [
            { tenant: 'FinalWishes', environment: 'production', status: 'operational', lastRun: '2 min ago', branch: 'main' },
            { tenant: 'FinalWishes', environment: 'staging', status: 'operational', lastRun: '15 min ago', branch: 'develop' },
            { tenant: 'Assiduous', environment: 'production', status: 'unknown', lastRun: 'N/A', branch: 'main' },
            { tenant: 'Assiduous', environment: 'staging', status: 'degraded', lastRun: '1 hour ago', branch: 'develop' },
        ],
        recentDeployments: [
            { id: 'd1', sha: 'f8d2c1a', tenant: 'FinalWishes', environment: 'Production', version: 'v6.0.5', status: 'success', deployer: 'Cylton Collymore', duration: '3m 42s', timestamp: '2 min ago' },
            { id: 'd2', sha: 'a3b7e2f', tenant: 'Assiduous', environment: 'Staging', version: 'v1.2.0', status: 'success', deployer: 'Cylton Collymore', duration: '2m 18s', timestamp: '2 hours ago' },
            { id: 'd3', sha: 'c1d9f3e', tenant: 'FinalWishes', environment: 'Production', version: 'v6.0.4', status: 'success', deployer: 'Cylton Collymore', duration: '4m 11s', timestamp: '6 hours ago' },
            { id: 'd4', sha: 'b5e8a1c', tenant: 'FinalWishes', environment: 'Staging', version: 'v6.0.4-rc1', status: 'success', deployer: 'Cylton Collymore', duration: '2m 55s', timestamp: '8 hours ago' },
            { id: 'd5', sha: '91f2d4b', tenant: 'FinalWishes', environment: 'Production', version: 'v6.0.3', status: 'success', deployer: 'Cylton Collymore', duration: '3m 28s', timestamp: '1 day ago' },
        ],
        buildHealth: [
            { tenant: 'FinalWishes', successRate: 97.5, trend: [95, 96, 97, 97.5, 97, 97.5, 97.5] },
            { tenant: 'Assiduous', successRate: 89.2, trend: [85, 87, 88, 90, 89, 89.2, 89.2] },
        ],
    }
}

export function getMockInfrastructureData(): InfrastructureData {
    return {
        resources: { inSync: 42, drifted: 3, pending: 2 },
        driftItems: [
            { resource: 'cloud-run/fw-api', type: 'Cloud Run', tenant: 'FinalWishes', detected: '2 hours ago', severity: 'warning' },
            { resource: 'firestore-rules/fw', type: 'Firestore', tenant: 'FinalWishes', detected: '1 day ago', severity: 'info' },
            { resource: 'dns/assiduous.app', type: 'DNS', tenant: 'Assiduous', detected: '3 days ago', severity: 'critical' },
        ],
        environmentMatrix: [
            { tenant: 'FinalWishes', environment: 'Production', version: 'v6.0.5', status: 'operational', lastDeploy: '2 min ago' },
            { tenant: 'FinalWishes', environment: 'Staging', version: 'v6.0.5-rc1', status: 'operational', lastDeploy: '8 hours ago' },
            { tenant: 'Assiduous', environment: 'Production', version: '—', status: 'unknown', lastDeploy: 'Not deployed' },
            { tenant: 'Assiduous', environment: 'Staging', version: 'v1.2.0', status: 'degraded', lastDeploy: '2 hours ago' },
        ],
        cloudRunServices: [
            { name: 'fw-api', tenant: 'FinalWishes', instances: 2, maxInstances: 10, cpu: 45, memory: 62 },
            { name: 'fw-sign', tenant: 'FinalWishes', instances: 1, maxInstances: 5, cpu: 12, memory: 28 },
            { name: 'admin-service', tenant: 'Sirsi Core', instances: 1, maxInstances: 5, cpu: 8, memory: 35 },
        ],
        costByResource: [
            { name: 'Cloud Run', cost: 890 },
            { name: 'Cloud SQL', cost: 650 },
            { name: 'Firebase', cost: 320 },
            { name: 'Cloud Storage', cost: 180 },
            { name: 'Networking', cost: 150 },
            { name: 'Cloud KMS', cost: 80 },
            { name: 'Other', cost: 70 },
        ],
    }
}

export function getMockSecurityData(): SecurityData {
    return {
        mfaCompliance: [
            { tenant: 'FinalWishes', enrolled: 12, total: 14 },
            { tenant: 'Assiduous', enrolled: 3, total: 5 },
            { tenant: 'Sirsi Core', enrolled: 4, total: 4 },
        ],
        authActivity24h: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            successful: Math.floor(Math.random() * 20) + 5,
            failed: Math.floor(Math.random() * 3),
        })),
        vulnerabilityScore: { score: 82, critical: 0, high: 1, medium: 4, low: 12 },
        certificates: [
            { domain: 'sign.sirsi.ai', issuer: "Let's Encrypt", expiresAt: '2026-03-24', daysRemaining: 22, status: 'operational' },
            { domain: 'sirsi-sign.web.app', issuer: 'Google Trust', expiresAt: '2026-06-15', daysRemaining: 105, status: 'operational' },
            { domain: 'api.sirsi.ai', issuer: "Let's Encrypt", expiresAt: '2026-03-10', daysRemaining: 8, status: 'degraded' },
        ],
        secretRotationCompliance: 87,
        soc2Score: 91,
    }
}

export function getMockDatabaseData(): DatabaseData {
    return {
        connectionPools: [
            { database: 'fw-primary', active: 18, idle: 12, max: 100 },
            { database: 'fw-replica', active: 8, idle: 22, max: 100 },
        ],
        slowQueries: [
            { query: 'SELECT * FROM contracts WHERE tenant_id = ? AND status = ?', avgTime: 245, frequency: 42, lastSeen: '5 min ago' },
            { query: 'SELECT COUNT(*) FROM audit_log WHERE timestamp > ?', avgTime: 180, frequency: 18, lastSeen: '12 min ago' },
        ],
        replicationLag: [
            { replica: 'fw-replica-1', lagMs: 120 },
            { replica: 'fw-replica-2', lagMs: 85 },
        ],
        tableStats: [
            { name: 'users', rowCount: 1247, diskMB: 12, indexMB: 4, lastVacuum: '2 hours ago' },
            { name: 'contracts', rowCount: 892, diskMB: 45, indexMB: 8, lastVacuum: '3 hours ago' },
            { name: 'audit_log', rowCount: 45230, diskMB: 128, indexMB: 32, lastVacuum: '1 hour ago' },
        ],
        firestoreCollections: [
            { name: 'sessions', documentCount: 38, readsTrend: [120, 150, 130, 160, 140, 155, 145], writesTrend: [10, 12, 8, 15, 11, 13, 12] },
            { name: 'notifications', documentCount: 245, readsTrend: [80, 90, 85, 100, 95, 88, 92], writesTrend: [5, 8, 6, 7, 9, 6, 7] },
            { name: 'catalog', documentCount: 24, readsTrend: [200, 220, 210, 240, 230, 215, 225], writesTrend: [1, 0, 2, 1, 0, 1, 0] },
        ],
        backupStatus: [
            { database: 'fw-primary', lastBackup: '1 hour ago', status: 'operational', lastRestoreTest: '3 days ago' },
            { database: 'fw-replica', lastBackup: '1 hour ago', status: 'operational', lastRestoreTest: '3 days ago' },
        ],
    }
}

export function getMockFrontendData(): FrontendData {
    return {
        webVitals: [
            { name: 'LCP', value: 1.8, unit: 's', rating: 'good', thresholds: { good: 2.5, poor: 4.0 } },
            { name: 'FID', value: 45, unit: 'ms', rating: 'good', thresholds: { good: 100, poor: 300 } },
            { name: 'CLS', value: 0.05, unit: '', rating: 'good', thresholds: { good: 0.1, poor: 0.25 } },
        ],
        bundleSize: {
            current: 342, budget: 500,
            byModule: [
                { name: 'React + DOM', size: 128 },
                { name: 'Recharts', size: 85 },
                { name: 'Radix UI', size: 42 },
                { name: 'TanStack', size: 38 },
                { name: 'Firebase', size: 32 },
                { name: 'App Code', size: 17 },
            ],
        },
        pageInventory: [
            { route: '/', componentCount: 8, loadTimeMs: 420, errorRate: 0.1, traffic: 4500 },
            { route: '/users', componentCount: 12, loadTimeMs: 380, errorRate: 0.05, traffic: 1200 },
            { route: '/contracts', componentCount: 10, loadTimeMs: 520, errorRate: 0.2, traffic: 2800 },
            { route: '/tenants', componentCount: 15, loadTimeMs: 680, errorRate: 0.0, traffic: 800 },
            { route: '/security', componentCount: 14, loadTimeMs: 450, errorRate: 0.1, traffic: 600 },
        ],
        errorTracking: [
            { component: 'ContractTable', frequency: 3, affectedUsers: 2, severity: 'warning' },
            { component: 'MFAVerification', frequency: 1, affectedUsers: 1, severity: 'info' },
        ],
    }
}

export function getMockBackendData(): BackendData {
    return {
        apiEndpoints: [
            { method: 'POST', path: '/sirsi.admin.v2.AdminService/GetSystemOverview', requestCount: 4200, avgLatencyMs: 12, errorRate: 0.0, p95Trend: [15, 14, 12, 13, 12, 11, 12] },
            { method: 'POST', path: '/sirsi.admin.v2.AdminService/ListUsers', requestCount: 1800, avgLatencyMs: 18, errorRate: 0.1, p95Trend: [22, 20, 18, 19, 18, 17, 18] },
            { method: 'POST', path: '/sirsi.admin.v2.TenantService/ListTenants', requestCount: 920, avgLatencyMs: 8, errorRate: 0.0, p95Trend: [10, 9, 8, 9, 8, 8, 8] },
            { method: 'POST', path: '/sirsi.contracts.v2.ContractService/ListContracts', requestCount: 3100, avgLatencyMs: 24, errorRate: 0.2, p95Trend: [30, 28, 25, 24, 26, 24, 24] },
        ],
        serviceHealth: [
            { service: 'admin-service', status: 'operational', uptime: 99.98 },
            { service: 'fw-api', status: 'operational', uptime: 99.95 },
            { service: 'signing-service', status: 'operational', uptime: 99.90 },
        ],
        grpcThroughput: [
            { service: 'admin-service', rps: 142, trend: [120, 130, 135, 140, 138, 142, 142] },
            { service: 'fw-api', rps: 86, trend: [70, 75, 80, 82, 85, 84, 86] },
        ],
        goRuntime: { goroutines: 48, heapMB: 124, gcPauseMs: 0.8 },
        rateLimits: [
            { service: 'admin-service', used: 420, limit: 5000 },
            { service: 'fw-api', used: 1200, limit: 5000 },
        ],
    }
}

export function getMockIntegrationData(): IntegrationData {
    return {
        serviceHealth: [
            { name: 'Stripe', status: 'operational', lastCheck: '30s ago', responseTimeMs: 45 },
            { name: 'SendGrid', status: 'operational', lastCheck: '30s ago', responseTimeMs: 120 },
            { name: 'SigningService', status: 'operational', lastCheck: '30s ago', responseTimeMs: 85 },
            { name: 'Firebase Auth', status: 'operational', lastCheck: '30s ago', responseTimeMs: 22 },
            { name: 'Cloud KMS', status: 'operational', lastCheck: '30s ago', responseTimeMs: 18 },
            { name: 'Plaid', status: 'unknown', lastCheck: 'Not configured', responseTimeMs: 0 },
        ],
        webhooks: [
            { url: '/api/webhooks/stripe', eventTypes: ['payment_intent.succeeded', 'charge.refunded'], successRate: 99.8, avgResponseMs: 45, retryCount: 1 },
            { url: '/api/webhooks/signing', eventTypes: ['envelope.completed', 'envelope.voided'], successRate: 100, avgResponseMs: 38, retryCount: 0 },
        ],
        apiKeys: [
            { service: 'Stripe', expiresAt: '2026-12-31', daysRemaining: 304, rotationStatus: 'Current' },
            { service: 'SendGrid', expiresAt: '2026-09-15', daysRemaining: 197, rotationStatus: 'Current' },
            { service: 'GitHub PAT', expiresAt: '2026-04-01', daysRemaining: 30, rotationStatus: 'Rotation Needed' },
        ],
        scheduledJobs: [
            { name: 'Daily Backup', schedule: '0 2 * * *', lastRun: '2026-03-02 02:00', nextRun: '2026-03-03 02:00', status: 'operational' },
            { name: 'Cert Check', schedule: '0 */6 * * *', lastRun: '2026-03-02 18:00', nextRun: '2026-03-03 00:00', status: 'operational' },
            { name: 'Telemetry Snapshot', schedule: '*/5 * * * *', lastRun: '2026-03-02 23:55', nextRun: '2026-03-02 24:00', status: 'operational' },
        ],
    }
}

export function getMockCostData(): CostData {
    return {
        monthlyByService: [
            { service: 'Cloud Run', tenant: 'FinalWishes', cost: 520 },
            { service: 'Cloud Run', tenant: 'Assiduous', cost: 180 },
            { service: 'Cloud Run', tenant: 'Sirsi Core', cost: 190 },
            { service: 'Cloud SQL', tenant: 'FinalWishes', cost: 450 },
            { service: 'Cloud SQL', tenant: 'Sirsi Core', cost: 200 },
            { service: 'Firebase', tenant: 'FinalWishes', cost: 220 },
            { service: 'Firebase', tenant: 'Sirsi Core', cost: 100 },
            { service: 'Networking', tenant: 'All', cost: 150 },
            { service: 'Storage', tenant: 'All', cost: 180 },
            { service: 'Cloud KMS', tenant: 'All', cost: 80 },
        ],
        budgetVsActual: { budget: 5000, actual: 2340, forecast: 3800 },
        costTrend6m: [
            { month: 'Oct', finalwishes: 1800, assiduous: 200, sirsiCore: 600 },
            { month: 'Nov', finalwishes: 1900, assiduous: 280, sirsiCore: 620 },
            { month: 'Dec', finalwishes: 2100, assiduous: 350, sirsiCore: 650 },
            { month: 'Jan', finalwishes: 2200, assiduous: 400, sirsiCore: 680 },
            { month: 'Feb', finalwishes: 2050, assiduous: 380, sirsiCore: 700 },
            { month: 'Mar', finalwishes: 1560, assiduous: 280, sirsiCore: 500 },
        ],
        costPerUser: 1.87,
        idleResources: [
            { name: 'as-staging-worker', type: 'Cloud Run', monthlyCost: 45, recommendation: 'Scale to zero (no traffic in 14d)' },
            { name: 'legacy-backup-bucket', type: 'Cloud Storage', monthlyCost: 12, recommendation: 'Delete (CockroachDB decommissioned)' },
        ],
    }
}

export function getMockIncidentData(): IncidentData {
    return {
        openIncidents: [
            {
                id: 'inc_1', title: 'Elevated staging error rate',
                severity: 'warning', status: 'investigating',
                openedAt: '2026-03-02T20:45:00Z', tenant: 'Assiduous',
                assignee: 'Cylton Collymore',
                description: 'HTTP 500 responses spiking on Assiduous staging environment. Cloud Run logs show database connection timeouts.',
            },
        ],
        slaCompliance: { current: 99.95, target: 99.9, trend: [99.9, 99.92, 99.95, 99.93, 99.95, 99.95, 99.95] },
        incidentHistory: [
            {
                id: 'inc_0', title: 'Firebase Auth token refresh failure',
                severity: 'critical', status: 'resolved',
                openedAt: '2026-02-28T14:00:00Z', resolvedAt: '2026-02-28T14:22:00Z',
                tenant: 'FinalWishes', assignee: 'Cylton Collymore',
                description: 'Users unable to authenticate due to Firebase SDK initialization crash in production. Root cause: Firebase Auth 10.x breaking change.',
            },
        ],
        runbookLog: [
            { name: 'Restart Cloud Run', trigger: 'Manual', result: 'success', duration: '45s', timestamp: '2026-02-28T14:15:00Z' },
            { name: 'Clear Redis Cache', trigger: 'Auto (incident)', result: 'success', duration: '12s', timestamp: '2026-02-28T14:16:00Z' },
        ],
    }
}

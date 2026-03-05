/**
 * Hypervisor Data Hooks — TanStack Query (ADR-026)
 *
 * ALL 10 tabs now hit the Go backend via HypervisorService ConnectRPC.
 *
 * The ConnectRPC proto responses are mapped to the existing frontend
 * data shapes so no UI tab components need to change.
 */
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@connectrpc/connect'
import { HypervisorService } from '../gen/sirsi/admin/v2/hypervisor_service_pb'
import { transport } from '../lib/transport'
import type { TenantId } from '../components/instruments/TenantFilter'
import type { EnvironmentId } from '../components/instruments/EnvironmentFilter'

// ── ConnectRPC Client ─────────────────────────────────────────────
const hypervisorClient = createClient(HypervisorService as any, transport)

interface HypervisorFilters {
    tenant: TenantId
    environment: EnvironmentId
}

/** Build the proto filter from UI filter values */
function buildFilter(f: HypervisorFilters) {
    return {
        filter: {
            tenantId: f.tenant === 'all' ? '' : f.tenant,
            environment: f.environment === 'all' ? '' : f.environment,
        },
    }
}


// ── Tab 1: Overview ───────────────────────────────────────────────

export function useOverviewData(filters: HypervisorFilters) {
    const query = useQuery({
        queryKey: ['hypervisor', 'overview', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorOverview(buildFilter(filters))
            return {
                uptime: res.uptime ?? { current: 0, target: 99.9, trend: [] },
                deployments24h: res.deployments24h ?? { count: 0, trend: [] },
                cloudSpendMTD: {
                    current: res.cloudSpendMtd?.current ?? 0,
                    budget: res.cloudSpendMtd?.budget ?? 0,
                    trend: res.cloudSpendMtd?.trend ?? [],
                },
                tenants: (res.tenants ?? []).map((t: any) => ({
                    id: t.id, name: t.name, slug: t.slug, status: t.status,
                    environment: t.environment, uptime30d: t.uptime30d,
                    deployments24h: t.deployments24h, openIncidents: t.openIncidents,
                    uptimeTrend: t.uptimeTrend ?? [],
                })),
                recentActivity: (res.recentActivity ?? []).map((a: any) => ({
                    id: a.id, timestamp: a.timestamp, type: a.type,
                    tenant: a.tenant, message: a.message, severity: a.severity,
                })),
                openIncidents: (res.openIncidents ?? []).map((i: any) => ({
                    id: i.id, title: i.title, severity: i.severity, status: i.status,
                    openedAt: i.openedAt, tenant: i.tenant, assignee: i.assignee,
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 30_000,
    })

    // Preserve return shape for existing consumers (OverviewTab)
    return {
        overview: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
    }
}


// ── Tab 2: DevOps ─────────────────────────────────────────────────

export function useDevOpsData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'devops', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorDevOps(buildFilter(filters))
            return {
                deploymentFrequency: (res.deploymentFrequency ?? []).map((d: any) => ({
                    tenant: d.tenant, dailyCounts: d.dailyCounts ?? [],
                })),
                changeFailureRate: res.changeFailureRate ?? [],
                mttr: res.mttr ?? [],
                leadTime: res.leadTime ?? [],
                pipelineMatrix: (res.pipelineMatrix ?? []).map((p: any) => ({
                    tenant: p.tenant, environment: p.environment, status: p.status,
                    lastRun: p.lastRun, branch: p.branch,
                })),
                recentDeployments: (res.recentDeployments ?? []).map((d: any) => ({
                    id: d.id, sha: d.sha, tenant: d.tenant, environment: d.environment,
                    version: d.version, status: d.status, deployer: d.deployer,
                    duration: d.duration, timestamp: d.timestamp,
                })),
                buildHealth: (res.buildHealth ?? []).map((b: any) => ({
                    tenant: b.tenant, successRate: b.successRate, trend: b.trend ?? [],
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}


// ── Tab 3: Infrastructure ─────────────────────────────────────────

export function useInfrastructureData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'infrastructure', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorInfrastructure(buildFilter(filters))
            return {
                resources: {
                    inSync: res.resources?.inSync ?? 0,
                    drifted: res.resources?.drifted ?? 0,
                    pending: res.resources?.pending ?? 0,
                },
                driftItems: (res.driftItems ?? []).map((d: any) => ({
                    resource: d.resource, type: d.type, tenant: d.tenant,
                    detected: d.detected, severity: d.severity,
                })),
                environmentMatrix: (res.environmentMatrix ?? []).map((e: any) => ({
                    tenant: e.tenant, environment: e.environment, version: e.version,
                    status: e.status, lastDeploy: e.lastDeploy,
                })),
                cloudRunServices: (res.cloudRunServices ?? []).map((s: any) => ({
                    name: s.name, tenant: s.tenant, instances: s.instances,
                    maxInstances: s.maxInstances, cpu: s.cpu, memory: s.memory,
                })),
                costByResource: (res.costByResource ?? []).map((c: any) => ({
                    name: c.name, cost: c.cost,
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}


// ── Tab 4: Security ───────────────────────────────────────────────

export function useSecurityData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'security', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorSecurity(buildFilter(filters))
            return {
                mfaCompliance: (res.mfaCompliance ?? []).map((m: any) => ({
                    tenant: m.tenant, enrolled: m.enrolled, total: m.total,
                })),
                authActivity24h: (res.authActivity24h ?? []).map((a: any) => ({
                    hour: a.hour, successful: a.successful, failed: a.failed,
                })),
                vulnerabilityScore: {
                    score: res.vulnerabilityScore?.score ?? 0,
                    critical: res.vulnerabilityScore?.critical ?? 0,
                    high: res.vulnerabilityScore?.high ?? 0,
                    medium: res.vulnerabilityScore?.medium ?? 0,
                    low: res.vulnerabilityScore?.low ?? 0,
                },
                certificates: (res.certificates ?? []).map((c: any) => ({
                    domain: c.domain, issuer: c.issuer, expiresAt: c.expiresAt,
                    daysRemaining: c.daysRemaining, status: c.status,
                })),
                secretRotationCompliance: res.secretRotationCompliance ?? 0,
                soc2Score: res.soc2Score ?? 0,
            }
        },
        staleTime: 60_000,
        refetchInterval: 120_000,
    })
}


// ── Tab 5: Database ───────────────────────────────────────────────

export function useDatabaseData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'database', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorDatabase(buildFilter(filters))
            return {
                connectionPools: (res.connectionPools ?? []).map((c: any) => ({
                    database: c.database, active: c.active, idle: c.idle, max: c.max,
                })),
                slowQueries: (res.slowQueries ?? []).map((q: any) => ({
                    query: q.query, avgTime: q.avgTime, frequency: q.frequency, lastSeen: q.lastSeen,
                })),
                replicationLag: (res.replicationLag ?? []).map((r: any) => ({
                    replica: r.replica, lagMs: r.lagMs,
                })),
                tableStats: (res.tableStats ?? []).map((t: any) => ({
                    name: t.name, rowCount: t.rowCount, diskMB: t.diskMb,
                    indexMB: t.indexMb, lastVacuum: t.lastVacuum,
                })),
                firestoreCollections: (res.firestoreCollections ?? []).map((f: any) => ({
                    name: f.name, documentCount: f.documentCount,
                    readsTrend: f.readsTrend ?? [], writesTrend: f.writesTrend ?? [],
                })),
                backupStatus: (res.backupStatus ?? []).map((b: any) => ({
                    database: b.database, lastBackup: b.lastBackup,
                    status: b.status, lastRestoreTest: b.lastRestoreTest,
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 30_000,
    })
}


// ── Tab 6: Frontend ───────────────────────────────────────────────

export function useFrontendData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'frontend', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorFrontend(buildFilter(filters))
            return {
                webVitals: (res.webVitals ?? []).map((v: any) => ({
                    name: v.name, value: v.value, unit: v.unit, rating: v.rating,
                    thresholds: { good: v.thresholdGood, poor: v.thresholdPoor },
                })),
                bundleSize: {
                    current: res.bundleSize?.current ?? 0,
                    budget: res.bundleSize?.budget ?? 0,
                    byModule: (res.bundleSize?.byModule ?? []).map((m: any) => ({
                        name: m.name, size: m.size,
                    })),
                },
                pageInventory: (res.pageInventory ?? []).map((p: any) => ({
                    route: p.route, componentCount: p.componentCount,
                    loadTimeMs: p.loadTimeMs, errorRate: p.errorRate, traffic: p.traffic,
                })),
                errorTracking: (res.errorTracking ?? []).map((e: any) => ({
                    component: e.component, frequency: e.frequency,
                    affectedUsers: e.affectedUsers, severity: e.severity,
                })),
            }
        },
        staleTime: 60_000,
    })
}


// ── Tab 7: Backend ────────────────────────────────────────────────

export function useBackendData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'backend', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorBackend(buildFilter(filters))
            return {
                apiEndpoints: (res.apiEndpoints ?? []).map((e: any) => ({
                    method: e.method, path: e.path, requestCount: e.requestCount,
                    avgLatencyMs: e.avgLatencyMs, errorRate: e.errorRate,
                    p95Trend: e.p95Trend ?? [],
                })),
                serviceHealth: (res.serviceHealth ?? []).map((s: any) => ({
                    service: s.service, status: s.status, uptime: s.uptime,
                })),
                grpcThroughput: (res.grpcThroughput ?? []).map((g: any) => ({
                    service: g.service, rps: g.rps, trend: g.trend ?? [],
                })),
                goRuntime: {
                    goroutines: res.goRuntime?.goroutines ?? 0,
                    heapMB: res.goRuntime?.heapMb ?? 0,
                    gcPauseMs: res.goRuntime?.gcPauseMs ?? 0,
                },
                rateLimits: (res.rateLimits ?? []).map((r: any) => ({
                    service: r.service, used: r.used, limit: r.limit,
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 30_000,
    })
}


// ── Tab 8: Integrations ───────────────────────────────────────────

export function useIntegrationData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'integrations', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorIntegrations(buildFilter(filters))
            return {
                serviceHealth: (res.serviceHealth ?? []).map((s: any) => ({
                    name: s.name, status: s.status, lastCheck: s.lastCheck,
                    responseTimeMs: s.responseTimeMs,
                })),
                webhooks: (res.webhooks ?? []).map((w: any) => ({
                    url: w.url, eventTypes: w.eventTypes ?? [],
                    successRate: w.successRate, avgResponseMs: w.avgResponseMs,
                    retryCount: w.retryCount,
                })),
                apiKeys: (res.apiKeys ?? []).map((k: any) => ({
                    service: k.service, expiresAt: k.expiresAt,
                    daysRemaining: k.daysRemaining, rotationStatus: k.rotationStatus,
                })),
                scheduledJobs: (res.scheduledJobs ?? []).map((j: any) => ({
                    name: j.name, schedule: j.schedule, lastRun: j.lastRun,
                    nextRun: j.nextRun, status: j.status,
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}


// ── Tab 9: Cost ───────────────────────────────────────────────────

export function useCostData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'cost', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorCost(buildFilter(filters))
            return {
                monthlyByService: (res.monthlyByService ?? []).map((s: any) => ({
                    service: s.service, tenant: s.tenant, cost: s.cost,
                })),
                budgetVsActual: {
                    budget: res.budgetVsActual?.budget ?? 0,
                    actual: res.budgetVsActual?.actual ?? 0,
                    forecast: res.budgetVsActual?.forecast ?? 0,
                },
                costTrend6m: (res.costTrend6m ?? []).map((m: any) => ({
                    month: m.month, finalwishes: m.finalwishes,
                    assiduous: m.assiduous, sirsiCore: m.sirsiCore,
                })),
                costPerUser: res.costPerUser ?? 0,
                idleResources: (res.idleResources ?? []).map((r: any) => ({
                    name: r.name, type: r.type, monthlyCost: r.monthlyCost,
                    recommendation: r.recommendation,
                })),
            }
        },
        staleTime: 300_000,
    })
}


// ── Tab 10: Incidents ─────────────────────────────────────────────

export function useIncidentData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'incidents', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorIncidents(buildFilter(filters))
            return {
                openIncidents: (res.openIncidents ?? []).map((i: any) => ({
                    id: i.id, title: i.title, severity: i.severity, status: i.status,
                    openedAt: i.openedAt, resolvedAt: i.resolvedAt, tenant: i.tenant,
                    assignee: i.assignee, description: i.description,
                })),
                slaCompliance: {
                    current: res.slaCompliance?.current ?? 0,
                    target: res.slaCompliance?.target ?? 99.9,
                    trend: res.slaCompliance?.trend ?? [],
                },
                incidentHistory: (res.incidentHistory ?? []).map((i: any) => ({
                    id: i.id, title: i.title, severity: i.severity, status: i.status,
                    openedAt: i.openedAt, resolvedAt: i.resolvedAt, tenant: i.tenant,
                    assignee: i.assignee, description: i.description,
                })),
                runbookLog: (res.runbookLog ?? []).map((r: any) => ({
                    name: r.name, trigger: r.trigger, result: r.result,
                    duration: r.duration, timestamp: r.timestamp,
                })),
            }
        },
        staleTime: 10_000,
        refetchInterval: 15_000,
    })
}

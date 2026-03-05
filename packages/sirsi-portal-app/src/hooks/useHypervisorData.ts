/**
 * Hypervisor Data Hooks — TanStack Query (ADR-026)
 *
 * Three-tier data architecture:
 * - TIER 1 (LIVE): Delegates to existing useAdminService/useTenantService hooks
 * - TIER 2 (LIVE — Sprint 8): Overview, DevOps, Security via HypervisorService ConnectRPC
 * - TIER 3 (MOCK): Uses contract-first mock data from hypervisor-mock.ts
 *
 * Tabs 1, 2, 4 now hit the Go backend (HypervisorService).
 * Tabs 3, 5–10 remain Tier 3 mock until Go handlers ship.
 */
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@connectrpc/connect'
import { HypervisorService } from '../gen/sirsi/admin/v2/hypervisor_service_pb'
import { transport } from '../lib/transport'
import {
    getMockInfrastructureData,
    getMockDatabaseData,
    getMockFrontendData,
    getMockBackendData,
    getMockIntegrationData,
    getMockCostData,
    getMockIncidentData,
} from '../data/hypervisor-mock'
import type { TenantId } from '../components/instruments/TenantFilter'
import type { EnvironmentId } from '../components/instruments/EnvironmentFilter'

// ── ConnectRPC Client ─────────────────────────────────────────────
const hypervisorClient = createClient(HypervisorService as any, transport)

interface HypervisorFilters {
    tenant: TenantId
    environment: EnvironmentId
}

// ── Tab 1: Overview (TIER 2 — LIVE via HypervisorService) ─────────

export function useOverviewData(filters: HypervisorFilters) {
    const query = useQuery({
        queryKey: ['hypervisor', 'overview', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorOverview({
                filter: {
                    tenantId: filters.tenant === 'all' ? '' : filters.tenant,
                    environment: filters.environment === 'all' ? '' : filters.environment,
                },
            })
            // Map proto response → frontend shape
            return {
                uptime: res.uptime ?? { current: 0, target: 99.9, trend: [] },
                deployments24h: res.deployments24h ?? { count: 0, trend: [] },
                cloudSpendMTD: {
                    current: res.cloudSpendMtd?.current ?? 0,
                    budget: res.cloudSpendMtd?.budget ?? 0,
                    trend: res.cloudSpendMtd?.trend ?? [],
                },
                tenants: (res.tenants ?? []).map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    slug: t.slug,
                    status: t.status,
                    environment: t.environment,
                    uptime30d: t.uptime30d,
                    deployments24h: t.deployments24h,
                    openIncidents: t.openIncidents,
                    uptimeTrend: t.uptimeTrend ?? [],
                })),
                recentActivity: (res.recentActivity ?? []).map((a: any) => ({
                    id: a.id,
                    timestamp: a.timestamp,
                    type: a.type,
                    tenant: a.tenant,
                    message: a.message,
                    severity: a.severity,
                })),
                openIncidents: (res.openIncidents ?? []).map((i: any) => ({
                    id: i.id,
                    title: i.title,
                    severity: i.severity,
                    status: i.status,
                    openedAt: i.openedAt,
                    tenant: i.tenant,
                    assignee: i.assignee,
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

// ── Tab 2: DevOps (TIER 2 — LIVE via HypervisorService) ──────────

export function useDevOpsData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'devops', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorDevOps({
                filter: {
                    tenantId: filters.tenant === 'all' ? '' : filters.tenant,
                    environment: filters.environment === 'all' ? '' : filters.environment,
                },
            })
            return {
                deploymentFrequency: (res.deploymentFrequency ?? []).map((d: any) => ({
                    tenant: d.tenant,
                    dailyCounts: d.dailyCounts ?? [],
                })),
                changeFailureRate: res.changeFailureRate ?? [],
                mttr: res.mttr ?? [],
                leadTime: res.leadTime ?? [],
                pipelineMatrix: (res.pipelineMatrix ?? []).map((p: any) => ({
                    tenant: p.tenant,
                    environment: p.environment,
                    status: p.status,
                    lastRun: p.lastRun,
                    branch: p.branch,
                })),
                recentDeployments: (res.recentDeployments ?? []).map((d: any) => ({
                    id: d.id,
                    sha: d.sha,
                    tenant: d.tenant,
                    environment: d.environment,
                    version: d.version,
                    status: d.status,
                    deployer: d.deployer,
                    duration: d.duration,
                    timestamp: d.timestamp,
                })),
                buildHealth: (res.buildHealth ?? []).map((b: any) => ({
                    tenant: b.tenant,
                    successRate: b.successRate,
                    trend: b.trend ?? [],
                })),
            }
        },
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}

// ── Tab 3: Infrastructure (TIER 3 — mock) ─────────────────────────

export function useInfrastructureData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'infrastructure', _filters.tenant, _filters.environment],
        queryFn: () => getMockInfrastructureData(),
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}

// ── Tab 4: Security (TIER 2 — LIVE via HypervisorService) ─────────

export function useSecurityData(filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'security', filters.tenant, filters.environment],
        queryFn: async () => {
            const res = await (hypervisorClient as any).getHypervisorSecurity({
                filter: {
                    tenantId: filters.tenant === 'all' ? '' : filters.tenant,
                    environment: filters.environment === 'all' ? '' : filters.environment,
                },
            })
            return {
                mfaCompliance: (res.mfaCompliance ?? []).map((m: any) => ({
                    tenant: m.tenant,
                    enrolled: m.enrolled,
                    total: m.total,
                })),
                authActivity24h: (res.authActivity24h ?? []).map((a: any) => ({
                    hour: a.hour,
                    successful: a.successful,
                    failed: a.failed,
                })),
                vulnerabilityScore: {
                    score: res.vulnerabilityScore?.score ?? 0,
                    critical: res.vulnerabilityScore?.critical ?? 0,
                    high: res.vulnerabilityScore?.high ?? 0,
                    medium: res.vulnerabilityScore?.medium ?? 0,
                    low: res.vulnerabilityScore?.low ?? 0,
                },
                certificates: (res.certificates ?? []).map((c: any) => ({
                    domain: c.domain,
                    issuer: c.issuer,
                    expiresAt: c.expiresAt,
                    daysRemaining: c.daysRemaining,
                    status: c.status,
                })),
                secretRotationCompliance: res.secretRotationCompliance ?? 0,
                soc2Score: res.soc2Score ?? 0,
            }
        },
        staleTime: 60_000,
        refetchInterval: 120_000,
    })
}

// ── Tab 5: Database (TIER 3 — needs Cloud SQL monitoring) ─────────

export function useDatabaseData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'database', _filters.tenant, _filters.environment],
        queryFn: () => getMockDatabaseData(),
        staleTime: 30_000,
        refetchInterval: 30_000,
    })
}

// ── Tab 6: Frontend (TIER 3 — needs RUM + build pipeline) ─────────

export function useFrontendData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'frontend', _filters.tenant, _filters.environment],
        queryFn: () => getMockFrontendData(),
        staleTime: 60_000,
    })
}

// ── Tab 7: Backend (TIER 3 — needs APM integration) ───────────────

export function useBackendData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'backend', _filters.tenant, _filters.environment],
        queryFn: () => getMockBackendData(),
        staleTime: 30_000,
        refetchInterval: 30_000,
    })
}

// ── Tab 8: Integrations (TIER 3 — needs HTTP health pings) ────────

export function useIntegrationData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'integrations', _filters.tenant, _filters.environment],
        queryFn: () => getMockIntegrationData(),
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}

// ── Tab 9: Cost (TIER 3 — needs BigQuery billing export) ──────────

export function useCostData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'cost', _filters.tenant, _filters.environment],
        queryFn: () => getMockCostData(),
        staleTime: 300_000,
    })
}

// ── Tab 10: Incidents (TIER 3 — needs incident tracking) ──────────

export function useIncidentData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'incidents', _filters.tenant, _filters.environment],
        queryFn: () => getMockIncidentData(),
        staleTime: 10_000,
        refetchInterval: 15_000,
    })
}

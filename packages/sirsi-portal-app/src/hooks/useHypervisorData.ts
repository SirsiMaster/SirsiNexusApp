/**
 * Hypervisor Data Hooks — TanStack Query (ADR-026)
 *
 * Three-tier data architecture:
 * - TIER 1 (LIVE): Delegates to existing useAdminService/useTenantService hooks
 * - TIER 2 (BUILDABLE): Will connect to HypervisorService when Go handlers ship
 * - TIER 3 (MOCK): Uses contract-first mock data from hypervisor-mock.ts
 *
 * Swapping from mock → live is a single queryFn change per hook.
 */
import { useQuery } from '@tanstack/react-query'
import { useSystemOverview } from './useAdminService'
import { useTenants } from './useTenantService'
import {
    getMockOverviewData,
    getMockDevOpsData,
    getMockInfrastructureData,
    getMockSecurityData,
    getMockDatabaseData,
    getMockFrontendData,
    getMockBackendData,
    getMockIntegrationData,
    getMockCostData,
    getMockIncidentData,
} from '../data/hypervisor-mock'
import type { TenantId } from '../components/instruments/TenantFilter'
import type { EnvironmentId } from '../components/instruments/EnvironmentFilter'

interface HypervisorFilters {
    tenant: TenantId
    environment: EnvironmentId
}

// ── Tab 1: Overview (TIER 1 + TIER 3 hybrid) ─────────────────────

export function useOverviewData(_filters: HypervisorFilters) {
    // TIER 1: Live data from existing ConnectRPC hooks (non-blocking)
    const systemOverview = useSystemOverview()
    const tenantsList = useTenants()

    // TIER 3: Mock data for instruments not yet backed by Go handlers
    const mockData = useQuery({
        queryKey: ['hypervisor', 'overview', _filters.tenant, _filters.environment],
        queryFn: () => getMockOverviewData(),
        staleTime: 30_000,
        refetchInterval: 30_000,
    })

    return {
        // Composite: merge live + mock
        overview: mockData.data,
        systemOverview: systemOverview.data,
        tenants: tenantsList.data,
        // Mock data is sufficient to render — TIER 1 enriches when available
        isLoading: mockData.isLoading,
        isError: mockData.isError,
    }
}

// ── Tab 2: DevOps (TIER 3 — needs GitHub Actions + deploy history) ─

export function useDevOpsData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'devops', _filters.tenant, _filters.environment],
        queryFn: () => getMockDevOpsData(),
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}

// ── Tab 3: Infrastructure (TIER 2/3 hybrid) ───────────────────────

export function useInfrastructureData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'infrastructure', _filters.tenant, _filters.environment],
        queryFn: () => getMockInfrastructureData(),
        staleTime: 30_000,
        refetchInterval: 60_000,
    })
}

// ── Tab 4: Security (TIER 2/3 hybrid) ─────────────────────────────

export function useSecurityData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'security', _filters.tenant, _filters.environment],
        queryFn: () => getMockSecurityData(),
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

// ── Tab 7: Backend (TIER 2/3 hybrid) ──────────────────────────────

export function useBackendData(_filters: HypervisorFilters) {
    return useQuery({
        queryKey: ['hypervisor', 'backend', _filters.tenant, _filters.environment],
        queryFn: () => getMockBackendData(),
        staleTime: 30_000,
        refetchInterval: 30_000,
    })
}

// ── Tab 8: Integrations (TIER 2 — HTTP health pings) ──────────────

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

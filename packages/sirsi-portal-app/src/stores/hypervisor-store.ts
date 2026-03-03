/**
 * Hypervisor Global State — Zustand Store (ADR-026)
 * Persists filters across tab switches. Single source of truth for cockpit state.
 */
import { create } from 'zustand'
import type { TenantId } from '../components/instruments/TenantFilter'
import type { EnvironmentId } from '../components/instruments/EnvironmentFilter'

export type TimeRange = '1h' | '24h' | '7d' | '30d'

interface HypervisorStore {
    selectedTenant: TenantId
    selectedEnvironment: EnvironmentId
    activeTab: string
    timeRange: TimeRange
    setTenant: (tenant: TenantId) => void
    setEnvironment: (env: EnvironmentId) => void
    setTab: (tab: string) => void
    setTimeRange: (range: TimeRange) => void
}

export const useHypervisorStore = create<HypervisorStore>((set) => ({
    selectedTenant: 'all',
    selectedEnvironment: 'all',
    activeTab: 'overview',
    timeRange: '24h',
    setTenant: (tenant) => set({ selectedTenant: tenant }),
    setEnvironment: (env) => set({ selectedEnvironment: env }),
    setTab: (tab) => set({ activeTab: tab }),
    setTimeRange: (range) => set({ timeRange: range }),
}))

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { contractsClient } from '../lib/grpc'
import { calculateTotal } from '../data/catalog'

export type TabId = 'summary' | 'configure' | 'sow' | 'cost' | 'msa' | 'vault'

interface ConfigState {
    // Project info
    projectName: string
    companyName: string
    projectId: string
    contractId: string | null

    // Client info
    clientName: string
    clientEmail: string

    // Entity / Counterparty info
    entityLegalName: string
    counterpartyName: string
    counterpartyTitle: string

    // Navigation state
    currentTab: TabId
    visitedTabs: TabId[]

    // Configuration state
    selectedBundle: string | null
    selectedAddons: string[]
    ceoConsultingWeeks: number
    probateStates: string[]

    // System settings from Admin
    sirsiMultiplier: number
    maintenanceMode: boolean

    // Actions
    setCurrentTab: (tab: TabId) => void
    setProjectId: (id: string) => void
    setContractId: (id: string | null) => void
    setClientInfo: (name: string, email: string) => void
    setCounterpartyInfo: (entity: string, name: string, title: string) => void
    setSelectedBundle: (id: string | null) => void
    toggleAddon: (id: string) => void
    setCeoConsultingWeeks: (weeks: number) => void
    toggleProbateState: (state: string) => void
    markTabVisited: (tab: TabId) => void
    setSystemSettings: (settings: { multiplier: number, maintenanceMode: boolean }) => void
    fetchContract: (id: string) => Promise<void>
    syncConfig: () => Promise<void>
    resetConfig: () => void
}

const initialState = {
    projectName: 'FinalWishes',
    companyName: '111 Venture Studio',
    projectId: 'finalwishes',
    contractId: null,
    clientName: '',
    clientEmail: '',
    entityLegalName: 'Sirsi Technologies, Inc.',
    counterpartyName: 'Cylton Collymore',
    counterpartyTitle: 'CEO',
    currentTab: 'summary' as TabId,
    visitedTabs: ['summary'] as TabId[],
    selectedBundle: null,
    selectedAddons: [],
    ceoConsultingWeeks: 1,
    probateStates: [] as string[],
    sirsiMultiplier: 2.0, // Default to 2.0x as per Rule 13
    maintenanceMode: false,
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set, get) => ({
            ...initialState,

            setCurrentTab: (tab) => {
                set({ currentTab: tab })
                // Mark as visited
                const visited = get().visitedTabs
                if (!visited.includes(tab)) {
                    set({ visitedTabs: [...visited, tab] })
                }
                // Scroll to top of content
                setTimeout(() => {
                    const mainContent = document.querySelector('.main-content')
                    if (mainContent) {
                        mainContent.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 50)
            },

            setProjectId: (id) => set({ projectId: id }),

            setContractId: (id) => set({ contractId: id }),

            setClientInfo: (name, email) => set({
                clientName: name,
                clientEmail: email
            }),

            setCounterpartyInfo: (entity, name, title) => set({
                entityLegalName: entity,
                counterpartyName: name,
                counterpartyTitle: title
            }),

            setSelectedBundle: (id) => set({ selectedBundle: id }),

            toggleAddon: (id) => set((state) => ({
                selectedAddons: state.selectedAddons.includes(id)
                    ? state.selectedAddons.filter(a => a !== id)
                    : [...state.selectedAddons, id]
            })),

            setCeoConsultingWeeks: (weeks) => set({ ceoConsultingWeeks: Math.max(1, Math.min(52, weeks)) }),

            toggleProbateState: (state) => set((s) => ({
                probateStates: s.probateStates.includes(state)
                    ? s.probateStates.filter(st => st !== state)
                    : [...s.probateStates, state]
            })),

            markTabVisited: (tab) => set((state) => ({
                visitedTabs: state.visitedTabs.includes(tab)
                    ? state.visitedTabs
                    : [...state.visitedTabs, tab]
            })),

            setSystemSettings: (settings) => set({
                sirsiMultiplier: settings.multiplier || 2.0,
                maintenanceMode: settings.maintenanceMode || false
            }),

            fetchContract: async (id: string) => {
                try {
                    const contract = await contractsClient.getContract({ id });
                    if (contract) {
                        const updates: Partial<ConfigState> = {
                            contractId: contract.id,
                            clientName: contract.clientName,
                            clientEmail: contract.clientEmail,
                            projectId: contract.projectId,
                            projectName: contract.projectName,
                        };

                        // Re-hydrate selections if present in metadata
                        // @ts-ignore - access injected selections from Firestore
                        const selections = contract.selections;
                        if (selections) {
                            if (selections.bundle) updates.selectedBundle = selections.bundle;
                            if (selections.addons) updates.selectedAddons = selections.addons;
                            if (selections.ceoConsultingWeeks) updates.ceoConsultingWeeks = selections.ceoConsultingWeeks;
                            if (selections.probateStates) updates.probateStates = selections.probateStates;
                        }

                        set(updates);
                        console.log(`✅ State re-hydrated from contract ${id}`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to fetch contract ${id}:`, error);
                }
            },

            syncConfig: async () => {
                const state = get()
                if (!state.contractId) {
                    console.warn('Cannot sync config: No contractId available')
                    return
                }

                try {
                    console.log(`🔄 Syncing configuration for contract ${state.contractId}...`)

                    const totalResult = calculateTotal(
                        state.selectedBundle,
                        state.selectedAddons,
                        state.ceoConsultingWeeks,
                        state.probateStates.length,
                        state.sirsiMultiplier
                    )

                    await contractsClient.updateContract({
                        id: state.contractId,
                        contract: {
                            // Convert total to cents for gRPC int64
                            totalAmount: BigInt(Math.round(totalResult.total * 100)),
                            // @ts-ignore - Injecting metadata to Firestore
                            selections: {
                                bundle: state.selectedBundle,
                                addons: state.selectedAddons,
                                ceoConsultingWeeks: state.ceoConsultingWeeks,
                                probateStates: state.probateStates
                            }
                        }
                    })
                    console.log('✅ Configuration synced to Sirsi Ledger')
                } catch (error) {
                    console.error('❌ Failed to sync configuration:', error)
                }
            },

            resetConfig: () => set(initialState),
        }),
        {
            name: 'sirsi-config-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

// Tab configuration
export const TABS: { id: TabId; label: string }[] = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'configure', label: 'Configure Solution' },
    { id: 'sow', label: 'Statement of Work' },
    { id: 'cost', label: 'Cost & Valuation' },
    { id: 'msa', label: 'Master Agreement' },
    { id: 'vault', label: 'Sirsi Vault' },
]

// Tab order for navigation
export const TAB_ORDER: TabId[] = ['summary', 'configure', 'sow', 'cost', 'msa', 'vault']

export function getNextTab(current: TabId): TabId | null {
    const idx = TAB_ORDER.indexOf(current)
    return idx < TAB_ORDER.length - 1 ? TAB_ORDER[idx + 1] : null
}

export function getPrevTab(current: TabId): TabId | null {
    const idx = TAB_ORDER.indexOf(current)
    return idx > 0 ? TAB_ORDER[idx - 1] : null
}

// Selector hooks
export const useCurrentTab = () => useConfigStore((state) => state.currentTab)
export const useVisitedTabs = () => useConfigStore((state) => state.visitedTabs)
export const useSetTab = () => useConfigStore((state) => state.setCurrentTab)
export const useSyncConfig = () => useConfigStore((state) => state.syncConfig)

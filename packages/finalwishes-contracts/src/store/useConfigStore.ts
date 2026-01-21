import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type TabId = 'summary' | 'configure' | 'sow' | 'cost' | 'msa' | 'vault'

interface ConfigState {
    // Project info
    projectName: string
    companyName: string

    // Client info
    clientName: string
    clientEmail: string

    // Navigation state
    currentTab: TabId
    visitedTabs: TabId[]

    // Configuration state
    selectedBundle: string | null
    selectedAddons: string[]

    // Actions
    setCurrentTab: (tab: TabId) => void
    setClientInfo: (name: string, email: string) => void
    setSelectedBundle: (id: string | null) => void
    toggleAddon: (id: string) => void
    markTabVisited: (tab: TabId) => void
    resetConfig: () => void
}

const initialState = {
    projectName: 'FinalWishes',
    companyName: '111 Venture Studio',
    clientName: '',
    clientEmail: '',
    currentTab: 'summary' as TabId,
    visitedTabs: ['summary'] as TabId[],
    selectedBundle: null,
    selectedAddons: [],
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
            },

            setClientInfo: (name, email) => set({
                clientName: name,
                clientEmail: email
            }),

            setSelectedBundle: (id) => set({ selectedBundle: id }),

            toggleAddon: (id) => set((state) => ({
                selectedAddons: state.selectedAddons.includes(id)
                    ? state.selectedAddons.filter(a => a !== id)
                    : [...state.selectedAddons, id]
            })),

            markTabVisited: (tab) => set((state) => ({
                visitedTabs: state.visitedTabs.includes(tab)
                    ? state.visitedTabs
                    : [...state.visitedTabs, tab]
            })),

            resetConfig: () => set(initialState),
        }),
        {
            name: 'finalwishes-config',
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

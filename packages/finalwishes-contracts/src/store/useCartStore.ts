import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    id: string
    name: string
    price: number
    timeline: number
    type: 'bundle' | 'addon'
}

interface CartState {
    // State
    bundleId: string | null
    addonIds: string[]
    paymentPlan: 2 | 3 | 4 | null

    // Actions
    setBundleId: (id: string | null) => void
    addAddon: (id: string) => void
    removeAddon: (id: string) => void
    toggleAddon: (id: string) => void
    setPaymentPlan: (plan: 2 | 3 | 4) => void
    clearCart: () => void
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // Initial state
            bundleId: null,
            addonIds: [],
            paymentPlan: null,

            // Actions
            setBundleId: (id) => set({ bundleId: id }),

            addAddon: (id) => set((state) => ({
                addonIds: state.addonIds.includes(id)
                    ? state.addonIds
                    : [...state.addonIds, id]
            })),

            removeAddon: (id) => set((state) => ({
                addonIds: state.addonIds.filter((addonId) => addonId !== id)
            })),

            toggleAddon: (id) => {
                const { addonIds } = get()
                if (addonIds.includes(id)) {
                    set({ addonIds: addonIds.filter((addonId) => addonId !== id) })
                } else {
                    set({ addonIds: [...addonIds, id] })
                }
            },

            setPaymentPlan: (plan) => set({ paymentPlan: plan }),

            clearCart: () => set({
                bundleId: null,
                addonIds: [],
                paymentPlan: null
            }),
        }),
        {
            name: 'finalwishes-cart',
            storage: createJSONStorage(() => localStorage),
        }
    )
)

// Selector hooks for performance (prevents unnecessary re-renders)
export const useCartBundleId = () => useCartStore((state) => state.bundleId)
export const useCartAddonIds = () => useCartStore((state) => state.addonIds)
export const useCartPaymentPlan = () => useCartStore((state) => state.paymentPlan)

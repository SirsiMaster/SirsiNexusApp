import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PRODUCTS, BUNDLES } from '../data/catalog';
import type { Product, Bundle } from '../data/catalog';
import { TEMPLATES } from '../data/projectTemplates';
import type { ProjectTemplate } from '../data/projectTemplates';

interface GovernanceState {
    products: Record<string, Product>;
    bundles: Record<string, Bundle>;
    templates: Record<string, ProjectTemplate>;

    // Actions
    updateProduct: (id: string, product: Partial<Product>) => void;
    addProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;

    updateBundle: (id: string, bundle: Partial<Bundle>) => void;
    addBundle: (bundle: Bundle) => void;

    updateTemplate: (key: string, template: Partial<ProjectTemplate>) => void;
    addTemplate: (template: ProjectTemplate) => void;

    resetToDefaults: () => void;
}

export const useGovernanceStore = create<GovernanceState>()(
    persist(
        (set) => ({
            products: { ...PRODUCTS },
            bundles: { ...BUNDLES },
            templates: { ...TEMPLATES },

            updateProduct: (id, updates) => set((state) => ({
                products: {
                    ...state.products,
                    [id]: { ...state.products[id], ...updates }
                }
            })),

            addProduct: (product) => set((state) => ({
                products: { ...state.products, [product.id]: product }
            })),

            deleteProduct: (id) => set((state) => {
                const newProducts = { ...state.products };
                delete newProducts[id];
                return { products: newProducts };
            }),

            updateBundle: (id, updates) => set((state) => ({
                bundles: {
                    ...state.bundles,
                    [id]: { ...state.bundles[id], ...updates }
                }
            })),

            addBundle: (bundle) => set((state) => ({
                bundles: { ...state.bundles, [bundle.id]: bundle }
            })),

            updateTemplate: (key, updates) => set((state) => ({
                templates: {
                    ...state.templates,
                    [key]: { ...state.templates[key], ...updates }
                }
            })),

            addTemplate: (template) => set((state) => ({
                templates: { ...state.templates, [template.key]: template }
            })),

            resetToDefaults: () => set({
                products: { ...PRODUCTS },
                bundles: { ...BUNDLES },
                templates: { ...TEMPLATES }
            })
        }),
        {
            name: 'sirsi-governance-cache',
        }
    )
);

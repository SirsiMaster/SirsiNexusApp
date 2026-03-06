# FinalWishes Contracts App - React Migration Plan
**Date:** January 19, 2026  
**Status:** APPROVED - READY FOR IMPLEMENTATION  
**Stack:** React 18 + Vite + TypeScript + Zustand + TailwindCSS

---

## 1. Project Overview

### Current State
- **Location:** `/packages/sirsi-opensign/public/finalwishes/contracts/index.html`
- **Size:** 7,200+ lines, 405KB single file
- **Problems:** Monolithic, fragile, hard to maintain

### Target State
- **Location:** `/packages/finalwishes-contracts/` (new package in monorepo)
- **Structure:** Component-based React application
- **Build Output:** Static files served alongside OpenSign

---

## 2. Technology Stack (Per SIRSI_RULES.md)

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5+ |
| **Language** | TypeScript |
| **State Management** | Zustand |
| **Styling** | TailwindCSS + Custom CSS (Royal Neo-Deco) |
| **Routing** | React Router v6 (hash routing for static hosting) |
| **Forms** | React Hook Form (for signature) |
| **HTTP** | Native fetch (gRPC-Web for future) |

---

## 3. Project Structure

```
/packages/finalwishes-contracts/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── index.html
│
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Root component with routing
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Partnership Agreement header
│   │   │   ├── TabNavigation.tsx   # 6-tab navigation bar
│   │   │   └── PageWrapper.tsx     # Common page layout
│   │   │
│   │   ├── tabs/
│   │   │   ├── ExecutiveSummary.tsx
│   │   │   ├── ConfigureSolution.tsx
│   │   │   ├── StatementOfWork.tsx
│   │   │   ├── CostValuation.tsx
│   │   │   ├── MasterAgreement.tsx
│   │   │   └── SirsiVault.tsx
│   │   │
│   │   ├── configure/              # Configure tab sub-components
│   │   │   ├── PathSelection.tsx   # Bundle vs Standalone cards
│   │   │   ├── AddonGrid.tsx       # Add-on module cards
│   │   │   └── SelectionSummary.tsx
│   │   │
│   │   ├── sow/                    # SOW tab sub-components
│   │   │   ├── SOWDocument.tsx     # Full document wrapper
│   │   │   ├── SOWSection.tsx      # Reusable section component
│   │   │   └── DynamicScope.tsx    # Cart-based scope
│   │   │
│   │   ├── cost/                   # Cost tab sub-components
│   │   │   ├── MarketAnalysis.tsx
│   │   │   ├── AtomicBreakdown.tsx
│   │   │   ├── ValueRealization.tsx
│   │   │   ├── TechBOM.tsx
│   │   │   └── PaymentSchedule.tsx
│   │   │
│   │   ├── msa/                    # MSA tab sub-components
│   │   │   ├── MSADocument.tsx
│   │   │   ├── MSASection.tsx
│   │   │   ├── AppendixSOW.tsx
│   │   │   └── AppendixCost.tsx
│   │   │
│   │   ├── vault/                  # Vault tab sub-components
│   │   │   ├── SignatureBlock.tsx  # OpenSign integration
│   │   │   ├── PaymentBlock.tsx    # Stripe integration
│   │   │   └── CompletionScreen.tsx
│   │   │
│   │   └── ui/                     # Shared UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── GlassPanel.tsx
│   │       ├── Badge.tsx
│   │       ├── PriceDisplay.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── store/
│   │   ├── useCartStore.ts         # Zustand: cart state
│   │   ├── useConfigStore.ts       # Zustand: project config
│   │   └── usePaymentStore.ts      # Zustand: payment state
│   │
│   ├── hooks/
│   │   ├── useOfferings.ts         # Hook for catalog data
│   │   ├── useCart.ts              # Hook for cart operations
│   │   ├── usePricing.ts           # Hook for price calculations
│   │   └── useStripe.ts            # Hook for Stripe operations
│   │
│   ├── data/
│   │   ├── catalog.ts              # Product/bundle definitions
│   │   ├── msa-content.ts          # MSA legal text
│   │   └── constants.ts            # App constants
│   │
│   ├── lib/
│   │   ├── offerings-engine.ts     # Core pricing logic
│   │   ├── stripe-client.ts        # Stripe integration
│   │   ├── opensign-client.ts      # OpenSign integration
│   │   └── utils.ts                # Utility functions
│   │
│   ├── styles/
│   │   ├── globals.css             # Global styles + Tailwind directives
│   │   ├── royal-neo-deco.css      # Design system tokens
│   │   └── print.css               # Print-specific styles
│   │
│   └── types/
│       ├── catalog.ts              # Type definitions for products
│       ├── cart.ts                 # Cart type definitions
│       └── api.ts                  # API response types
│
├── public/
│   ├── fonts/                      # Cinzel, Inter fonts
│   └── images/                     # Any static images
│
└── dist/                           # Build output (deploy this)
```

---

## 4. Implementation Phases

### Phase 1: Project Setup (30 min)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure TailwindCSS with Royal Neo-Deco tokens
- [ ] Set up project structure
- [ ] Configure path aliases

### Phase 2: Core Infrastructure (1 hour)
- [ ] Create Zustand stores (cart, config, payment)
- [ ] Migrate Offerings Engine to TypeScript
- [ ] Create catalog data module
- [ ] Set up React Router with hash routing

### Phase 3: Layout Components (30 min)
- [ ] Header component
- [ ] Tab Navigation component
- [ ] Page Wrapper component
- [ ] Shared UI components (Button, Card, etc.)

### Phase 4: Tab Components (2-3 hours)
- [ ] Executive Summary tab
- [ ] Configure Solution tab (with sub-components)
- [ ] Statement of Work tab
- [ ] Cost & Valuation tab
- [ ] Master Agreement tab
- [ ] Sirsi Vault tab

### Phase 5: Integrations (1 hour)
- [ ] Stripe payment integration
- [ ] OpenSign signature integration
- [ ] Print/PDF functionality

### Phase 6: Testing & Polish (30 min)
- [ ] End-to-end flow testing
- [ ] Responsive design verification
- [ ] Console error cleanup
- [ ] Performance optimization

---

## 5. State Management (Zustand)

### Cart Store
```typescript
interface CartState {
  bundleId: string | null;
  addonIds: string[];
  paymentPlan: 2 | 3 | 4 | null;
  
  // Actions
  setBundleId: (id: string | null) => void;
  addAddon: (id: string) => void;
  removeAddon: (id: string) => void;
  toggleAddon: (id: string) => void;
  setPaymentPlan: (plan: 2 | 3 | 4) => void;
  clearCart: () => void;
  
  // Computed (via selectors)
  getTotal: () => number;
  getTimeline: () => number;
  getItems: () => CartItem[];
}
```

### Config Store
```typescript
interface ConfigState {
  projectName: string;
  clientName: string;
  clientEmail: string;
  currentTab: TabId;
  
  setCurrentTab: (tab: TabId) => void;
  setClientInfo: (name: string, email: string) => void;
}
```

---

## 6. Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Routing** | Hash routing (`/#/tab`) | Works with static hosting on OpenSign |
| **State persistence** | localStorage via Zustand persist | Cart survives refresh |
| **Styling** | Tailwind + custom CSS | Per SIRSI_RULES.md, Royal Neo-Deco system |
| **Build output** | Static files to `/dist` | Deploy alongside OpenSign |
| **Tab component size** | ~200-400 lines max | Maintainable, testable |

---

## 7. Migration Strategy

### Approach: Parallel Development
1. Build new React app in `/packages/finalwishes-contracts/`
2. Keep existing `index.html` running until React app is complete
3. Once verified, redirect traffic to new React app
4. Archive old `index.html`

### Data Migration
- Catalog data → `src/data/catalog.ts`
- MSA legal text → `src/data/msa-content.ts`
- CSS → `src/styles/` (converted to Tailwind where possible)
- JavaScript logic → `src/lib/` and `src/hooks/`

---

## 8. Success Criteria

- [ ] All 6 tabs render correctly
- [ ] Cart state persists across tabs and page refresh
- [ ] Pricing calculations match original
- [ ] Payment flow works (Stripe)
- [ ] Signature flow works (OpenSign)
- [ ] Print/PDF generates correctly
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build size < 500KB (gzipped)

---

## 9. Next Steps

**APPROVED. Proceeding with Phase 1: Project Setup**

```bash
cd /packages
npx create-vite@latest finalwishes-contracts --template react-ts
cd finalwishes-contracts
npm install zustand @tanstack/react-router tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

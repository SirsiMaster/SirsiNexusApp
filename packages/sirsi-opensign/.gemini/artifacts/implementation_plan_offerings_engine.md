# Implementation Plan: Universal Offerings Engine

**Status:** 🚧 IN PROGRESS (Phase 1 Complete)  
**Created:** 2026-01-17  
**Author:** Antigravity  
**Complexity:** High (4-6 hours implementation)  
**Priority:** P1 - Core Architecture Enhancement  
**Commit:** `affa651` (Phase 1)

---

## 1. Executive Summary

Transform the current FinalWishes contracts page from a single-path "Core + Add-ons" model into a **Universal Offerings Engine** that supports:

- Dynamic product catalog (features, bundles, services)
- Standalone purchases (with 50% markup)
- Admin-configurable offerings (add/remove/hide/price)
- Simplified, dynamic MSA generation
- Bundle discounting logic

This engine becomes the **kernel for all Sirsi project offerings**, not just FinalWishes.

---

## 2. Architecture Overview

### 2.1 Multi-Tenant Architecture

This Offerings Engine is a **Sirsi Platform Component** that supports three levels of tenancy:

```
┌────────────────────────────────────────────────────────────────────┐
│                     SIRSI OFFERINGS ENGINE                         │
│                  (Core Platform Component)                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  LEVEL 1: Sirsi → Clients                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Sirsi sells to: FinalWishes, Assiduous, Other Projects     │    │
│  │ Catalog: Sirsi Engineering Services                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│  LEVEL 2: FinalWishes → Their Customers                            │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ FinalWishes sells to: End consumers, Funeral homes, etc.   │    │
│  │ Catalog: FinalWishes Product Offerings                      │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
│  LEVEL 3: Other Sirsi Projects → Their Customers                   │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ Assiduous/Other sells to: Their target markets             │    │
│  │ Catalog: Project-specific offerings                         │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Model

```javascript
/**
 * SIRSI UNIVERSAL OFFERINGS ENGINE
 * Multi-tenant product catalog system
 * 
 * Architecture:
 * - Each PROJECT has its own CATALOG
 * - Each CATALOG has CATEGORIES, BUNDLES, and PRODUCTS
 * - Catalogs are config-driven (no code changes to add offerings)
 */

// Catalog Registry - All projects register their catalogs here
const CATALOG_REGISTRY = {
  'sirsi-engineering': {
    catalogId: 'sirsi-engineering',
    projectId: 'sirsi',
    name: 'Sirsi Engineering Services',
    description: 'Custom software development for enterprise clients',
    currency: 'USD',
    active: true
  },
  'finalwishes-core': {
    catalogId: 'finalwishes-core',
    projectId: 'finalwishes',
    name: 'FinalWishes Platform Offerings',
    description: 'Legacy curation platform and services',
    currency: 'USD',
    active: true
  }
  // Future: 'assiduous-core', 'finalwishes-consumer', etc.
};

/**
 * CATALOG SCHEMA
 * Each catalog follows this structure
 */
const CATALOG_SCHEMA = {
  // Required metadata
  catalogId: 'string',        // Unique identifier
  projectId: 'string',        // Parent project
  name: 'string',             // Display name
  version: 'string',          // Semantic version
  lastUpdated: 'ISO-date',    // Last modification
  currency: 'string',         // USD, EUR, etc.
  
  // Pricing configuration
  pricing: {
    standaloneMultiplier: 1.5,    // 50% markup for standalone
    bundleDiscountPercent: 0,     // PLACEHOLDER: Not implemented yet
    minimumOrder: null,           // No minimum order
    taxable: false                // Tax handling
  },
  
  // Categories for organization
  categories: {
    'category-id': {
      name: 'string',
      icon: 'string',         // Emoji or icon class
      order: 'number',        // Display order
      description: 'string'
    }
  },
  
  // Bundles (platforms, packages)
  bundles: {
    'bundle-id': {
      id: 'string',
      name: 'string',
      category: 'string',         // References categories
      basePrice: 'number',
      timeline: 'number',
      timelineUnit: 'weeks',      // 'weeks', 'months', 'days'
      description: 'string',
      includes: ['product-ids'],  // Products included in bundle
      visible: true,
      featured: false,
      allowAddons: true,
      wbs: { /* Work breakdown structure */ }
    }
  },
  
  // Individual products
  products: {
    'product-id': {
      id: 'string',
      name: 'string',
      category: 'string',
      bundledPrice: 'number',
      standalonePrice: 'number',  // Auto-calculated if null
      timeline: 'number',
      timelineUnit: 'weeks',
      description: 'string',
      prerequisites: ['product-ids'],
      standalone: true,           // Can be purchased alone
      visible: true,
      wbs: { /* Work breakdown structure */ }
    }
  }
};

/**
 * CURRENT CATALOG: Sirsi Engineering Services (FinalWishes Project)
 * This is the first implementation using the framework
 */
const SIRSI_ENGINEERING_CATALOG = {
  catalogId: 'sirsi-engineering',
  projectId: 'sirsi',
  name: 'Sirsi Engineering Services',
  version: '1.0.0',
  lastUpdated: '2026-01-17',
  currency: 'USD',
  
  pricing: {
    standaloneMultiplier: 1.5,    // 50% markup
    bundleDiscountPercent: 0,     // Future: Enable bundle discounts
    minimumOrder: null,           // No minimum
    taxable: false
  },
  
  categories: {
    'platform': { 
      name: 'Full Platform Builds', 
      icon: '🏗️', 
      order: 1,
      description: 'Complete application development'
    },
    'feature': { 
      name: 'Feature Modules', 
      icon: '🧩', 
      order: 2,
      description: 'Standalone or add-on capabilities'
    },
    'service': { 
      name: 'Professional Services', 
      icon: '🎨', 
      order: 3,
      description: 'Branding, support, and consulting'
    }
  },
  
  bundles: {
    'finalwishes-core': {
      id: 'finalwishes-core',
      name: 'FinalWishes Core Platform',
      category: 'platform',
      basePrice: 95000,
      timeline: 16,
      timelineUnit: 'weeks',
      description: 'Full "Living Legacy" platform for iOS, Android, and Web. Includes vault architecture, media integration, AI foundation, and mobile apps.',
      includes: ['vault-core', 'media-engine', 'ai-foundation', 'mobile-apps'],
      visible: true,
      featured: true,
      allowAddons: true
    }
  },
  
  products: {
    'branding': {
      id: 'branding',
      name: 'Branding & Identity',
      category: 'service',
      bundledPrice: 30000,
      standalonePrice: 45000,
      timeline: 8,
      timelineUnit: 'weeks',
      description: 'Logo System, Voice Guide, UI Kit, Marketing Assets',
      prerequisites: [],
      standalone: true,
      visible: true
    },
    'maintenance': {
      id: 'maintenance',
      name: 'Maintenance & Support',
      category: 'service',
      bundledPrice: 18000,
      standalonePrice: 27000,
      timeline: 12,
      timelineUnit: 'months',
      description: 'Annual support contract (20 hrs/month max). Excludes new feature development.',
      prerequisites: [],
      standalone: true,
      visible: true
    },
    'estate': {
      id: 'estate',
      name: 'Estate Administration',
      category: 'feature',
      bundledPrice: 65000,
      standalonePrice: 97500,
      timeline: 8,
      timelineUnit: 'weeks',
      description: 'Executor Dashboards, Asset Inventory, Beneficiary Hub',
      prerequisites: [],
      standalone: true,
      visible: true
    },
    'probate': {
      id: 'probate',
      name: 'Probate Engine (Per State)',
      category: 'feature',
      bundledPrice: 35000,
      standalonePrice: 52500,
      timeline: 10,
      timelineUnit: 'weeks',
      description: 'State-specific form automation & statute tracking. Built on Sirsi Minimum Probate IP.',
      prerequisites: [],
      standalone: true,
      visible: true
    },
    'probate-ai': {
      id: 'probate-ai',
      name: 'Probate AI Enhancement',
      category: 'feature',
      bundledPrice: 25000,
      standalonePrice: null,  // Cannot be purchased standalone
      timeline: 4,
      timelineUnit: 'weeks',
      description: 'RAG analysis, form pre-fill, deadline prediction. Requires Probate Engine.',
      prerequisites: ['probate'],
      standalone: false,
      visible: true
    },
    'comms': {
      id: 'comms',
      name: 'Secure Comms Suite',
      category: 'feature',
      bundledPrice: 30000,
      standalonePrice: 45000,
      timeline: 4,
      timelineUnit: 'weeks',
      description: "Secure messaging, Dead Man's Switch, Audit Logs",
      prerequisites: [],
      standalone: true,
      visible: true
    },
    'memorial': {
      id: 'memorial',
      name: 'Virtual Memorial Services',
      category: 'feature',
      bundledPrice: 45000,
      standalonePrice: 67500,
      timeline: 6,
      timelineUnit: 'weeks',
      description: 'YouTube Live integration, Digital Guestbook, Event Scheduling',
      prerequisites: [],
      standalone: true,
      visible: true
    },
    'financial': {
      id: 'financial',
      name: 'Advanced Asset Discovery',
      category: 'feature',
      bundledPrice: 60000,
      standalonePrice: 90000,
      timeline: 10,
      timelineUnit: 'weeks',
      description: 'Multi-institution discovery, Balance Aggregation via Plaid',
      prerequisites: [],
      standalone: true,
      visible: true
    }
  }
};
```

### 2.2 UI Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OFFERINGS LANDING                               │
│                                                                         │
│  "What would you like to build today?"                                  │
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │ 🏗️ PLATFORM  │   │ 🧩 FEATURES  │   │ 🎨 SERVICES  │                │
│  │              │   │              │   │              │                │
│  │ Full apps    │   │ Individual   │   │ Branding,    │                │
│  │ & systems    │   │ modules      │   │ Support      │                │
│  │              │   │              │   │              │                │
│  │ From $45K    │   │ From $25K    │   │ From $18K    │                │
│  └──────────────┘   └──────────────┘   └──────────────┘                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌───────────┐   ┌───────────┐   ┌───────────┐
            │ PLATFORM  │   │ FEATURES  │   │ SERVICES  │
            │ CATALOG   │   │ CATALOG   │   │ CATALOG   │
            │           │   │           │   │           │
            │ - Core    │   │ - Estate  │   │ - Brand   │
            │ - Starter │   │ - Probate │   │ - Support │
            │           │   │ - Comms   │   │           │
            └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                  │               │               │
                  └───────────────┼───────────────┘
                                  ▼
                    ┌─────────────────────────────┐
                    │       SHOPPING CART         │
                    │                             │
                    │ Selected Items:             │
                    │ ☑ Estate Admin    $65,000   │
                    │ ☑ Probate Engine  $35,000   │
                    │ ☐ (Bundled pricing)         │
                    │                             │
                    │ Subtotal:        $100,000   │
                    │                             │
                    │ [Review Contract →]         │
                    └─────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │     DYNAMIC CONTRACT        │
                    │                             │
                    │ • Generated SOW             │
                    │ • Payment Plan Selection    │
                    │ • Simplified MSA            │
                    │ • E-Sign Integration        │
                    └─────────────────────────────┘
```

---

## 3. Component Breakdown

### 3.1 New Components to Build

| Component | Description | Complexity |
|-----------|-------------|------------|
| `OfferingsLanding` | Category selection screen | Low |
| `ProductCatalog` | Filterable product grid | Medium |
| `ProductCard` | Individual offering display | Low |
| `ShoppingCart` | Selection summary & pricing | Medium |
| `DynamicSOW` | Auto-generated scope of work | High |
| `SimplifiedMSA` | Streamlined contract template | Medium |
| `PricingCalculator` | Bundle vs standalone logic | Medium |

### 3.2 Modified Components

| Component | Changes |
|-----------|---------|
| `index.html` | Add offerings landing, refactor tabs |
| `printable-msa.html` | Make fully dynamic based on cart |
| Existing add-on selection | Convert to use product catalog |

---

## 4. Pricing Logic

### 4.1 Price Calculation

```javascript
function calculatePrice(cart, hasBundle) {
  let total = 0;
  
  // If cart contains a bundle (platform), use bundled pricing
  const bundleInCart = cart.some(item => 
    PRODUCT_CATALOG.bundles[item.id]
  );
  
  cart.forEach(item => {
    if (PRODUCT_CATALOG.bundles[item.id]) {
      // It's a bundle/platform
      total += item.basePrice;
    } else if (PRODUCT_CATALOG.products[item.id]) {
      const product = PRODUCT_CATALOG.products[item.id];
      
      if (bundleInCart) {
        // Bundled pricing (add-on to platform)
        total += product.bundledPrice;
      } else {
        // Standalone pricing (50% markup)
        total += product.standalonePrice;
      }
    }
  });
  
  return total;
}
```

### 4.2 Pricing Display Examples

| Scenario | Items | Price Calculation |
|----------|-------|-------------------|
| Core + Estate (bundled) | Core, Estate | $95K + $65K = $160K |
| Estate only (standalone) | Estate | $65K × 1.5 = **$97.5K** |
| Estate + Probate (standalone bundle) | Estate, Probate | $65K×1.5 + $35K×1.5 = **$150K** |
| Core + Estate + Probate | Core, Estate, Probate | $95K + $65K + $35K = **$195K** |

---

## 5. Dynamic Contract Generation

### 5.1 MSA Template Sections

The MSA will be modular with these conditional sections:

```html
<!-- ALWAYS INCLUDED -->
<section id="msa-header">...</section>
<section id="recitals">...</section>
<section id="definitions">...</section>

<!-- CONDITIONAL: Platform-specific -->
{{#if hasPlatform}}
<section id="platform-scope">...</section>
{{/if}}

<!-- CONDITIONAL: Feature-specific -->
{{#each selectedFeatures}}
<section id="feature-{{this.id}}-scope">
  <h3>{{this.name}}</h3>
  <p>{{this.legalDescription}}</p>
</section>
{{/each}}

<!-- CONDITIONAL: Service-specific -->
{{#if hasServices}}
<section id="services-scope">...</section>
{{/if}}

<!-- ALWAYS INCLUDED -->
<section id="compensation">
  <!-- Dynamically populated from cart -->
</section>
<section id="warranties">...</section>
<section id="signatures">...</section>
```

### 5.2 SOW Generation Logic

```javascript
function generateSOW(cart) {
  const sections = [];
  
  // Group by category
  const platforms = cart.filter(i => i.category === 'platform');
  const features = cart.filter(i => i.category === 'feature');
  const services = cart.filter(i => i.category === 'service');
  
  // Generate sections for each
  if (platforms.length) {
    sections.push({
      title: 'Platform Development',
      items: platforms,
      wbs: generateWBS(platforms)
    });
  }
  
  if (features.length) {
    sections.push({
      title: 'Feature Modules',
      items: features,
      wbs: generateWBS(features)
    });
  }
  
  if (services.length) {
    sections.push({
      title: 'Professional Services',
      items: services,
      wbs: generateWBS(services)
    });
  }
  
  return sections;
}
```

---

## 6. Admin Capabilities (Future)

While not in initial scope, the architecture supports:

| Capability | Description |
|------------|-------------|
| **Add Product** | New entry in `products` object |
| **Hide Product** | Set `visible: false` |
| **Create Bundle** | New entry in `bundles` object |
| **Adjust Pricing** | Modify `bundledPrice`/`standalonePrice` |
| **Set Dependencies** | Add to `prerequisites` array |
| **Reorder Display** | Modify `order` property |

Future admin UI: `/admin/offerings-manager.html`

---

## 7. Implementation Phases

### Phase 1: Data Architecture (45 min) ✅ COMPLETE
- [x] Create `PRODUCT_CATALOG` data structure → `catalog-data.js`
- [x] Migrate existing `ADDONS_INFO` and `CORE_WBS_DATA` to new format
- [x] Add `standalonePrice` to all products (bundledPrice × 1.5)
- [x] Create pricing calculation utilities → `pricing-engine.js`
- [x] Create cart manager → `cart-manager.js`
- [x] Create main engine facade → `offerings-engine.js`

### Phase 2: UI - Offerings Landing (1 hour) ✅ COMPLETE
- [x] Create category selection screen → `offerings.html`
- [x] Design product cards with standalone/bundled indicators
- [x] Build filterable product grid
- [x] Implement shopping cart sidebar

### Phase 3: Pricing Engine (45 min) ✅ COMPLETE (Built in Phase 1)
- [x] Implement `calculatePrice()` with bundle detection
- [x] Add standalone markup logic
- [x] Handle prerequisites validation
- [x] Create price display formatting

### Phase 4: Dynamic Contract (1.5 hours)
- [ ] Refactor MSA to use conditional sections
- [ ] Create SOW generator from cart
- [ ] Update payment plan calculator for variable totals
- [ ] Handle zero-platform (standalone) contracts

### Phase 5: Integration & Polish (1 hour)
- [ ] Connect all components
- [ ] Test all purchase paths
- [ ] Update printable-msa.html for dynamic content
- [ ] QA edge cases (empty cart, single item, max items)

**Total Estimated Time: 5-6 hours**

---

## 8. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `index.html` | Major Refactor | Add offerings landing, product catalog UI |
| `printable-msa.html` | Refactor | Make dynamic based on cart contents |
| `offerings-data.js` | **NEW** | Product catalog data structure |
| `pricing-engine.js` | **NEW** | Price calculation utilities |
| `cart-manager.js` | **NEW** | Shopping cart state management |
| `sow-generator.js` | **NEW** | Dynamic SOW creation |

---

## 9. Success Criteria

| Criteria | Measurement |
|----------|-------------|
| User can purchase standalone feature | Complete flow without platform |
| Standalone shows 50% markup | Price calculates correctly |
| Platform + add-ons shows bundled price | Price calculates correctly |
| Generated SOW matches cart | All selected items in scope |
| MSA is valid for all scenarios | Legal sections appropriate for purchase |
| Payment plans calculate correctly | For any total amount |

---

## 10. Decisions Made (Resolved Questions)

| Question | Decision | Implementation |
|----------|----------|----------------|
| **Bundle Discounts** | Not now, but facilitate in code | `bundleDiscountPercent: 0` placeholder |
| **Minimum Order** | No minimum | `minimumOrder: null` |
| **Multi-Project** | Yes, from day 1 | `CATALOG_REGISTRY` with multiple catalogs |
| **Standalone Markup** | 50% confirmed | `standaloneMultiplier: 1.5` |

### Strategic Notes

1. **This is a Sirsi Platform Component** - Not a FinalWishes-specific feature
2. **FinalWishes is the first tenant** - Using this to build the FinalWishes platform offerings
3. **FinalWishes will use this for their customers** - Multi-level tenancy baked in
4. **Configuration-driven** - No code changes needed to add/modify offerings

---

## 11. Recommendation

**Start with Phase 1 (Data Architecture)** - This creates the foundation without disrupting the current UI. We can iterate on the UI design after validating the data model works.

**Ready to begin implementation?**

---

**Document Status:** DRAFT - Awaiting Review  
**Next Action:** User approval before Phase 1 begins

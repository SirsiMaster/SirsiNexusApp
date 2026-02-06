// FinalWishes Product Catalog
// This is the single source of truth for all products and pricing
// Ported from the SIRSI Universal Offerings Engine (catalog-data.js)
// CRITICAL: PER GEMINI.MD RULE 12, all pricing must be dynamic. No hardcoded
// dollar amounts should exist in the UI or templates outside of this catalog.

export interface WBSActivity {
    name: string
    role: string
    hours: number
    cost: number
}

export interface WBSPhase {
    phaseNum: number
    name: string
    weeks: string
    hours: number
    cost: number
    activities: WBSActivity[]
}

export interface DetailedScopeItem {
    title: string
    content: string
    subItems: string[]
}

export interface Product {
    id: string
    name: string
    shortDescription: string
    description: string
    category: 'platform' | 'feature' | 'service' | 'addon'
    bundledPrice: number
    standalonePrice: number | null
    hours: number // True labor hours
    timeline: number
    timelineUnit: 'weeks' | 'months'

    features?: string[]
    detailedScope?: DetailedScopeItem[]
    wbs?: WBSPhase[]
    recurring?: boolean
    perWeek?: boolean
    prerequisites?: string[]
}

export interface Bundle {
    id: string
    name: string
    shortDescription: string
    description: string
    price: number
    hours: number // True labor hours
    timeline: number
    timelineUnit: 'weeks' | 'months'

    includedProducts: string[]
    features: string[]
    addonDiscount: number // percentage
    detailedScope?: DetailedScopeItem[]
    wbs?: WBSPhase[]
}

export const BUNDLES: Record<string, Bundle> = {
    'finalwishes-core': {
        id: 'finalwishes-core',
        name: 'FinalWishes Core Platform',
        shortDescription: 'Complete Digital Legacy Solution',
        description: 'The complete FinalWishes platform including iOS, Android, and Web applications with AI-powered legacy management.',
        price: 95000,
        hours: 760,
        timeline: 16,
        timelineUnit: 'weeks',
        addonDiscount: 0,
        includedProducts: ['vault-core', 'media-engine', 'ai-foundation', 'mobile-apps'],

        features: [
            'iOS & Android Native Apps',
            'Web Application (React)',
            '"The Shepherd" AI Foundation',
            'Secure Cloud Infrastructure',
            'Legacy Media Vault',
            'Digital Lockbox Storage',
            'Beneficiary Management',
            'User Authentication & MFA',
        ],
        detailedScope: [
            {
                title: "Legacy Media Vault",
                content: "Implementation of a secure, cloud-native media management system.",
                subItems: ["YouTube API integration", "Google Photos API integration", "In-app recording tools", "Shared memorial walls"]
            },
            {
                title: "Secure Digital Lockbox",
                content: "A zero-knowledge, encrypted vault for sensitive information.",
                subItems: ["AES-256 encryption", "Heirloom registry", "Discovery notes", "Role-based access"]
            },
            {
                title: "Final Directives & Ethical Wills",
                content: "Tools for capturing and legally securing final instructions.",
                subItems: ["Guided ethical will creation", "Funeral preference documentation", "Medical directives templates", "Scheduled release to beneficiaries"]
            }
        ],
        wbs: [
            {
                phaseNum: 1, name: 'Foundation & Cloud Infrastructure', weeks: '1-4', hours: 180, cost: 22500,
                activities: [
                    { name: 'System Architecture & Technical Design', role: 'Sr. Architect', hours: 40, cost: 5000 },
                    { name: 'Google Cloud Project Setup', role: 'DevOps Eng', hours: 30, cost: 3750 },
                    { name: 'Database Schema Design', role: 'Backend Eng', hours: 40, cost: 5000 },
                    { name: 'Authentication System', role: 'Security Eng', hours: 30, cost: 3750 },
                    { name: 'CI/CD Pipeline & DevOps', role: 'DevOps Eng', hours: 40, cost: 5000 }
                ]
            },
            {
                phaseNum: 2, name: 'Core Application Development', weeks: '5-8', hours: 220, cost: 27500,
                activities: [
                    { name: 'Web Application Shell', role: 'Frontend Eng', hours: 50, cost: 6250 },
                    { name: 'Mobile Application Shell (iOS/Android)', role: 'Mobile Eng', hours: 70, cost: 8750 },
                    { name: '"The Shepherd" AI Foundation', role: 'AI Engineer', hours: 50, cost: 6250 },
                    { name: 'API Gateway & Backend Services', role: 'Backend Eng', hours: 50, cost: 6250 }
                ]
            },
            {
                phaseNum: 3, name: 'Feature Integration & Vault', weeks: '9-12', hours: 200, cost: 25000,
                activities: [
                    { name: 'Legacy Media Vault Implementation', role: 'Backend Eng', hours: 50, cost: 6250 },
                    { name: 'Digital Lockbox & Encryption', role: 'Security Eng', hours: 50, cost: 6250 },
                    { name: 'Beneficiary Management Portal', role: 'Frontend Eng', hours: 50, cost: 6250 },
                    { name: 'Final Directives Module', role: 'Full Stack', hours: 50, cost: 6250 }
                ]
            },
            {
                phaseNum: 4, name: 'Testing, QA & Launch', weeks: '13-16', hours: 160, cost: 20000,
                activities: [
                    { name: 'End-to-End Testing & Bug Fixes', role: 'QA Engineer', hours: 40, cost: 5000 },
                    { name: 'Security Audit & Penetration Testing', role: 'Security Eng', hours: 40, cost: 5000 },
                    { name: 'Performance Optimization', role: 'DevOps Eng', hours: 40, cost: 5000 },
                    { name: 'Launch Preparation & Deployment', role: 'Sr. Architect', hours: 40, cost: 5000 }
                ]
            }
        ]


    }
}

export const PRODUCTS: Record<string, Product> = {
    'maintenance': {
        id: 'maintenance',
        name: 'Maintenance & Support',
        shortDescription: '12-month support (20 hrs/mo)',
        description: 'Annual support contract.',
        category: 'service',
        bundledPrice: 18000,
        standalonePrice: 18000,
        hours: 144,
        timeline: 12,

        timelineUnit: 'months',
        recurring: true,
        detailedScope: [
            {
                title: "Maintenance & Support",
                content: "Ongoing technical guardianship.",
                subItems: ["20 Hours monthly support ($1,500/mo)", "Priority bug fixes", "Security patching", "Infrastructure audits"]
            }
        ]
    },
    'ceo-consulting': {
        id: 'ceo-consulting',
        name: 'CEO Consulting',
        shortDescription: 'Direct strategic partnership (20 hrs/week)',
        description: 'On-demand strategic consulting and executive partnership.',
        category: 'service',
        bundledPrice: 6000,
        standalonePrice: 6000,
        hours: 48,
        timeline: 1,

        timelineUnit: 'weeks',
        recurring: true,
        perWeek: true,

        detailedScope: [
            {
                title: "Executive Strategic Partnership",
                content: "High-level strategic guidance and operational oversight.",
                subItems: [
                    "20 Hours weekly dedicated consulting",
                    "Direct access to CEO-level strategy",
                    "Product roadmap validation",
                    "Strategic partnership development"
                ]
            }
        ],
        wbs: [
            {
                phaseNum: 1, name: 'Strategic Advisory', weeks: '1-1', hours: 20, cost: 6000,
                activities: [
                    { name: 'Strategic Planning Session', role: 'Erin Horne McKinney', hours: 10, cost: 3000 },
                    { name: 'Operational Oversight', role: 'Erin Horne McKinney', hours: 10, cost: 3000 }
                ]
            }
        ]

    },
    'branding': {
        id: 'branding',
        name: 'Branding & Identity',
        shortDescription: 'Logo, voice guide, UI kit',
        description: 'Complete brand identity system.',
        category: 'service',
        bundledPrice: 30000,
        standalonePrice: 30000,
        hours: 240,
        timeline: 8,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Master Brand Identity",
                content: "Creation of a comprehensive visual identity system.",
                subItems: ["Logo marks", "Typography & Palette", "Voice & Tone", "UI/UX Figma Kit"]
            }
        ],
        wbs: [
            {
                phaseNum: 1, name: 'Brand & UI/UX Design', weeks: '1-3', hours: 60, cost: 12000,
                activities: [
                    { name: 'Logo & Visual Identity', role: 'Art Director', hours: 20, cost: 4000 },
                    { name: 'UI/UX Design Kit', role: 'UI Designer', hours: 40, cost: 8000 }
                ]
            }
        ]
    },
    'estate': {
        id: 'estate',
        name: 'Estate Administration',
        shortDescription: 'Executor tools & asset tracking',
        description: 'Estate management module.',
        category: 'feature',
        bundledPrice: 31850,
        standalonePrice: 45500,
        hours: 364,
        timeline: 8,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Estate Administration Hub",
                content: "Specialized tools for legacy management.",
                subItems: ["Executor dashboard", "Asset inventory", "Beneficiary portal", "Auditing"]
            }
        ],
        wbs: [
            {
                phaseNum: 3, name: 'Module Integration', weeks: '9-12', hours: 80, cost: 12000,
                activities: [
                    { name: 'Estate Logic Integration', role: 'Backend Eng', hours: 40, cost: 11200 },
                    { name: 'Executor UI Components', role: 'Frontend Eng', hours: 40, cost: 11200 }
                ]
            }
        ]
    },
    'probate': {
        id: 'probate',
        name: 'Probate Engine (Per State)',
        shortDescription: 'State-specific form automation',
        description: 'State-specific probate automation.',
        category: 'feature',
        bundledPrice: 24500,
        standalonePrice: 35000,
        hours: 280,
        timeline: 10,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "State-Specific Probate Engine",
                content: "Automation of primary probate filings and documentation for a specific jurisdiction.",
                subItems: ["Statutory form templates", "Local court filing rules integration", "Deadline and timeline calculators", "Asset-to-heir distribution logic"]
            }
        ],
        wbs: [
            {
                phaseNum: 3, name: 'Module Integration', weeks: '9-12', hours: 70, cost: 14000,
                activities: [
                    { name: 'Probate Form Engine', role: 'Backend Eng', hours: 40, cost: 8000 },
                    { name: 'Court Integration API', role: 'Security Eng', hours: 30, cost: 6000 }
                ]
            }
        ]
    },
    'probate-ai': {
        id: 'probate-ai',
        name: 'Probate AI Enhancement',
        shortDescription: 'AI form analysis',
        description: 'AI-powered probate assistance.',
        category: 'feature',
        bundledPrice: 12250,
        standalonePrice: 17500,
        hours: 140,
        timeline: 4,
        timelineUnit: 'weeks',
        prerequisites: ['probate'],

        detailedScope: [
            {
                title: "Probate AI Enhancement",
                content: "Integration of large language models to assist in document extraction and validation.",
                subItems: ["Automated form extraction (OCR/LLM)", "Legacy document summarization", "Consistency checking across filings", "Natural language query of probate laws"]
            }
        ]
    },
    'comms': {
        id: 'comms',
        name: 'Secure Comms Suite',
        shortDescription: 'Encrypted messaging & alerts',
        description: 'Encrypted messaging system.',
        category: 'feature',
        bundledPrice: 14700,
        standalonePrice: 21000,
        hours: 168,
        timeline: 4,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Encrypted Legacy Communications",
                content: "Secure communication channel for family and executors.",
                subItems: ["End-to-End Encryption (E2EE)", "Message persistence guarantees", "Heir-to-Executor private channels", "Automated legacy alerts"]
            }
        ]
    },
    'memorial': {
        id: 'memorial',
        name: 'Virtual Memorial Services',
        shortDescription: 'Live streaming & guestbook',
        description: 'Virtual memorial platform.',
        category: 'feature',
        bundledPrice: 22050,
        standalonePrice: 31499,
        hours: 252,
        timeline: 6,
        timelineUnit: 'weeks',

        detailedScope: [
            {
                title: "Virtual Memorial Platform",
                content: "Interactive, permanent spaces for remembrance and broadcast.",
                subItems: ["Live stream integration", "Interactive guestbooks", "Virtual candle lighting", "Permanent memory walls"]
            }
        ]
    },
    'financial': {
        id: 'financial',
        name: 'Advanced Asset Discovery',
        shortDescription: 'Plaid-powered asset search',
        description: 'Plaid-powered asset discovery.',
        category: 'feature',
        bundledPrice: 29400,
        standalonePrice: 42000,
        hours: 336,
        timeline: 10,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Advanced Financial Discovery",
                content: "Deep integration with financial institutions for asset identification.",
                subItems: ["Plaid Link integration", "Automated account mapping", "Institutional metadata extraction", "Credential-less vaulting"]
            }
        ]
    },
    'ai-legacy': {
        id: 'ai-legacy',
        name: 'AI Voice & Avatar Synthesis',
        shortDescription: 'Voice cloning & avatar memorial',
        description: 'AI-driven voice and visual synthesis for living memorials.',
        category: 'feature',
        bundledPrice: 26950,
        standalonePrice: 38500,
        hours: 308,
        timeline: 10,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Living Legacy AI",
                content: "Implementation of advanced generative AI for realistic legacy preservation.",
                subItems: ["Custom voice cloning (from 15m audio)", "3D Avatar generation from photos", "Interactive AI guided story-telling", "Strict ethical safety guardrails"]
            }
        ]
    },
    'liquidator': {
        id: 'liquidator',
        name: 'Digital Asset Liquidator',
        shortDescription: 'Automated account transitions',
        description: 'Automated closing and transfer of digital accounts.',
        category: 'feature',
        bundledPrice: 19600,
        standalonePrice: 28000,
        hours: 224,
        timeline: 8,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Automated Digital Transitions",
                content: "Tools for managing the difficult process of closing a digital life.",
                subItems: ["Social media 'Memorialize' triggers", "Subscription cancellation bot", "Digital asset inventory vault", "Credential transition protocols"]
            }
        ]
    },
    'compliance': {
        id: 'compliance',
        name: 'Global Compliance Suite',
        shortDescription: 'GDPR / Multi-region privacy',
        description: 'Multi-region data residency and compliance (GDPR, CCPA).',
        category: 'service',
        bundledPrice: 17150,
        standalonePrice: 24500,
        hours: 196,
        timeline: 8,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Global Data Sovereignty",
                content: "Enterprise-grade compliance framework for international operations.",
                subItems: ["Local data residency (EU/US/Asia)", "Automated PII auditing", "End-to-end encryption key management", "Privacy regulation monitoring"]
            }
        ]
    },
    'white-label': {
        id: 'white-label',
        name: 'Professional Partner Portal',
        shortDescription: 'B2B Partner & Branding system',
        description: 'White-label dashboard for funeral homes and law firms.',
        category: 'feature',
        bundledPrice: 36750,
        standalonePrice: 52500,
        hours: 420,
        timeline: 12,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "B2B Partner Ecosystem",
                content: "Enabling professional services to offer FinalWishes to their clients.",
                subItems: ["Fully white-labeled UI", "Lead management for partners", "Co-branded document generation", "Unified partner billing console"]
            }
        ]
    },
    'charity': {
        id: 'charity',
        name: 'Charitable Trust Engine',
        shortDescription: 'Automated legacy philanthropy',
        description: 'Automation for charitable donations and foundation setup.',
        category: 'feature',
        bundledPrice: 22050,
        standalonePrice: 31499,
        hours: 252,
        timeline: 8,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Legacy Philanthropy Engine",
                content: "Tools to ensure a user's charitable impact continues permanently.",
                subItems: ["Verified non-profit registry", "Endowment setup automation", "Recurring donation scheduling", "Impact reporting for heirs"]
            }
        ]
    },
    'genealogy': {
        id: 'genealogy',
        name: 'Genealogy Data Deep-Sync',
        shortDescription: 'Deep lineage & history sync',
        description: 'Ancestry.com and FamilySearch automatic data sync.',
        category: 'feature',
        bundledPrice: 12250,
        standalonePrice: 17500,
        hours: 140,
        timeline: 6,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Deep Lineage Integration",
                content: "Pulling a user's history into their current legacy platform.",
                subItems: ["Automatic family tree import", "Record & Document OCR", "Multi-generational storytelling", "Lineage-based privacy locks"]
            }
        ]
    },
    'multi-sig': {
        id: 'multi-sig',
        name: 'Vault Shamir Key Sharding',
        shortDescription: 'Multi-heir vault unlocking',
        description: 'Ultra-secure vault access using Shamir\'s Secret Sharing.',
        category: 'feature',
        bundledPrice: 14700,
        standalonePrice: 21000,
        hours: 168,
        timeline: 6,
        timelineUnit: 'weeks',

        detailedScope: [
            {
                title: "Advanced Vault Security",
                content: "Ensuring the vault can only be opened with the consensus of multiple heirs.",
                subItems: ["Shamir's Secret Sharing (SSS)", "N-of-M signature requirements", "Trustee verification tokens", "Emergency access protocols"]
            }
        ]
    },
    'publishing': {
        id: 'publishing',
        name: 'Legacy Print & Publishing',
        shortDescription: 'Physical ethical will books',
        description: 'Physical publishing of memoirs and ethical wills.',
        category: 'service',
        bundledPrice: 9800,
        standalonePrice: 14000,
        hours: 112,
        timeline: 4,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Physical Legacy Publishing",
                content: "Turning digital memories into permanent physical heirlooms.",
                subItems: ["High-quality hardcover memoirs", "Ethical Will print editions", "Global fulfillment & shipping", "Custom brand leather binding"]
            }
        ]
    },
    'crypto': {
        id: 'crypto',
        name: 'Crypto Vault & Wallet Sync',
        shortDescription: 'Crypto & NFT legacy vault',
        description: 'Secure legacy transfer of cryptocurrency and NFT assets.',
        category: 'feature',
        bundledPrice: 22050,
        standalonePrice: 31499,
        hours: 252,
        timeline: 6,
        timelineUnit: 'weeks',

        detailedScope: [
            {
                title: "Digital Asset Preservation",
                content: "Ensuring that non-custodial digital assets can be securely handed down.",
                subItems: ["Hardware wallet (Ledger) integration", "NFT metadata preservation", "Multi-chain asset tracking", "Encrypted seed phrase transition (Zero-Knowledge)"]
            }
        ]
    },

    'blockchain': {
        id: 'blockchain',
        name: 'Smart Contract Legacy Trust',
        shortDescription: 'Immutable trust automation',
        description: 'Definitive automated asset release via immutable smart contracts.',
        category: 'feature',
        bundledPrice: 31850,
        standalonePrice: 45500,
        hours: 364,
        timeline: 10,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Blockchain Trust Infrastructure",
                content: "Replacing human-error trusts with mathematically certain code.",
                subItems: ["Solidity-based trust contracts", "On-chain proof of existence", "Automated distribution on death-trigger", "Immutable legacy ledger"]
            }
        ]
    },
    'documentary': {
        id: 'documentary',
        name: 'Legacy Documentary Production',
        shortDescription: 'Pro-grade cinematic legacy',
        description: 'Professional video editing and archival for family documentaries.',
        category: 'service',
        bundledPrice: 14700,
        standalonePrice: 21000,
        hours: 168,
        timeline: 6,
        timelineUnit: 'weeks',

        detailedScope: [
            {
                title: "Cinematic Legacy Preservation",
                content: "Transforming raw footage and memories into a high-end documentary.",
                subItems: ["4K cinematic editing", "Color grading & professional sound", "Family interview orchestration", "Cloud-native 8K archival"]
            }
        ]
    },
    'vault-guard': {
        id: 'vault-guard',
        name: 'Vault Guard: Multi-Regional KMS Backup',
        shortDescription: 'Multi-region KMS hardening',
        description: 'Hyper-resilient security with cross-region key management.',
        category: 'feature',
        bundledPrice: 12250,
        standalonePrice: 17500,
        hours: 140,
        timeline: 4,
        timelineUnit: 'weeks',

        detailedScope: [
            {
                title: "Advanced Vault Guarding",
                content: "Ensuring that the vault remains accessible even in the event of major region failure.",
                subItems: ["Cross-region KMS key replication", "Automated encryption health checks", "HSM-level security integration", "Biometric secondary recovery paths"]
            }
        ]
    },
    'analytics': {
        id: 'analytics',
        name: 'Estate ROI & Analytics Dashboard',
        shortDescription: 'Estate health & growth insights',
        description: 'Advanced data insights into estate health and value growth.',
        category: 'feature',
        bundledPrice: 8820,
        standalonePrice: 12600,
        hours: 101,
        timeline: 6,

        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Estate Intelligence Dashboard",
                content: "Providing real-time insights into the total value and health of a legacy portfolio.",
                subItems: ["Automated valuation of digital assets", "Tax impact forecasting", "Heir engagement metrics", "Document expiration alerts"]
            }
        ]
    }
}

// Get all addon product IDs
export const ADDON_IDS = Object.keys(PRODUCTS)

// Helper functions
export function getProduct(id: string): Product | undefined {
    return PRODUCTS[id]
}

export function getBundle(id: string): Bundle | undefined {
    return BUNDLES[id]
}

export interface CalculateTotalResult {
    total: number // The final investment (multiplied or base)
    internalTotal: number // Base cost (1.0x)
    marketTotal: number // Market valuation based on hours @ $250/hr
    totalHours: number // Total labor hours
    breakdown: {
        bundle: number
        addons: number
        special: {
            ceoConsulting: number
            probateEngine: number
        }
    }
}



export function calculateTotal(
    bundleId: string | null,
    addonIds: string[],
    ceoConsultingWeeks: number = 1,
    probateStateCount: number = 1,
    multiplier: number = 1.0 // Sirsi Multiplier
): CalculateTotalResult {
    let bundleTotalBase = 0
    let addonsTotalBase = 0
    let ceoConsultingTotalBase = 0
    let probateEngineTotalBase = 0
    let totalHours = 0

    const hasBundle = bundleId !== null
    if (bundleId && BUNDLES[bundleId]) {
        bundleTotalBase = BUNDLES[bundleId].price
        totalHours += BUNDLES[bundleId].hours
    }

    addonIds.forEach(id => {
        const product = PRODUCTS[id]
        if (product) {
            const standPrice = product.standalonePrice || Math.round(product.bundledPrice * 1.5)
            const unitPrice = hasBundle ? product.bundledPrice : standPrice

            // Standalone hours are used for market valuation accuracy
            const unitHours = hasBundle ? product.hours : Math.round(standPrice / 125)

            if (id === 'ceo-consulting') {
                const multiplier = Math.max(1, ceoConsultingWeeks)
                ceoConsultingTotalBase += unitPrice * multiplier
                totalHours += product.hours * multiplier
            } else if (id === 'probate') {
                const multiplier = probateStateCount
                probateEngineTotalBase += unitPrice * multiplier
                totalHours += product.hours * multiplier
            } else {
                addonsTotalBase += unitPrice
                totalHours += unitHours
            }
        }
    })

    const internalTotal = bundleTotalBase + addonsTotalBase + ceoConsultingTotalBase + probateEngineTotalBase
    const scale = multiplier || 1.0

    // Market Valuation Rule 13: $250/hr
    const marketTotal = totalHours * 250

    return {
        total: Math.round(internalTotal * scale),
        internalTotal: internalTotal,
        marketTotal: marketTotal,
        totalHours: totalHours,
        breakdown: {
            bundle: Math.round(bundleTotalBase * scale),
            addons: Math.round(addonsTotalBase * scale),
            special: {
                ceoConsulting: Math.round(ceoConsultingTotalBase * scale),
                probateEngine: Math.round(probateEngineTotalBase * scale)
            }
        }
    }
}



export function calculateTimeline(
    bundleId: string | null,
    addonIds: string[],
    probateStateCount: number = 1
): number {
    const maxTimeline = bundleId ? BUNDLES[bundleId].timeline : 0
    let addonTime = 0

    addonIds.forEach(id => {
        const product = PRODUCTS[id]
        if (product && product.timelineUnit === 'weeks') {
            if (id === 'probate') {
                // First state is 10 weeks, each additional state adds 2 weeks of raw duration (1 week parallelized)
                const stateCount = Math.max(1, probateStateCount)
                addonTime += product.timeline + ((stateCount - 1) * 2)
            } else if (id === 'ceo-consulting') {
                // CEO Consulting runs in parallel, doesn't add to dev timeline directly
                return
            } else {
                addonTime += product.timeline
            }
        }
    })

    // 50% parallelization factor - realistic for small agency with integration overhead
    return maxTimeline + Math.ceil(addonTime * 0.5)
}

// ============================================
// DYNAMIC WBS GENERATOR (Sirsi Reusable Logic)
// ============================================

const HOURLY_RATE = 125 // $/hour for labor calculations

// Role distribution for auto-generated activities
const ROLE_DISTRIBUTION = [
    { role: 'Sr. Architect', percentage: 0.15 },
    { role: 'Backend Eng', percentage: 0.25 },
    { role: 'Frontend Eng', percentage: 0.25 },
    { role: 'DevOps Eng', percentage: 0.15 },
    { role: 'QA Engineer', percentage: 0.10 },
    { role: 'Security Eng', percentage: 0.10 }
]

/**
 * Generate WBS phases dynamically from product metadata
 * This is the Sirsi-reusable engine logic
 */
function generateProductWBS(product: Product | Bundle, startWeek: number = 1): WBSPhase[] {
    const timeline = 'timeline' in product ? product.timeline : 16
    const price = 'price' in product ? product.price : ('bundledPrice' in product ? product.bundledPrice : 0)
    const name = product.name
    const scope = product.detailedScope || []

    // Calculate total hours from price (at $125/hour rate)
    const totalHours = Math.round(price / HOURLY_RATE)

    // Determine number of phases based on timeline
    const numPhases = Math.max(1, Math.ceil(timeline / 4)) // ~4 weeks per phase
    const weeksPerPhase = Math.ceil(timeline / numPhases)
    const hoursPerPhase = Math.ceil(totalHours / numPhases)
    const costPerPhase = Math.round(price / numPhases)

    const phases: WBSPhase[] = []

    // Generate phases based on detailed scope or default structure
    if (scope.length >= numPhases) {
        // Use scope items as phase guides
        for (let i = 0; i < numPhases; i++) {
            const phaseStart = startWeek + (i * weeksPerPhase)
            const phaseEnd = phaseStart + weeksPerPhase - 1
            const scopeItem = scope[i] || scope[scope.length - 1]

            phases.push({
                phaseNum: i + 1,
                name: scopeItem.title,
                weeks: `${phaseStart}-${phaseEnd}`,
                hours: hoursPerPhase,
                cost: costPerPhase,
                activities: generateActivities(scopeItem, hoursPerPhase, costPerPhase)
            })
        }
    } else {
        // Generate default phases
        const defaultPhaseNames = [
            'Foundation & Architecture',
            'Core Development',
            'Integration & Features',
            'Testing & Launch'
        ]

        for (let i = 0; i < numPhases; i++) {
            const phaseStart = startWeek + (i * weeksPerPhase)
            const phaseEnd = phaseStart + weeksPerPhase - 1
            const phaseName = i < defaultPhaseNames.length
                ? `${name}: ${defaultPhaseNames[i]}`
                : `${name}: Phase ${i + 1}`

            phases.push({
                phaseNum: i + 1,
                name: phaseName,
                weeks: `${phaseStart}-${phaseEnd}`,
                hours: hoursPerPhase,
                cost: costPerPhase,
                activities: generateDefaultActivities(name, hoursPerPhase, costPerPhase, i)
            })
        }
    }

    return phases
}

function generateActivities(scope: DetailedScopeItem, totalHours: number, totalCost: number): WBSActivity[] {
    const activities: WBSActivity[] = []
    const numActivities = Math.min(scope.subItems.length, 4) || 1
    const hoursPerActivity = Math.ceil(totalHours / numActivities)
    const costPerActivity = Math.round(totalCost / numActivities)

    for (let i = 0; i < numActivities; i++) {
        const activityName = scope.subItems[i] || scope.title
        const role = ROLE_DISTRIBUTION[i % ROLE_DISTRIBUTION.length].role

        activities.push({
            name: activityName,
            role,
            hours: hoursPerActivity,
            cost: costPerActivity
        })
    }

    return activities
}

function generateDefaultActivities(_productName: string, totalHours: number, totalCost: number, phaseIndex: number): WBSActivity[] {
    const phaseActivities = [
        ['System Architecture', 'Infrastructure Setup', 'Database Design'],
        ['Backend Development', 'Frontend Development', 'API Integration'],
        ['Feature Implementation', 'Third-Party Integration', 'Security Hardening'],
        ['End-to-End Testing', 'Performance Optimization', 'Deployment']
    ]

    const activities: WBSActivity[] = []
    const activityNames = phaseActivities[phaseIndex % phaseActivities.length]
    const hoursPerActivity = Math.ceil(totalHours / activityNames.length)
    const costPerActivity = Math.round(totalCost / activityNames.length)

    activityNames.forEach((actName, i) => {
        activities.push({
            name: actName,
            role: ROLE_DISTRIBUTION[i % ROLE_DISTRIBUTION.length].role,
            hours: hoursPerActivity,
            cost: costPerActivity
        })
    })

    return activities
}

/**
 * Aggregate WBS from bundle + add-ons with proper timeline extension
 * Add-ons are inserted BEFORE Testing & Launch phase
 */
export function getAggregatedWBS(
    bundleId: string | null,
    addonIds: string[],
    ceoConsultingWeeks: number = 1,
    probateStateCount: number = 1
): WBSPhase[] {
    const phases: WBSPhase[] = []
    const hasBundle = bundleId !== null

    // Generate bundle phases dynamically (or use override if defined)
    if (bundleId && BUNDLES[bundleId]) {
        const bundle = BUNDLES[bundleId]
        if (bundle.wbs && bundle.wbs.length > 0) {
            phases.push(...JSON.parse(JSON.stringify(bundle.wbs)))
        } else {
            phases.push(...generateProductWBS(bundle, 1))
        }
    }

    // Find Testing & Launch phase to insert add-ons before it
    const testingPhaseIndex = phases.findIndex(p =>
        p.name.toLowerCase().includes('testing') ||
        p.name.toLowerCase().includes('launch') ||
        p.name.toLowerCase().includes('qa')
    )

    // Determine where add-on development starts (week 9 = after Foundation & Core Dev)
    const addonStartWeek = bundleId ? 9 : 1
    let currentWeekStart = addonStartWeek

    // Collect add-on phases
    const addonPhases: WBSPhase[] = []

    addonIds.forEach(id => {
        const product = PRODUCTS[id]
        if (!product) return

        // Skip recurring/support products for the main dev timeline, 
        // but include them in WBS if they have hours (except maintenance which is yearly)
        if (id === 'maintenance') return

        let multiplier = 1
        if (id === 'ceo-consulting') multiplier = Math.max(1, ceoConsultingWeeks)
        if (id === 'probate') multiplier = Math.max(1, probateStateCount)

        const standPrice = product.standalonePrice || Math.round(product.bundledPrice * 1.5)
        const unitPrice = hasBundle ? product.bundledPrice : standPrice
        const totalAddonPrice = unitPrice * multiplier
        const totalHours = Math.round(totalAddonPrice / HOURLY_RATE)

        // Only extend timeline for buildable features (weeks unit)
        if (product.timelineUnit === 'weeks' && id !== 'ceo-consulting') {
            const baseDuration = product.timeline
            // Scaling duration: first state is base, each extra state adds 1 week of parallelized time
            const duration = id === 'probate' ? (baseDuration + (multiplier - 1) * 2) : baseDuration
            const parallelizedWeeks = Math.ceil(duration * 0.5)
            const weekEnd = currentWeekStart + parallelizedWeeks - 1

            addonPhases.push({
                phaseNum: 0,
                name: multiplier > 1 ? `${product.name} (${multiplier})` : product.name,
                weeks: `${currentWeekStart}-${weekEnd}`,
                hours: totalHours,
                cost: Math.round(totalAddonPrice * 0.4), // Revenue-at-risk/labor cost factor
                activities: product.detailedScope?.slice(0, 3).map((scope, i) => ({
                    name: scope.title,
                    role: ROLE_DISTRIBUTION[i % ROLE_DISTRIBUTION.length].role,
                    hours: Math.round(totalHours / 3),
                    cost: Math.round((totalAddonPrice * 0.4) / 3)
                })) || [{
                    name: `${product.name} Implementation`,
                    role: 'Full Stack',
                    hours: totalHours,
                    cost: Math.round(totalAddonPrice * 0.4)
                }]
            })
            currentWeekStart = weekEnd + 1
        } else if (id === 'ceo-consulting') {
            // CEO consulting doesn't extend timeline but is in WBS
            addonPhases.push({
                phaseNum: 0,
                name: `${product.name} (${multiplier} weeks)`,
                weeks: `1-${multiplier}`,
                hours: totalHours,
                cost: Math.round(totalAddonPrice * 0.4),
                activities: [{
                    name: 'Strategic Advisory',
                    role: 'CEO',
                    hours: totalHours,
                    cost: Math.round(totalAddonPrice * 0.4)
                }]
            })
        }
    })

    // Insert add-on phases before Testing & Launch
    const insertIndex = testingPhaseIndex !== -1 ? testingPhaseIndex : phases.length
    phases.splice(insertIndex, 0, ...addonPhases)

    // Update Testing phase weeks if add-ons extend the timeline
    if (addonPhases.length > 0 && testingPhaseIndex !== -1) {
        const testingPhase = phases[insertIndex + addonPhases.length]
        if (testingPhase) {
            const testingDuration = 4
            testingPhase.weeks = `${currentWeekStart}-${currentWeekStart + testingDuration - 1}`
        }
    }

    // Renumber all phases
    phases.forEach((phase, idx) => {
        phase.phaseNum = idx + 1
    })

    return phases
}

export function calculateTotalHours(
    bundleId: string | null,
    addonIds: string[],
    ceoConsultingWeeks: number = 1,
    probateStateCount: number = 1
): number {
    // Hours are based on the BASE INTERNAL RATE ($125/hr)
    return getAggregatedWBS(bundleId, addonIds, ceoConsultingWeeks, probateStateCount).reduce((acc, p) => acc + p.hours, 0)
}


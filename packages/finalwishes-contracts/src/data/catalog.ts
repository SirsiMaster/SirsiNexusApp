// FinalWishes Product Catalog
// This is the single source of truth for all products and pricing
// Ported from the SIRSI Universal Offerings Engine (catalog-data.js)

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
    timeline: number
    timelineUnit: 'weeks' | 'months'
    features?: string[]
    detailedScope?: DetailedScopeItem[]
    wbs?: WBSPhase[]
    recurring?: boolean
    prerequisites?: string[]
}

export interface Bundle {
    id: string
    name: string
    shortDescription: string
    description: string
    price: number
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
                phaseNum: 1, name: 'Foundation & Cloud Infrastructure', weeks: '1-4', hours: 120, cost: 24000,
                activities: [
                    { name: 'System Architecture & Technical Design', role: 'Sr. Architect', hours: 30, cost: 6000 },
                    { name: 'Google Cloud Project Setup', role: 'DevOps Eng', hours: 20, cost: 4000 },
                    { name: 'Database Schema Design', role: 'Backend Eng', hours: 20, cost: 4000 },
                    { name: 'Authentication System', role: 'Security Eng', hours: 20, cost: 4000 }
                ]
            },
            {
                phaseNum: 2, name: 'Core Application Development', weeks: '5-8', hours: 140, cost: 28000,
                activities: [
                    { name: 'Web Application Shell', role: 'Frontend Eng', hours: 30, cost: 6000 },
                    { name: 'Mobile Application Shell', role: 'Mobile Eng', hours: 35, cost: 7000 },
                    { name: '"The Shepherd" AI Foundation', role: 'AI Engineer', hours: 30, cost: 6000 }
                ]
            }
        ]
    }
}

export const PRODUCTS: Record<string, Product> = {
    'branding': {
        id: 'branding',
        name: 'Branding & Identity',
        shortDescription: 'Logo, voice guide, UI kit',
        description: 'Complete brand identity system.',
        category: 'service',
        bundledPrice: 30000,
        standalonePrice: 45000,
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
    'maintenance': {
        id: 'maintenance',
        name: 'Maintenance & Support',
        shortDescription: '12-month support (20 hrs/mo)',
        description: 'Annual support contract.',
        category: 'service',
        bundledPrice: 18000,
        standalonePrice: 27000,
        timeline: 12,
        timelineUnit: 'months',
        recurring: true,
        detailedScope: [
            {
                title: "Maintenance & Support",
                content: "Ongoing technical guardianship.",
                subItems: ["20 Hours monthly support", "Priority bug fixes", "Security patching", "Infrastructure audits"]
            }
        ]
    },
    'estate': {
        id: 'estate',
        name: 'Estate Administration',
        shortDescription: 'Executor tools & asset tracking',
        description: 'Estate management module.',
        category: 'feature',
        bundledPrice: 65000,
        standalonePrice: 97500,
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
                phaseNum: 3, name: 'Module Integration', weeks: '9-12', hours: 80, cost: 16000,
                activities: [
                    { name: 'Estate Logic Integration', role: 'Backend Eng', hours: 40, cost: 8000 },
                    { name: 'Executor UI Components', role: 'Frontend Eng', hours: 40, cost: 8000 }
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
        bundledPrice: 35000,
        standalonePrice: 52500,
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
        bundledPrice: 25000,
        standalonePrice: null,
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
        bundledPrice: 30000,
        standalonePrice: 45000,
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
        bundledPrice: 45000,
        standalonePrice: 67500,
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
        bundledPrice: 60000,
        standalonePrice: 90000,
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
        bundledPrice: 55000,
        standalonePrice: 82500,
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
        bundledPrice: 40000,
        standalonePrice: 60000,
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
        bundledPrice: 35000,
        standalonePrice: 52500,
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
        bundledPrice: 75000,
        standalonePrice: 112500,
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
        bundledPrice: 45000,
        standalonePrice: 67500,
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
        bundledPrice: 25000,
        standalonePrice: 37500,
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
        bundledPrice: 30000,
        standalonePrice: 45000,
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
        bundledPrice: 20000,
        standalonePrice: 30000,
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
        bundledPrice: 45000,
        standalonePrice: 67500,
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
    'coaching': {
        id: 'coaching',
        name: 'Executor Professional Coaching',
        shortDescription: 'Executor training & support',
        description: 'Professional guidance for designated executors and trustees.',
        category: 'service',
        bundledPrice: 15000,
        standalonePrice: 22500,
        timeline: 12,
        timelineUnit: 'weeks',
        detailedScope: [
            {
                title: "Professional Executor Support",
                content: "Ensuring the person you trust most is actually prepared for the role.",
                subItems: ["Legal process orientation", "Platform administrative training", "Conflict resolution guidance", "Asset distribution checklists"]
            }
        ]
    },
    'blockchain': {
        id: 'blockchain',
        name: 'Smart Contract Legacy Trust',
        shortDescription: 'Immutable trust automation',
        description: 'Definitive automated asset release via immutable smart contracts.',
        category: 'feature',
        bundledPrice: 65000,
        standalonePrice: 97500,
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
        bundledPrice: 30000,
        standalonePrice: 45000,
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
        bundledPrice: 25000,
        standalonePrice: 37500,
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
        bundledPrice: 18000,
        standalonePrice: 27000,
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

export function getAddonPrice(id: string, hasBundle: boolean): number {
    const product = PRODUCTS[id]
    if (!product) return 0
    return hasBundle ? product.bundledPrice : (product.standalonePrice || product.bundledPrice * 1.5)
}

export function calculateTotal(bundleId: string | null, addonIds: string[]): number {
    let total = 0
    const hasBundle = bundleId !== null
    if (bundleId && BUNDLES[bundleId]) total += BUNDLES[bundleId].price
    addonIds.forEach(id => {
        const product = PRODUCTS[id]
        if (product) total += hasBundle ? product.bundledPrice : (product.standalonePrice || product.bundledPrice * 1.5)
    })
    return total
}

export function calculateTimeline(bundleId: string | null, addonIds: string[]): number {
    let maxTimeline = bundleId ? BUNDLES[bundleId].timeline : 0
    let addonTime = 0
    addonIds.forEach(id => {
        const product = PRODUCTS[id]
        if (product && product.timelineUnit === 'weeks') addonTime += product.timeline
    })
    return maxTimeline + Math.ceil(addonTime * 0.3)
}

export function getAggregatedWBS(bundleId: string | null, addonIds: string[]): WBSPhase[] {
    const phases: WBSPhase[] = []
    if (bundleId && BUNDLES[bundleId]?.wbs) phases.push(...JSON.parse(JSON.stringify(BUNDLES[bundleId]!.wbs)))
    addonIds.forEach(id => {
        const product = PRODUCTS[id]
        if (product && product.wbs) {
            product.wbs.forEach(ap => {
                const existing = phases.find(p => p.name === ap.name)
                if (existing) {
                    existing.hours += ap.hours
                    existing.cost += ap.cost
                    existing.activities.push(...ap.activities)
                } else {
                    phases.push({ ...ap, phaseNum: phases.length + 1 })
                }
            })
        }
    })
    return phases
}

export function calculateTotalHours(bundleId: string | null, addonIds: string[]): number {
    return getAggregatedWBS(bundleId, addonIds).reduce((acc, p) => acc + p.hours, 0)
}

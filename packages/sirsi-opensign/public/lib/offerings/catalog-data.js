/**
 * SIRSI UNIVERSAL OFFERINGS ENGINE
 * Multi-tenant product catalog system
 * 
 * @version 1.0.0
 * @author Sirsi Technologies
 * @license Proprietary
 */

const CATALOG_REGISTRY = {
    'sirsi-engineering': {
        catalogId: 'sirsi-engineering',
        projectId: 'sirsi',
        name: 'Sirsi Engineering Services',
        description: 'Custom software development for enterprise clients',
        currency: 'USD',
        active: true,
        defaultCatalog: true
    },
    'finalwishes-consumer': {
        catalogId: 'finalwishes-consumer',
        projectId: 'finalwishes',
        name: 'FinalWishes Consumer Products',
        description: 'Legacy curation products for end consumers',
        currency: 'USD',
        active: false
    }
};

const SIRSI_ENGINEERING_CATALOG = {
    catalogId: 'sirsi-engineering',
    projectId: 'sirsi',
    name: 'Sirsi Engineering Services',
    version: '1.0.0',
    lastUpdated: '2026-01-17',
    currency: 'USD',

    projectConfig: {
        'finalwishes': {
            name: 'FinalWishes',
            tagline: 'The Estate Operating System',
            logo: '/assets/logos/finalwishes-gold.svg',
            theme: 'royal-neo-deco',
            primaryColor: '#C8A951',
            accentColor: '#10B981',
            legalMetadata: {
                companyName: 'FinalWishes Inc.',
                jurisdiction: 'Maryland',
                disclosureAI: true,
                disclosureFinancial: true,
                maintenanceSLA: '4 hours'
            },
            valueRealization: {
                marketBase: 274000,
                marketMultiplier: 1.5,
                marketLabel: 'US Agency (Standard Rate)',
                googleBase: 68500,
                googleMultiplier: 0.15,
                googleLabel: 'SirsiNexus Efficiency Discount',
                sirsiBase: 68500,
                sirsiMultiplier: 0.10,
                sirsiLabel: 'Strategic Partnership Discount'
            },
            scopeSummary: {
                platform: 'Living Legacy Platform (iOS, Android, Web)',
                architecture: 'Google Cloud Fiber (Cloud Run, Firestore) + "The Shepherd" AI Agent Foundation',
                timeline: '20 Weeks Maximum Delivery'
            }
        }
    },

    pricing: {
        standaloneMultiplier: 1.5,
        bundleDiscountPercent: 0,
        minimumOrder: null,
        taxable: false,
        paymentPlans: [2, 3, 4]
    },

    categories: {
        'platform': { id: 'platform', name: 'Full Platform Builds', icon: '🏗️', order: 1, description: 'Complete application development', color: '#C8A951' },
        'feature': { id: 'feature', name: 'Feature Modules', icon: '🧩', order: 2, description: 'Add-on capabilities', color: '#3B82F6' },
        'service': { id: 'service', name: 'Professional Services', icon: '🎨', order: 3, description: 'Branding, support, consulting', color: '#10B981' }
    },

    bundles: {
        'finalwishes-core': {
            id: 'finalwishes-core',
            name: 'FinalWishes Core Platform',
            category: 'platform',
            basePrice: 137000,
            timeline: 20,
            timelineUnit: 'weeks',
            description: 'Full "Living Legacy" platform for iOS, Android, and Web.',
            shortDescription: 'Complete legacy curation platform',
            includes: ['vault-core', 'media-engine', 'ai-foundation', 'mobile-apps'],
            visible: true,
            featured: true,
            allowAddons: true,
            wbs: [
                {
                    phaseNum: 1, name: 'Foundation & Cloud Infrastructure', weeks: '1-4', hours: 120, cost: 24000,
                    activities: [
                        { name: 'System Architecture & Technical Design', role: 'Sr. Architect', hours: 30, cost: 6000 },
                        { name: 'Google Cloud Project Setup', role: 'DevOps Eng', hours: 20, cost: 4000 },
                        { name: 'Database Schema Design', role: 'Backend Eng', hours: 20, cost: 4000 },
                        { name: 'Authentication System', role: 'Security Eng', hours: 20, cost: 4000 },
                        { name: 'Vault Infrastructure', role: 'Security Eng', hours: 15, cost: 3000 },
                        { name: 'OpenSign Self-Hosted Deployment', role: 'DevOps Eng', hours: 15, cost: 3000 }
                    ]
                },
                {
                    phaseNum: 2, name: 'Core Application Development', weeks: '5-8', hours: 160, cost: 28000,
                    activities: [
                        { name: 'Web Application Shell', role: 'Frontend Eng', hours: 30, cost: 6000 },
                        { name: 'Mobile Application Shell', role: 'Mobile Eng', hours: 35, cost: 7000 },
                        { name: 'User Dashboard & Navigation', role: 'Frontend Eng', hours: 25, cost: 5000 },
                        { name: '"The Shepherd" AI Foundation', role: 'AI Engineer', hours: 30, cost: 6000 },
                        { name: 'Time Capsule Scheduling System', role: 'Full Stack', hours: 20, cost: 4000 }
                    ]
                },
                {
                    phaseNum: 3, name: 'Living Legacy Features', weeks: '9-12', hours: 140, cost: 26000,
                    activities: [
                        { name: 'Video Memorial Management', role: 'Full Stack', hours: 30, cost: 6000 },
                        { name: 'Photo Gallery Integration', role: 'Full Stack', hours: 25, cost: 5000 },
                        { name: 'Digital Lockbox Storage', role: 'Backend Eng', hours: 25, cost: 5000 },
                        { name: 'Beneficiary Management UI', role: 'Frontend Eng', hours: 25, cost: 5000 },
                        { name: 'Cross-Platform Sync', role: 'Mobile Eng', hours: 25, cost: 5000 }
                    ]
                },
                {
                    phaseNum: 4, name: 'QA, Integration & Launch', weeks: '13-16', hours: 100, cost: 17000,
                    activities: [
                        { name: 'End-to-End Testing', role: 'QA Engineer', hours: 25, cost: 5000 },
                        { name: 'Performance Optimization', role: 'DevOps Eng', hours: 15, cost: 3000 },
                        { name: 'Security Code Review', role: 'Security Eng', hours: 15, cost: 3000 },
                        { name: 'iOS App Store Submission', role: 'Mobile Eng', hours: 10, cost: 2000 },
                        { name: 'Google Play Store Submission', role: 'Mobile Eng', hours: 10, cost: 2000 },
                    ]
                },
                {
                    phaseNum: 5, name: 'Executive Advisory & Launch Optimization', weeks: '17-20', hours: 100, cost: 42000,
                    activities: [
                        { name: 'Lead Executive Consultation', role: 'Erin Horne McKinney', hours: 40, cost: 20000 },
                        { name: 'Product Market Fit Optimization', role: 'Erin Horne McKinney', hours: 30, cost: 12000 },
                        { name: 'Operational Transition Support', role: 'Erin Horne McKinney', hours: 30, cost: 10000 }
                    ]
                }
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
            ]
        }
    },

    products: {
        'ceo-consulting': {
            id: 'ceo-consulting',
            name: 'CEO Consulting',
            category: 'service',
            bundledPrice: 1000,
            standalonePrice: 1000,
            timeline: 1,
            timelineUnit: 'weeks',
            description: 'Direct executive partnership and strategic advisory.',
            shortDescription: 'Direct strategic partnership (20 hrs/week)',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            recurring: true,
            perWeek: true,
            wbs: [
                {
                    phaseNum: 1, name: 'Strategic Advisory', weeks: '1-1', hours: 20, cost: 1000,
                    activities: [
                        { name: 'Strategic Planning Session', role: 'Erin Horne McKinney', hours: 10, cost: 500 },
                        { name: 'Operational Oversight', role: 'Erin Horne McKinney', hours: 10, cost: 500 }
                    ]
                }
            ],
            detailedScope: [
                {
                    title: "Executive Strategic Partnership",
                    content: "High-level strategic guidance and operational oversight.",
                    subItems: [
                        "20 Hours weekly dedicated consulting",
                        "Direct access to Erin Horne McKinney (Lead Strategist)",
                        "Product roadmap validation",
                        "Strategic partnership development"
                    ]
                }
            ]
        },
        'branding': {
            id: 'branding',
            name: 'Branding & Identity',
            category: 'service',
            bundledPrice: 30000,
            standalonePrice: 30000,
            timeline: 8,
            timelineUnit: 'weeks',
            description: 'Complete brand identity system.',
            shortDescription: 'Logo, voice guide, UI kit',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Discovery & Strategy', weeks: '1-2', hours: 40, cost: 8000,
                    activities: [
                        { name: 'Brand Audit', role: 'Strategist', hours: 16, cost: 3200 },
                        { name: 'Stakeholder Interviews', role: 'Strategist', hours: 8, cost: 1600 },
                        { name: 'Positioning Workshop', role: 'Creative Director', hours: 16, cost: 3200 }
                    ]
                },
                {
                    phaseNum: 2, name: 'Visual Identity', weeks: '3-5', hours: 60, cost: 12000,
                    activities: [
                        { name: 'Logo Concepts', role: 'Senior Designer', hours: 24, cost: 4800 },
                        { name: 'Logo Refinement', role: 'Senior Designer', hours: 16, cost: 3200 },
                        { name: 'Color Palette & Typography', role: 'Designer', hours: 12, cost: 2400 },
                        { name: 'Brand Guidelines', role: 'Designer', hours: 8, cost: 1600 }
                    ]
                },
                {
                    phaseNum: 3, name: 'Application & Delivery', weeks: '6-8', hours: 50, cost: 10000,
                    activities: [
                        { name: 'UI Component Kit', role: 'UI Designer', hours: 20, cost: 4000 },
                        { name: 'Marketing Templates', role: 'Designer', hours: 16, cost: 3200 },
                        { name: 'Asset Export', role: 'Designer', hours: 14, cost: 2800 }
                    ]
                }
            ],
            detailedScope: [
                {
                    title: "Master Brand Identity",
                    content: "Creation of a comprehensive visual identity system.",
                    subItems: ["Logo marks", "Typography & Palette", "Voice & Tone", "UI/UX Figma Kit"]
                }
            ]
        },
        'maintenance': {
            id: 'maintenance',
            name: 'Maintenance & Support',
            category: 'service',
            bundledPrice: 18000,
            standalonePrice: 27000,
            timeline: 12,
            timelineUnit: 'months',
            description: 'Annual support contract.',
            shortDescription: '12-month support (20 hrs/mo)',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            recurring: true,
            wbs: null,
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
            category: 'feature',
            bundledPrice: 65000,
            standalonePrice: 97500,
            timeline: 8,
            timelineUnit: 'weeks',
            description: 'Estate management module.',
            shortDescription: 'Executor tools & asset tracking',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'Executor Dashboard', weeks: '1-3', hours: 80, cost: 24000,
                    activities: [
                        { name: 'Dashboard UI Design', role: 'UI Designer', hours: 20, cost: 6000 },
                        { name: 'Task Management', role: 'Full Stack', hours: 30, cost: 9000 },
                        { name: 'Status Tracking', role: 'Backend Eng', hours: 30, cost: 9000 }
                    ]
                }
            ],
            detailedScope: [
                {
                    title: "Estate Administration Hub",
                    content: "Specialized tools for legacy management.",
                    subItems: ["Executor dashboard", "Asset inventory", "Beneficiary portal", "Auditing"]
                }
            ]
        },
        'probate': {
            id: 'probate',
            name: 'Probate Engine (Per State)',
            category: 'feature',
            bundledPrice: 35000,
            standalonePrice: 52500,
            timeline: 10,
            timelineUnit: 'weeks',
            description: 'State-specific probate automation.',
            shortDescription: 'State-specific form automation',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'Probate Core Engine', weeks: '1-4', hours: 80, cost: 16000,
                    activities: [
                        { name: 'Statute Database', role: 'Backend Eng', hours: 30, cost: 6000 },
                        { name: 'Form Template Engine', role: 'Full Stack', hours: 30, cost: 6000 },
                        { name: 'Deadline Calculator', role: 'Backend Eng', hours: 20, cost: 4000 }
                    ]
                }
            ],
            detailedScope: [
                {
                    title: "State-Specific Probate Engine",
                    content: "Automation of primary probate filings and documentation for a specific jurisdiction.",
                    subItems: ["Statutory form templates", "Local court filing rules integration", "Deadline and timeline calculators", "Asset-to-heir distribution logic"]
                }
            ]
        },
        'probate-ai': {
            id: 'probate-ai',
            name: 'Probate AI Enhancement',
            category: 'feature',
            bundledPrice: 25000,
            standalonePrice: null,
            timeline: 4,
            timelineUnit: 'weeks',
            description: 'AI-powered probate assistance.',
            shortDescription: 'AI form analysis',
            prerequisites: ['probate'],
            standalone: false,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'AI Integration', weeks: '1-4', hours: 80, cost: 25000,
                    activities: [
                        { name: 'Gemini RAG Setup', role: 'AI Engineer', hours: 30, cost: 9375 },
                        { name: 'Form Pre-fill', role: 'AI Engineer', hours: 25, cost: 7812 },
                        { name: 'Deadline Prediction', role: 'AI Engineer', hours: 25, cost: 7813 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 30000,
            standalonePrice: 45000,
            timeline: 4,
            timelineUnit: 'weeks',
            description: 'Encrypted messaging system.',
            shortDescription: 'Encrypted messaging & alerts',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Secure Messaging', weeks: '1-2', hours: 50, cost: 15000,
                    activities: [
                        { name: 'E2E Encryption', role: 'Security Eng', hours: 25, cost: 7500 },
                        { name: 'Message UI', role: 'Frontend Eng', hours: 25, cost: 7500 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 45000,
            standalonePrice: 67500,
            timeline: 6,
            timelineUnit: 'weeks',
            description: 'Virtual memorial platform.',
            shortDescription: 'Live streaming & guestbook',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Memorial Platform', weeks: '1-3', hours: 60, cost: 22500,
                    activities: [
                        { name: 'YouTube Live Integration', role: 'Full Stack', hours: 30, cost: 11250 },
                        { name: 'Memorial Page Builder', role: 'Frontend Eng', hours: 30, cost: 11250 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 60000,
            standalonePrice: 90000,
            timeline: 10,
            timelineUnit: 'weeks',
            description: 'Plaid-powered asset discovery.',
            shortDescription: 'Plaid-powered asset search',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'Plaid Integration', weeks: '1-4', hours: 80, cost: 24000,
                    activities: [
                        { name: 'Plaid Link Setup', role: 'Full Stack', hours: 30, cost: 9000 },
                        { name: 'Institution Connection', role: 'Full Stack', hours: 25, cost: 7500 },
                        { name: 'Account Sync Engine', role: 'Backend Eng', hours: 25, cost: 7500 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 55000,
            standalonePrice: 82500,
            timeline: 10,
            timelineUnit: 'weeks',
            description: 'AI-driven voice and visual synthesis for living memorials.',
            shortDescription: 'Voice cloning & avatar memorial',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'AI Model Engineering', weeks: '1-6', hours: 100, cost: 35000,
                    activities: [
                        { name: 'Voice Synthesis Pipeline', role: 'AI Engineer', hours: 40, cost: 14000 },
                        { name: 'Avatar Rendering Engine', role: 'AI Engineer', hours: 40, cost: 14000 },
                        { name: 'Emotional Tone Mapping', role: 'Data Scientist', hours: 20, cost: 7000 }
                    ]
                },
                {
                    phaseNum: 2, name: 'Interaction Logic', weeks: '7-10', hours: 60, cost: 20000,
                    activities: [
                        { name: 'Real-time Dialog Flow', role: 'Full Stack', hours: 30, cost: 10000 },
                        { name: 'Mobile Rendering Client', role: 'Mobile Eng', hours: 30, cost: 10000 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 40000,
            standalonePrice: 60000,
            timeline: 8,
            timelineUnit: 'weeks',
            description: 'Automated closing and transfer of digital accounts.',
            shortDescription: 'Automated account transitions',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Integration Engine', weeks: '1-5', hours: 80, cost: 25000,
                    activities: [
                        { name: 'Social Media API Bridges', role: 'Backend Eng', hours: 40, cost: 12500 },
                        { name: 'Account Auth Handlers', role: 'Security Eng', hours: 40, cost: 12500 }
                    ]
                },
                {
                    phaseNum: 2, name: 'Execution UI', weeks: '6-8', hours: 40, cost: 15000,
                    activities: [
                        { name: 'Executor Action Console', role: 'Frontend Eng', hours: 40, cost: 15000 }
                    ]
                }
            ],
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
            category: 'service',
            bundledPrice: 35000,
            standalonePrice: 52500,
            timeline: 8,
            timelineUnit: 'weeks',
            description: 'Multi-region data residency and compliance (GDPR, CCPA).',
            shortDescription: 'GDPR / Multi-region privacy',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Architecture Hardening', weeks: '1-8', hours: 80, cost: 35000,
                    activities: [
                        { name: 'Multi-Region VPC Setup', role: 'DevOps Eng', hours: 30, cost: 13125 },
                        { name: 'Privacy Policy Automation', role: 'Legal Tech', hours: 25, cost: 10937 },
                        { name: 'Data Subject Request Tools', role: 'Full Stack', hours: 25, cost: 10938 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 75000,
            standalonePrice: 112500,
            timeline: 12,
            timelineUnit: 'weeks',
            description: 'White-label dashboard for funeral homes and law firms.',
            shortDescription: 'B2B Partner & Branding system',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'B2B Admin Infrastructure', weeks: '1-6', hours: 100, cost: 40000,
                    activities: [
                        { name: 'Multi-Tenant Partner Logic', role: 'Sr. Architect', hours: 40, cost: 16000 },
                        { name: 'Custom Branding Engine', role: 'Full Stack', hours: 30, cost: 12000 },
                        { name: 'Partner Permission Sets', role: 'Backend Eng', hours: 30, cost: 12000 }
                    ]
                },
                {
                    phaseNum: 2, name: 'Partner Interface', weeks: '7-12', hours: 80, cost: 35000,
                    activities: [
                        { name: 'Client Onboarding Dashboard', role: 'Frontend Eng', hours: 40, cost: 17500 },
                        { name: 'Reporting & Billing', role: 'Full Stack', hours: 40, cost: 17500 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 45000,
            standalonePrice: 67500,
            timeline: 8,
            timelineUnit: 'weeks',
            description: 'Automation for charitable donations and foundation setup.',
            shortDescription: 'Automated legacy philanthropy',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Philanthropy Core', weeks: '1-8', hours: 100, cost: 45000,
                    activities: [
                        { name: 'Charity Verification (Guidestar)', role: 'Backend Eng', hours: 30, cost: 13500 },
                        { name: 'Donation Smart Contracts', role: 'Blockchain Eng', hours: 40, cost: 18000 },
                        { name: 'Legacy Foundation Templates', role: 'Full Stack', hours: 30, cost: 13500 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 25000,
            standalonePrice: 37500,
            timeline: 6,
            timelineUnit: 'weeks',
            description: 'Ancestry.com and FamilySearch automatic data sync.',
            shortDescription: 'Deep lineage & history sync',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Lineage Engineering', weeks: '1-6', hours: 60, cost: 25000,
                    activities: [
                        { name: 'Ancestry API Connector', role: 'Backend Eng', hours: 30, cost: 12500 },
                        { name: 'Visual Family Tree Builder', role: 'Frontend Eng', hours: 30, cost: 12500 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 30000,
            standalonePrice: 45000,
            timeline: 6,
            timelineUnit: 'weeks',
            description: 'Ultra-secure vault access using Shamir\'s Secret Sharing.',
            shortDescription: 'Multi-heir vault unlocking',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'Security Engineering', weeks: '1-6', hours: 60, cost: 30000,
                    activities: [
                        { name: 'SSS Algorithm Implementation', role: 'Security Eng', hours: 30, cost: 15000 },
                        { name: 'Heir Distribution Logic', role: 'Security Eng', hours: 30, cost: 15000 }
                    ]
                }
            ],
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
            category: 'service',
            bundledPrice: 20000,
            standalonePrice: 30000,
            timeline: 4,
            timelineUnit: 'weeks',
            description: 'Physical publishing of memoirs and ethical wills.',
            shortDescription: 'Physical ethical will books',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Print Production Engine', weeks: '1-4', hours: 50, cost: 20000,
                    activities: [
                        { name: 'PDF Book Layout Generator', role: 'Full Stack', hours: 25, cost: 10000 },
                        { name: 'Print Vendor API Setup', role: 'Backend Eng', hours: 25, cost: 10000 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 45000,
            standalonePrice: 67500,
            timeline: 6,
            timelineUnit: 'weeks',
            description: 'Secure legacy transfer of cryptocurrency and NFT assets.',
            shortDescription: 'Crypto & NFT legacy vault',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Web3 Integration', weeks: '1-6', hours: 80, cost: 45000,
                    activities: [
                        { name: 'Multi-chain Wallet Connect', role: 'Blockchain Eng', hours: 40, cost: 22500 },
                        { name: 'Cold Storage Logic', role: 'Security Eng', hours: 40, cost: 22500 }
                    ]
                }
            ],
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
            category: 'service',
            bundledPrice: 15000,
            standalonePrice: 22500,
            timeline: 12,
            timelineUnit: 'weeks',
            description: 'Professional guidance for designated executors and trustees.',
            shortDescription: 'Executor training & support',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Training Program', weeks: '1-12', hours: 40, cost: 15000,
                    activities: [
                        { name: 'Weekly Strategy Sessions', role: 'Project Mgr', hours: 40, cost: 15000 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 65000,
            standalonePrice: 97500,
            timeline: 10,
            timelineUnit: 'weeks',
            description: 'Definitive automated asset release via immutable smart contracts.',
            shortDescription: 'Immutable trust automation',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: true,
            wbs: [
                {
                    phaseNum: 1, name: 'On-Chain Engineering', weeks: '1-10', hours: 120, cost: 65000,
                    activities: [
                        { name: 'Smart Contract Audit', role: 'Security Auditor', hours: 40, cost: 21666 },
                        { name: 'Trust Deployment Logic', role: 'Blockchain Eng', hours: 40, cost: 21667 },
                        { name: 'Gas Management Engine', role: 'Backend Eng', hours: 40, cost: 21667 }
                    ]
                }
            ],
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
            category: 'service',
            bundledPrice: 30000,
            standalonePrice: 45000,
            timeline: 6,
            timelineUnit: 'weeks',
            description: 'Professional video editing and archival for family documentaries.',
            shortDescription: 'Pro-grade cinematic legacy',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Post-Production', weeks: '1-6', hours: 80, cost: 30000,
                    activities: [
                        { name: 'Cinematic Video Editing', role: 'Media Editor', hours: 50, cost: 18750 },
                        { name: 'Audio Restoration', role: 'Audio Engineer', hours: 30, cost: 11250 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 25000,
            standalonePrice: 37500,
            timeline: 4,
            timelineUnit: 'weeks',
            description: 'Hyper-resilient security with cross-region key management.',
            shortDescription: 'Multi-region KMS hardening',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Security Hardening', weeks: '1-4', hours: 60, cost: 25000,
                    activities: [
                        { name: 'KMS Cross-region Sync', role: 'Security Eng', hours: 30, cost: 12500 },
                        { name: 'Disaster Recovery Drill', role: 'DevOps Eng', hours: 30, cost: 12500 }
                    ]
                }
            ],
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
            category: 'feature',
            bundledPrice: 18000,
            standalonePrice: 27000,
            timeline: 6,
            timelineUnit: 'weeks',
            description: 'Advanced data insights into estate health and value growth.',
            shortDescription: 'Estate health & growth insights',
            prerequisites: [],
            standalone: true,
            visible: true,
            featured: false,
            wbs: [
                {
                    phaseNum: 1, name: 'Analytics Engine', weeks: '1-6', hours: 50, cost: 18000,
                    activities: [
                        { name: 'Data Aggregation pipeline', role: 'Data Eng', hours: 25, cost: 9000 },
                        { name: 'Visualization Dashboard', role: 'Frontend Eng', hours: 25, cost: 9000 }
                    ]
                }
            ],
            detailedScope: [
                {
                    title: "Estate Intelligence Dashboard",
                    content: "Providing real-time insights into the total value and health of a legacy portfolio.",
                    subItems: ["Automated valuation of digital assets", "Tax impact forecasting", "Heir engagement metrics", "Document expiration alerts"]
                }
            ]
        }
    }
};

/**
 * Get catalog by ID
 */
function getCatalog(catalogId) {
    if (catalogId === 'sirsi-engineering') {
        return SIRSI_ENGINEERING_CATALOG;
    }
    return null;
}

/**
 * Get the default catalog
 */
function getDefaultCatalog() {
    return SIRSI_ENGINEERING_CATALOG;
}

/**
 * Get all visible products
 */
function getVisibleProducts(catalog) {
    return Object.values(catalog.products).filter(p => p.visible);
}

/**
 * Get all visible bundles
 */
function getVisibleBundles(catalog) {
    return Object.values(catalog.bundles).filter(b => b.visible);
}

/**
 * Get products by category
 */
function getProductsByCategory(catalog, categoryId) {
    return Object.values(catalog.products).filter(p => p.visible && p.category === categoryId);
}

/**
 * Get featured items
 */
function getFeaturedItems(catalog) {
    const bundles = Object.values(catalog.bundles).filter(b => b.visible && b.featured);
    const products = Object.values(catalog.products).filter(p => p.visible && p.featured);
    return [...bundles, ...products];
}

/**
 * Check if a product can be purchased
 */
function checkPrerequisites(catalog, productId, cartItems) {
    const product = catalog.products[productId];
    if (!product) return { canPurchase: false, missingPrereqs: [] };
    if (!product.prerequisites || product.prerequisites.length === 0) {
        return { canPurchase: true, missingPrereqs: [] };
    }
    const missing = product.prerequisites.filter(prereq => !cartItems.includes(prereq));
    return {
        canPurchase: missing.length === 0,
        missingPrereqs: missing.map(id => catalog.products[id]?.name || id)
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CATALOG_REGISTRY,
        SIRSI_ENGINEERING_CATALOG,
        getCatalog,
        getDefaultCatalog,
        getVisibleProducts,
        getVisibleBundles,
        getProductsByCategory,
        getFeaturedItems,
        checkPrerequisites
    };
}

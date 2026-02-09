/**
 * Project Template Registry
 * ═══════════════════════════════════════════════════════════
 * Dynamic contract template system. Each tenant/project gets
 * its own content definitions for the contract workflow tabs.
 * 
 * This is the single source of truth for per-project content.
 * Tab components read from this registry via `getProjectTemplate(projectId)`.
 * 
 * To add a new tenant: add an entry to TEMPLATES below.
 * ═══════════════════════════════════════════════════════════
 */

export interface TechStackItem {
    label: string
    value: string
}

export interface ProjectTemplate {
    /** Unique key matching the projectId */
    key: string
    /** Display name for the project */
    projectDisplayName: string
    /** Company/org offering the service */
    providerName: string
    /** Short code for document references (e.g., FW, FM) */
    docCode: string

    // ── Executive Summary Tab ──
    primaryObjectiveTitle: string
    primaryObjectiveDescription: string
    strategicPosition: string
    techStack: TechStackItem[]

    // ── SOW Tab ──
    sowObjective: string
    sowPlatformType: string

    // ── MSA Tab ──
    msaRecital: string
    msaForegroundIpDescription: string
    msaForegroundIpItems: string[]
    msaVerticalLicense: string
    msaNonCompeteVertical: string
    msaSowOverview: string
    msaSowObjective: string
    msaAssumptions: string[]
    msaNoSelectFallback: string
    msaCostIntro: string

    // ── Document Scope (MSA Exhibit A §2.4) ──
    msaDocumentScope: {
        title: string
        content: string
    }[]

    // ── Vault Tab ──
    docType: string
}

// ═══════════════════════════════════════════════════════════
// Template Definitions
// ═══════════════════════════════════════════════════════════

const TEMPLATES: Record<string, ProjectTemplate> = {

    // ── FinalWishes (Default) ──
    finalwishes: {
        key: 'finalwishes',
        projectDisplayName: 'FinalWishes Platform',
        providerName: 'Sirsi Technologies',
        docCode: 'FW',

        primaryObjectiveTitle: 'The Living Legacy Platform',
        primaryObjectiveDescription:
            'To architect and deploy a secure, multi-tenant digital preservation engine that ' +
            'allows Principals to curate their "Final Wishes"—including digital assets, legal ' +
            'instructions, and emotional legacies—using AI-driven guidance and a "Vault-Grade" ' +
            'security infrastructure.',
        strategicPosition:
            'Sirsi acts as the Technical Lead, leveraging the Nexus V4 Core to ' +
            'accelerate 0-to-1 development by 60%. We are not just building an app; we are ' +
            'deploying a private, permanent infrastructure for estate management.',
        techStack: [
            { label: 'Logic', value: 'Go (Golang) / Cloud Run' },
            { label: 'Intelligence', value: 'Google Vertex AI (Gemini)' },
            { label: 'Vault', value: 'Cloud SQL + KMS Encryption' },
            { label: 'Mobile', value: 'React Native Expo' },
        ],

        sowObjective:
            'Establish a permanent, industrial-grade "Living Legacy" platform spanning iOS, Android, and Web, ' +
            'powered by Sirsi\'s component library and Google Cloud\'s enterprise AI infrastructure.',
        sowPlatformType: 'Legacy Management',

        msaRecital:
            'Client desires to engage Provider to design, develop, and implement a legacy management system ' +
            'known as {projectName} (the "Platform"), with sufficient foundational infrastructure to support ' +
            'future expansion into estate settlement capabilities in jurisdictions such as Maryland, Illinois, and Minnesota',
        msaForegroundIpDescription:
            'the Intellectual Property Rights in the comprehensive body of specific business logic, ' +
            'legacy management scripts, configurations, and unique operational workflows developed strictly ' +
            'and exclusively for {projectName} that rely upon but are distinct from Background Technology',
        msaForegroundIpItems: [
            'Custom UI/UX designs, visual interfaces, and brand assets specific to {projectName}',
            'Jurisdiction-specific probate logic, workflows, and regulatory compliance rules, inclusive of but not restricted to Maryland, Illinois, and Minnesota, or any other federal, state, or local governmental jurisdictions',
            'Proprietary content, decision trees, and conversational scripts authored for \'The Shepherd\' guidance engine (defining the interactive user prompts, educational narratives, and process navigation pathways)',
            'Unique data schemas and information architecture (representing the specific definitions, organization, and structural relationships of Client\'s proprietary business data)',
        ],
        msaVerticalLicense:
            'within the field of Legacy Management and Digital Inheritance Automation',
        msaNonCompeteVertical:
            'Legacy Management or Digital Inheritance',
        msaSowOverview:
            'This Statement of Work ("SOW") defines the comprehensive scope for the {projectName} Legacy Management System. ' +
            'This project aims to build foundational legacy management infrastructure with foundational support for future expansion ' +
            'into estate settlement capabilities in jurisdictions such as Maryland, Illinois, and Minnesota.',
        msaSowObjective:
            'deliver a "Vault-Grade" secure platform that allows users to securely organize, document, and manage their legacy assets ' +
            'and final wishes, providing a permanent, cryptographically-secure repository for digital inheritance and beneficiary instructions.',
        msaAssumptions: [
            'Future Expansion Support: Logic is focused on foundational legacy management, with future support planned for Maryland, Illinois, and Minnesota.',
            'No Legal Advice: The "Shepherd" guides users through site and application logic and provides procedural guidance, not legal advice.',
            'Third-Party Costs: Client pays direct consumption costs for Stripe, Plaid, Lob, and Google Cloud.',
            'Content: Client is responsible for final validation of court form templates.',
        ],
        msaNoSelectFallback: 'Core Legacy Management Platform (Standard Bundle)',
        msaCostIntro:
            'The {projectName} project leverages the Sirsi Nexus V4 Framework to achieve enterprise-grade results ' +
            'at a fraction of typical market costs. By utilizing pre-validated logic engines and infrastructure-as-code ' +
            'deployments, we realize significant savings.',
        msaDocumentScope: [
            {
                title: 'A. Identity & Vital Records',
                content: 'Death Certificate (Manual upload/OCR processing); Social Security/Gov ID (Secure entry & validation).',
            },
            {
                title: 'B. Future State Engine Framework (Expansion)',
                content: 'Maryland/Illinois/Minnesota: Foundational logic mapping for future expansion into MDEC (Maryland), eCourt (Illinois), and MNCIS (Minnesota) e-filing guidance. Note: Active development of direct court filing automation is reserved for future statement(s) of work.',
            },
            {
                title: 'C. Financial & Asset Documents',
                content: 'Asset Discovery (Plaid integration for 12,000+ institutions); Life Insurance/Retirement (Standard claim letter generation); Real Estate (Manual tracking + valuation APIs).',
            },
        ],

        docType: 'legacy-msa',
    },

    // ── FoneMovie Media Discovery ──
    fonemovie: {
        key: 'fonemovie',
        projectDisplayName: 'FoneMovie Media Discovery Platform',
        providerName: 'Sirsi Technologies',
        docCode: 'FM',

        primaryObjectiveTitle: 'The Media Discovery Engine',
        primaryObjectiveDescription:
            'To architect and deploy a high-performance media discovery and distribution platform ' +
            'that enables creators, studios, and audiences to connect through intelligent content ' +
            'curation—leveraging AI-powered recommendations, real-time analytics, and a scalable ' +
            'streaming infrastructure.',
        strategicPosition:
            'Sirsi acts as the Technical Lead, leveraging the Nexus V4 Core to ' +
            'accelerate 0-to-1 development by 60%. We are building a next-generation media ' +
            'platform with discovery-first architecture and creator-centric monetization.',
        techStack: [
            { label: 'Logic', value: 'Go (Golang) / Cloud Run' },
            { label: 'Intelligence', value: 'Google Vertex AI (Gemini)' },
            { label: 'Media', value: 'Cloud CDN + Transcoding Pipeline' },
            { label: 'Mobile', value: 'React Native Expo' },
        ],

        sowObjective:
            'Build a next-generation media discovery and distribution platform spanning iOS, Android, and Web, ' +
            'powered by Sirsi\'s component library and Google Cloud\'s enterprise AI and media infrastructure.',
        sowPlatformType: 'Media Discovery',

        msaRecital:
            'Client desires to engage Provider to design, develop, and implement a media discovery and distribution platform ' +
            'known as {projectName} (the "Platform"), with sufficient foundational infrastructure to support content curation, ' +
            'creator tools, audience analytics, and scalable streaming capabilities',
        msaForegroundIpDescription:
            'the Intellectual Property Rights in the comprehensive body of specific business logic, ' +
            'media discovery algorithms, content curation scripts, configurations, and unique operational workflows developed strictly ' +
            'and exclusively for {projectName} that rely upon but are distinct from Background Technology',
        msaForegroundIpItems: [
            'Custom UI/UX designs, visual interfaces, and brand assets specific to {projectName}',
            'Proprietary content recommendation algorithms, discovery feeds, and audience matching logic',
            'Creator dashboard interfaces, analytics pipelines, and monetization workflow configurations',
            'Unique data schemas and information architecture for media metadata, user engagement, and content relationships',
        ],
        msaVerticalLicense:
            'within the field of Media Discovery, Content Distribution, and Entertainment Technology',
        msaNonCompeteVertical:
            'Media Discovery or Content Distribution',
        msaSowOverview:
            'This Statement of Work ("SOW") defines the comprehensive scope for the {projectName} Media Discovery Platform. ' +
            'This project aims to build a scalable media discovery infrastructure with content curation, creator tools, ' +
            'audience analytics, and streaming distribution capabilities.',
        msaSowObjective:
            'deliver a high-performance media platform that enables creators and studios to distribute content, ' +
            'audiences to discover personalized media, and all parties to engage through intelligent AI-driven recommendations ' +
            'and real-time analytics.',
        msaAssumptions: [
            'Content Licensing: Client is responsible for securing all necessary content licensing and distribution rights.',
            'No Legal Advice: The platform provides content discovery and distribution tools, not legal or licensing counsel.',
            'Third-Party Costs: Client pays direct consumption costs for Stripe, CDN bandwidth, transcoding, and Google Cloud.',
            'Content Moderation: Client is responsible for content moderation policies and enforcement.',
        ],
        msaNoSelectFallback: 'Core Media Discovery Platform (Standard Bundle)',
        msaCostIntro:
            'The {projectName} project leverages the Sirsi Nexus V4 Framework to achieve enterprise-grade results ' +
            'at a fraction of typical market costs. By utilizing pre-validated logic engines, CDN infrastructure, ' +
            'and AI pipelines, we realize significant savings.',
        msaDocumentScope: [
            {
                title: 'A. Content Ingestion & Processing',
                content: 'Media upload pipeline with automated transcoding; Metadata extraction and tagging; CDN distribution with adaptive bitrate streaming.',
            },
            {
                title: 'B. Discovery & Recommendation Engine',
                content: 'AI-powered content recommendations using Vertex AI; User behavior analytics and engagement tracking; Personalized discovery feeds with collaborative filtering.',
            },
            {
                title: 'C. Creator Tools & Monetization',
                content: 'Creator dashboard with performance analytics; Revenue tracking and payout management (Stripe integration); Content scheduling and distribution management.',
            },
        ],

        docType: 'media-msa',
    },
}

// ═══════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════

/**
 * Interpolate {projectName} placeholders in template strings
 */
function interpolate(text: string, projectName: string): string {
    return text.replace(/\{projectName\}/g, projectName)
}

/**
 * Get the template for a given projectId.
 * Falls back to FinalWishes if no match found.
 */
export function getProjectTemplate(projectId: string | null | undefined): ProjectTemplate {
    if (!projectId) return TEMPLATES.finalwishes

    // Direct match
    if (TEMPLATES[projectId]) return TEMPLATES[projectId]

    // Fuzzy match: check if projectId contains a known key
    const lower = projectId.toLowerCase()
    for (const [key, template] of Object.entries(TEMPLATES)) {
        if (lower.includes(key)) return template
    }

    // Default
    return TEMPLATES.finalwishes
}

/**
 * Get template with interpolated project name
 */
export function getInterpolatedTemplate(projectId: string | null | undefined, projectName: string): ProjectTemplate {
    const template = getProjectTemplate(projectId)
    return {
        ...template,
        msaRecital: interpolate(template.msaRecital, projectName),
        msaForegroundIpDescription: interpolate(template.msaForegroundIpDescription, projectName),
        msaForegroundIpItems: template.msaForegroundIpItems.map(item => interpolate(item, projectName)),
        msaSowOverview: interpolate(template.msaSowOverview, projectName),
        msaCostIntro: interpolate(template.msaCostIntro, projectName),
    }
}

/**
 * Check if a project has a dedicated template (not fallback)
 */
export function hasProjectTemplate(projectId: string): boolean {
    if (TEMPLATES[projectId]) return true
    const lower = projectId.toLowerCase()
    return Object.keys(TEMPLATES).some(key => lower.includes(key))
}

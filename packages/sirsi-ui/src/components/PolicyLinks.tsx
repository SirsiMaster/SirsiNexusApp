/**
 * PolicyLinks Component - Footer links to privacy and security policies
 * 
 * Implements policy visibility requirements per CANONICAL_POLICIES_IMPLEMENTATION_PLAN.md
 * 
 * @see docs/policies/CANONICAL_POLICIES_IMPLEMENTATION_PLAN.md
 */

import React from 'react';

export interface PolicyLinksProps {
    /** Base URL for policy pages (default: /policies) */
    baseUrl?: string;
    /** Whether to open links in new tab */
    newTab?: boolean;
    /** Custom styles */
    className?: string;
    /** Show compact version (icons only) */
    compact?: boolean;
    /** Custom link order */
    links?: Array<'privacy' | 'terms' | 'security' | 'cookies'>;
}

const DEFAULT_LINKS: PolicyLinksProps['links'] = ['privacy', 'terms', 'security'];

const POLICY_INFO = {
    privacy: {
        label: 'Privacy Policy',
        shortLabel: 'Privacy',
        path: '/privacy',
        icon: '🔒'
    },
    terms: {
        label: 'Terms of Service',
        shortLabel: 'Terms',
        path: '/terms',
        icon: '📜'
    },
    security: {
        label: 'Security',
        shortLabel: 'Security',
        path: '/security',
        icon: '🛡️'
    },
    cookies: {
        label: 'Cookie Policy',
        shortLabel: 'Cookies',
        path: '/cookies',
        icon: '🍪'
    }
} as const;

/**
 * Footer component with links to privacy and security policies
 * 
 * @example
 * ```tsx
 * // In your footer:
 * <Footer>
 *   <PolicyLinks />
 * </Footer>
 * 
 * // Compact version for mobile:
 * <PolicyLinks compact />
 * 
 * // Custom links:
 * <PolicyLinks links={['privacy', 'terms', 'cookies']} />
 * ```
 */
export function PolicyLinks({
    baseUrl = '/policies',
    newTab = false,
    className = '',
    compact = false,
    links = DEFAULT_LINKS
}: PolicyLinksProps): React.ReactElement {
    const linkItems = (links ?? DEFAULT_LINKS)!;
    const linkProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
        <div
            className={`sirsi-policy-links ${compact ? 'sirsi-policy-links--compact' : ''} ${className}`}
            style={styles.container}
        >
            {linkItems.map((linkType, index) => {
                const info = POLICY_INFO[linkType];
                const isLast = index === linkItems.length - 1;

                return (
                    <React.Fragment key={linkType}>
                        <a
                            href={`${baseUrl}${info.path}`}
                            {...linkProps}
                            style={styles.link}
                            className="sirsi-policy-link"
                        >
                            {compact ? (
                                <span title={info.label}>{info.icon}</span>
                            ) : (
                                info.shortLabel
                            )}
                        </a>
                        {!isLast && !compact && (
                            <span style={styles.separator}>•</span>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

/**
 * Complete footer with copyright and policy links
 */
export function PolicyFooter({
    companyName = 'Sirsi AI Corporation',
    year = new Date().getFullYear(),
    ...policyLinksProps
}: PolicyLinksProps & {
    companyName?: string;
    year?: number;
}): React.ReactElement {
    return (
        <footer style={styles.footer} className="sirsi-policy-footer">
            <div style={styles.footerContent}>
                <span style={styles.copyright}>
                    © {year} {companyName}. All Rights Reserved.
                </span>
                <PolicyLinks {...policyLinksProps} />
            </div>
        </footer>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    link: {
        color: 'rgba(255, 255, 255, 0.6)',
        textDecoration: 'none',
        fontSize: '12px',
        transition: 'color 0.2s ease'
    },
    separator: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: '8px'
    },
    footer: {
        padding: '16px 24px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    footerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '16px'
    },
    copyright: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px'
    }
};

// CSS for hover effects (to be added to global styles or CSS module)
export const PolicyLinksCSS = `
.sirsi-policy-link:hover {
  color: rgba(255, 255, 255, 0.9) !important;
}

.sirsi-policy-links--compact {
  gap: 12px !important;
}

.sirsi-policy-links--compact .sirsi-policy-link {
  font-size: 16px !important;
}
`;

export default PolicyLinks;

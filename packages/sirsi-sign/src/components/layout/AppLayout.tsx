/**
 * AppLayout Component - Global layout with PolicyFooter and Consent
 * 
 * Wraps all routes with common layout elements per security policy requirements
 */

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

// Inline PolicyFooter to avoid build issues with external packages during integration
// Once sirsi-ui is properly linked, replace with: import { PolicyFooter, ConsentBanner, useConsent } from '@sirsimaster/sirsi-ui'

interface PolicyLinksProps {
    baseUrl?: string;
    newTab?: boolean;
}

function PolicyLinks({ baseUrl = '/policies', newTab = false }: PolicyLinksProps) {
    const linkProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    const links = [
        { label: 'Privacy', path: '/privacy-policy.html' },
        { label: 'Terms', path: '/terms-of-service.html' },
        { label: 'Security', path: '/security.html' }
    ];

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {links.map((link, i) => (
                <span key={link.path}>
                    <a
                        href={`${baseUrl}${link.path}`}
                        {...linkProps}
                        style={{
                            color: 'rgba(255,255,255,0.6)',
                            textDecoration: 'none',
                            fontSize: '12px',
                            transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                        onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
                    >
                        {link.label}
                    </a>
                    {i < links.length - 1 && (
                        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '8px', marginLeft: '8px' }}>•</span>
                    )}
                </span>
            ))}
        </div>
    );
}

interface ConsentBannerProps {
    onAcceptAll: () => void;
    onRejectAll: () => void;
}

function ConsentBanner({ onAcceptAll, onRejectAll }: ConsentBannerProps) {
    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(2, 30, 22, 0.95)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(200, 169, 81, 0.3)',
            padding: '16px 24px',
            zIndex: 9999,
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '16px'
                }}>
                    We use cookies to enhance your experience and analyze site usage.
                    By clicking "Accept All", you consent to our use of cookies.
                    Read our{' '}
                    <a href="https://sirsi.ai/privacy-policy.html" style={{ color: '#C8A951', textDecoration: 'underline' }}>Privacy Policy</a>
                    {' '}for more information.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onRejectAll}
                        style={{
                            background: 'transparent',
                            color: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        Reject All
                    </button>
                    <button
                        onClick={onAcceptAll}
                        style={{
                            background: '#C8A951',
                            color: '#022c22',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}

interface AppLayoutProps {
    children: ReactNode;
}

const CONSENT_KEY = 'sirsi_consent_finalwishes';

export function AppLayout({ children }: AppLayoutProps) {
    const [showConsentBanner, setShowConsentBanner] = useState(false);

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            setShowConsentBanner(true);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            accepted: true,
            timestamp: new Date().toISOString(),
            preferences: { essential: true, analytics: true, marketing: true }
        }));
        setShowConsentBanner(false);
    };

    const handleRejectAll = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            accepted: false,
            timestamp: new Date().toISOString(),
            preferences: { essential: true, analytics: false, marketing: false }
        }));
        setShowConsentBanner(false);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
        }}>
            {/* Main Content */}
            <main style={{ flex: 1 }}>
                {children}
            </main>

            {/* Footer with Policy Links */}
            <footer style={{
                padding: '16px 24px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <span style={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '12px'
                    }}>
                        © {new Date().getFullYear()} Sirsi Technologies Inc.. All Rights Reserved.
                    </span>
                    <PolicyLinks baseUrl="https://sirsi.ai" newTab />
                </div>
            </footer>

            {/* Consent Banner */}
            {showConsentBanner && (
                <ConsentBanner
                    onAcceptAll={handleAcceptAll}
                    onRejectAll={handleRejectAll}
                />
            )}
        </div>
    );
}

export default AppLayout;

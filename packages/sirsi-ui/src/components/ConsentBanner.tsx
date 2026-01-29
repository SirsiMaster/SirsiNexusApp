/**
 * ConsentBanner Component - GDPR/CCPA compliant cookie consent banner
 * 
 * Implements consent requirements per PRIVACY_POLICY.md
 * 
 * @see docs/policies/PRIVACY_POLICY.md
 */

import React, { useState } from 'react';

export interface ConsentBannerProps {
    /** Called when user accepts all cookies */
    onAcceptAll: () => void;
    /** Called when user rejects non-essential cookies */
    onRejectAll: () => void;
    /** Called when user customizes preferences */
    onCustomize: (preferences: ConsentPreferences) => void;
    /** Link to full privacy policy */
    privacyPolicyUrl?: string;
    /** Link to cookie policy */
    cookiePolicyUrl?: string;
    /** Custom styles */
    className?: string;
    /** Whether to show customize option */
    showCustomize?: boolean;
}

export interface ConsentPreferences {
    essential: boolean; // Always true
    analytics: boolean;
    marketing: boolean;
    thirdParty: boolean;
}

/**
 * GDPR/CCPA compliant cookie consent banner
 * 
 * @example
 * ```tsx
 * const { showBanner, updatePreferences, dismissBanner } = useConsent();
 * 
 * {showBanner && (
 *   <ConsentBanner
 *     onAcceptAll={() => {
 *       updatePreferences({ analytics: true, marketing: true, thirdParty: true });
 *       dismissBanner();
 *     }}
 *     onRejectAll={() => {
 *       updatePreferences({ analytics: false, marketing: false, thirdParty: false });
 *       dismissBanner();
 *     }}
 *     onCustomize={(prefs) => {
 *       updatePreferences(prefs);
 *       dismissBanner();
 *     }}
 *   />
 * )}
 * ```
 */
export function ConsentBanner({
    onAcceptAll,
    onRejectAll,
    onCustomize,
    privacyPolicyUrl = '/policies/privacy',
    cookiePolicyUrl = '/policies/cookies',
    className = '',
    showCustomize = true
}: ConsentBannerProps): React.ReactElement {
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<ConsentPreferences>({
        essential: true,
        analytics: false,
        marketing: false,
        thirdParty: false
    });

    const handleToggle = (key: keyof ConsentPreferences) => {
        if (key === 'essential') return; // Can't toggle essential
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSavePreferences = () => {
        onCustomize(preferences);
    };

    if (showPreferences) {
        return (
            <div className={`sirsi-consent-banner sirsi-consent-banner--expanded ${className}`} style={styles.banner}>
                <div style={styles.content}>
                    <h3 style={styles.title}>Cookie Preferences</h3>
                    <p style={styles.text}>
                        Manage your cookie preferences. Essential cookies are required for the site to function.
                    </p>

                    <div style={styles.preferences}>
                        <PreferenceToggle
                            label="Essential Cookies"
                            description="Required for site functionality"
                            checked={true}
                            disabled={true}
                        />
                        <PreferenceToggle
                            label="Analytics Cookies"
                            description="Help us understand how you use the site"
                            checked={preferences.analytics}
                            onChange={() => handleToggle('analytics')}
                        />
                        <PreferenceToggle
                            label="Marketing Cookies"
                            description="Used for personalized advertising"
                            checked={preferences.marketing}
                            onChange={() => handleToggle('marketing')}
                        />
                        <PreferenceToggle
                            label="Third-Party Cookies"
                            description="Used by external services"
                            checked={preferences.thirdParty}
                            onChange={() => handleToggle('thirdParty')}
                        />
                    </div>

                    <div style={styles.actions}>
                        <button
                            onClick={() => setShowPreferences(false)}
                            style={styles.secondaryButton}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSavePreferences}
                            style={styles.primaryButton}
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`sirsi-consent-banner ${className}`} style={styles.banner}>
            <div style={styles.content}>
                <p style={styles.text}>
                    We use cookies to enhance your experience and analyze site usage.
                    By clicking "Accept All", you consent to our use of cookies.
                    Read our{' '}
                    <a href={privacyPolicyUrl} style={styles.link}>Privacy Policy</a>
                    {' '}and{' '}
                    <a href={cookiePolicyUrl} style={styles.link}>Cookie Policy</a>
                    {' '}for more information.
                </p>

                <div style={styles.actions}>
                    <button
                        onClick={onRejectAll}
                        style={styles.secondaryButton}
                    >
                        Reject All
                    </button>
                    {showCustomize && (
                        <button
                            onClick={() => setShowPreferences(true)}
                            style={styles.secondaryButton}
                        >
                            Customize
                        </button>
                    )}
                    <button
                        onClick={onAcceptAll}
                        style={styles.primaryButton}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}

interface PreferenceToggleProps {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange?: () => void;
}

function PreferenceToggle({ label, description, checked, disabled, onChange }: PreferenceToggleProps) {
    return (
        <div style={styles.preferenceItem}>
            <div style={styles.preferenceInfo}>
                <span style={styles.preferenceLabel}>{label}</span>
                <span style={styles.preferenceDesc}>{description}</span>
            </div>
            <label style={styles.toggle}>
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={onChange}
                    style={styles.toggleInput}
                />
                <span style={{
                    ...styles.toggleSlider,
                    background: checked ? '#C8A951' : 'rgba(255,255,255,0.2)',
                    opacity: disabled ? 0.5 : 1
                }} />
            </label>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    banner: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 20, 50, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(200, 169, 81, 0.3)',
        padding: '16px 24px',
        zIndex: 9999,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)'
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto'
    },
    title: {
        fontFamily: "'Cinzel', serif",
        color: '#C8A951',
        fontSize: '18px',
        marginBottom: '12px'
    },
    text: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
        lineHeight: '1.5',
        marginBottom: '16px'
    },
    link: {
        color: '#C8A951',
        textDecoration: 'underline'
    },
    actions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        flexWrap: 'wrap'
    },
    primaryButton: {
        background: '#C8A951',
        color: '#0A1432',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'opacity 0.2s'
    },
    secondaryButton: {
        background: 'transparent',
        color: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'border-color 0.2s'
    },
    preferences: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px'
    },
    preferenceItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px'
    },
    preferenceInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    preferenceLabel: {
        color: 'white',
        fontSize: '14px',
        fontWeight: 500
    },
    preferenceDesc: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '12px'
    },
    toggle: {
        position: 'relative',
        width: '44px',
        height: '24px',
        cursor: 'pointer'
    },
    toggleInput: {
        opacity: 0,
        width: 0,
        height: 0
    },
    toggleSlider: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '24px',
        transition: 'background 0.2s'
    }
};

export default ConsentBanner;

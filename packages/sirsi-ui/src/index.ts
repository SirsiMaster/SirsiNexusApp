/**
 * Sirsi UI - Shared components, hooks, and utilities for Sirsi applications
 * 
 * @packageDocumentation
 */

// Components
export { PolicyLinks, PolicyFooter, PolicyLinksCSS } from './components/PolicyLinks';
export type { PolicyLinksProps } from './components/PolicyLinks';
export { ConsentBanner } from './components/ConsentBanner';
export type { ConsentBannerProps, ConsentPreferences } from './components/ConsentBanner';
export { MFARequired, withMFARequired } from './components/MFARequired';
export type { MFARequiredProps } from './components/MFARequired';

// Hooks
export { useMFA, useMFAProtected } from './hooks/useMFA';
export type { UseMFAResult, UseMFAOptions, MFAClaims } from './hooks/useMFA';
export { useConsent, useRequireConsent } from './hooks/useConsent';
export type { ConsentRecord, UseConsentResult } from './hooks/useConsent';

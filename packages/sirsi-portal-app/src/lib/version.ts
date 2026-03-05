/**
 * Version — Single Source of Truth
 *
 * Reads from package.json via Vite's `define` injection.
 * To update the version badge everywhere:
 *   1. Change "version" in package.json
 *   2. Rebuild — every header badge auto-updates
 *
 * Format: "0.8.0-alpha" → displayed as "v0.8.0-alpha"
 */

declare const __APP_VERSION__: string

/** Raw semver string, e.g. "0.8.0-alpha" */
export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined'
    ? __APP_VERSION__
    : '0.0.0'

/** Display string, e.g. "v0.8.0-alpha" */
export const APP_VERSION_DISPLAY = `v${APP_VERSION}`

/** Release channel derived from version string */
export const RELEASE_CHANNEL: 'alpha' | 'beta' | 'stable' =
    APP_VERSION.includes('alpha') ? 'alpha'
        : APP_VERSION.includes('beta') ? 'beta'
            : 'stable'

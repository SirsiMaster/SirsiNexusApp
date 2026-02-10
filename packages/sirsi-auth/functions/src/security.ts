import * as crypto from "crypto";

// Secret key for HMAC signing - in production, use Firebase environment config
export const HMAC_SECRET = process.env.HMAC_SECRET || 'sirsi-opensign-hmac-secret-key-2025-v1-CHANGE-IN-PRODUCTION';

/**
 * Generate HMAC-SHA256 signature for data
 */
export function generateHmacSignature(data: any, secret = HMAC_SECRET): string {
    const content = typeof data === 'string' ? data : JSON.stringify(data);
    return crypto
        .createHmac('sha256', secret)
        .update(content)
        .digest('hex');
}

/**
 * Verify HMAC-SHA256 signature
 */
export function verifyHmacSignature(data: any, signature: string, secret = HMAC_SECRET): boolean {
    const expectedSignature = generateHmacSignature(data, secret);
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (e) {
        return false;
    }
}

/**
 * Generate cryptographically signed redirect URL
 */
export function generateSignedRedirectUrl(baseUrl: string, params: Record<string, string>, secret = HMAC_SECRET): string {
    const url = new URL(baseUrl);
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    // Add base params
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    // Add security params
    url.searchParams.set('ts', timestamp);
    url.searchParams.set('nonce', nonce);

    // Sign the entire search string
    const signature = generateHmacSignature(url.search, secret);
    url.searchParams.set('sig', signature);

    return url.toString();
}

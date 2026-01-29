/**
 * MFA Middleware for Cloud Functions
 * 
 * Enforces Multi-Factor Authentication for sensitive operations
 * per AUTHORIZATION_POLICY.md Section 4.3
 * 
 * @see docs/policies/AUTHORIZATION_POLICY.md
 */

import { HttpsError, CallableRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Token claims interface with MFA verification
 */
export interface MFATokenClaims {
  role?: string;
  mfa_verified?: boolean;
  mfa_method?: 'totp' | 'sms' | 'hardware_key';
  mfa_timestamp?: number;
  acr?: string;
}

/**
 * MFA verification result
 */
export interface MFAVerificationResult {
  verified: boolean;
  method?: string;
  timestamp?: number;
  error?: string;
}

/**
 * Options for MFA requirement
 */
export interface RequireMFAOptions {
  /** Maximum age of MFA verification in seconds (default: 3600 = 1 hour) */
  maxAge?: number;
  /** Whether to allow SMS-based MFA (default: true) */
  allowSMS?: boolean;
  /** Log access attempt to audit log (default: true) */
  auditLog?: boolean;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Verify that the user has completed MFA
 * 
 * @param request - The callable request from Firebase Functions
 * @param options - Optional configuration for MFA requirements
 * @throws HttpsError if MFA is not verified
 */
export function requireMFA(
  request: CallableRequest,
  options: RequireMFAOptions = {}
): MFAVerificationResult {
  const {
    maxAge = 3600,  // 1 hour default
    allowSMS = true,
    auditLog = true,
    errorMessage = 'Multi-factor authentication is required for this operation'
  } = options;

  // Check authentication first
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  const token = request.auth.token as MFATokenClaims;
  const uid = request.auth.uid;

  // Check if MFA is verified
  if (!token.mfa_verified) {
    // Log failed attempt if audit logging is enabled
    if (auditLog) {
      logMFAAttempt(uid, 'mfa_not_verified', 'failed').catch(console.error);
    }

    throw new HttpsError('permission-denied', errorMessage, {
      error: 'mfa_required',
      redirect: '/auth/mfa',
      policy: 'https://sirsi.ai/policies/authorization'
    });
  }

  // Check MFA method restrictions
  if (!allowSMS && token.mfa_method === 'sms') {
    if (auditLog) {
      logMFAAttempt(uid, 'sms_not_allowed', 'failed').catch(console.error);
    }

    throw new HttpsError('permission-denied', 
      'SMS-based MFA is not allowed for this operation. Please use TOTP or hardware key.', {
        error: 'mfa_method_not_allowed',
        redirect: '/auth/mfa/upgrade'
      });
  }

  // Check MFA freshness
  const mfaTimestamp = token.mfa_timestamp || 0;
  const mfaAge = Math.floor(Date.now() / 1000) - mfaTimestamp;

  if (mfaAge > maxAge) {
    if (auditLog) {
      logMFAAttempt(uid, 'mfa_stale', 'failed').catch(console.error);
    }

    throw new HttpsError('permission-denied', 
      'Your MFA session has expired. Please re-authenticate.', {
        error: 'mfa_stale',
        redirect: '/auth/mfa',
        mfaAge,
        maxAge
      });
  }

  // Log successful verification
  if (auditLog) {
    logMFAAttempt(uid, token.mfa_method || 'unknown', 'success').catch(console.error);
  }

  return {
    verified: true,
    method: token.mfa_method,
    timestamp: mfaTimestamp
  };
}

/**
 * Log MFA verification attempt for audit compliance
 */
async function logMFAAttempt(
  userId: string,
  method: string,
  status: 'success' | 'failed'
): Promise<void> {
  try {
    await db.collection('audit_logs').add({
      type: 'mfa_verification',
      userId,
      method,
      status,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      environment: process.env.ENVIRONMENT || 'production'
    });
  } catch (error) {
    console.error('Failed to log MFA attempt:', error);
  }
}

/**
 * Decorator-style function to wrap callable handlers with MFA requirement
 * 
 * @example
 * export const sensitiveOperation = onCall(withMFA(async (request) => {
 *   // This code only runs if MFA is verified
 *   return { success: true };
 * }));
 */
export function withMFA<T>(
  handler: (request: CallableRequest) => Promise<T>,
  options?: RequireMFAOptions
) {
  return async (request: CallableRequest): Promise<T> => {
    requireMFA(request, options);
    return handler(request);
  };
}

/**
 * Decorator for financial operations with stricter MFA requirements
 * - No SMS allowed
 * - MFA must be fresh (15 minutes)
 */
export function withFinancialMFA<T>(
  handler: (request: CallableRequest) => Promise<T>
) {
  return withMFA(handler, {
    maxAge: 900,  // 15 minutes for financial operations
    allowSMS: false,
    auditLog: true,
    errorMessage: 'MFA verification required before accessing financial services'
  });
}

/**
 * Set MFA verification status in user's custom claims
 * Called after successful MFA verification
 */
export async function setMFAVerified(
  userId: string,
  method: 'totp' | 'sms' | 'hardware_key'
): Promise<void> {
  const auth = admin.auth();
  
  // Get existing claims
  const user = await auth.getUser(userId);
  const existingClaims = user.customClaims || {};

  // Add MFA claims
  await auth.setCustomUserClaims(userId, {
    ...existingClaims,
    mfa_verified: true,
    mfa_method: method,
    mfa_timestamp: Math.floor(Date.now() / 1000),
    acr: 'urn:sirsi:mfa:verified'
  });

  // Log to Firestore
  await db.collection('audit_logs').add({
    type: 'mfa_verified',
    userId,
    method,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Clear MFA verification status (e.g., on logout or session timeout)
 */
export async function clearMFAVerification(userId: string): Promise<void> {
  const auth = admin.auth();
  
  const user = await auth.getUser(userId);
  const existingClaims = user.customClaims || {};

  // Remove MFA claims
  const { mfa_verified, mfa_method, mfa_timestamp, acr, ...remainingClaims } = existingClaims;

  await auth.setCustomUserClaims(userId, remainingClaims);
}

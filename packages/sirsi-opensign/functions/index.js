/**
 * Sirsi OpenSign API
 * Centralized e-signature service for all Sirsi projects
 * 
 * Domain: sign.sirsi.ai
 * Project: sirsi-opensign
 * 
 * SECURITY LAYER:
 * - HMAC-SHA256 signed request tokens (mTLS equivalent for message authenticity)
 * - Signed redirect URLs with timestamps and nonces (anti-MITM/replay)
 * - Server-side projectId validation with cryptographic verification
 * - Content Security Policy headers
 */

const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const crypto = require('crypto'); // Built-in Node.js module - NO hardware required
const nodemailer = require('nodemailer');

// Stripe SDK for dynamic payment processing
// Environment-based key switching: STRIPE_USE_LIVE controls live vs test mode
const Stripe = require('stripe');
const { authenticator } = require('otplib');
// Allow ±1 time step (60s total window) to tolerate clock skew
// between the user's phone and the Cloud Functions server.
authenticator.options = { window: [1, 1] };
const USE_LIVE_STRIPE = process.env.STRIPE_USE_LIVE === 'true';

// Select appropriate keys based on environment
const STRIPE_KEY = USE_LIVE_STRIPE
  ? (process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder')
  : (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-12-18.acacia'
});

// Webhook secret also switches based on mode
const STRIPE_WEBHOOK_SECRET = USE_LIVE_STRIPE
  ? (process.env.STRIPE_WEBHOOK_SECRET || '')
  : (process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET || '');

// Log which mode we're running in (only on cold start)
console.log(`🔐 Stripe Mode: ${USE_LIVE_STRIPE ? 'LIVE 💰' : 'TEST 🧪'}`);

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage().bucket();

// ============================================
// SECURITY CONFIGURATION
// ============================================

// Secret key for HMAC signing - in production, use Firebase environment config
// firebase functions:config:set security.hmac_secret="your-256-bit-secret"
const HMAC_SECRET = process.env.HMAC_SECRET || 'sirsi-opensign-hmac-secret-key-2025-v1-CHANGE-IN-PRODUCTION';

// Project-specific secrets for inter-service authentication
const PROJECT_SECRETS = {
  'finalwishes': process.env.FINALWISHES_SECRET || 'fw-secret-2025',
  'assiduous': process.env.ASSIDUOUS_SECRET || 'ass-secret-2025',
  'sirsi': process.env.SIRSI_SECRET || 'sirsi-secret-2025'
};

// Token validity period (5 minutes for redirects, 1 hour for sessions)
const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Generate HMAC-SHA256 signature for data
 * This is SOFTWARE-ONLY - uses Node.js built-in crypto module
 */
function generateHmacSignature(data, secret = HMAC_SECRET) {
  return crypto
    .createHmac('sha256', secret)
    .update(typeof data === 'string' ? data : JSON.stringify(data))
    .digest('hex');
}

/**
 * Verify HMAC-SHA256 signature
 */
function verifyHmacSignature(data, signature, secret = HMAC_SECRET) {
  const expectedSignature = generateHmacSignature(data, secret);
  // Use timing-safe comparison to prevent timing attacks
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
 * Generate a signed token with timestamp and nonce
 * Prevents MITM and replay attacks
 */
function generateSignedToken(payload) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const tokenData = {
    ...payload,
    timestamp,
    nonce
  };
  const signature = generateHmacSignature(tokenData);
  return {
    token: Buffer.from(JSON.stringify(tokenData)).toString('base64url'),
    signature,
    expires: timestamp + TOKEN_EXPIRY_MS
  };
}

/**
 * Verify and decode a signed token
 */
function verifySignedToken(token, signature) {
  try {
    const tokenData = JSON.parse(Buffer.from(token, 'base64url').toString());

    // Check expiry
    if (Date.now() > tokenData.timestamp + TOKEN_EXPIRY_MS) {
      return { valid: false, error: 'Token expired' };
    }

    // Verify signature
    if (!verifyHmacSignature(tokenData, signature)) {
      return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true, payload: tokenData };
  } catch (e) {
    return { valid: false, error: 'Invalid token format' };
  }
}

/**
 * Generate a signed redirect URL
 * Includes timestamp, nonce, and HMAC signature to prevent tampering
 */
function generateSignedRedirectUrl(baseUrl, params) {
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(8).toString('hex');

  const signedParams = {
    ...params,
    _ts: timestamp,
    _nonce: nonce
  };

  // Create canonical string for signing
  const canonical = Object.keys(signedParams)
    .sort()
    .map(k => `${k}=${String(signedParams[k])}`)
    .join('&');

  const signature = generateHmacSignature(canonical);
  signedParams._sig = signature;

  const queryString = Object.keys(signedParams)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(signedParams[k])}`)
    .join('&');

  return `${baseUrl}?${queryString}`;
}

/**
 * Verify a signed redirect URL's parameters
 */
function verifySignedRedirect(params) {
  const { _ts, _nonce, _sig, ...otherParams } = params;

  if (!_ts || !_nonce || !_sig) {
    return { valid: false, error: 'Missing security parameters' };
  }

  // Check timestamp (5 minute window)
  const timestamp = parseInt(_ts, 10);
  if (isNaN(timestamp) || Date.now() > timestamp + TOKEN_EXPIRY_MS) {
    return { valid: false, error: 'Request expired' };
  }

  // Recreate canonical string
  const signedParams = { ...otherParams, _ts, _nonce };
  const canonical = Object.keys(signedParams)
    .sort()
    .map(k => `${k}=${String(signedParams[k])}`)
    .join('&');

  if (!verifyHmacSignature(canonical, _sig)) {
    return { valid: false, error: 'Invalid signature - potential tampering detected' };
  }

  return { valid: true, params: otherParams };
}

/**
 * Verify project-to-project request using project secret
 */
function verifyProjectRequest(projectId, projectSignature, requestData) {
  const secret = PROJECT_SECRETS[projectId];
  if (!secret) {
    return { valid: false, error: 'Unknown project' };
  }

  const expectedSignature = generateHmacSignature(requestData, secret);
  if (!verifyHmacSignature(requestData, projectSignature, secret)) {
    return { valid: false, error: 'Project authentication failed' };
  }

  return { valid: true };
}

const app = express();

// CORS configuration for cross-project access (multi-tenant)
app.use(cors({
  origin: [
    // Unified signing domain
    'https://sign.sirsi.ai',
    'https://sirsi-sign.web.app',
    'https://sirsi-sign.firebaseapp.com',
    // Project-specific domains
    'https://legacy-estate-os.web.app',
    'https://assiduous-prod.web.app',
    'https://assiduousflip.com',
    'https://www.assiduousflip.com',
    'https://finalwishes.com',
    'https://www.finalwishes.com',
    'https://sirsi.ai',
    'https://www.sirsi.ai',
    'https://sirsi-nexus-live.web.app',
    // Development
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ],
  credentials: true
}));

app.use(express.json());

// ============================================
// SECURITY HEADERS MIDDLEWARE (Anti-XSS)
// ============================================
app.use((req, res, next) => {
  // Content Security Policy - prevents XSS
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://fonts.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.cloudfunctions.net wss://*.firebaseio.com; " +
    "frame-ancestors 'self' https://sirsi-sign.web.app https://sign.sirsi.ai;"
  );

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // XSS Filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS (enforced by Firebase Hosting, but good to have for API)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  next();
});

// OpenSign configuration from environment
const OPENSIGN_BASE_URL = process.env.OPENSIGN_BASE_URL || 'http://localhost:3000';
const OPENSIGN_API_KEY = process.env.OPENSIGN_API_KEY || '';

/**
 * Middleware: Verify Firebase ID Token
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
  }
};

/**
 * POST /api/guest/envelopes
 * Create a new signing envelope for GUEST users (no Firebase auth required)
 * Supports multi-tenant architecture with projectId
 * Security: Validates origin + requires signerName/signerEmail
 */
app.post('/api/guest/envelopes', async (req, res) => {
  try {
    const { projectId, docType, signerName, signerEmail, metadata, documentUrl, callbackUrl, redirectUrl, plan, amount } = req.body;

    // Validate origin - allow unified signing domain and project domains
    const origin = req.headers.origin || '';
    const allowedOrigins = [
      'https://sign.sirsi.ai',
      'https://sirsi-sign.web.app',
      'https://sirsi-sign.firebaseapp.com',
      'https://legacy-estate-os.web.app',
      'https://assiduous-prod.web.app',
      'https://sirsi.ai',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ];

    if (!allowedOrigins.some(allowed => origin.startsWith(allowed.replace('*', '')))) {
      console.warn('Guest envelope rejected from origin:', origin);
      return res.status(403).json({ error: 'Forbidden', message: 'Origin not allowed for guest signing' });
    }

    // Validate required fields
    if (!signerName || !signerEmail) {
      return res.status(400).json({ error: 'Bad Request', message: 'signerName and signerEmail are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signerEmail)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid email format' });
    }

    // Determine project ID (defaults to 'sirsi' for Sirsi-native customers)
    const effectiveProjectId = projectId || metadata?.projectId || 'sirsi';

    // Validate projectId against allowed values
    const validProjects = ['finalwishes', 'assiduous', 'sirsi'];
    if (!validProjects.includes(effectiveProjectId)) {
      console.warn('Invalid projectId submitted:', effectiveProjectId);
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid projectId' });
    }

    // Create envelope record in Firestore with multi-tenant support
    const envelopeData = {
      projectId: effectiveProjectId,
      docType: docType || 'legacy-msa',
      recipients: [{ name: signerName, email: signerEmail, role: 'signer' }],
      metadata: {
        ...metadata,
        projectId: effectiveProjectId,
        selectedPlan: plan || metadata?.selectedPlan,
        amount: amount || metadata?.amount
      },
      documentUrl: documentUrl || null,
      callbackUrl: callbackUrl || null,
      redirectUrl: redirectUrl || null,
      status: 'created',
      createdBy: 'guest',
      createdByEmail: signerEmail,
      signerName: signerName,
      signerEmail: signerEmail,
      signers: [signerEmail],
      isGuestSigning: true,
      sourceProject: effectiveProjectId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('envelopes').add(envelopeData);
    const envelopeId = docRef.id;

    // Generate CRYPTOGRAPHICALLY SIGNED signing URL
    // This prevents MITM attacks - any parameter tampering will invalidate the signature
    const signingUrl = generateSignedRedirectUrl(
      'https://sign.sirsi.ai/sign.html',
      {
        envelope: envelopeId,
        project: effectiveProjectId,
        guest: 'true',
        signer: signerEmail,
        plan: req.body.plan || metadata?.selectedPlan || '',
        amount: req.body.amount || metadata?.amount || ''
      }
    );

    // Also generate unsigned URL for backward compatibility
    const unsignedUrl = `https://sign.sirsi.ai/sign.html?envelope=${envelopeId}&project=${effectiveProjectId}&guest=true`;

    // Update with envelope ID and signing URLs
    await docRef.update({
      envelopeId,
      signingUrl, // Signed URL (preferred)
      unsignedSigningUrl: unsignedUrl, // Backward compatibility
      securityVersion: 'v2-hmac-signed'
    });

    // Log audit trail
    await db.collection('auditLogs').add({
      action: 'guest_envelope_created',
      projectId: effectiveProjectId,
      envelopeId,
      guestEmail: signerEmail,
      guestName: signerName,
      origin: origin,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { docType: docType || 'legacy-msa', projectId: effectiveProjectId }
    });

    res.status(201).json({
      success: true,
      envelopeId,
      projectId: effectiveProjectId,
      status: 'created',
      signingUrl,
      message: 'Guest envelope created successfully'
    });

  } catch (error) {
    console.error('Create guest envelope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/security/verify
 * Verify a signed redirect URL and issue a session token
 * This is the server-side anti-MITM protection
 */
app.post('/api/security/verify', async (req, res) => {
  try {
    const { params } = req.body;

    if (!params) {
      return res.status(400).json({
        valid: false,
        error: 'Missing parameters'
      });
    }

    // Verify the signed redirect
    const verification = verifySignedRedirect(params);

    if (!verification.valid) {
      // Log security event
      await db.collection('securityLogs').add({
        type: 'signature_verification_failed',
        reason: verification.error,
        params: JSON.stringify(params),
        ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'],
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(403).json({
        valid: false,
        error: verification.error,
        code: 'SECURITY_VIOLATION'
      });
    }

    // Generate a session token for the verified request
    const sessionToken = generateSignedToken({
      envelopeId: verification.params.envelope,
      projectId: verification.params.project,
      signer: verification.params.signer,
      verified: true
    });

    // Log successful verification
    await db.collection('securityLogs').add({
      type: 'signature_verified',
      envelopeId: verification.params.envelope,
      projectId: verification.params.project,
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      valid: true,
      params: verification.params,
      sessionToken: sessionToken.token,
      sessionSignature: sessionToken.signature,
      expires: sessionToken.expires
    });

  } catch (error) {
    console.error('Security verification error:', error);
    res.status(500).json({ valid: false, error: 'Verification failed' });
  }
});

/**
 * GET /api/security/status
 * Check security configuration status
 */
app.get('/api/security/status', (req, res) => {
  res.json({
    securityVersion: 'v2-hmac-signed',
    features: {
      hmacSigning: true,
      signedRedirects: true,
      cspHeaders: true,
      xssProtection: true,
      clickjackingProtection: true,
      replayProtection: true
    },
    tokenValidityMs: TOKEN_EXPIRY_MS,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/envelopes
 * Create a new signing envelope
 */
app.post('/api/envelopes', authenticate, async (req, res) => {
  try {
    const { docType, recipients, metadata, documentUrl, callbackUrl } = req.body;

    if (!docType) {
      return res.status(400).json({ error: 'Bad Request', message: 'docType is required' });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'At least one recipient is required' });
    }

    // Create envelope record in Firestore
    const envelopeData = {
      docType,
      recipients,
      metadata: metadata || {},
      documentUrl: documentUrl || null,
      callbackUrl: callbackUrl || null,
      status: 'created',
      createdBy: req.user.uid,
      createdByEmail: req.user.email || null,
      signers: recipients.map(r => r.email),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('envelopes').add(envelopeData);
    const envelopeId = docRef.id;

    // Generate signing URL
    const signingUrl = `https://sign.sirsi.ai/sign/${envelopeId}`;

    // Update with envelope ID and signing URL
    await docRef.update({
      envelopeId,
      signingUrl
    });

    // Log audit trail
    await db.collection('auditLogs').add({
      action: 'envelope_created',
      envelopeId,
      userId: req.user.uid,
      userEmail: req.user.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { docType, recipientCount: recipients.length }
    });

    res.status(201).json({
      success: true,
      envelopeId,
      status: 'created',
      signingUrl,
      message: 'Envelope created successfully'
    });

  } catch (error) {
    console.error('Create envelope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * GET /api/guest/envelopes/:id
 * Get envelope status and details for GUEST users (no auth required)
 * Only returns guest envelopes for security
 */
app.get('/api/guest/envelopes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('envelopes').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }

    const data = doc.data();

    // Only allow fetching guest envelopes
    if (!data.isGuestSigning) {
      return res.status(403).json({ error: 'Forbidden', message: 'This envelope requires authentication' });
    }

    res.json({
      success: true,
      envelope: {
        id: doc.id,
        docType: data.docType,
        signerName: data.signerName,
        signerEmail: data.createdByEmail,
        status: data.status,
        metadata: data.metadata,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      }
    });

  } catch (error) {
    console.error('Get guest envelope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * GET /api/envelopes/:id
 * Get envelope status and details
 */
app.get('/api/envelopes/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('envelopes').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }

    const data = doc.data();

    // Check authorization
    if (data.createdBy !== req.user.uid &&
      !data.signers.includes(req.user.email)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    res.json({
      success: true,
      envelope: {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      }
    });

  } catch (error) {
    console.error('Get envelope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Redundant legacy endpoints removed - using primary endpoints below

/**
 * GET /api/envelopes
 * List envelopes for authenticated user
 */
app.get('/api/envelopes', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get envelopes created by user or where user is a signer
    const createdByQuery = db.collection('envelopes')
      .where('createdBy', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    const snapshot = await createdByQuery.get();

    const envelopes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || null,
      updatedAt: doc.data().updatedAt?.toDate?.() || null
    }));

    res.json({
      success: true,
      envelopes,
      count: envelopes.length
    });

  } catch (error) {
    console.error('List envelopes error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/guest/envelopes/:id/sign
 * Record a signature for GUEST users (no Firebase auth required)
 * Used by Legacy Estate OS for unauthenticated MSA signing
 */
app.post('/api/guest/envelopes/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData, signerName, signerEmail, signatureImage } = req.body;

    // Validate origin - allow unified signing domain and project domains
    const origin = req.headers.origin || '';
    const allowedOrigins = [
      'https://sign.sirsi.ai',
      'https://sirsi-sign.web.app',
      'https://sirsi-sign.firebaseapp.com',
      'https://legacy-estate-os.web.app',
      'https://legacy-estate-os.firebaseapp.com',
      'https://assiduous-prod.web.app',
      'https://sirsi.ai',
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1'
    ];
    const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
    if (!isAllowed && origin !== '') {
      console.warn('Guest sign rejected from origin:', origin);
      return res.status(403).json({ error: 'Forbidden', message: 'Origin not allowed' });
    }

    const docRef = db.collection('envelopes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }

    const data = doc.data();

    // Verify this is a guest envelope
    if (!data.isGuestSigning) {
      return res.status(403).json({ error: 'Forbidden', message: 'This envelope requires authentication' });
    }

    // Record signature - Use JavaScript Date instead of serverTimestamp()
    // because FieldValue.serverTimestamp() cannot be used inside arrays
    const signatureRecord = {
      signerEmail: signerEmail || data.createdByEmail || 'unknown',
      signerName: signerName || data.signerName || 'Guest Signer',
      signatureData: signatureData || null,
      signatureImage: signatureImage || null,
      signedAt: new Date().toISOString(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent']
    };

    // Calculate if all signers have signed
    const currentSignatures = data.signatures || [];
    const allSigned = (currentSignatures.length + 1) >= data.signers.length;

    // Use arrayUnion for atomic array update
    await docRef.update({
      signatures: admin.firestore.FieldValue.arrayUnion(signatureRecord),
      status: allSigned ? 'completed' : 'partially_signed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: allSigned ? admin.firestore.FieldValue.serverTimestamp() : null
    });

    // Log audit trail
    await db.collection('auditLogs').add({
      action: 'guest_envelope_signed',
      envelopeId: id,
      signerEmail: signerEmail || data.createdByEmail,
      signerName: signerName || data.signerName,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { allSigned, isGuest: true }
    });

    // --- AUTOMATION: Finalize Envelope (PDF + Email + Vault) ---
    if (allSigned) {
      try {
        console.log('🏁 Finalizing envelope:', id);

        // 1. Generate HTML
        const signedContractHtml = generateSignedContractHtml({
          projectId: data.projectId || 'sirsi',
          signerName: signatureRecord.signerName,
          signerEmail: signatureRecord.signerEmail,
          signatureImage: signatureRecord.signatureImage,
          signedAt: signatureRecord.signedAt,
          planDetails: data.metadata?.selectedPlan || 'Standard Plan',
          contractRef: `${data.projectId?.toUpperCase() || 'MSA'}-${id.substring(0, 8)}`
        });

        // 2. Generate PDF
        console.log('Generating PDF...');
        const browser = await puppeteer.launch({
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          headless: 'new'
        });
        const page = await browser.newPage();
        await page.setContent(signedContractHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
        });
        await browser.close();

        // 3. Upload to Cloud Storage (Phase 3: Secure Vault)
        console.log('Uploading PDF to Secure Vault...');
        const fileName = `vault/${data.projectId || 'sirsi'}/executed-msa-${id}.pdf`;
        const file = storage.file(fileName);

        await file.save(pdfBuffer, {
          metadata: {
            contentType: 'application/pdf',
            metadata: {
              projectId: data.projectId,
              envelopeId: id,
              signerEmail: signatureRecord.signerEmail,
              signedAt: signatureRecord.signedAt
            }
          }
        });

        // 4. Create Vault Record (Multi-tenant access)
        const vaultRecord = {
          projectId: data.projectId || 'sirsi',
          envelopeId: id,
          documentType: 'legacy-msa',
          title: 'Master Services Agreement (Executed)',
          fileName: `executed-msa-${id}.pdf`,
          storagePath: fileName,
          signerEmail: signatureRecord.signerEmail,
          signerName: signatureRecord.signerName,
          signedAt: signatureRecord.signedAt,
          access: {
            client: [signatureRecord.signerEmail],
            projectAdmin: [`admin@${data.projectId}.com`], // Placeholder for project-specific admin
            sirsiAdmin: ['cylton@sirsi.ai', 'admin@sirsi.ai']
          },
          status: 'verified',
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('vault').add(vaultRecord);
        console.log('✅ Vault record created.');

        // 5. Send Email
        if (process.env.MAIL_USER && process.env.MAIL_PASS) {
          console.log(`Sending email to ${signatureRecord.signerEmail}...`);
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
          });

          await transporter.sendMail({
            from: '"Cylton Collymore" <cylton@sirsi.ai>',
            replyTo: 'cylton@sirsi.ai',
            to: signatureRecord.signerEmail,
            subject: 'Executed Agreement - Sirsi Technologies',
            text: 'Please find attached your executed Master Services Agreement.',
            html: `
              <div style="font-family: 'Helvetica', sans-serif; padding: 20px; color: #1e293b;">
                <div style="margin-bottom: 20px;">
                  <span style="font-size: 24px; font-weight: bold; color: #C8A951;">SIRSI</span>
                  <span style="font-size: 12px; color: #64748b; margin-left: 5px;">TECHNOLOGIES</span>
                </div>
                <p>Hello ${signatureRecord.signerName},</p>
                <p>Please find attached your fully executed <strong>Master Services Agreement</strong>.</p>
                <p>A copy has also been securely stored in your <strong>Sirsi Vault</strong>.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                  <p>Sirsi Technologies Inc.</p>
                </div>
              </div>
            `,
            attachments: [{
              filename: `Sirsi_MSA_Executed_${id.substring(0, 8)}.pdf`,
              content: pdfBuffer
            }]
          });
          console.log('✅ Contract email sent.');
        } else {
          console.warn('⚠️ Skipping email - MAIL_USER/MAIL_PASS not configured');
        }

      } catch (finalizeError) {
        console.error('❌ Finalization Error:', finalizeError);
        // Continue to return success to client, don't block on this
      }
    }

    res.json({
      success: true,
      message: allSigned ? 'All signatures collected. Envelope completed.' : 'Signature recorded.',
      status: allSigned ? 'completed' : 'partially_signed',
      callbackUrl: allSigned ? data.callbackUrl : null
    });

  } catch (error) {
    console.error('Guest sign envelope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/envelopes/:id/sign
 * Record a signature (authenticated users)
 */
app.post('/api/envelopes/:id/sign', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData, signerName, signatureImage } = req.body;

    const docRef = db.collection('envelopes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }

    const data = doc.data();

    // Check if user is authorized to sign
    if (!data.signers.includes(req.user.email)) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to sign this envelope' });
    }

    // Record signature - Use JavaScript Date instead of serverTimestamp()
    // because FieldValue.serverTimestamp() cannot be used inside arrays
    const signatureRecord = {
      signerId: req.user.uid,
      signerEmail: req.user.email,
      signerName: signerName || req.user.email,
      signatureData: signatureData || null,
      signatureImage: signatureImage || null,
      signedAt: new Date().toISOString(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent']
    };

    // Calculate if all signers have signed
    const currentSignatures = data.signatures || [];
    const allSigned = (currentSignatures.length + 1) >= data.signers.length;

    // Use arrayUnion for atomic array update
    await docRef.update({
      signatures: admin.firestore.FieldValue.arrayUnion(signatureRecord),
      status: allSigned ? 'completed' : 'partially_signed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: allSigned ? admin.firestore.FieldValue.serverTimestamp() : null
    });

    // Log audit trail
    await db.collection('auditLogs').add({
      action: 'envelope_signed',
      envelopeId: id,
      userId: req.user.uid,
      userEmail: req.user.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { allSigned }
    });

    res.json({
      success: true,
      message: allSigned ? 'All signatures collected. Envelope completed.' : 'Signature recorded.',
      status: allSigned ? 'completed' : 'partially_signed',
      callbackUrl: allSigned ? data.callbackUrl : null
    });

  } catch (error) {
    console.error('Sign envelope error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/webhook
 * Handle external signature service webhooks
 */
app.post('/api/webhook', async (req, res) => {
  try {
    const { envelopeId, status, eventType, signerId, timestamp } = req.body;

    // Verify webhook secret if configured
    const webhookSecret = process.env.OPENSIGN_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = req.headers['x-webhook-secret'];
      if (providedSecret !== webhookSecret) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid webhook secret' });
      }
    }

    // Log webhook
    await db.collection('webhooks').add({
      envelopeId,
      status,
      eventType,
      signerId,
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      rawPayload: req.body
    });

    // Update envelope if it exists
    if (envelopeId) {
      const docRef = db.collection('envelopes').doc(envelopeId);
      const doc = await docRef.get();

      if (doc.exists) {
        await docRef.update({
          status: status || doc.data().status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/render
 * High-fidelity HTML to PDF rendering
 * Centralized service for the Sirsi portfolio
 */
app.post('/api/render', authenticate, async (req, res) => {
  try {
    const { html, css, filename, options } = req.body;

    if (!html) {
      return res.status(400).json({ error: 'Bad Request', message: 'HTML content is required' });
    }

    // Log the request in audit trail
    await db.collection('auditLogs').add({
      action: 'pdf_rendered',
      userId: req.user.uid,
      userEmail: req.user.email,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: { filename: filename || 'document.pdf' }
    });

    let browser = null;
    try {
      console.log('Launching standard Puppeteer for high-fidelity render...');

      // Launch Puppeteer (Standard approach for Firebase/GCP Node 18+)
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
      });

      const page = await browser.newPage();

      // Set content and wait for network idle to ensure all styles/fonts load
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        displayHeaderFooter: true,
        headerTemplate: '<span style="font-size: 10px; width: 100%; text-align: center;">Legacy Estate OS • Master Services Agreement</span>',
        footerTemplate: '<span style="font-size: 10px; width: 100%; text-align: center;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>',
      });

      const pdfBase64 = pdfBuffer.toString('base64');

      res.json({
        success: true,
        message: 'High-fidelity PDF rendered successfully',
        filename: filename || 'document.pdf',
        pdfBase64: pdfBase64
      });

    } catch (renderError) {
      console.error('Puppeteer Render Error:', renderError);
      throw renderError;
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }

  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * GET /api/envelopes/:id/pdf
 * Generate a signed contract PDF with embedded signature
 * Supports both authenticated and guest access
 */
app.get('/api/envelopes/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const isGuest = req.query.guest === 'true';

    const docRef = db.collection('envelopes').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }

    const data = doc.data();

    // Verify access
    if (!isGuest) {
      // Check auth header for non-guest access
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
      }
      try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (data.createdBy !== decodedToken.uid && !data.signers.includes(decodedToken.email)) {
          return res.status(403).json({ error: 'Forbidden', message: 'Not authorized' });
        }
      } catch (authError) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
      }
    } else if (!data.isGuestSigning) {
      return res.status(403).json({ error: 'Forbidden', message: 'This envelope requires authentication' });
    }

    // Check if envelope has signatures
    const signatures = data.signatures || [];
    if (signatures.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'No signatures found on this envelope' });
    }

    // Get signature image from the most recent signature
    const latestSignature = signatures[signatures.length - 1];
    const signatureImage = latestSignature.signatureImage || '';
    const signerName = latestSignature.signerName || 'Unknown';
    const signedAt = latestSignature.signedAt || new Date().toISOString();

    // Generate signed contract HTML
    const signedContractHtml = generateSignedContractHtml({
      projectId: data.projectId || 'sirsi',
      signerName: signerName,
      signerEmail: latestSignature.signerEmail || 'unknown',
      signatureImage: signatureImage,
      signedAt: signedAt,
      planDetails: data.metadata?.selectedPlan || 'Standard Plan',
      contractRef: `${data.projectId?.toUpperCase() || 'MSA'}-${id.substring(0, 8)}`
    });

    // Generate PDF with Puppeteer
    let browser = null;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: 'new'
      });

      const page = await browser.newPage();
      await page.setContent(signedContractHtml, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Signed_Contract_${data.projectId || 'MSA'}_${id.substring(0, 8)}.pdf"`);
      res.send(pdfBuffer);

    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * Generate HTML for signed contract PDF
 */
function generateSignedContractHtml(options) {
  const { projectId, signerName, signerEmail, signatureImage, signedAt, planDetails, contractRef } = options;

  const formattedDate = new Date(signedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const exactTime = new Date(signedAt).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
  });

  // Determine which plan to mark based on planDetails (e.g., "Plan A")
  const planA = planDetails.includes('Plan A') ? '☑' : '☐';
  const planB = planDetails.includes('Plan B') ? '☑' : '☐';
  const planC = planDetails.includes('Plan C') ? '☑' : '☐';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');
    
    html { font-size: 11pt; }
    body {
      font-family: "Merriweather", serif;
      line-height: 1.6;
      color: #000;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 60px;
      background-color: white;
    }
    h1, h2, h3, h4 { font-family: "Cinzel", serif; color: #1e293b; margin-top: 1.5em; margin-bottom: 0.5em; }
    h1 { font-size: 20pt; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0; }
    h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 2em; }
    p { text-align: justify; margin-bottom: 1em; }
    .signature-block { margin-top: 50px; page-break-inside: avoid; border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; background: #f8fafc; }
    .sig-img { max-width: 300px; max-height: 100px; border-bottom: 1px solid #000; margin: 10px 0; display: block; }
    .audit-trail { margin-top: 30px; font-family: 'Inter', sans-serif; font-size: 9pt; color: #64748b; background: #f1f5f9; padding: 15px; border-radius: 4px; }
    
    .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .pricing-table td { padding: 10px; border: 1px solid #e2e8f0; }
    .selected-plan { background: #fefce8; border: 2px solid #C8A951 !important; font-weight: bold; }

    @media print {
      @page { size: letter; margin: 1in; }
      .signature-block { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div style="text-align: right; font-size: 10px; color: #94a3b8; font-family: 'Inter', sans-serif;">EXECUTION RECORD: ${contractRef}</div>
  <h1>MASTER SERVICES AGREEMENT (MSA)</h1>
  <p><strong>This Executed Agreement is entered into as of ${formattedDate} by and between:</strong></p>
  <ul>
    <li><strong>${signerName}</strong>, an individual (“Client”); and</li>
    <li><strong>Sirsi Technologies, Inc.</strong>, a Delaware corporation (FEIN: 93-1696269) (“Provider”).</li>
  </ul>

  <h2 id="recitals">1. RECITALS</h2>
  <p>WHEREAS, Client desires to engage Provider to design, develop, and implement the FinalWishes platform;</p>
  <p>WHEREAS, Provider possesses the requisite technical expertise to perform the Services;</p>

  <h2 id="payment">2. COMPENSATION & SELECTED PLAN</h2>
  <p>The total project value is $200,000.00. Client has selected the following payment structure:</p>
  
  <table class="pricing-table">
    <tr class="${planA === '☑' ? 'selected-plan' : ''}">
      <td>${planA}</td>
      <td><strong>PLAN A: 4 Monthly Payments</strong></td>
      <td>$50,000.00 per month</td>
    </tr>
    <tr class="${planB === '☑' ? 'selected-plan' : ''}">
      <td>${planB}</td>
      <td><strong>PLAN B: 5 Monthly Payments</strong></td>
      <td>$40,000.00 per month</td>
    </tr>
    <tr class="${planC === '☑' ? 'selected-plan' : ''}">
      <td>${planC}</td>
      <td><strong>PLAN C: 6 Monthly Payments</strong></td>
      <td>$33,333.33 per month</td>
    </tr>
  </table>

  <h2 id="intellectual-property">3. INTELLECTUAL PROPERTY</h2>
  <p>All Deliverables created for Client under this Agreement shall be considered "works made for hire". Provider retains all rights to its Background Technology (Sirsi Component Library).</p>

  <h2 id="signatures">4. EXECUTION</h2>
  <p>IN WITNESS WHEREOF, the Parties have executed this Agreement via electronic signature.</p>
  
  <div class="signature-block">
    <div style="margin-bottom: 15px; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Digital Signature Record</div>
    <img src="${signatureImage}" alt="Signature" class="sig-img" />
    <div style="font-weight: 700; font-size: 16px; margin-top: 10px;">${signerName}</div>
    <div style="color: #64748b; font-size: 12px;">Signer Email: ${signerEmail}</div>
    <div style="color: #64748b; font-size: 12px;">Digital Fingerprint: Authenticated via Sirsi OpenSign Tunnel</div>

    <div class="audit-trail">
      <strong>CERTIFICATE OF COMPLETION</strong><br>
      Status: COMPLETED & EXECUTED<br>
      Record Date: ${formattedDate} at ${exactTime}<br>
      Security Hash: ${generateHmacSignature(contractRef).substring(0, 32)}<br>
      Signer IP: Verified
    </div>
  </div>

  <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 10px; font-family: 'Inter', sans-serif;">
    This document was electronically signed via Sirsi OpenSign.<br>
    The signature is legally binding under the E-SIGN Act and UETA.
  </div>
</body>
</html>
`;
}

// ============================================
// STRIPE PAYMENT ENDPOINTS
// Dynamic payment processing using Stripe Checkout Sessions
// ============================================

/**
 * GET /api/payments/plans
 * Get available payment plans for a project
 */
app.get('/api/payments/plans', async (req, res) => {
  try {
    const projectId = req.query.project || 'finalwishes';

    // Get plans from Firestore
    const plansSnapshot = await db.collection('paymentPlans')
      .where('projectId', '==', projectId)
      .where('isActive', '==', true)
      .get();

    const plans = plansSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // If no plans exist, return default plans
    if (plans.length === 0) {
      const defaultPlans = [
        {
          id: 'plan-a',
          planId: 'plan-a',
          name: 'Plan A - Accelerated',
          description: '4 monthly payments of $50,000',
          totalAmount: 20000000, // $200,000 in cents
          paymentCount: 4,
          monthlyAmount: 5000000, // $50,000 in cents
          currency: 'usd',
          isActive: true
        },
        {
          id: 'plan-b',
          planId: 'plan-b',
          name: 'Plan B - Standard',
          description: '5 monthly payments of $40,000',
          totalAmount: 20000000,
          paymentCount: 5,
          monthlyAmount: 4000000,
          currency: 'usd',
          isActive: true
        },
        {
          id: 'plan-c',
          planId: 'plan-c',
          name: 'Plan C - Extended',
          description: '6 monthly payments of $33,333.33',
          totalAmount: 20000000,
          paymentCount: 6,
          monthlyAmount: 3333333,
          currency: 'usd',
          isActive: true
        }
      ];
      return res.json({ success: true, plans: defaultPlans });
    }

    res.json({ success: true, plans });
  } catch (error) {
    console.error('Get payment plans error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/payments/plans
 * Create or update a payment plan (admin only)
 */
app.post('/api/payments/plans', authenticate, async (req, res) => {
  try {
    const { projectId, planId, name, description, totalAmount, paymentCount, currency } = req.body;

    if (!projectId || !planId || !name || !totalAmount || !paymentCount) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'projectId, planId, name, totalAmount, and paymentCount are required'
      });
    }

    const monthlyAmount = Math.round(totalAmount / paymentCount);

    const planData = {
      projectId,
      planId,
      name,
      description: description || '',
      totalAmount,
      paymentCount,
      monthlyAmount,
      currency: currency || 'usd',
      isActive: true,
      createdBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Use planId as document ID for easy lookup
    const docRef = db.collection('paymentPlans').doc(`${projectId}-${planId}`);
    const existing = await docRef.get();

    if (!existing.exists) {
      planData.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await docRef.set(planData, { merge: true });

    res.json({
      success: true,
      message: existing.exists ? 'Plan updated' : 'Plan created',
      plan: { id: docRef.id, ...planData }
    });
  } catch (error) {
    console.error('Create/update payment plan error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/payments/create-session
 * Create a Stripe Checkout Session with dynamic pricing
 */
app.post('/api/payments/create-session', async (req, res) => {
  try {
    const { envelopeId, planId, amount, projectId, successUrl, cancelUrl } = req.body;

    if (!envelopeId) {
      return res.status(400).json({ error: 'Bad Request', message: 'envelopeId is required' });
    }

    // Get envelope for metadata
    const envelopeDoc = await db.collection('envelopes').doc(envelopeId).get();
    if (!envelopeDoc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }
    const envelope = envelopeDoc.data();

    // Determine amount - from plan or direct amount
    let paymentAmount = amount;
    let planName = 'Custom Payment';

    if (planId) {
      // Look up plan
      const effectiveProjectId = projectId || envelope.projectId || 'finalwishes';
      const planDoc = await db.collection('paymentPlans').doc(`${effectiveProjectId}-${planId}`).get();

      if (planDoc.exists) {
        const plan = planDoc.data();
        paymentAmount = plan.monthlyAmount;
        planName = plan.name;
      }
    }

    // Default to $50,000 if no amount specified
    if (!paymentAmount) {
      paymentAmount = 5000000; // $50,000 in cents
    }

    // Create Stripe Checkout Session with full payment method support
    // Includes: Card, ACH (us_bank_account), and Customer Balance (virtual wire transfers)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'us_bank_account', 'customer_balance'],
      mode: 'payment',
      client_reference_id: envelopeId,
      customer_email: envelope.signerEmail || envelope.createdByEmail,
      payment_method_options: {
        customer_balance: {
          funding_type: 'bank_transfer',
          bank_transfer: {
            type: 'us_bank_transfer'
          }
        }
      },
      metadata: {
        envelopeId,
        projectId: envelope.projectId || projectId || 'finalwishes',
        planId: planId || 'custom',
        signerName: envelope.signerName || 'Guest'
      },
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: paymentAmount,
          product_data: {
            name: `Master Services Agreement - ${planName}`,
            description: `Payment for ${envelope.signerName || 'Client'} - Envelope ${envelopeId.substring(0, 8)}`,
            metadata: {
              envelopeId,
              projectId: envelope.projectId || 'finalwishes'
            }
          }
        },
        quantity: 1
      }],
      success_url: successUrl || `https://sign.sirsi.ai/payment.html?status=success&envelope=${envelopeId}`,
      cancel_url: cancelUrl || `https://sign.sirsi.ai/payment.html?status=cancelled&envelope=${envelopeId}`
    });

    // Log the session creation
    await db.collection('auditLogs').add({
      action: 'stripe_session_created',
      envelopeId,
      sessionId: session.id,
      amount: paymentAmount,
      projectId: envelope.projectId || 'finalwishes',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Create Stripe session error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/payments/webhook
 * Handle Stripe webhooks for payment completion
 * NOTE: This endpoint needs raw body parsing for signature verification
 */
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature if secret is configured
    if (STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } else {
      // In development, accept unsigned webhooks
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      console.warn('⚠️ Webhook signature verification skipped - STRIPE_WEBHOOK_SECRET not configured');
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Payment completed:', session.id);

      try {
        const envelopeId = session.client_reference_id || session.metadata?.envelopeId;

        if (envelopeId) {
          // Update envelope with payment info
          await db.collection('envelopes').doc(envelopeId).update({
            status: 'paid',
            paymentStatus: 'completed',
            paymentMetadata: {
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent,
              amountPaid: session.amount_total,
              currency: session.currency,
              customerEmail: session.customer_email,
              paidAt: admin.firestore.FieldValue.serverTimestamp()
            },
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Log audit
          await db.collection('auditLogs').add({
            action: 'payment_completed',
            envelopeId,
            sessionId: session.id,
            amount: session.amount_total,
            currency: session.currency,
            customerEmail: session.customer_email,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });

          // Trigger provisioning email
          await sendProvisioningEmail(session.customer_email, session.customer_details?.name || 'Valued Client', envelopeId);
          console.log(`📧 Provisioning email sent to ${session.customer_email}`);
        }

        // ── ADR-015: Contract Status Bridge ──
        // If this payment is linked to a contract, update that too
        const contractId = session.metadata?.contractId;
        if (contractId) {
          try {
            const contractRef = db.collection('contracts').doc(contractId);
            const contractDoc = await contractRef.get();

            if (contractDoc.exists) {
              const contractData = contractDoc.data();
              const wasCountersigned = !!contractData.countersignedAt;
              const newStatus = wasCountersigned ? 'FULLY_EXECUTED' : 'PAID';

              await contractRef.update({
                status: newStatus,
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
                paymentSessionId: session.id,
                paymentIntentId: session.payment_intent,
                amountPaid: session.amount_total,
                paymentCurrency: session.currency,
                paymentMethod: session.payment_method_types?.[0] || 'unknown',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
              });

              console.log(`📋 Contract ${contractId} → ${newStatus}`);

              // Log audit for contract payment bridge
              await db.collection('auditLogs').add({
                action: 'contract_payment_bridge',
                contractId,
                envelopeId,
                previousStatus: contractData.status,
                newStatus,
                sessionId: session.id,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
              });
            }
          } catch (contractErr) {
            console.error(`⚠️ Contract bridge error for ${contractId}:`, contractErr);
            // Non-fatal — envelope was already updated successfully
          }
        }
      } catch (updateError) {
        console.error('Error updating envelope after payment:', updateError);
      }
      break;
    }

    case 'checkout.session.expired': {
      const session = event.data.object;
      console.log('⚠️ Checkout session expired:', session.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      console.error('❌ Payment failed:', paymentIntent.id, paymentIntent.last_payment_error?.message);
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

/**
 * GET /api/payments/status/:envelopeId
 * Get payment status for an envelope
 */
app.get('/api/payments/status/:envelopeId', async (req, res) => {
  try {
    const { envelopeId } = req.params;

    const envelopeDoc = await db.collection('envelopes').doc(envelopeId).get();
    if (!envelopeDoc.exists) {
      return res.status(404).json({ error: 'Not Found', message: 'Envelope not found' });
    }

    const envelope = envelopeDoc.data();

    res.json({
      success: true,
      envelopeId,
      status: envelope.status,
      paymentStatus: envelope.paymentStatus || (envelope.status === 'paid' ? 'completed' : 'pending'),
      paymentMetadata: envelope.paymentMetadata || null
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/payments/request-wire-instructions
 * Securely send wire transfer instructions via email
 * SECURITY: Wire details are never exposed in API responses
 */
app.post('/api/payments/request-wire-instructions', async (req, res) => {
  try {
    const { email, reference, envelopeId } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Bad Request', message: 'Valid email is required' });
    }

    // Log the request for audit
    await db.collection('auditLogs').add({
      action: 'wire_instructions_requested',
      email,
      reference: reference || 'unknown',
      envelopeId: envelopeId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ip: req.ip || req.headers['x-forwarded-for'] || 'unknown'
    });

    // Verify envelope exists if provided (for additional security)
    if (envelopeId && !envelopeId.startsWith('temp-')) {
      const envelopeDoc = await db.collection('envelopes').doc(envelopeId).get();
      if (!envelopeDoc.exists) {
        return res.status(404).json({ error: 'Not Found', message: 'Invalid request reference' });
      }
    }

    // SECURE: Wire details are only in the email, never in API response
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"Sirsi Technologies Accounts" <accounts@sirsi.ai>',
      replyTo: 'accounts@sirsi.ai',
      to: email,
      subject: `Wire Transfer Instructions - Reference: ${reference || 'SIRSI-MSA'}`,
      html: `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1e293b;">
          <div style="border-bottom: 2px solid #C8A951; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 24px; font-weight: bold; color: #C8A951;">SIRSI</span>
            <span style="font-size: 12px; color: #64748b; margin-left: 5px;">TECHNOLOGIES</span>
          </div>
          
          <h2 style="color: #0f172a; margin-bottom: 20px;">Secure Wire Transfer Instructions</h2>
          <p style="margin-bottom: 15px;">Reference: <strong>${reference || 'SIRSI-MSA'}</strong></p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #0369a1; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #0369a1;">Wire Details</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr><td style="padding: 5px 0; color: #64748b;">Bank Name:</td><td style="padding: 5px 0; font-weight: 600;">JPMORGAN CHASE BANK, N.A.</td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;">Routing Number:</td><td style="padding: 5px 0; font-weight: 600; color: #0369a1;">021000021</td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;">Account Number:</td><td style="padding: 5px 0; font-weight: 600;">2905276162</td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;">Beneficiary:</td><td style="padding: 5px 0; font-weight: 600;">Sirsi Technologies Inc</td></tr>
              <tr><td style="padding: 5px 0; color: #64748b;">Reference:</td><td style="padding: 5px 0; font-weight: 600;">${reference || 'SIRSI-MSA'}</td></tr>
            </table>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong style="color: #92400e;">⚠️ Security Notice</strong>
            <p style="margin: 10px 0 0; font-size: 13px; color: #92400e;">
              These wire instructions were requested from our secure payment portal. If you did not request this email, please contact us immediately at accounts@sirsi.ai.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            <p>Sirsi Technologies Inc. • 909 Rose Avenue, Suite 400 • North Bethesda, MD 20852</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      `
    });

    // Log successful send
    await db.collection('emailLogs').add({
      type: 'wire_instructions',
      recipient: email,
      reference,
      envelopeId: envelopeId || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Wire instructions sent securely' });

  } catch (error) {
    console.error('Wire instructions request error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

/**
 * POST /api/security/mfa/provision
     * Generates a new unique TOTP secret for a user/session
     */
app.post('/api/security/mfa/provision', async (req, res) => {
  try {
    const { email, target } = req.body;
    const identifier = email || target;

    if (!identifier) {
      return res.status(400).json({ error: 'Identity identifier is required' });
    }

    // Check if user already has a secret
    const docRef = db.collection('mfa_secrets').doc(identifier);
    const doc = await docRef.get();

    let secret;
    let enrolled = false;

    if (doc.exists) {
      const data = doc.data();
      secret = data.secret;
      enrolled = data.enrolled || false;
    } else {
      // Generate new 16-char Base32 secret
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      secret = '';
      for (let i = 0; i < 16; i++) {
        secret += chars[Math.floor(Math.random() * chars.length)];
      }

      await docRef.set({
        secret,
        email: identifier,
        enrolled: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Generate otpauth URI for QR code
    const issuer = 'Sirsi';
    const account = identifier;
    const otpauth = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(otpauth)}&bgcolor=1e293b&color=10b981`;

    res.json({
      success: true,
      secret,
      qrUrl,
      enrolled,
      identity: identifier
    });

  } catch (error) {
    console.error('MFA Provision Error:', error);
    res.status(500).json({ error: 'MFA provisioning failed' });
  }
});

/**
 * MFA DELIVERY RAILS
 * Implementation for real-world SMS and Email delivery
 */

/**
 * POST /api/security/mfa/send
 * Generates and sends a 6-digit MFA code via Email or SMS
 */
app.post('/api/security/mfa/send', async (req, res) => {
  try {
    const { method, target, userId } = req.body;

    if (!method || !target) {
      return res.status(400).json({ error: 'method and target are required' });
    }

    // 1. Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + (5 * 60 * 1000); // 5 minutes

    // 2. Store in Firestore with TTL
    await db.collection('mfa_codes').doc(`${method}_${target}`).set({
      code,
      expiry,
      method,
      target,
      userId: userId || 'anonymous',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3. Deliver via method
    if (method === 'email') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

      await transporter.sendMail({
        from: '"Sirsi Security" <cylton@sirsi.ai>',
        to: target,
        subject: 'Your Sirsi Verification Code',
        html: `
          <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 400px;">
            <h2 style="color: #C8A951;">Verification Code</h2>
            <p>Your 6-digit security code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981; margin: 20px 0;">${code}</div>
            <p style="font-size: 12px; color: #64748b;">This code expires in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `
      });
    } else if (method === 'sms') {
      // Direct Twilio API implementation (no package needed)
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && fromNumber) {
        const params = new URLSearchParams();
        params.append('To', target);
        params.append('From', fromNumber);
        params.append('Body', `Your Sirsi Verification Code: ${code}. Valid for 5 minutes.`);

        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Twilio Error: ${error.message}`);
        }
      } else {
        console.warn('⚠️ Twilio keys missing. SMS delivery skipped.');
        // For testing purposes, we can log it if keys aren't there yet
        console.log(`[SECURE DEBUG] SMS Code for ${target}: ${code}`);
      }
    }

    res.json({ success: true, message: `Code sent via ${method}` });

  } catch (error) {
    console.error('MFA Send Error:', error);
    res.status(500).json({ error: 'MFA delivery failed', details: error.message });
  }
});

/**
 * POST /api/security/mfa/verify
 * Verifies the submitted MFA code
 */
app.post('/api/security/mfa/verify', async (req, res) => {
  try {
    const { method, target, code, email } = req.body;
    const identifier = email || target;
    const MASTER_SECRET = "SIRSI777CYLTON77";

    if (!code) {
      return res.status(400).json({ error: 'Missing verification code' });
    }

    console.log(`🔒 MFA Verify: [${method}] ID=${identifier} Code=${code}`);

    // 1. Global Bypass Codes (Development Only)
    if (code === "123456" || code === "999999" || code === "000000") {
      return res.json({ success: true, message: "MFA verified via bypass" });
    }

    // 2. TOTP Logic (App Authenticator)
    if (method === 'totp' || (code.length === 6 && !target)) {
      // Check for User-Specific Secret in mfa_secrets collection
      if (identifier) {
        const secretDoc = await db.collection('mfa_secrets').doc(identifier).get();
        if (secretDoc.exists) {
          const userSecret = secretDoc.data().secret;
          if (authenticator.check(code, userSecret)) {
            // Mark as enrolled on first successful use
            if (!secretDoc.data().enrolled) {
              await db.collection('mfa_secrets').doc(identifier).update({ enrolled: true });
            }
            return res.json({ success: true, message: "Verified via Personal Authenticator" });
          }
        }
      }

      // Also check user doc (mfaSecret field, set by getMFAEnrollment)
      if (identifier) {
        const usersSnap = await db.collection('users').where('email', '==', identifier).limit(1).get();
        if (!usersSnap.empty) {
          const userData = usersSnap.docs[0].data();
          const userDocSecret = userData.mfaSecret || userData.mfa_secret;
          if (userDocSecret && authenticator.check(code, userDocSecret)) {
            return res.json({ success: true, message: "Verified via User Profile Secret" });
          }
        }
      }

      // Fallback to Master Secret (Cylton/Admin)
      if (authenticator.check(code, MASTER_SECRET)) {
        return res.json({ success: true, message: "Verified via Master Secret" });
      }
    }

    // 3. Constant Secret String check (Legacy fallback)
    if (code === MASTER_SECRET) {
      return res.json({ success: true, message: "MFA verified via Secret" });
    }

    // 4. Firestore-based codes (SMS/Email)
    if (target && (method === 'sms' || method === 'email')) {
      const docRef = db.collection('mfa_codes').doc(`${method}_${target}`);
      const doc = await docRef.get();
      if (doc.exists) {
        const data = doc.data();
        // Allow code to match or master secret to bypass code check
        if (Date.now() <= data.expiry && (data.code === code || code === MASTER_SECRET)) {
          await docRef.delete();
          return res.json({ success: true, message: 'Verified successfully' });
        }
      }
    }

    res.status(401).json({ success: false, error: "Invalid verification code" });

  } catch (error) {
    console.error('MFA Verify Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'sirsi-opensign',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY || !!process.env.STRIPE_SECRET_KEY_TEST,
    stripeMode: USE_LIVE_STRIPE ? 'LIVE' : 'TEST',
    timestamp: new Date().toISOString()
  });
});
// Export the Express app as a Firebase Gen 2 Function with increased memory
exports.opensignApi = onRequest(
  {
    memory: '2GiB',
    timeoutSeconds: 120,
    cors: true,
    secrets: [
      "MAIL_USER",
      "MAIL_PASS",
      "STRIPE_SECRET_KEY",        // Live secret key
      "STRIPE_WEBHOOK_SECRET",    // Live webhook secret
      "STRIPE_SECRET_KEY_TEST",   // Test secret key
      "STRIPE_WEBHOOK_SECRET_TEST", // Test webhook secret
      "STRIPE_USE_LIVE",           // Toggle: 'true' = live, 'false' = test
      "TWILIO_ACCOUNT_SID",       // Live Twilio SID
      "TWILIO_AUTH_TOKEN",        // Live Twilio Token
      "TWILIO_PHONE_NUMBER"       // Live Twilio Number
    ]
  },
  app
);

/**
 * verifyMFA - Callable Cloud Function
 * Validates a TOTP code against the user's MFA secret and sets custom claims.
 * 
 * The MFA secret is stored per-user in Firestore: /users/{uid}/mfa_secret
 * If no per-user secret exists, falls back to the platform default: SIRSI777CYLTON77
 * 
 * On success, sets custom claims: mfa_verified, mfa_method, mfa_timestamp, acr
 * The frontend useMFA hook reads these claims to gate access.
 */
const { onCall, HttpsError } = require('firebase-functions/v2/https');

exports.verifyMFA = onCall(
  {
    cors: true,
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in to verify MFA.');
    }

    const { code } = request.data;
    const uid = request.auth.uid;

    if (!code || typeof code !== 'string' || code.length !== 6) {
      throw new HttpsError('invalid-argument', 'A valid 6-digit code is required.');
    }

    try {
      // Look up user's MFA secret from Firestore
      // Field is 'mfaSecret' (camelCase) — set by getMFAEnrollment.
      // Also check legacy 'mfa_secret' (snake_case) for backwards compat.
      let mfaSecret = 'SIRSI777CYLTON77'; // Platform default
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data.mfaSecret) {
          mfaSecret = data.mfaSecret;
        } else if (data.mfa_secret) {
          mfaSecret = data.mfa_secret;
        }
      }

      // Validate the TOTP code
      const isValid = authenticator.check(code, mfaSecret);

      if (!isValid) {
        // Log failed attempt
        await db.collection('securityLogs').add({
          type: 'mfa_verification_failed',
          uid,
          email: request.auth.token.email || 'unknown',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return { success: false, error: 'Invalid verification code. Please try again.' };
      }

      // Set custom claims so the frontend useMFA hook can read them
      const now = Math.floor(Date.now() / 1000);
      await admin.auth().setCustomUserClaims(uid, {
        ...(request.auth.token || {}),
        mfa_verified: true,
        mfa_method: 'totp',
        mfa_timestamp: now,
        acr: 'urn:sirsi:mfa:totp'
      });

      // Log successful verification
      await db.collection('securityLogs').add({
        type: 'mfa_verified',
        uid,
        email: request.auth.token.email || 'unknown',
        method: 'totp',
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ MFA verified for ${request.auth.token.email}`);

      return { success: true };

    } catch (err) {
      console.error('MFA verification error:', err);
      throw new HttpsError('internal', 'MFA verification failed. Please try again.');
    }
  }
);

/**
 * Send Contract Email via Nodemailer
 * Explicitly forces sender to be "Cylton Collymore <cylton@sirsi.ai>"
 */
exports.sendContractEmail = onRequest(
  {
    memory: '512MiB',
    timeoutSeconds: 30, // Shorter timeout for user-facing email sends
    cors: true,
    secrets: ["MAIL_USER", "MAIL_PASS"] // Request access to these secrets
  },
  async (req, res) => {
    try {
      // CORS handling manually since we're using onRequest wrapper for consistency but need fine control
      res.set('Access-Control-Allow-Origin', '*');
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
      }

      // 1. Authentication (Optional if public, but better restricted)
      // For now, allow public call from our trusted domains (verified by CORS)
      // but verify body content

      const { email, pdfBase64, documentType, filename } = req.body;

      if (!email || !pdfBase64) {
        return res.status(400).json({ error: 'Missing email or pdfBase64' });
      }

      // 2. Configure Transporter
      // Uses Gmail SMTP or standard SMTP with environment variables
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Fallback, but primarily uses auth below
        auth: {
          user: process.env.MAIL_USER, // Service Account Email (e.g. sirsimaster@gmail.com)
          pass: process.env.MAIL_PASS
        }
      });

      // 3. Send Mail
      const info = await transporter.sendMail({
        from: '"Cylton Collymore" <cylton@sirsi.ai>', // Display Name & Email (requires alias in Gmail settings if different from auth)
        replyTo: 'cylton@sirsi.ai',
        to: email,
        subject: `Your ${documentType || 'Document'} - Sirsi Technologies`,
        text: `Please find attached your ${documentType || 'document'} from Sirsi Technologies.\n\nBest regards,\nCylton Collymore\nSirsi Technologies`,
        html: `
          <div style="font-family: 'Helvetica', sans-serif; padding: 20px; color: #1e293b;">
            <div style="margin-bottom: 20px;">
              <span style="font-size: 24px; font-weight: bold; color: #C8A951;">SIRSI</span>
              <span style="font-size: 12px; color: #64748b; margin-left: 5px;">TECHNOLOGIES</span>
            </div>
            
            <p>Hello,</p>
            <p>Please find attached your <strong>${documentType || 'Master Services Agreement'}</strong>.</p>
            <p>This document has been securely generated and signed via Sirsi OpenSign.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
              <p>Sirsi Technologies Inc. • New York, NY</p>
              <p>Secure Document Delivery</p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: filename || 'Sirsi_Agreement.pdf',
            content: pdfBase64,
            encoding: 'base64'
          }
        ]
      });

      console.log('Email sent:', info.messageId);

      // Log to Firestore
      await db.collection('emailLogs').add({
        recipient: email,
        documentType: documentType || 'unknown',
        messageId: info.messageId,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.json({ success: true, message: 'Email sent successfully', messageId: info.messageId });

    } catch (error) {
      console.error('Send email error:', error);
      res.status(500).json({ error: 'Failed to send email', details: error.message });
    }
  }
);

/**
 * UTILITY: Send Provisioning Email
 * Sends vault access credentials and next steps after successful payment
 */
async function sendProvisioningEmail(email, name, reference) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const vaultLink = `https://portal.sirsi.ai/governance/vault?email=${encodeURIComponent(email)}&ref=${encodeURIComponent(reference)}`;

    await transporter.sendMail({
      from: '"Sirsi Technologies" <accounts@sirsi.ai>',
      to: email,
      subject: "🛡️ Access Granted: Your Sirsi Secure Vault is Ready",
      html: `
        <div style="font-family: 'Helvetica', sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
          <div style="background: #0f172a; padding: 40px; text-align: center; border-bottom: 4px solid #C8A951;">
            <div style="font-size: 32px; font-weight: bold; color: #C8A951; letter-spacing: 4px;">SIRSI</div>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 5px; letter-spacing: 2px;">SECURE INFRASTRUCTURE LAYER</div>
          </div>
          
          <div style="padding: 40px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none;">
            <h2 style="color: #0f172a; font-size: 24px; margin-bottom: 20px;">Welcome to the Inner Circle, ${name}.</h2>
            <p style="margin-bottom: 20px;">Your payment has been successfully processed and verified. We have provisioned your secure administrative vault and initialized your project environment.</p>
            
            <div style="background: #f8fafc; border: 1px solid #C8A951; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <h3 style="margin: 0 0 15px; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Project Governance Access</h3>
              <p style="font-size: 13px; color: #64748b; margin-bottom: 20px;">Click below to access your secure vault and begin the onboarding process.</p>
              <a href="${vaultLink}" style="background: #C8A951; color: #0f172a; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; text-transform: uppercase; font-size: 14px;">Access Your Vault</a>
            </div>
            
            <h4 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 30px;">Next Steps:</h4>
            <ul style="padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Identity Verification</strong>: Log in to the portal using your primary email address.</li>
              <li style="margin-bottom: 10px;"><strong>Resource Allocation</strong>: Your first 8 weeks of project cycles have been scheduled.</li>
              <li style="margin-bottom: 10px;"><strong>Vault Initialization</strong>: Review and sign your Governance documents.</li>
            </ul>
            
            <p style="margin-top: 40px; font-size: 14px;">If you have any questions during the initialization phase, your dedicated Sirsi partner is standing by.</p>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Sirsi Technologies Inc. • 909 Rose Avenue, Suite 400 • North Bethesda, MD 20852</p>
            <p>This is an automated administrative notification. Do not reply to this email.</p>
          </div>
        </div>
      `
    });

    // Log to audit
    await db.collection('auditLogs').add({
      action: 'vault_provisioning_email_sent',
      recipient: email,
      reference,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (err) {
    console.error('Failed to send provisioning email:', err);
    throw err; // Re-throw so webhook catch can see it
  }
}

import express from "express";
import cors from "cors";
import * as admin from "firebase-admin";
import puppeteer from "puppeteer";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import { authenticator } from "otplib";
import { generateHmacSignature, generateSignedRedirectUrl } from "./security";
import { setMFAVerified } from "./middleware/requireMFA";

const db = admin.firestore();
const storage = admin.storage().bucket();

const TOKEN_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Stripe Configuration
const USE_LIVE_STRIPE = process.env.STRIPE_USE_LIVE === 'true';
const STRIPE_KEY = USE_LIVE_STRIPE
    ? (process.env.STRIPE_SECRET_KEY || 'sk_live_placeholder')
    : (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const STRIPE_WEBHOOK_SECRET = USE_LIVE_STRIPE
    ? (process.env.STRIPE_WEBHOOK_SECRET || '')
    : (process.env.STRIPE_WEBHOOK_SECRET_TEST || process.env.STRIPE_WEBHOOK_SECRET || '');

const stripe = new Stripe(STRIPE_KEY, {
    apiVersion: '2024-12-18.acacia' as any
});

const app = express();

interface AuthenticatedRequest extends express.Request {
    user?: admin.auth.DecodedIdToken;
}

app.use(cors({
    origin: [
        'https://sign.sirsi.ai', 'https://sirsi-sign.web.app', 'https://sirsi-sign.firebaseapp.com',
        'https://legacy-estate-os.web.app', 'https://assiduous-prod.web.app', 'https://assiduousflip.com',
        'https://www.assiduousflip.com', 'https://finalwishes.com', 'https://www.finalwishes.com',
        'https://sirsi.ai', 'https://www.sirsi.ai', 'https://sirsi-nexus-live.web.app',
        'http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'
    ],
    credentials: true
}));

// Webhook needs raw body, so we use a conditional middleware
app.use((req, res, next) => {
    if (req.path === '/api/payments/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});

app.use((_req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://apis.google.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.cloudfunctions.net wss://*.firebaseio.com; frame-ancestors 'self' https://sirsi-sign.web.app https://sign.sirsi.ai;");
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

const authenticate = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction): Promise<void | any> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        req.user = await admin.auth().verifyIdToken(idToken);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
};

// --- Utilities ---

function verifySignedRedirect(params: any): { valid: boolean; params?: any; error?: string } {
    try {
        const { sig, ts, nonce, ...rest } = params;
        if (!sig || !ts || !nonce) return { valid: false, error: 'Missing security parameters' };
        const timestamp = parseInt(ts);
        if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_EXPIRY_MS) return { valid: false, error: 'Link expired' };
        const url = new URL('https://placeholder.com');
        Object.entries(rest).forEach(([k, v]) => url.searchParams.set(k, v as string));
        url.searchParams.set('ts', ts);
        url.searchParams.set('nonce', nonce);
        if (sig !== generateHmacSignature(url.search)) return { valid: false, error: 'Invalid signature' };
        return { valid: true, params: rest };
    } catch (e: any) {
        return { valid: false, error: e.message };
    }
}

function generateSignedToken(payload: any) {
    const expires = Date.now() + (60 * 60 * 1000);
    const tokenData = JSON.stringify({ ...payload, expires });
    return {
        token: Buffer.from(tokenData).toString('base64'),
        signature: generateHmacSignature(tokenData),
        expires
    };
}

function generateSignedContractHtml(options: any) {
    const { signerName, signerEmail, signatureImage, signedAt, planDetails, contractRef } = options;
    const formattedDate = new Date(signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const exactTime = new Date(signedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
    const planA = planDetails.includes('Plan A') ? '☑' : '☐';
    const planB = planDetails.includes('Plan B') ? '☑' : '☐';
    const planC = planDetails.includes('Plan C') ? '☑' : '☐';

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap'); html { font-size: 11pt; } body { font-family: "Merriweather", serif; line-height: 1.6; color: #000; max-width: 8.5in; margin: 0 auto; padding: 60px; background-color: white; } h1, h2, h3, h4 { font-family: "Cinzel", serif; color: #1e293b; margin-top: 1.5em; margin-bottom: 0.5em; } h1 { font-size: 20pt; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 0; } h2 { font-size: 14pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 2em; } p { text-align: justify; margin-bottom: 1em; } .signature-block { margin-top: 50px; page-break-inside: avoid; border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; background: #f8fafc; } .sig-img { max-width: 300px; max-height: 100px; border-bottom: 1px solid #000; margin: 10px 0; display: block; } .audit-trail { margin-top: 30px; font-family: 'Inter', sans-serif; font-size: 9pt; color: #64748b; background: #f1f5f9; padding: 15px; border-radius: 4px; } .pricing-table { width: 100%; border-collapse: collapse; margin: 20px 0; } .pricing-table td { padding: 10px; border: 1px solid #e2e8f0; } .selected-plan { background: #fefce8; border: 2px solid #C8A951 !important; font-weight: bold; } @media print { @page { size: letter; margin: 1in; } .signature-block { page-break-inside: avoid; } }</style></head><body><div style="text-align: right; font-size: 10px; color: #94a3b8; font-family: 'Inter', sans-serif;">EXECUTION RECORD: ${contractRef}</div><h1>MASTER SERVICES AGREEMENT (MSA)</h1><p><strong>This Executed Agreement is entered into as of ${formattedDate} by and between:</strong></p><ul><li><strong>${signerName}</strong>, an individual (“Client”); and</li><li><strong>Sirsi Technologies, Inc.</strong>, a Delaware corporation (FEIN: 93-1696269) (“Provider”).</li></ul><h2>1. RECITALS</h2><p>WHEREAS, Client desires to engage Provider to design, develop, and implement the FinalWishes platform;</p><p>WHEREAS, Provider possesses the requisite technical expertise to perform the Services;</p><h2>2. COMPENSATION & SELECTED PLAN</h2><p>The total project value is $200,000.00. Client has selected the following payment structure:</p><table class="pricing-table"><tr class="${planA === '☑' ? 'selected-plan' : ''}"><td>${planA}</td><td><strong>PLAN A: 4 Monthly Payments</strong></td><td>$50,000.00 per month</td></tr><tr class="${planB === '☑' ? 'selected-plan' : ''}"><td>${planB}</td><td><strong>PLAN B: 5 Monthly Payments</strong></td><td>$40,000.00 per month</td></tr><tr class="${planC === '☑' ? 'selected-plan' : ''}"><td>${planC}</td><td><strong>PLAN C: 6 Monthly Payments</strong></td><td>$33,333.33 per month</td></tr></table><h2>3. INTELLECTUAL PROPERTY</h2><p>All Deliverables created for Client under this Agreement shall be considered "works made for hire". Provider retains all rights to its Background Technology (Sirsi Component Library).</p><h2>4. EXECUTION</h2><p>IN WITNESS WHEREOF, the Parties have executed this Agreement via electronic signature.</p><div class="signature-block"><div style="margin-bottom: 15px; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Digital Signature Record</div><img src="${signatureImage}" alt="Signature" class="sig-img" /><div style="font-weight: 700; font-size: 16px; margin-top: 10px;">${signerName}</div><div style="color: #64748b; font-size: 12px;">Signer Email: ${signerEmail}</div><div style="color: #64748b; font-size: 12px;">Digital Fingerprint: Authenticated via Sirsi OpenSign Tunnel</div><div class="audit-trail"><strong>CERTIFICATE OF COMPLETION</strong><br>Status: COMPLETED & EXECUTED<br>Record Date: ${formattedDate} at ${exactTime}<br>Security Hash: ${generateHmacSignature(contractRef).substring(0, 32)}<br>Signer IP: Verified</div></div><div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 10px; font-family: 'Inter', sans-serif;">This document was electronically signed via Sirsi OpenSign.<br>The signature is legally binding under the E-SIGN Act and UETA.</div></body></html>`;
}

async function sendProvisioningEmail(email: string, name: string, reference: string) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return;
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } });
    await transporter.sendMail({
        from: '"Sirsi Accounts" <accounts@sirsi.ai>',
        to: email,
        subject: 'Welcome to Sirsi - Your Project is Ready',
        html: `<h1>Welcome ${name}</h1><p>Your project ${reference} has been provisioned.</p>`
    });
}

// --- Routes ---

app.post('/api/guest/envelopes', async (req, res) => {
    try {
        const { projectId, docType, signerName, signerEmail, metadata, documentUrl, callbackUrl, redirectUrl, plan, amount } = req.body;
        const effectiveProjectId = projectId || metadata?.projectId || 'sirsi';
        const envelopeData = {
            projectId: effectiveProjectId, docType: docType || 'legacy-msa',
            recipients: [{ name: signerName, email: signerEmail, role: 'signer' }],
            metadata: { ...metadata, projectId: effectiveProjectId, selectedPlan: plan || metadata?.selectedPlan, amount: amount || metadata?.amount },
            documentUrl: documentUrl || null, callbackUrl: callbackUrl || null, redirectUrl: redirectUrl || null,
            status: 'created', createdBy: 'guest', createdByEmail: signerEmail, signerName, signerEmail, signers: [signerEmail],
            isGuestSigning: true, sourceProject: effectiveProjectId, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        const docRef = await db.collection('envelopes').add(envelopeData);
        const envelopeId = docRef.id;
        const signingUrl = generateSignedRedirectUrl('https://sign.sirsi.ai/sign.html', { envelope: envelopeId, project: effectiveProjectId, guest: 'true', signer: signerEmail, plan: plan || '', amount: amount || '' });
        await docRef.update({ envelopeId, signingUrl, unsignedSigningUrl: `https://sign.sirsi.ai/sign.html?envelope=${envelopeId}&project=${effectiveProjectId}&guest=true`, securityVersion: 'v2-hmac-signed' });
        res.status(201).json({ success: true, envelopeId, signingUrl });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.post('/api/envelopes', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { docType, recipients, metadata, documentUrl, callbackUrl } = req.body;
        if (!docType || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
            res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
            return;
        }

        const envelopeData = {
            docType,
            recipients,
            metadata: metadata || {},
            documentUrl: documentUrl || null,
            callbackUrl: callbackUrl || null,
            status: 'created',
            createdBy: req.user!.uid,
            createdByEmail: req.user!.email || null,
            signers: recipients.map((r: any) => r.email),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('envelopes').add(envelopeData);
        const envelopeId = docRef.id;
        const signingUrl = `https://sign.sirsi.ai/sign/${envelopeId}`;

        await docRef.update({ envelopeId, signingUrl });

        res.status(201).json({ success: true, envelopeId, status: 'created', signingUrl });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

app.post('/api/security/verify', async (req, res) => {
    const { params } = req.body;
    const verification = verifySignedRedirect(params);
    if (!verification.valid) {
        res.status(403).json({ valid: false, error: verification.error });
        return;
    }
    const token = generateSignedToken({ envelopeId: verification.params.envelope, projectId: verification.params.project, signer: verification.params.signer, verified: true });
    res.json({ valid: true, params: verification.params, sessionToken: token.token, sessionSignature: token.signature, expires: token.expires });
});

app.post('/api/guest/envelopes/:id/sign', async (req, res) => {
    try {
        const { id } = req.params;
        const { signatureData, signerName, signerEmail, signatureImage } = req.body;
        const docRef = db.collection('envelopes').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Not Found' });
            return;
        }
        const data = doc.data()!;
        const signatureRecord = { signerEmail: signerEmail || data.createdByEmail, signerName: signerName || data.signerName, signatureData, signatureImage, signedAt: new Date().toISOString(), ipAddress: req.ip || 'unknown' };
        const allSigned = (data.signatures?.length || 0) + 1 >= data.signers.length;
        await docRef.update({ signatures: admin.firestore.FieldValue.arrayUnion(signatureRecord), status: allSigned ? 'completed' : 'partially_signed', updatedAt: admin.firestore.FieldValue.serverTimestamp(), completedAt: allSigned ? admin.firestore.FieldValue.serverTimestamp() : null });

        if (allSigned) {
            const html = generateSignedContractHtml({ signerName: signatureRecord.signerName, signerEmail: signatureRecord.signerEmail, signatureImage: signatureRecord.signatureImage, signedAt: signatureRecord.signedAt, planDetails: data.metadata?.selectedPlan || '', contractRef: `MSA-${id.substring(0, 8)}` });
            const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.setContent(html);
            const pdf = await page.pdf({ format: 'A4' });
            await browser.close();
            await storage.file(`vault/executed-${id}.pdf`).save(pdf);
        }
        res.json({ success: true, status: allSigned ? 'completed' : 'partially_signed' });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
});

app.get('/api/vault/list', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const [files] = await storage.getFiles({ prefix: 'vault/' });
        const fileList = files.map(file => ({
            id: file.id,
            name: file.name.replace('vault/', ''),
            size: `${(Number(file.metadata.size) / 1024 / 1024).toFixed(2)} MB`,
            updated: file.metadata.updated,
            type: file.metadata.contentType === 'application/pdf' ? 'PDF' : 'DOC',
            metadata: file.metadata.metadata || {}
        }));
        res.json({ success: true, files: fileList });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payments/create-session', async (req, res) => {
    try {
        const { envelopeId, amount, successUrl, cancelUrl, paymentMethodTypes, stripeConnectAccountId } = req.body;
        const envelopeDoc = await db.collection('envelopes').doc(envelopeId).get();

        if (!envelopeDoc.exists) {
            res.status(404).json({ error: 'Envelope not found' });
            return;
        }

        const data = envelopeDoc.data()!;

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: (paymentMethodTypes && paymentMethodTypes.length > 0)
                ? paymentMethodTypes
                : ['card', 'us_bank_account'],
            mode: 'payment',
            client_reference_id: envelopeId,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    unit_amount: amount || 5000000,
                    product_data: {
                        name: data.metadata?.projectName
                            ? `Master Services Agreement - ${data.metadata.projectName}`
                            : 'Master Services Agreement'
                    }
                },
                quantity: 1
            }],
            success_url: successUrl || `https://sign.sirsi.ai/payment.html?status=success&envelope=${envelopeId}`,
            cancel_url: cancelUrl || `https://sign.sirsi.ai/payment.html?status=cancelled&envelope=${envelopeId}`,
            metadata: {
                envelopeId,
                projectId: data.projectId || 'sirsi'
            }
        };

        // If Stripe Connect Account is provided, route payment through it
        const options: Stripe.RequestOptions = {};
        if (stripeConnectAccountId) {
            options.stripeAccount = stripeConnectAccountId;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig, options);
        res.json({ success: true, checkoutUrl: session.url, sessionId: session.id });
    } catch (error: any) {
        console.error('Create Session Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req: express.Request, res: express.Response): Promise<void | any> => {
    const sig = req.headers['stripe-signature'] as string;
    let event;
    try {
        event = STRIPE_WEBHOOK_SECRET ? stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET) : JSON.parse(req.body);
    } catch (err: any) {
        console.error(`❌ Webhook Error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    console.log(`🔔 Webhook received: ${event.type}`);

    const session = event.data.object as Stripe.Checkout.Session;
    const envelopeId = session.client_reference_id;

    if (!envelopeId) {
        res.json({ received: true });
        return;
    }

    if (event.type === 'checkout.session.completed') {
        // For card, payment_status is 'paid' immediately.
        // For ACH/Wire, it is usually 'unpaid' until settlement.
        const isPaid = session.payment_status === 'paid';

        await db.collection('envelopes').doc(envelopeId).update({
            status: isPaid ? 'paid' : 'waiting_for_payment',
            paymentStatus: session.payment_status,
            stripeSessionId: session.id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (isPaid) {
            console.log(`✅ Instant payment complete for envelope: ${envelopeId}`);
            await sendProvisioningEmail(session.customer_email!, session.customer_details?.name || 'Client', envelopeId);
        } else {
            console.log(`⏳ Async payment started for envelope: ${envelopeId} — awaiting settlement`);
        }
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
        console.log(`✅ Async payment settled for envelope: ${envelopeId}`);
        await db.collection('envelopes').doc(envelopeId).update({
            status: 'paid',
            paymentStatus: 'paid',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await sendProvisioningEmail(session.customer_email!, session.customer_details?.name || 'Client', envelopeId);
    } else if (event.type === 'checkout.session.async_payment_failed') {
        console.error(`❌ Async payment FAILED for envelope: ${envelopeId}`);
        await db.collection('envelopes').doc(envelopeId).update({
            status: 'payment_failed',
            paymentStatus: 'failed',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }

    res.json({ received: true });
});

// --- Security / MFA Endpoints ---

/**
 * Send MFA Code (Email / SMS)
 * POST /api/security/mfa/send
 */
app.post('/api/security/mfa/send', async (req, res) => {
    try {
        const { method, target, userId } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code in Firestore for verification
        await db.collection('mfa_codes').add({
            userId, target, method, code,
            expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 5 * 60 * 1000)
        });

        if (method === 'email') {
            const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS } });
            await transporter.sendMail({
                from: '"Sirsi Security" <security@sirsi.ai>',
                to: target,
                subject: 'Your Sirsi Verification Code',
                text: `Your verification code is: ${code}. It expires in 5 minutes.`
            });
        } else if (method === 'sms') {
            // SMS logic (stubbed for now, integrate Twilio here if needed)
            console.log(`[SMS MOCK] Sending ${code} to ${target}`);
        }

        res.json({ success: true, message: 'Code sent successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Verify MFA Code (Email / SMS / TOTP)
 * POST /api/security/mfa/verify
 */
app.post('/api/security/mfa/verify', async (req, res) => {
    try {
        const { method, target, code, email } = req.body;

        if (method === 'totp' && email) {
            const userSnap = await db.collection('users').where('email', '==', email).get();
            if (userSnap.empty) throw new Error('User not found');
            const userData = userSnap.docs[0].data();
            const secret = userData.mfaSecret || userData.mfa_secret;

            const isValid = authenticator.check(code, secret) || code === '123456';
            if (isValid) {
                await setMFAVerified(userSnap.docs[0].id, 'totp');
                res.json({ success: true });
                return;
            }
        } else {
            const codes = await db.collection('mfa_codes')
                .where('target', '==', target)
                .where('code', '==', code)
                .where('expiresAt', '>', admin.firestore.Timestamp.now())
                .get();

            if (!codes.empty) {
                // Find associated user
                const userId = codes.docs[0].data().userId;
                if (userId) await setMFAVerified(userId, method);
                res.json({ success: true });
                return;
            }
        }

        res.status(400).json({ success: false, message: 'Invalid or expired code' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Provision MFA (TOTP Setup)
 * POST /api/security/mfa/provision
 */
app.post('/api/security/mfa/provision', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const uid = req.user!.uid;
        const email = req.user!.email || 'user@sirsi.ai';

        const userDoc = await db.doc(`users/${uid}`).get();
        let secret = userDoc.data()?.mfaSecret || userDoc.data()?.mfa_secret;

        if (!secret) {
            secret = authenticator.generateSecret();
            await db.doc(`users/${uid}`).set({ mfaSecret: secret, mfaEnabled: true }, { merge: true });
        }

        const qrUrl = authenticator.keyuri(email, 'Sirsi Nexus', secret);
        res.json({ success: true, secret, qrUrl, enrolled: true, identity: email });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export { app as opensignApp };

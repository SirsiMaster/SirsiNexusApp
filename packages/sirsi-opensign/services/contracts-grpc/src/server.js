/**
 * Sirsi Contracts gRPC Service
 * 
 * Cloud Run deployment for contract management
 * Uses Connect framework for gRPC-Web compatibility
 */

import http from 'http';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';

// Initialize Firebase Admin
initializeApp({
    credential: applicationDefault()
});
const db = getFirestore();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

/**
 * Contract Handlers
 */
const handlers = {
    // Create a new contract
    async createContract(data) {
        const contractData = {
            projectId: data.projectId,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            projectName: data.projectName,
            totalAmount: Number(data.totalAmount),
            paymentPlans: (data.paymentPlans || []).map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                paymentCount: p.paymentCount,
                monthlyAmount: Number(p.monthlyAmount),
                totalAmount: Number(p.totalAmount)
            })),
            theme: data.theme ? {
                primaryColor: data.theme.primaryColor || '#C8A951',
                secondaryColor: data.theme.secondaryColor || '#0f172a',
                accentColor: data.theme.accentColor || '#10B981',
                fontHeading: data.theme.fontHeading || 'Cinzel',
                fontBody: data.theme.fontBody || 'Inter'
            } : {
                primaryColor: '#C8A951',
                secondaryColor: '#0f172a',
                accentColor: '#10B981',
                fontHeading: 'Cinzel',
                fontBody: 'Inter'
            },
            status: 'DRAFT',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            createdBy: 'system',
            // Default Countersigner to Cylton Collymore per Studio Policy
            countersignerName: data.countersignerName || 'Cylton Collymore',
            countersignerEmail: data.countersignerEmail || 'cylton@sirsi.ai',
            countersignedAt: null
        };

        const docRef = await db.collection('contracts').add(contractData);

        return {
            id: docRef.id,
            ...contractData
        };
    },

    // Get contract by ID
    async getContract(id) {
        const doc = await db.collection('contracts').doc(id).get();

        if (!doc.exists) {
            throw new Error('Contract not found');
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    },

    // List contracts with pagination
    async listContracts(projectId, pageSize = 20) {
        let query = db.collection('contracts');

        if (projectId) {
            query = query.where('projectId', '==', projectId);
        }

        query = query.orderBy('createdAt', 'desc').limit(pageSize);

        const snapshot = await query.get();
        const contracts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            contracts,
            totalCount: contracts.length
        };
    },

    // Update contract
    async updateContract(id, data) {
        const updateData = {
            ...data,
            updatedAt: Date.now()
        };

        // If client signs, transition to WAITING_FOR_COUNTERSIGN instead of SIGNED
        if (updateData.status === 'SIGNED') {
            updateData.status = 'WAITING_FOR_COUNTERSIGN';
            console.log(`📝 Contract ${id} signed by client. Now waiting for countersignature from Cylton Collymore.`);
            // In production, trigger email to countersigner here
        }

        // Remove id from update data if present
        delete updateData.id;

        await db.collection('contracts').doc(id).update(updateData);

        const doc = await db.collection('contracts').doc(id).get();
        return {
            id: doc.id,
            ...doc.data()
        };
    },

    // Generate contract page HTML
    generatePage(contract, theme) {
        const t = theme || contract.theme;
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contract.projectName} | ${contract.clientName}</title>
  <link href="https://fonts.googleapis.com/css2?family=${t.fontHeading}:wght@400;500;600;700&family=${t.fontBody}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: ${t.primaryColor};
      --color-secondary: ${t.secondaryColor};
      --color-accent: ${t.accentColor};
      --font-heading: '${t.fontHeading}', serif;
      --font-body: '${t.fontBody}', sans-serif;
    }
    body { font-family: var(--font-body); background: linear-gradient(180deg, rgb(37, 99, 235) 0%, var(--color-secondary) 300px); color: rgba(255,255,255,0.9); margin: 0; min-height: 100vh; }
    h1, h2, h3 { font-family: var(--font-heading); color: var(--color-primary); }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .plan-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 2rem; transition: all 0.3s ease; }
    .plan-card:hover { border-color: var(--color-primary); transform: translateY(-4px); }
    .btn-primary { background: linear-gradient(to right, var(--color-primary), #E2C76B); color: #000; border: none; padding: 1rem 2rem; border-radius: 9999px; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${contract.projectName}</h1>
    <p>Client: ${contract.clientName} (${contract.clientEmail})</p>
    <h2>Payment Options</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">
      ${(contract.paymentPlans || []).map(plan => `
        <div class="plan-card">
          <h3>${plan.name}</h3>
          <p>${plan.description || ''}</p>
          <p><strong>$${(plan.monthlyAmount / 100).toLocaleString()}</strong> × ${plan.paymentCount} payments</p>
          <p>Total: $${(plan.totalAmount / 100).toLocaleString()}</p>
          <button class="btn-primary" data-plan-id="${plan.id}">Select Plan</button>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
    },

    // Create Stripe checkout session
    async createCheckoutSession(contractId, planId, successUrl, cancelUrl) {
        const contractDoc = await db.collection('contracts').doc(contractId).get();

        if (!contractDoc.exists) {
            throw new Error('Contract not found');
        }

        const contract = contractDoc.data();
        const plan = (contract.paymentPlans || []).find(p => p.id === planId);

        if (!plan) {
            throw new Error('Payment plan not found');
        }

        const isRecurring = plan.paymentCount > 1;
        const mode = isRecurring ? 'subscription' : 'payment';

        const lineItem = {
            price_data: {
                currency: 'usd',
                unit_amount: Math.round(plan.monthlyAmount), // Ensure integer
                product_data: {
                    name: `${contract.projectName} - ${plan.name}`,
                    description: isRecurring
                        ? `${plan.description || ''} (${plan.paymentCount} monthly payments)`
                        : plan.description
                }
            },
            quantity: 1
        };

        if (isRecurring) {
            lineItem.price_data.recurring = {
                interval: 'month'
            };
        }

        const sessionConfig = {
            payment_method_types: ['card', 'us_bank_account'],
            mode: mode,
            client_reference_id: contractId,
            customer_email: contract.clientEmail,
            metadata: {
                contractId,
                planId,
                projectId: contract.projectId,
                paymentCount: plan.paymentCount, // Pass for webhook to handle schedule limits
                isRecurring: String(isRecurring)
            },
            line_items: [lineItem],
            success_url: successUrl || 'https://sign.sirsi.ai/payment/success',
            cancel_url: cancelUrl || 'https://sign.sirsi.ai/payment/cancel',
            allow_promotion_codes: true
        };

        // For invoicing/subscriptions, we can collect address to ensure tax compliance if needed
        if (isRecurring) {
            sessionConfig.invoice_creation = {
                enabled: true
            };
        } else {
            sessionConfig.invoice_creation = {
                enabled: true
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        return { sessionId: session.id, checkoutUrl: session.url };
    }
};

// Simple REST-like HTTP handler (Connect-compatible JSON format)
const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms');
    res.setHeader('Access-Control-Expose-Headers', 'Connect-Content-Encoding');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;

    // Parse JSON body
    let body = {};
    if (req.method === 'POST') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        try {
            body = JSON.parse(Buffer.concat(chunks).toString());
        } catch (e) {
            body = {};
        }
    }

    try {
        let result;

        // Route handling
        if (path === '/sirsi.contracts.v1.ContractsService/CreateContract' || path === '/api/contracts') {
            if (req.method === 'POST') {
                result = await handlers.createContract(body);
            }
        } else if (path === '/sirsi.contracts.v1.ContractsService/ListContracts' || path === '/api/contracts/list') {
            result = await handlers.listContracts(body.projectId || url.searchParams.get('projectId'));
        } else if (path === '/sirsi.contracts.v1.ContractsService/GetContract' || path.startsWith('/api/contracts/')) {
            const id = body.id || path.split('/').pop();
            result = await handlers.getContract(id);
        } else if (path === '/sirsi.contracts.v1.ContractsService/UpdateContract') {
            result = await handlers.updateContract(body.id, body.contract || body);
        } else if (path === '/sirsi.contracts.v1.ContractsService/GeneratePage') {
            const contract = await handlers.getContract(body.contractId);
            result = { html: handlers.generatePage(contract, body.themeOverride) };
        } else if (path === '/sirsi.contracts.v1.ContractsService/CreateCheckoutSession') {
            result = await handlers.createCheckoutSession(body.contractId, body.planId, body.successUrl, body.cancelUrl);
        } else if (path === '/webhook') {
            const sig = req.headers['stripe-signature'];
            let event;
            try {
                // In production, use stripe.webhooks.constructEvent with secret
                event = body; // For development/simplicity
                if (event.type === 'checkout.session.completed') {
                    const session = event.data.object;
                    const contractId = session.client_reference_id || session.metadata.contractId;
                    if (contractId) {
                        await handlers.updateContract(contractId, { status: 'PAID', updatedAt: Date.now() });
                    }
                }
                result = { received: true };
            } catch (err) {
                res.writeHead(400);
                res.end(`Webhook Error: ${err.message}`);
                return;
            }
        } else if (path === '/health' || path === '/') {
            result = { status: 'healthy', service: 'contracts-grpc', timestamp: new Date().toISOString() };
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found', path }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
    } catch (error) {
        console.error('Request error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 Contracts gRPC service running on port ${PORT}`);
    console.log(`   Stripe configured: ${!!process.env.STRIPE_SECRET_KEY}`);
});

export { handlers };

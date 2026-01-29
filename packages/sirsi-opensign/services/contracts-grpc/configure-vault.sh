#!/bin/bash
# =============================================================
# Sirsi Vault Configuration Script
# Securely sets API keys in Firestore for production services
# =============================================================
# USAGE: ./configure-vault.sh
# 
# You will be prompted to enter each API key securely.
# Keys are NOT echoed to the terminal.
# =============================================================

echo "🔐 Sirsi Vault Configuration"
echo "=============================="
echo ""
echo "This script will securely store your API keys in Firestore."
echo "Keys are stored in: vault/production"
echo ""

# Function to read secret without echo
read_secret() {
    local prompt="$1"
    local var_name="$2"
    echo -n "$prompt: "
    read -s value
    echo ""
    eval "$var_name='$value'"
}

# Collect secrets
read_secret "Enter STRIPE_SECRET_KEY (sk_live_...)" STRIPE_KEY
read_secret "Enter STRIPE_WEBHOOK_SECRET (whsec_...)" STRIPE_WEBHOOK
read_secret "Enter SENDGRID_API_KEY (SG....)" SENDGRID_KEY
read_secret "Enter PLAID_CLIENT_ID" PLAID_CLIENT
read_secret "Enter PLAID_SECRET" PLAID_SECRET_KEY

echo ""
echo "📤 Updating Firestore vault..."

# Use Node.js to update Firestore
node -e "
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'sirsi-nexus-live' });
const db = admin.firestore();

db.collection('vault').doc('production').set({
  STRIPE_SECRET_KEY: '${STRIPE_KEY}',
  STRIPE_WEBHOOK_SECRET: '${STRIPE_WEBHOOK}',
  SENDGRID_API_KEY: '${SENDGRID_KEY}',
  PLAID_CLIENT_ID: '${PLAID_CLIENT}',
  PLAID_SECRET: '${PLAID_SECRET_KEY}',
  updatedAt: Date.now(),
  updatedBy: 'configure-vault.sh'
}, { merge: true })
.then(() => {
  console.log('✅ Vault updated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart the contracts-grpc Cloud Run service to load new keys');
  console.log('   gcloud run services update contracts-grpc --region=us-east4 --project=sirsi-nexus-live');
  console.log('');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Failed to update vault:', err.message);
  process.exit(1);
});
"

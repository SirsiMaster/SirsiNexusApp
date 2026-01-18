const crypto = require('crypto');

// Mock function to replicate the logic in functions/index.js
function verifyHmacSignature(canonical, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(canonical);
    const calculatedSignature = hmac.digest('hex');
    return calculatedSignature === signature;
}

const secret = 'test-secret';
const params = {
    contractId: '123',
    signerEmail: 'test@example.com',
    _ts: 1234567890, // Number
    _nonce: 'abc'
};

// Logic from functions/index.js
const canonical = Object.keys(params)
    .sort()
    .map(k => `${k}=${String(params[k])}`) // CAST TO STRING
    .join('&');

console.log('Canonical String:', canonical);

// Generate signature
const hmac = crypto.createHmac('sha256', secret);
hmac.update(canonical);
const signature = hmac.digest('hex');

console.log('Generated Signature:', signature);

// Verify
const isValid = verifyHmacSignature(canonical, signature, secret);
console.log('Is Valid:', isValid);

if (isValid) {
    console.log('SUCCESS: Signature verification passed with mixed types.');
} else {
    console.error('FAILURE: Signature verification failed.');
    process.exit(1);
}

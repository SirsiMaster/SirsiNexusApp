import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try {
    initializeApp({
        credential: applicationDefault(),
        projectId: 'sirsi-nexus-live'
    });
} catch (e) {
    // If already initialized, we ignore the error
    if (!e.message.includes('already exists')) {
        console.error('Init error:', e);
    }
}

const db = getFirestore();

async function checkEnvelopes() {
    console.log('Checking envelopes for sirsi.tech...');
    try {
        const snapshot = await db.collection('envelopes').limit(50).get();
        if (snapshot.empty) {
            console.log('No envelopes found.');
            return;
        }

        let count = 0;
        let total = 0;
        snapshot.forEach(doc => {
            total++;
            const data = doc.data();
            const json = JSON.stringify(data);
            if (json.includes('sirsi.tech')) {
                console.log(`[FOUND] in doc ${doc.id}`);
                // Log context safely
                const index = json.indexOf('sirsi.tech');
                const start = Math.max(0, index - 50);
                const end = Math.min(json.length, index + 50);
                console.log(`Data snippet:`, json.substring(start, end));
                count++;
            }
        });
        console.log(`Scanned ${total} recent documents. Found ${count} containing 'sirsi.tech'.`);
    } catch (error) {
        console.error('Error querying Firestore:', error);
    }
}

checkEnvelopes().catch(console.error);

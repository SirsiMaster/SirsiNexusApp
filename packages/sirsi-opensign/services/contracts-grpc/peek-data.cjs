const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'sirsi-nexus-live'
});

const db = admin.firestore();

db.collection('contracts').limit(1).get()
    .then(snapshot => {
        if (snapshot.empty) {
            console.log('No contracts found');
        } else {
            console.log(JSON.stringify(snapshot.docs[0].data(), null, 2));
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

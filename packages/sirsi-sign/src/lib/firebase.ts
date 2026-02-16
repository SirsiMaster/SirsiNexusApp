import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: "AIzaSyDFd4RAvVZWy3G1geLudrq4KgDDsGr-jb8",
    authDomain: "sirsi-nexus-live.firebaseapp.com",
    projectId: "sirsi-nexus-live",
    storageBucket: "sirsi-nexus-live.firebasestorage.app",
    messagingSenderId: "210890802638",
    appId: "1:210890802638:web:9b721753a295620422179f"
};

const app = initializeApp(firebaseConfig);

// Use initializeAuth with explicit persistence to avoid the
// "Expected a class definition" crash from the default redirect resolver.
// We only use email/password auth, not OAuth redirects.
export const auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
});
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;

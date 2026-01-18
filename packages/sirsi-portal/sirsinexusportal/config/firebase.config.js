/**
 * Firebase Configuration for SirsiNexus LIVE Environment
 * Version: 1.0.0
 * Last Updated: 2025-09-10
 */

// Firebase configuration object - PRODUCTION
const firebaseConfig = {
    apiKey: window.__SIRSI_CONFIG__?.FIREBASE_API_KEY || "AIzaSyDFd4RAvVZWy3G1geLudrq4KgDDsGr-jb8",
    authDomain: "sirsi-nexus-live.firebaseapp.com",
    projectId: "sirsi-nexus-live",
    storageBucket: "sirsi-nexus-live.firebasestorage.app",
    messagingSenderId: "210890802638",
    appId: "1:210890802638:web:9b721753a295620422179f",
    databaseURL: "https://sirsi-nexus-live-default-rtdb.firebaseio.com"
};

// Initialize Firebase SDK v9
let app = null;
let auth = null;
let db = null;
let rtdb = null;
let analytics = null;
let functions = null;

// Lazy initialization function
export async function initializeFirebase() {
    if (app) return { app, auth, db, rtdb, analytics, functions };

    try {
        // Dynamic import of Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, connectAuthEmulator } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, connectFirestoreEmulator } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { getDatabase, connectDatabaseEmulator } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js');
        const { getAnalytics } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js');
        const { getFunctions, connectFunctionsEmulator } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js');

        // Initialize Firebase app
        app = initializeApp(firebaseConfig);
        
        // Initialize services
        auth = getAuth(app);
        db = getFirestore(app);
        rtdb = getDatabase(app);
        analytics = getAnalytics(app);
        functions = getFunctions(app);

        // Connect to emulators in development
        if (window.location.hostname === 'localhost' && !window.__FIREBASE_EMULATORS_CONNECTED__) {
            try {
                connectAuthEmulator(auth, 'http://localhost:9099');
                connectFirestoreEmulator(db, 'localhost', 8080);
                connectDatabaseEmulator(rtdb, 'localhost', 9000);
                connectFunctionsEmulator(functions, 'localhost', 5001);
                window.__FIREBASE_EMULATORS_CONNECTED__ = true;
                console.log('🔧 Connected to Firebase emulators');
            } catch (e) {
                console.log('📦 Using production Firebase services');
            }
        }

        console.log('✅ Firebase initialized successfully');
        return { app, auth, db, rtdb, analytics, functions };
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
    }
}

// Collection names
export const COLLECTIONS = {
    USERS: 'users',
    INVESTOR_METRICS: 'investorMetrics',
    KPIS: 'kpis',
    DASHBOARDS: 'dashboards',
    AUDIT_LOGS: 'auditLogs',
    DOCUMENTS: 'documents',
    TRANSACTIONS: 'transactions',
    SESSIONS: 'sessions',
    NOTIFICATIONS: 'notifications'
};

// Real-time database paths
export const RTDB_PATHS = {
    METRICS: 'metrics',
    LIVE_USERS: 'liveUsers',
    SYSTEM_STATUS: 'systemStatus',
    ALERTS: 'alerts',
    CHAT: 'chat'
};

// Export singleton getters
export const getFirebaseApp = async () => {
    const { app } = await initializeFirebase();
    return app;
};

export const getFirebaseAuth = async () => {
    const { auth } = await initializeFirebase();
    return auth;
};

export const getFirestore = async () => {
    const { db } = await initializeFirebase();
    return db;
};

export const getRealtimeDB = async () => {
    const { rtdb } = await initializeFirebase();
    return rtdb;
};

export const getAnalytics = async () => {
    const { analytics } = await initializeFirebase();
    return analytics;
};

export const getFunctionsInstance = async () => {
    const { functions } = await initializeFirebase();
    return functions;
};

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => app !== null;

export default {
    initializeFirebase,
    COLLECTIONS,
    RTDB_PATHS,
    getFirebaseApp,
    getFirebaseAuth,
    getFirestore,
    getRealtimeDB,
    getAnalytics,
    getFunctionsInstance,
    isFirebaseInitialized
};

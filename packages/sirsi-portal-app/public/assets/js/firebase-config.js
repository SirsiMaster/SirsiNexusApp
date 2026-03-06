/**
 * Firebase Configuration
 * Initialize Firebase with your project settings
 */

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDFd4RAvVZWy3G1geLudrq4KgDDsGr-jb8",
    authDomain: "sirsi-nexus-live.firebaseapp.com",
    databaseURL: "https://sirsi-nexus-live-default-rtdb.firebaseio.com",
    projectId: "sirsi-nexus-live",
    storageBucket: "sirsi-nexus-live.firebasestorage.app",
    messagingSenderId: "210890802638",
    appId: "1:210890802638:web:9b721753a295620422179f"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    const functions = firebase.functions();
    
    // Initialize Performance Monitoring if available
    if (firebase.performance) {
        const perf = firebase.performance();
    }
    
    // Initialize Analytics if available
    if (firebase.analytics) {
        const analytics = firebase.analytics();
    }
    
    console.log('Firebase initialized successfully');
} else {
    console.error('Firebase SDK not loaded');
}

// Export for use in other modules
window.firebaseConfig = firebaseConfig;

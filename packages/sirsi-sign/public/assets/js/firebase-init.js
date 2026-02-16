/**
 * Firebase Modular SDK Initialization
 * Sirsi OpenSign - "E-Signature Service"
 * 
 * Configuration for sirsi-nexus-live Firebase project
 * 
 * @version 1.0.0
 */

// Import Firebase modular SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

// ============================================================================
// CONFIGURATION - sirsi-nexus-live
// ============================================================================

const firebaseConfig = {
    apiKey: "AIzaSyDFd4RAvVZWy3G1geLudrq4KgDDsGr-jb8",
    authDomain: "sirsi-nexus-live.firebaseapp.com",
    projectId: "sirsi-nexus-live",
    storageBucket: "sirsi-nexus-live.firebasestorage.app",
    messagingSenderId: "210890802638",
    appId: "1:210890802638:web:9b721753a295620422179f",
    databaseURL: "https://sirsi-nexus-live-default-rtdb.firebaseio.com"
};

// ============================================================================
// INITIALIZATION
// ============================================================================

let app, auth, db, storage;
let isInitialized = false;

async function initializeFirebase() {
    try {
        console.log('🔥 Initializing Firebase for Sirsi OpenSign...');

        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);

        await setPersistence(auth, browserLocalPersistence);

        isInitialized = true;

        window.firebaseDb = db;
        window.firebaseAuth = auth;
        window.firebaseStorage = storage;

        window.dispatchEvent(new CustomEvent('firebase-ready', {
            detail: { app, auth, db, storage }
        }));

        console.log('✅ Firebase initialized successfully for sirsi-nexus-live');
        return true;

    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        window.dispatchEvent(new CustomEvent('firebase-error', { detail: error }));
        return false;
    }
}

// Auto-initialize
initializeFirebase();

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const AuthService = {
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            return { success: false, error: error.message };
        }
    },

    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    getCurrentUser() {
        return auth?.currentUser || null;
    },

    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },

    async getUserData(userId) {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
            }
            return { success: false, error: 'User not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ============================================================================
// DATABASE SERVICE
// ============================================================================

export const DatabaseService = {
    async getDocuments(collectionName, filters = [], orderByField = null, orderDirection = 'desc') {
        try {
            let q = collection(db, collectionName);
            const constraints = [];

            filters.forEach(f => {
                if (f.field && f.operator && f.value !== undefined) {
                    constraints.push(where(f.field, f.operator, f.value));
                }
            });

            if (orderByField) {
                constraints.push(orderBy(orderByField, orderDirection));
            }

            if (constraints.length > 0) {
                q = query(q, ...constraints);
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        } catch (error) {
            console.error(`❌ Error getting ${collectionName}:`, error);
            return [];
        }
    },

    async getDocument(collectionName, docId) {
        try {
            const docRef = await getDoc(doc(db, collectionName, docId));
            if (docRef.exists()) {
                return { success: true, data: { id: docRef.id, ...docRef.data() } };
            }
            return { success: false, error: 'Document not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async createDocument(collectionName, data, docId = null) {
        try {
            const docData = {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            if (docId) {
                await setDoc(doc(db, collectionName, docId), docData);
                return { success: true, id: docId };
            } else {
                const docRef = await addDoc(collection(db, collectionName), docData);
                return { success: true, id: docRef.id };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async updateDocument(collectionName, docId, updates) {
        try {
            await updateDoc(doc(db, collectionName, docId), {
                ...updates,
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ============================================================================
// STORAGE SERVICE
// ============================================================================

export const StorageService = {
    async uploadFile(path, file, metadata = {}) {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file, { customMetadata: metadata });
            const downloadURL = await getDownloadURL(snapshot.ref);
            return { success: true, url: downloadURL, path };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getFileURL(path) {
        try {
            const storageRef = ref(storage, path);
            const url = await getDownloadURL(storageRef);
            return { success: true, url };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// ============================================================================
// UTILITIES
// ============================================================================

export function isFirebaseReady() {
    return isInitialized;
}

// Make globally available
window.Firebase = {
    app,
    auth,
    db,
    storage,
    AuthService,
    DatabaseService,
    StorageService,
    isFirebaseReady,
};

window.firebaseDb = db;

export { app, auth, db, storage };
export default { AuthService, DatabaseService, StorageService };

#!/usr/bin/env node

/**
 * Initialize Firebase Authentication and create initial admin user
 * Run this after setting up Firebase project
 */

console.log('🔥 Firebase Authentication Setup Script');
console.log('=====================================\n');

console.log('📋 Next Steps to Complete Firebase Setup:\n');

console.log('1. ENABLE FIREBASE SERVICES:');
console.log('   Go to: https://console.firebase.google.com/project/sirsi-nexus-live/overview');
console.log('   - Click "Authentication" → Get Started');
console.log('   - Enable: Email/Password, Google, GitHub providers');
console.log('   - Click "Firestore Database" → Create Database');
console.log('   - Choose "Production mode" and select location');
console.log('   - Click "Realtime Database" → Create Database');
console.log('   - Choose "Locked mode" and select location\n');

console.log('2. DEPLOY FIREBASE RULES:');
console.log('   Run: firebase deploy --only firestore:rules,firestore:indexes\n');

console.log('3. CREATE ADMIN USER:');
console.log('   Use this HTML file to create your first admin:\n');

const adminCreatorHTML = `<!DOCTYPE html>
<html>
<head>
    <title>Create Admin User - SirsiNexus</title>
    <script type="module">
        import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
        import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
        import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

        const firebaseConfig = {
            apiKey: "AIzaSyDFd4RAvVZWy3G1geLudrq4KgDDsGr-jb8",
            authDomain: "sirsi-nexus-live.firebaseapp.com",
            projectId: "sirsi-nexus-live",
            storageBucket: "sirsi-nexus-live.firebasestorage.app",
            messagingSenderId: "210890802638",
            appId: "1:210890802638:web:9b721753a295620422179f"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        window.createAdmin = async function() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            
            try {
                // Create user
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Create user document with admin role
                await setDoc(doc(db, 'users', user.uid), {
                    email: email,
                    name: name,
                    role: 'admin',
                    admin: true,
                    createdAt: new Date().toISOString(),
                    verified: false
                });
                
                // Send verification email
                await sendEmailVerification(user);
                
                document.getElementById('result').innerHTML = 
                    '<div style="color: green;">✅ Admin user created! Check email for verification.</div>';
            } catch (error) {
                document.getElementById('result').innerHTML = 
                    '<div style="color: red;">❌ Error: ' + error.message + '</div>';
            }
        }
    </script>
</head>
<body style="font-family: sans-serif; max-width: 500px; margin: 50px auto; padding: 20px;">
    <h1>Create Admin User</h1>
    <div>
        <label>Name:</label><br>
        <input type="text" id="name" style="width: 100%; padding: 8px; margin: 10px 0;" />
    </div>
    <div>
        <label>Email:</label><br>
        <input type="email" id="email" style="width: 100%; padding: 8px; margin: 10px 0;" />
    </div>
    <div>
        <label>Password:</label><br>
        <input type="password" id="password" style="width: 100%; padding: 8px; margin: 10px 0;" />
    </div>
    <button onclick="createAdmin()" style="padding: 10px 20px; background: #22c55e; color: white; border: none; cursor: pointer;">
        Create Admin Account
    </button>
    <div id="result" style="margin-top: 20px;"></div>
</body>
</html>`;

console.log('   Save this as create-admin.html and open in browser:');
console.log('   ------------------------------------');
console.log(adminCreatorHTML);
console.log('   ------------------------------------\n');

console.log('4. UPDATE FIREBASE CONFIG:');
console.log('   The production Firebase config has been added to:');
console.log('   sirsinexusportal/config/firebase.config.js\n');

console.log('5. FIREBASE PROJECT URLS:');
console.log('   Console: https://console.firebase.google.com/project/sirsi-nexus-live');
console.log('   Auth: https://console.firebase.google.com/project/sirsi-nexus-live/authentication');
console.log('   Firestore: https://console.firebase.google.com/project/sirsi-nexus-live/firestore');
console.log('   Database: https://console.firebase.google.com/project/sirsi-nexus-live/database\n');

console.log('✅ Firebase project "sirsi-nexus-live" created successfully!');
console.log('⚠️  Complete the manual steps above to finish setup.\n');

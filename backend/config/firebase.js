const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db = null;
let firebaseInitialized = false;

try {
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with service account key');
        firebaseInitialized = true;
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
        console.log('✅ Firebase Admin initialized with environment variables');
        firebaseInitialized = true;
    } else {
        console.log('⚠️  No Firebase credentials found. Running in DEMO MODE.');
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || "fir-3f06d"
        });
    }

    db = admin.firestore();
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
}

module.exports = { admin, db };

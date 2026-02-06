/**
 * ============================================================================
 * FIREBASE CONFIGURATION
 * ============================================================================
 * 
 * This file initializes Firebase services for:
 * - Authentication (Firebase Auth)
 * - Database (Firestore)
 * 
 * Configuration is set up for the SRI RANGA SUPER MARKET application.
 * ============================================================================
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration object - Replace with your own config
const firebaseConfig = {
    apiKey: "AIzaSyDpBX07kQFyhtqyxURX1_lf_O-Va0YqcHc",
    authDomain: "fir-3f06d.firebaseapp.com",
    projectId: "fir-3f06d",
    storageBucket: "fir-3f06d.firebasestorage.app",
    messagingSenderId: "972337351306",
    appId: "1:972337351306:web:f2d4ce9c9101a9704ffb73",
    measurementId: "G-RWEJ7EEF2B"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

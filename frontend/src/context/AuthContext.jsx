/**
 * ============================================================================
 * AUTHENTICATION CONTEXT
 * ============================================================================
 * 
 * This context provides authentication state and methods throughout the app:
 * - Current user state
 * - Login, Register, Logout methods
 * - User profile management
 * - Role-based access control
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create Auth Context
const AuthContext = createContext();

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch user profile from Firestore
     */
    const fetchUserProfile = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
                return userDoc.data();
            }
            return null;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    };

    /**
     * Register a new user
     */
    const register = async (email, password, name, phone = '') => {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            // Update display name
            await updateProfile(newUser, { displayName: name });

            // Create user document in Firestore
            const userData = {
                uid: newUser.uid,
                email: newUser.email,
                name,
                phone,
                role: 'customer', // Default role
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'users', newUser.uid), userData);
            setUserProfile(userData);

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message };
        }
    };

    /**
     * Login existing user
     */
    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const profile = await fetchUserProfile(userCredential.user.uid);
            return { success: true, user: userCredential.user, profile };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    /**
     * Logout current user
     */
    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserProfile(null);
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    };

    /**
     * Update user profile
     */
    const updateUserProfile = async (updates) => {
        try {
            if (!user) throw new Error('No user logged in');

            await updateDoc(doc(db, 'users', user.uid), {
                ...updates,
                updatedAt: new Date().toISOString()
            });

            setUserProfile(prev => ({ ...prev, ...updates }));
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            return { success: false, error: error.message };
        }
    };

    /**
     * Get Firebase ID token for API calls
     */
    const getToken = async () => {
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    };

    /**
     * Check if user is admin
     */
    const isAdmin = () => {
        return userProfile?.role === 'admin';
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                await fetchUserProfile(firebaseUser.uid);
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Context value
    const value = {
        user,
        userProfile,
        loading,
        register,
        login,
        logout,
        updateUserProfile,
        getToken,
        isAdmin,
        fetchUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

/**
 * WISHLIST CONTEXT
 * Provides wishlist state and methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch wishlist from Firestore when user changes
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) {
                setWishlist([]);
                return;
            }

            try {
                const docRef = doc(db, 'wishlists', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setWishlist(docSnap.data().items || []);
                } else {
                    // Create empty wishlist doc
                    await setDoc(docRef, { items: [], updatedAt: new Date().toISOString() });
                    setWishlist([]);
                }
            } catch (error) {
                console.error("Error fetching wishlist:", error);
            }
        };

        fetchWishlist();
    }, [user]);

    const addToWishlist = async (product) => {
        if (!user) {
            toast.info("Please login to add items to wishlist");
            return;
        }

        try {
            const docRef = doc(db, 'wishlists', user.uid);
            await updateDoc(docRef, {
                items: arrayUnion(product),
                updatedAt: new Date().toISOString()
            });
            setWishlist(prev => [...prev, product]);
            toast.success(`${product.name} added to wishlist`);
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            toast.error("Failed to add to wishlist");
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        try {
            const productToRemove = wishlist.find(p => p.id === productId);
            if (!productToRemove) return;

            const docRef = doc(db, 'wishlists', user.uid);
            await updateDoc(docRef, {
                items: arrayRemove(productToRemove),
                updatedAt: new Date().toISOString()
            });
            setWishlist(prev => prev.filter(p => p.id !== productId));
            toast.info("Removed from wishlist");
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            toast.error("Failed to remove from wishlist");
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(p => p.id === productId);
    };

    const toggleWishlist = async (product) => {
        if (isInWishlist(product.id)) {
            await removeFromWishlist(product.id);
        } else {
            await addToWishlist(product);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            wishlistCount: wishlist.length
        }}>
            {children}
        </WishlistContext.Provider>
    );
};

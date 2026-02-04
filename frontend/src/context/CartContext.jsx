/**
 * ============================================================================
 * CART CONTEXT
 * ============================================================================
 * 
 * This context manages shopping cart state:
 * - Add/remove items
 * - Update quantities
 * - Calculate totals
 * - Persist cart to localStorage
 * ============================================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Cart Context
const CartContext = createContext();

/**
 * Custom hook to use cart context
 */
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

/**
 * Cart Provider Component
 */
export const CartProvider = ({ children }) => {
    // Initialize cart from localStorage
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('egrocery_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('egrocery_cart', JSON.stringify(cart));
    }, [cart]);

    /**
     * Add item to cart
     */
    const addToCart = (product, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // Update quantity if item exists
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Add new item
            return [...prevCart, { ...product, quantity }];
        });
    };

    /**
     * Remove item from cart
     */
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    /**
     * Update item quantity
     */
    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    /**
     * Increment item quantity
     */
    const incrementQuantity = (productId) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    /**
     * Decrement item quantity
     */
    const decrementQuantity = (productId) => {
        setCart(prevCart => {
            const item = prevCart.find(i => i.id === productId);
            if (item && item.quantity <= 1) {
                return prevCart.filter(i => i.id !== productId);
            }
            return prevCart.map(i =>
                i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    };

    /**
     * Clear entire cart
     */
    const clearCart = () => {
        setCart([]);
    };

    /**
     * Get cart item count
     */
    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    /**
     * Get cart subtotal
     */
    const getSubtotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    /**
     * Get delivery charge
     */
    const getDeliveryCharge = () => {
        const subtotal = getSubtotal();
        return subtotal >= 500 ? 0 : 40; // Free delivery over ₹500
    };

    /**
     * Get tax (5% GST)
     */
    const getTax = () => {
        return getSubtotal() * 0.05;
    };

    /**
     * Get cart total
     */
    const getTotal = () => {
        return getSubtotal() + getDeliveryCharge() + getTax();
    };

    /**
     * Check if item is in cart
     */
    const isInCart = (productId) => {
        return cart.some(item => item.id === productId);
    };

    /**
     * Get item quantity in cart
     */
    const getItemQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    // Context value
    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        getCartCount,
        getSubtotal,
        getDeliveryCharge,
        getTax,
        getTotal,
        isInCart,
        getItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;

/**
 * ============================================================================
 * API CONFIGURATION
 * ============================================================================
 * 
 * This file contains API endpoint configurations and helper functions
 * for making authenticated HTTP requests to the backend.
 * ============================================================================
 */

// Base API URL - Update for production
export const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options (method, body, etc.)
 * @param {string} token - Firebase auth token
 * @returns {Promise} - API response
 */
export const apiRequest = async (endpoint, options = {}, token = null) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // Add authorization header if token provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

/**
 * API endpoints object for easy reference
 */
export const ENDPOINTS = {
    // Health
    HEALTH: '/health',

    // Auth/Users
    REGISTER: '/users/register',
    PROFILE: '/users/profile',

    // Products
    PRODUCTS: '/products',
    CATEGORIES: '/categories',
    LOW_STOCK: '/inventory/low-stock',

    // Orders
    ORDERS: '/orders',

    // Payments
    INITIATE_PAYMENT: '/payments/initiate',
    VERIFY_PAYMENT: '/payments/verify',
    PAYMENTS: '/payments',

    // Analytics
    DASHBOARD: '/analytics/dashboard',

    // Seed Data
    SEED_DATA: '/seed-data'
};

export default apiRequest;

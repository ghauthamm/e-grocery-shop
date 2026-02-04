/**
 * ============================================================================
 * E-GROCERY ORDERING & INVENTORY MANAGEMENT SYSTEM - BACKEND SERVER
 * ============================================================================
 * 
 * This is the main Express server file that handles all API endpoints for:
 * - User management
 * - Product and inventory management
 * - Order processing
 * - Payment handling
 * 
 * Technology: Node.js + Express + Firebase Admin SDK
 * Author: Final Year MCA Project
 * ============================================================================
 */

// Import required dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// FIREBASE ADMIN INITIALIZATION
// ============================================================================
/**
 * Firebase Admin Setup Instructions:
 * 
 * Option 1: Service Account Key File (Recommended)
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate new private key"
 * 3. Save the file as "serviceAccountKey.json" in the backend folder
 * 
 * Option 2: Environment Variables
 * Set these in your .env file:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY (include \n for newlines)
 */

const fs = require('fs');
const path = require('path');

let firebaseInitialized = false;
let db = null;

// Try to initialize Firebase Admin
try {
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

    if (fs.existsSync(serviceAccountPath)) {
        // Option 1: Use service account key file
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized with service account key');
        firebaseInitialized = true;
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        // Option 2: Use environment variables
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
        console.log('   To enable full functionality:');
        console.log('   1. Download service account key from Firebase Console');
        console.log('   2. Save as "serviceAccountKey.json" in backend folder');
        console.log('');
        console.log('   The frontend will still work with Firebase directly!');

        // Initialize without credentials for demo (limited functionality)
        admin.initializeApp({
            projectId: "fir-3f06d"
        });
    }

    db = admin.firestore();
} catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    console.log('   Running in limited demo mode...');
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS for frontend communication
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * Verify Firebase ID token from request header
 * Used to protect routes that require authentication
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.split('Bearer ')[1];

        // Verify the token with Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Check if authenticated user has admin role
 */
const verifyAdmin = async (req, res, next) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists || userDoc.data().role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        console.error('Admin verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying admin status'
        });
    }
};

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'E-Grocery API is running!',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// USER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/users/register
 * Register a new user after Firebase Auth signup
 */
app.post('/api/users/register', async (req, res) => {
    try {
        const { uid, email, name, phone, role = 'customer' } = req.body;

        // Validate required fields
        if (!uid || !email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: uid, email, name'
            });
        }

        // Create user document in Firestore
        const userData = {
            uid,
            email,
            name,
            phone: phone || '',
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(uid).set(userData);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: userData
        });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

/**
 * GET /api/users/profile
 * Get current user's profile
 */
app.get('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        res.json({
            success: true,
            user: userDoc.data()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
});

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
app.put('/api/users/profile', verifyToken, async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        await db.collection('users').doc(req.user.uid).update(updateData);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// ============================================================================
// PRODUCT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * GET /api/products
 * Get all products with optional category filter
 */
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, limit = 50 } = req.query;

        let query = db.collection('products').where('isActive', '==', true);

        // Filter by category if provided
        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.limit(parseInt(limit)).get();

        let products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

        // Apply search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                p.description?.toLowerCase().includes(searchLower)
            );
        }

        res.json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
app.get('/api/products/:id', async (req, res) => {
    try {
        const productDoc = await db.collection('products').doc(req.params.id).get();

        if (!productDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product: { id: productDoc.id, ...productDoc.data() }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product'
        });
    }
});

/**
 * POST /api/products
 * Create a new product (Admin only)
 */
app.post('/api/products', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
            unit,
            image,
            lowStockThreshold = 10
        } = req.body;

        // Validate required fields
        if (!name || !price || !category || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const productData = {
            name,
            description: description || '',
            price: parseFloat(price),
            category,
            stock: parseInt(stock),
            unit: unit || 'pcs',
            image: image || '/placeholder-product.png',
            lowStockThreshold: parseInt(lowStockThreshold),
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('products').add(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: { id: docRef.id, ...productData }
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product'
        });
    }
});

/**
 * PUT /api/products/:id
 * Update a product (Admin only)
 */
app.put('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Add timestamp
        updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();

        await db.collection('products').doc(id).update(updates);

        res.json({
            success: true,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
});

/**
 * DELETE /api/products/:id
 * Soft delete a product (Admin only)
 */
app.delete('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete - mark as inactive instead of removing
        await db.collection('products').doc(id).update({
            isActive: false,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
});

/**
 * GET /api/products/low-stock
 * Get products with low stock (Admin only)
 */
app.get('/api/inventory/low-stock', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('products')
            .where('isActive', '==', true)
            .get();

        const lowStockProducts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.stock <= data.lowStockThreshold) {
                lowStockProducts.push({ id: doc.id, ...data });
            }
        });

        res.json({
            success: true,
            products: lowStockProducts
        });
    } catch (error) {
        console.error('Get low stock error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching low stock products'
        });
    }
});

// ============================================================================
// ORDER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/orders
 * Create a new order with payment processing
 */
app.post('/api/orders', verifyToken, async (req, res) => {
    try {
        const { items, address, paymentMethod, paymentDetails } = req.body;

        // Validate required fields
        if (!items || !items.length || !address || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: items, address, paymentMethod'
            });
        }

        // Validate payment method
        const validPaymentMethods = ['upi', 'cod'];
        if (!validPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method. Use: upi or cod'
            });
        }

        // Calculate order totals
        let subtotal = 0;
        const orderItems = [];

        // Verify stock and calculate prices
        for (const item of items) {
            const productDoc = await db.collection('products').doc(item.productId).get();

            if (!productDoc.exists) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            const product = productDoc.data();

            // Check stock availability
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: item.productId,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                unit: product.unit,
                image: product.image,
                total: itemTotal
            });
        }

        // Calculate delivery charge and tax
        const deliveryCharge = subtotal >= 500 ? 0 : 40;
        const tax = subtotal * 0.05; // 5% GST
        const total = subtotal + deliveryCharge + tax;

        // Determine initial payment status
        let paymentStatus = 'pending';
        let orderStatus = 'pending';

        // For UPI, verify payment was successful before creating order
        if (paymentMethod === 'upi') {
            // In a real system, verify payment with payment gateway
            // For demo, we simulate payment verification
            if (paymentDetails && paymentDetails.transactionId) {
                paymentStatus = 'success';
                orderStatus = 'confirmed';
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'UPI payment verification failed. Please try again.'
                });
            }
        } else if (paymentMethod === 'cod') {
            // COD orders are created with pending payment
            paymentStatus = 'pending';
            orderStatus = 'confirmed';
        }

        // Generate order number
        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create order document
        const orderData = {
            orderNumber,
            userId: req.user.uid,
            userEmail: req.user.email,
            items: orderItems,
            subtotal,
            deliveryCharge,
            tax,
            total,
            address,
            paymentMethod,
            paymentStatus,
            orderStatus,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const orderRef = await db.collection('orders').add(orderData);

        // Create payment record
        const paymentData = {
            orderId: orderRef.id,
            orderNumber,
            userId: req.user.uid,
            amount: total,
            method: paymentMethod,
            status: paymentStatus,
            transactionId: paymentDetails?.transactionId || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('payments').add(paymentData);

        // Reduce stock for each item
        const batch = db.batch();
        for (const item of items) {
            const productRef = db.collection('products').doc(item.productId);
            batch.update(productRef, {
                stock: admin.firestore.FieldValue.increment(-item.quantity),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        await batch.commit();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: {
                id: orderRef.id,
                orderNumber,
                total,
                paymentStatus,
                orderStatus
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
});

/**
 * GET /api/orders
 * Get orders for current user (or all orders for admin)
 */
app.get('/api/orders', verifyToken, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        let query = db.collection('orders');

        // If not admin, only show user's orders
        if (!isAdmin) {
            query = query.where('userId', '==', req.user.uid);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

/**
 * GET /api/orders/:id
 * Get a single order by ID
 */
app.get('/api/orders/:id', verifyToken, async (req, res) => {
    try {
        const orderDoc = await db.collection('orders').doc(req.params.id).get();

        if (!orderDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderData = orderDoc.data();

        // Verify user has access to this order
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        if (orderData.userId !== req.user.uid && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            order: { id: orderDoc.id, ...orderData }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
});

/**
 * PUT /api/orders/:id/status
 * Update order status (Admin only)
 */
app.put('/api/orders/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        await db.collection('orders').doc(id).update(updateData);

        // If payment status updated, also update payment record
        if (paymentStatus) {
            const paymentsSnapshot = await db.collection('payments')
                .where('orderId', '==', id)
                .get();

            paymentsSnapshot.forEach(async (doc) => {
                await doc.ref.update({ status: paymentStatus });
            });
        }

        res.json({
            success: true,
            message: 'Order status updated successfully'
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
});

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/payments/initiate
 * Initiate a payment (for UPI)
 */
app.post('/api/payments/initiate', verifyToken, async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        // In a real system, integrate with Razorpay/Paytm/PhonePe
        // For demo, we generate a mock UPI payment request

        // Generate mock transaction ID
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

        // Mock UPI ID for demonstration
        const upiId = 'egrocery@upi';
        const merchantName = 'E-Grocery Store';

        // Generate UPI deep link (for demo)
        const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tr=${transactionId}&tn=Order%20Payment`;

        res.json({
            success: true,
            payment: {
                transactionId,
                upiId,
                upiLink,
                amount,
                qrData: upiLink // In production, generate actual QR code
            }
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error initiating payment'
        });
    }
});

/**
 * POST /api/payments/verify
 * Verify a payment (mock for demo)
 */
app.post('/api/payments/verify', verifyToken, async (req, res) => {
    try {
        const { transactionId } = req.body;

        // In a real system, verify with payment gateway
        // For demo, we simulate verification

        // Mock verification - always succeeds for demo
        // In production, call payment gateway API to verify

        res.json({
            success: true,
            verified: true,
            transactionId,
            message: 'Payment verified successfully'
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment'
        });
    }
});

/**
 * GET /api/payments
 * Get all payments (Admin only)
 */
app.get('/api/payments', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('payments')
            .orderBy('createdAt', 'desc')
            .get();

        const payments = [];
        snapshot.forEach(doc => {
            payments.push({ id: doc.id, ...doc.data() });
        });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
});

// ============================================================================
// ANALYTICS ENDPOINTS (Admin)
// ============================================================================

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics (Admin only)
 */
app.get('/api/analytics/dashboard', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Get total orders
        const ordersSnapshot = await db.collection('orders').get();
        const totalOrders = ordersSnapshot.size;

        // Get total revenue
        let totalRevenue = 0;
        let pendingOrders = 0;
        let completedOrders = 0;

        ordersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.paymentStatus === 'success') {
                totalRevenue += data.total;
            }
            if (data.orderStatus === 'pending' || data.orderStatus === 'confirmed') {
                pendingOrders++;
            }
            if (data.orderStatus === 'delivered') {
                completedOrders++;
            }
        });

        // Get total products
        const productsSnapshot = await db.collection('products')
            .where('isActive', '==', true)
            .get();
        const totalProducts = productsSnapshot.size;

        // Get low stock count
        let lowStockCount = 0;
        productsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.stock <= data.lowStockThreshold) {
                lowStockCount++;
            }
        });

        // Get total users
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;

        res.json({
            success: true,
            analytics: {
                totalOrders,
                totalRevenue: totalRevenue.toFixed(2),
                pendingOrders,
                completedOrders,
                totalProducts,
                lowStockCount,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});

// ============================================================================
// INVOICE GENERATION ENDPOINT
// ============================================================================

/**
 * GET /api/orders/:id/invoice
 * Get invoice data for an order
 */
app.get('/api/orders/:id/invoice', verifyToken, async (req, res) => {
    try {
        const orderDoc = await db.collection('orders').doc(req.params.id).get();

        if (!orderDoc.exists) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderData = orderDoc.data();

        // Verify user has access
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        if (orderData.userId !== req.user.uid && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Generate invoice data
        const invoice = {
            invoiceNumber: `INV-${orderData.orderNumber}`,
            orderNumber: orderData.orderNumber,
            date: orderData.createdAt?.toDate?.() || new Date(),
            customer: {
                email: orderData.userEmail,
                address: orderData.address
            },
            items: orderData.items,
            subtotal: orderData.subtotal,
            deliveryCharge: orderData.deliveryCharge,
            tax: orderData.tax,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod,
            paymentStatus: orderData.paymentStatus,
            company: {
                name: 'E-Grocery Store',
                address: '123 Market Street, City - 600001',
                phone: '+91 9876543210',
                email: 'support@egrocery.com',
                gstin: 'GSTIN1234567890'
            }
        };

        res.json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice'
        });
    }
});

// ============================================================================
// CATEGORIES ENDPOINT
// ============================================================================

/**
 * GET /api/categories
 * Get all product categories
 */
app.get('/api/categories', async (req, res) => {
    try {
        // Predefined categories for grocery store
        const categories = [
            { id: 'fruits', name: 'Fruits', icon: '🍎' },
            { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
            { id: 'dairy', name: 'Dairy', icon: '🥛' },
            { id: 'bakery', name: 'Bakery', icon: '🍞' },
            { id: 'beverages', name: 'Beverages', icon: '🧃' },
            { id: 'snacks', name: 'Snacks', icon: '🍪' },
            { id: 'grains', name: 'Grains & Pulses', icon: '🌾' },
            { id: 'meat', name: 'Meat & Seafood', icon: '🍖' },
            { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
            { id: 'household', name: 'Household', icon: '🧹' }
        ];

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

// ============================================================================
// SEED DATA ENDPOINT (For Demo)
// ============================================================================

/**
 * POST /api/seed-data
 * Seed initial product data for demonstration
 */
app.post('/api/seed-data', async (req, res) => {
    try {
        const products = [
            // Fruits
            { name: 'Fresh Apples', description: 'Crisp and juicy red apples', price: 120, category: 'fruits', stock: 100, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Bananas', description: 'Ripe yellow bananas', price: 40, category: 'fruits', stock: 150, unit: 'dozen', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', lowStockThreshold: 15, isActive: true },
            { name: 'Oranges', description: 'Sweet and tangy oranges', price: 80, category: 'fruits', stock: 80, unit: 'kg', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Grapes', description: 'Fresh green grapes', price: 100, category: 'fruits', stock: 60, unit: 'kg', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300', lowStockThreshold: 8, isActive: true },

            // Vegetables
            { name: 'Fresh Tomatoes', description: 'Ripe red tomatoes', price: 30, category: 'vegetables', stock: 200, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-227c7a4beea2?w=300', lowStockThreshold: 20, isActive: true },
            { name: 'Onions', description: 'Fresh red onions', price: 25, category: 'vegetables', stock: 250, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300', lowStockThreshold: 25, isActive: true },
            { name: 'Potatoes', description: 'Farm fresh potatoes', price: 35, category: 'vegetables', stock: 300, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber952?w=300', lowStockThreshold: 30, isActive: true },
            { name: 'Carrots', description: 'Sweet and crunchy carrots', price: 45, category: 'vegetables', stock: 120, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300', lowStockThreshold: 15, isActive: true },

            // Dairy
            { name: 'Fresh Milk', description: 'Pasteurized whole milk', price: 60, category: 'dairy', stock: 100, unit: 'litre', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', lowStockThreshold: 20, isActive: true },
            { name: 'Curd', description: 'Fresh homemade curd', price: 50, category: 'dairy', stock: 80, unit: '500g', image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Butter', description: 'Creamy unsalted butter', price: 55, category: 'dairy', stock: 60, unit: '100g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', lowStockThreshold: 8, isActive: true },
            { name: 'Paneer', description: 'Fresh cottage cheese', price: 90, category: 'dairy', stock: 50, unit: '200g', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300', lowStockThreshold: 5, isActive: true },

            // Bakery
            { name: 'Bread Loaf', description: 'Soft whole wheat bread', price: 45, category: 'bakery', stock: 50, unit: 'pcs', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', lowStockThreshold: 5, isActive: true },
            { name: 'Cookies Pack', description: 'Chocolate chip cookies', price: 80, category: 'bakery', stock: 40, unit: 'pack', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300', lowStockThreshold: 5, isActive: true },

            // Beverages
            { name: 'Orange Juice', description: 'Fresh orange juice', price: 90, category: 'beverages', stock: 70, unit: '1L', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Green Tea', description: 'Premium green tea bags', price: 150, category: 'beverages', stock: 45, unit: '25bags', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', lowStockThreshold: 5, isActive: true },

            // Snacks
            { name: 'Potato Chips', description: 'Crispy salted chips', price: 30, category: 'snacks', stock: 100, unit: 'pack', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', lowStockThreshold: 15, isActive: true },
            { name: 'Mixed Nuts', description: 'Premium mixed nuts', price: 250, category: 'snacks', stock: 30, unit: '250g', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300', lowStockThreshold: 5, isActive: true },

            // Grains
            { name: 'Basmati Rice', description: 'Premium aged basmati', price: 180, category: 'grains', stock: 80, unit: 'kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Wheat Flour', description: 'Fine wheat flour', price: 55, category: 'grains', stock: 100, unit: 'kg', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300', lowStockThreshold: 15, isActive: true },
        ];

        const batch = db.batch();

        for (const product of products) {
            const docRef = db.collection('products').doc();
            batch.set(docRef, {
                ...product,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();

        res.json({
            success: true,
            message: `${products.length} products seeded successfully`
        });
    } catch (error) {
        console.error('Seed data error:', error);
        res.status(500).json({
            success: false,
            message: 'Error seeding data'
        });
    }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║         E-GROCERY API SERVER STARTED                     ║
  ║         Port: ${PORT}                                         ║
  ║         Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ║         API Docs: http://localhost:${PORT}/api/health          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

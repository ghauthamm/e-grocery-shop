const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const { items, address, paymentMethod, paymentDetails } = req.body;

        if (!items || !items.length || !address || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const productDoc = await db.collection('products').doc(item.productId).get();
            if (!productDoc.exists) {
                return res.status(400).json({ success: false, message: `Product ${item.productId} not found` });
            }

            const product = productDoc.data();
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });
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

        const deliveryCharge = subtotal >= 500 ? 0 : 40;
        const tax = subtotal * 0.05;
        const total = subtotal + deliveryCharge + tax;

        let paymentStatus = 'pending';
        let orderStatus = 'pending';

        if (paymentMethod === 'upi') {
            if (paymentDetails && paymentDetails.transactionId) {
                paymentStatus = 'success';
                orderStatus = 'confirmed';
            } else {
                return res.status(400).json({ success: false, message: 'UPI payment verification failed.' });
            }
        } else if (paymentMethod === 'cod') {
            paymentStatus = 'pending';
            orderStatus = 'confirmed';
        }

        const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

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
            order: { id: orderRef.id, orderNumber, total, paymentStatus, orderStatus }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Error creating order' });
    }
});

/**
 * GET /api/orders
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        let query = db.collection('orders');
        if (!isAdmin) {
            query = query.where('userId', '==', req.user.uid);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const orders = [];
        snapshot.forEach(doc => { orders.push({ id: doc.id, ...doc.data() }); });

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Error fetching orders' });
    }
});

/**
 * GET /api/orders/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const orderDoc = await db.collection('orders').doc(req.params.id).get();
        if (!orderDoc.exists) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const orderData = orderDoc.data();
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        if (orderData.userId !== req.user.uid && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({ success: true, order: { id: orderDoc.id, ...orderData } });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Error fetching order' });
    }
});

/**
 * PUT /api/orders/:id/status
 */
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;

        const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        await db.collection('orders').doc(id).update(updateData);

        if (paymentStatus) {
            const paymentsSnapshot = await db.collection('payments').where('orderId', '==', id).get();
            paymentsSnapshot.forEach(async (doc) => { await doc.ref.update({ status: paymentStatus }); });
        }

        res.json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Error updating order status' });
    }
});

/**
 * GET /api/orders/:id/invoice
 */
router.get('/:id/invoice', verifyToken, async (req, res) => {
    try {
        const orderDoc = await db.collection('orders').doc(req.params.id).get();
        if (!orderDoc.exists) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const orderData = orderDoc.data();
        const userDoc = await db.collection('users').doc(req.user.uid).get();
        const isAdmin = userDoc.exists && userDoc.data().role === 'admin';

        if (orderData.userId !== req.user.uid && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const invoice = {
            invoiceNumber: `INV-${orderData.orderNumber}`,
            orderNumber: orderData.orderNumber,
            date: orderData.createdAt?.toDate?.() || new Date(),
            customer: { email: orderData.userEmail, address: orderData.address },
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

        res.json({ success: true, invoice });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ success: false, message: 'Error generating invoice' });
    }
});

module.exports = router;

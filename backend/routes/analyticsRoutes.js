const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const ordersSnapshot = await db.collection('orders').get();
        const totalOrders = ordersSnapshot.size;

        let totalRevenue = 0;
        let pendingOrders = 0;
        let completedOrders = 0;

        ordersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.paymentStatus === 'success') totalRevenue += data.total;
            if (data.orderStatus === 'pending' || data.orderStatus === 'confirmed') pendingOrders++;
            if (data.orderStatus === 'delivered') completedOrders++;
        });

        const productsSnapshot = await db.collection('products').where('isActive', '==', true).get();
        const totalProducts = productsSnapshot.size;

        let lowStockCount = 0;
        productsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.stock <= data.lowStockThreshold) lowStockCount++;
        });

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
        res.status(500).json({ success: false, message: 'Error fetching analytics' });
    }
});

module.exports = router;

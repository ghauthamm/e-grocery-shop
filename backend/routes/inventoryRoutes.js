const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * GET /api/inventory/low-stock
 */
router.get('/low-stock', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('products')
            .where('isActive', '==', true)
            .get();

        const lowStockProducts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.stock <= (data.lowStockThreshold || 10)) {
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

module.exports = router;

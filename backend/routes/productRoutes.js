const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * GET /api/products
 * Get all products with optional category filter
 */
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 50 } = req.query;

        let query = db.collection('products').where('isActive', '==', true);

        if (category && category !== 'all') {
            query = query.where('category', '==', category);
        }

        const snapshot = await query.limit(parseInt(limit)).get();

        let products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });

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
 */
router.get('/:id', async (req, res) => {
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
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
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
 */
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

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
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;

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

module.exports = router;

const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');

/**
 * GET /api/categories
 */
router.get('/categories', async (req, res) => {
    try {
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
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
});

/**
 * POST /api/seed-data
 */
router.post('/seed-data', async (req, res) => {
    try {
        const products = [
            { name: 'Fresh Apples', description: 'Crisp and juicy red apples', price: 120, category: 'fruits', stock: 100, unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Bananas', description: 'Ripe yellow bananas', price: 40, category: 'fruits', stock: 150, unit: 'dozen', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300', lowStockThreshold: 15, isActive: true },
            { name: 'Oranges', description: 'Sweet and tangy oranges', price: 80, category: 'fruits', stock: 80, unit: 'kg', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Grapes', description: 'Fresh green grapes', price: 100, category: 'fruits', stock: 60, unit: 'kg', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300', lowStockThreshold: 8, isActive: true },
            { name: 'Fresh Tomatoes', description: 'Ripe red tomatoes', price: 30, category: 'vegetables', stock: 200, unit: 'kg', image: 'https://images.unsplash.com/photo-1546470427-227c7a4beea2?w=300', lowStockThreshold: 20, isActive: true },
            { name: 'Onions', description: 'Fresh red onions', price: 25, category: 'vegetables', stock: 250, unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300', lowStockThreshold: 25, isActive: true },
            { name: 'Potatoes', description: 'Farm fresh potatoes', price: 35, category: 'vegetables', stock: 300, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber952?w=300', lowStockThreshold: 30, isActive: true },
            { name: 'Carrots', description: 'Sweet and crunchy carrots', price: 45, category: 'vegetables', stock: 120, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300', lowStockThreshold: 15, isActive: true },
            { name: 'Fresh Milk', description: 'Pasteurized whole milk', price: 60, category: 'dairy', stock: 100, unit: 'litre', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300', lowStockThreshold: 20, isActive: true },
            { name: 'Curd', description: 'Fresh homemade curd', price: 50, category: 'dairy', stock: 80, unit: '500g', image: 'https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Butter', description: 'Creamy unsalted butter', price: 55, category: 'dairy', stock: 60, unit: '100g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300', lowStockThreshold: 8, isActive: true },
            { name: 'Paneer', description: 'Fresh cottage cheese', price: 90, category: 'dairy', stock: 50, unit: '200g', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300', lowStockThreshold: 5, isActive: true },
            { name: 'Bread Loaf', description: 'Soft whole wheat bread', price: 45, category: 'bakery', stock: 50, unit: 'pcs', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300', lowStockThreshold: 5, isActive: true },
            { name: 'Cookies Pack', description: 'Chocolate chip cookies', price: 80, category: 'bakery', stock: 40, unit: 'pack', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300', lowStockThreshold: 5, isActive: true },
            { name: 'Orange Juice', description: 'Fresh orange juice', price: 90, category: 'beverages', stock: 70, unit: '1L', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300', lowStockThreshold: 10, isActive: true },
            { name: 'Green Tea', description: 'Premium green tea bags', price: 150, category: 'beverages', stock: 45, unit: '25bags', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300', lowStockThreshold: 5, isActive: true },
            { name: 'Potato Chips', description: 'Crispy salted chips', price: 30, category: 'snacks', stock: 100, unit: 'pack', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300', lowStockThreshold: 15, isActive: true },
            { name: 'Mixed Nuts', description: 'Premium mixed nuts', price: 250, category: 'snacks', stock: 30, unit: '250g', image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300', lowStockThreshold: 5, isActive: true },
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

        res.json({ success: true, message: `${products.length} products seeded successfully` });
    } catch (error) {
        console.error('Seed data error:', error);
        res.status(500).json({ success: false, message: 'Error seeding data' });
    }
});

module.exports = router;

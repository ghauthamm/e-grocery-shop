const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/users/register
 * Register a new user after Firebase Auth signup
 */
router.post('/register', async (req, res) => {
    try {
        const { uid, email, name, phone, role = 'customer' } = req.body;

        if (!uid || !email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: uid, email, name'
            });
        }

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
router.get('/profile', verifyToken, async (req, res) => {
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
router.put('/profile', verifyToken, async (req, res) => {
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

module.exports = router;

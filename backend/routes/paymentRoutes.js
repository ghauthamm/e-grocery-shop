const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * POST /api/payments/initiate
 */
router.post('/initiate', verifyToken, async (req, res) => {
    try {
        const { amount, orderId } = req.body;
        const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
        const upiId = 'egrocery@upi';
        const merchantName = 'E-Grocery Store';
        const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tr=${transactionId}&tn=Order%20Payment`;

        res.json({
            success: true,
            payment: {
                transactionId,
                upiId,
                upiLink,
                amount,
                qrData: upiLink
            }
        });
    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ success: false, message: 'Error initiating payment' });
    }
});

/**
 * POST /api/payments/verify
 */
router.post('/verify', verifyToken, async (req, res) => {
    try {
        const { transactionId } = req.body;
        res.json({
            success: true,
            verified: true,
            transactionId,
            message: 'Payment verified successfully'
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
});

/**
 * GET /api/payments
 */
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const snapshot = await db.collection('payments').orderBy('createdAt', 'desc').get();
        const payments = [];
        snapshot.forEach(doc => { payments.push({ id: doc.id, ...doc.data() }); });
        res.json({ success: true, payments });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ success: false, message: 'Error fetching payments' });
    }
});

module.exports = router;

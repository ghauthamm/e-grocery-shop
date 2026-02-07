const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api', require('./routes/miscRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'E-Grocery API is running!',
        timestamp: new Date().toISOString()
    });
});

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

app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║         SRI RANGA SUPER MARKET API STARTED         ║
  ║         Port: ${PORT}                                         ║
  ║         Environment: ${process.env.NODE_ENV || 'development'}                       ║
  ║         API Docs: http://localhost:${PORT}/api/health          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

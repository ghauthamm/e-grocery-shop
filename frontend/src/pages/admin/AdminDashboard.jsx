/**
 * ADMIN DASHBOARD
 * Main admin panel with statistics and management
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaHome, FaBox, FaShoppingCart, FaCreditCard, FaUsers,
    FaChartBar, FaExclamationTriangle, FaPlus, FaSignOutAlt,
    FaShoppingBasket
} from 'react-icons/fa';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalProducts: 0,
        lowStockCount: 0,
        totalUsers: 0
    });
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const { logout, isAdmin } = useAuth();
    const navigate = useNavigate();

    // Check admin access
    useEffect(() => {
        if (!isAdmin()) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    // Fetch dashboard data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch orders
                const ordersSnapshot = await getDocs(
                    query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
                );
                const ordersData = ordersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersData);

                // Fetch products
                const productsSnapshot = await getDocs(
                    query(collection(db, 'products'), where('isActive', '==', true))
                );
                const productsData = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);

                // Calculate stats
                let totalRevenue = 0;
                let pendingOrders = 0;

                ordersData.forEach(order => {
                    if (order.paymentStatus === 'success') {
                        totalRevenue += order.total;
                    }
                    if (['pending', 'confirmed'].includes(order.orderStatus)) {
                        pendingOrders++;
                    }
                });

                // Low stock products
                const lowStock = productsData.filter(p => p.stock <= (p.lowStockThreshold || 10));
                setLowStockProducts(lowStock);

                // Get users count
                const usersSnapshot = await getDocs(collection(db, 'users'));

                setStats({
                    totalOrders: ordersData.length,
                    totalRevenue,
                    pendingOrders,
                    totalProducts: productsData.length,
                    lowStockCount: lowStock.length,
                    totalUsers: usersSnapshot.size
                });

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                orderStatus: newStatus,
                updatedAt: new Date().toISOString()
            });

            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, orderStatus: newStatus } : o
            ));
        } catch (error) {
            console.error('Error updating order:', error);
        }
    };

    // Update payment status
    const updatePaymentStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                paymentStatus: newStatus,
                updatedAt: new Date().toISOString()
            });

            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, paymentStatus: newStatus } : o
            ));
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const sidebarItems = [
        { id: 'dashboard', icon: <FaHome />, label: 'Dashboard' },
        { id: 'orders', icon: <FaShoppingCart />, label: 'Orders' },
        { id: 'products', icon: <FaBox />, label: 'Products' },
        { id: 'payments', icon: <FaCreditCard />, label: 'Payments' },
    ];

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Link to="/" className="navbar-brand">
                        <div className="navbar-logo" style={{ width: '40px', height: '40px' }}>
                            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span style={{ color: 'white', fontSize: '1.25rem' }}>SRI RANGA SUPER MARKET</span>
                    </Link>
                </div>

                <nav>
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                    <Link to="/" className="admin-nav-item">
                        <FaHome /> Back to Store
                    </Link>
                    <button
                        className="admin-nav-item"
                        onClick={handleLogout}
                        style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {loading ? (
                    <div className="text-center" style={{ padding: '4rem' }}>
                        <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                        <p className="mt-2">Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* Dashboard Tab */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="admin-header">
                                    <h1>Dashboard</h1>
                                    <Link to="/admin/add-product" className="btn btn-primary">
                                        <FaPlus /> Add Product
                                    </Link>
                                </div>

                                {/* Low Stock Alert */}
                                {stats.lowStockCount > 0 && (
                                    <div className="low-stock-alert">
                                        <FaExclamationTriangle className="low-stock-alert-icon" />
                                        <div>
                                            <h4>Low Stock Alert!</h4>
                                            <p>{stats.lowStockCount} products are running low on stock</p>
                                        </div>
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon primary">
                                            <FaShoppingCart />
                                        </div>
                                        <div>
                                            <div className="stat-value">{stats.totalOrders}</div>
                                            <div className="stat-label">Total Orders</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon secondary">
                                            <FaChartBar />
                                        </div>
                                        <div>
                                            <div className="stat-value">₹{stats.totalRevenue.toFixed(0)}</div>
                                            <div className="stat-label">Total Revenue</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon warning">
                                            <FaBox />
                                        </div>
                                        <div>
                                            <div className="stat-value">{stats.pendingOrders}</div>
                                            <div className="stat-label">Pending Orders</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon info">
                                            <FaUsers />
                                        </div>
                                        <div>
                                            <div className="stat-value">{stats.totalUsers}</div>
                                            <div className="stat-label">Total Users</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div style={{ marginTop: '2rem' }}>
                                    <h2 style={{ marginBottom: '1rem' }}>Recent Orders</h2>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Date</th>
                                                <th>Customer</th>
                                                <th>Total</th>
                                                <th>Payment</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.slice(0, 5).map(order => (
                                                <tr key={order.id}>
                                                    <td style={{ fontFamily: 'monospace' }}>{order.orderNumber}</td>
                                                    <td>{formatDate(order.createdAt)}</td>
                                                    <td>{order.address?.fullName || order.userEmail}</td>
                                                    <td style={{ fontWeight: '600' }}>₹{order.total.toFixed(2)}</td>
                                                    <td>
                                                        <span className={`payment-badge ${order.paymentStatus}`}>
                                                            {order.paymentStatus}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`order-status ${order.orderStatus}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Low Stock Products */}
                                {lowStockProducts.length > 0 && (
                                    <div style={{ marginTop: '2rem' }}>
                                        <h2 style={{ marginBottom: '1rem' }}>Low Stock Products</h2>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Category</th>
                                                    <th>Current Stock</th>
                                                    <th>Threshold</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {lowStockProducts.map(product => (
                                                    <tr key={product.id}>
                                                        <td>{product.name}</td>
                                                        <td>{product.category}</td>
                                                        <td style={{ color: 'var(--error)', fontWeight: '600' }}>
                                                            {product.stock} {product.unit}
                                                        </td>
                                                        <td>{product.lowStockThreshold}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <>
                                <div className="admin-header">
                                    <h1>Orders Management</h1>
                                </div>

                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Date</th>
                                            <th>Customer</th>
                                            <th>Items</th>
                                            <th>Total</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                                    {order.orderNumber}
                                                </td>
                                                <td>{formatDate(order.createdAt)}</td>
                                                <td>
                                                    <div>
                                                        <p style={{ fontWeight: '500' }}>{order.address?.fullName}</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            {order.userEmail}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>{order.items?.length || 0} items</td>
                                                <td style={{ fontWeight: '600' }}>₹{order.total.toFixed(2)}</td>
                                                <td>
                                                    <select
                                                        value={order.paymentStatus}
                                                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                                                        className="form-select"
                                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="success">Success</option>
                                                        <option value="failed">Failed</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                        className="form-select"
                                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <Link
                                                        to={`/invoice/${order.id}`}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Invoice
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Products Tab */}
                        {activeTab === 'products' && (
                            <>
                                <div className="admin-header">
                                    <h1>Products Management</h1>
                                    <Link to="/admin/add-product" className="btn btn-primary">
                                        <FaPlus /> Add Product
                                    </Link>
                                </div>

                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <img
                                                            src={product.image || 'https://via.placeholder.com/40'}
                                                            alt={product.name}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '8px',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                        <span style={{ fontWeight: '500' }}>{product.name}</span>
                                                    </div>
                                                </td>
                                                <td>{product.category}</td>
                                                <td>₹{product.price}/{product.unit}</td>
                                                <td>
                                                    <span style={{
                                                        color: product.stock <= (product.lowStockThreshold || 10)
                                                            ? 'var(--error)'
                                                            : 'var(--text-primary)',
                                                        fontWeight: '500'
                                                    }}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`payment-badge ${product.stock > 0 ? 'success' : 'failed'}`}>
                                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Payments Tab */}
                        {activeTab === 'payments' && (
                            <>
                                <div className="admin-header">
                                    <h1>Payment Analytics</h1>
                                </div>

                                <div className="stats-grid" style={{ marginBottom: '2rem' }}>
                                    <div className="stat-card">
                                        <div className="stat-icon primary">
                                            <FaCreditCard />
                                        </div>
                                        <div>
                                            <div className="stat-value">
                                                {orders.filter(o => o.paymentMethod === 'upi').length}
                                            </div>
                                            <div className="stat-label">UPI Payments</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon warning">
                                            <FaCreditCard />
                                        </div>
                                        <div>
                                            <div className="stat-value">
                                                {orders.filter(o => o.paymentMethod === 'cod').length}
                                            </div>
                                            <div className="stat-label">COD Orders</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon secondary">
                                            <FaChartBar />
                                        </div>
                                        <div>
                                            <div className="stat-value">
                                                ₹{orders.filter(o => o.paymentStatus === 'success')
                                                    .reduce((sum, o) => sum + o.total, 0).toFixed(0)}
                                            </div>
                                            <div className="stat-label">Collected</div>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon info">
                                            <FaChartBar />
                                        </div>
                                        <div>
                                            <div className="stat-value">
                                                ₹{orders.filter(o => o.paymentStatus === 'pending')
                                                    .reduce((sum, o) => sum + o.total, 0).toFixed(0)}
                                            </div>
                                            <div className="stat-label">Pending (COD)</div>
                                        </div>
                                    </div>
                                </div>

                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Order #</th>
                                            <th>Date</th>
                                            <th>Method</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order.id}>
                                                <td style={{ fontFamily: 'monospace' }}>{order.orderNumber}</td>
                                                <td>{formatDate(order.createdAt)}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: order.paymentMethod === 'upi'
                                                            ? 'rgba(99, 102, 241, 0.1)'
                                                            : 'rgba(245, 158, 11, 0.1)',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        {order.paymentMethod === 'upi' ? 'UPI' : 'COD'}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: '600' }}>₹{order.total.toFixed(2)}</td>
                                                <td>
                                                    <span className={`payment-badge ${order.paymentStatus}`}>
                                                        {order.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;

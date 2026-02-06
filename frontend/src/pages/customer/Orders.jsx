/**
 * ORDERS PAGE
 * Display user's order history
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaFileInvoice, FaSpinner } from 'react-icons/fa';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, 'orders'),
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                const snapshot = await getDocs(q);
                const ordersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersData);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'pending';
            case 'confirmed': return 'confirmed';
            case 'shipped': return 'confirmed';
            case 'delivered': return 'delivered';
            case 'cancelled': return 'cancelled';
            default: return 'pending';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="container text-center" style={{ padding: '4rem' }}>
                    <FaSpinner className="loader-spinner" style={{ fontSize: '2rem' }} />
                    <p className="mt-2">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <FaBox />
                        </div>
                        <h2>No orders yet</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Start shopping to see your orders here
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Start Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1 className="products-title mb-4">My Orders</h1>

                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-card-header">
                                <div className="order-info">
                                    <h3>Order #{order.orderNumber}</h3>
                                    <p>{formatDate(order.createdAt)}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <span className={`order-status ${getStatusClass(order.orderStatus)}`}>
                                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                                    </span>
                                    <span className={`payment-badge ${order.paymentStatus}`}>
                                        {order.paymentStatus === 'success' ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="order-items">
                                {order.items.slice(0, 3).map((item, index) => (
                                    <div key={index} className="order-item">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                            className="order-item-image"
                                        />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: '500' }}>{item.name}</p>
                                            <p style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.875rem'
                                            }}>
                                                {item.quantity} x ₹{item.price}
                                            </p>
                                        </div>
                                        <span style={{ fontWeight: '600' }}>₹{item.total}</span>
                                    </div>
                                ))}
                                {order.items.length > 3 && (
                                    <p style={{
                                        textAlign: 'center',
                                        color: 'var(--text-secondary)',
                                        padding: '0.5rem'
                                    }}>
                                        +{order.items.length - 3} more items
                                    </p>
                                )}
                            </div>

                            <div className="order-card-footer">
                                <div className="order-total">
                                    Total: ₹{order.total.toFixed(2)}
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Link
                                        to={`/invoice/${order.id}`}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        <FaFileInvoice /> Invoice
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;

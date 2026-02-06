/**
 * ORDER CONFIRMATION PAGE
 * Displays after successful order placement
 */

import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaListAlt, FaFileInvoice } from 'react-icons/fa';

const OrderConfirmation = () => {
    const location = useLocation();
    const orderData = location.state;

    // Redirect if no order data
    if (!orderData) {
        return <Navigate to="/" replace />;
    }

    const { orderNumber, total, paymentMethod } = orderData;

    return (
        <div className="order-confirmation">
            <div className="confirmation-icon">
                <FaCheckCircle style={{ width: '50px', height: '50px', color: 'white' }} />
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Order Placed Successfully!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Thank you for your order. We'll send you an email confirmation shortly.
            </p>

            <div className="confirmation-details">
                <div className="order-number">
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Order Number</p>
                    <span>{orderNumber}</span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Amount</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                            ₹{total.toFixed(2)}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Payment Method</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                            {paymentMethod === 'upi' ? 'UPI (Paid)' : 'Cash on Delivery'}
                        </p>
                    </div>
                </div>

                <div style={{
                    background: 'var(--gray-50)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.5rem'
                }}>
                    <h4 style={{ marginBottom: '0.75rem' }}>What's Next?</h4>
                    <ul style={{
                        listStyle: 'disc',
                        paddingLeft: '1.25rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.8'
                    }}>
                        <li>You'll receive an order confirmation email</li>
                        <li>We'll notify you when your order is shipped</li>
                        <li>Estimated delivery: 2-3 business days</li>
                        {paymentMethod === 'cod' && (
                            <li>Please keep ₹{total.toFixed(2)} ready for payment</li>
                        )}
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/orders" className="btn btn-primary" style={{ flex: 1 }}>
                        <FaListAlt /> View My Orders
                    </Link>
                    <Link to="/" className="btn btn-secondary" style={{ flex: 1 }}>
                        <FaHome /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;

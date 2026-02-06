/**
 * INVOICE PAGE
 * Generates and displays digital invoice for orders
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPrint, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const Invoice = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderDoc = await getDoc(doc(db, 'orders', orderId));
                if (orderDoc.exists()) {
                    setOrder({ id: orderDoc.id, ...orderDoc.data() });
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="text-center" style={{ padding: '4rem' }}>
                <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                <p className="mt-2">Loading invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center" style={{ padding: '4rem' }}>
                <h2>Invoice not found</h2>
                <Link to="/orders" className="btn btn-primary mt-3">Back to Orders</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="container">
                {/* Actions Bar (hidden on print) */}
                <div className="no-print" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <Link to="/orders" className="btn btn-secondary">
                        <FaArrowLeft /> Back to Orders
                    </Link>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-primary" onClick={handlePrint}>
                            <FaPrint /> Print Invoice
                        </button>
                    </div>
                </div>

                {/* Invoice Document */}
                <div className="invoice-container">
                    {/* Header */}
                    <div className="invoice-header">
                        <div className="invoice-logo">
                            <div style={{
                                width: '50px',
                                height: '50px',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '1.5rem'
                            }}>
                                🛒
                            </div>
                            <div>
                                <h2 style={{ marginBottom: '0.25rem' }}>SRI RANGA SUPER MARKET</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    Fresh Groceries, Delivered Fast
                                </p>
                            </div>
                        </div>
                        <div className="invoice-title">
                            <h1>INVOICE</h1>
                            <p style={{ fontFamily: 'monospace', fontSize: '1rem' }}>
                                #INV-{order.orderNumber}
                            </p>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="invoice-parties">
                        <div className="invoice-from">
                            <h3>From</h3>
                            <p style={{ fontWeight: '600' }}>SRI RANGA SUPER MARKET</p>
                            <p>123 Market Street</p>
                            <p>City - 600001</p>
                            <p>Phone: +91 9876543210</p>
                            <p>Email: support@egrocery.com</p>
                            <p style={{ marginTop: '0.5rem' }}>GSTIN: 33XXXXX1234X1ZX</p>
                        </div>
                        <div className="invoice-to">
                            <h3>Bill To</h3>
                            <p style={{ fontWeight: '600' }}>{order.address.fullName}</p>
                            <p>{order.address.fullAddress || order.address.street}</p>
                            <p>Phone: {order.address.phone}</p>
                            <p>Email: {order.userEmail}</p>
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        padding: '1rem',
                        background: 'var(--gray-50)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: '2rem'
                    }}>
                        <div>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Invoice Date</p>
                            <p style={{ fontWeight: '600' }}>{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Order Number</p>
                            <p style={{ fontWeight: '600' }}>{order.orderNumber}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Payment Method</p>
                            <p style={{ fontWeight: '600' }}>
                                {order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50%' }}>Item</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Price</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div>
                                            <p style={{ fontWeight: '500' }}>{item.name}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {item.unit}
                                            </p>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '500' }}>
                                        ₹{item.total.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="invoice-totals">
                        <table className="invoice-totals-table">
                            <tbody>
                                <tr>
                                    <td>Subtotal</td>
                                    <td style={{ textAlign: 'right' }}>₹{order.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td>Delivery Charge</td>
                                    <td style={{ textAlign: 'right' }}>
                                        {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge.toFixed(2)}`}
                                    </td>
                                </tr>
                                <tr>
                                    <td>GST (5%)</td>
                                    <td style={{ textAlign: 'right' }}>₹{order.tax.toFixed(2)}</td>
                                </tr>
                                <tr className="total-row">
                                    <td>Grand Total</td>
                                    <td style={{ textAlign: 'right', color: 'var(--primary)' }}>
                                        ₹{order.total.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Status */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: order.paymentStatus === 'success'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : 'rgba(234, 179, 8, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontWeight: '600' }}>
                            Payment Status: {' '}
                            <span style={{
                                color: order.paymentStatus === 'success' ? 'var(--success)' : '#b45309'
                            }}>
                                {order.paymentStatus === 'success' ? 'PAID' : 'PENDING (COD)'}
                            </span>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="invoice-footer">
                        <p style={{ marginBottom: '0.5rem' }}>Thank you for shopping with SRI RANGA SUPER MARKET!</p>
                        <p style={{ fontSize: '0.85rem' }}>
                            This is a computer-generated invoice and does not require a signature.
                        </p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            For any queries, contact us at support@egrocery.com or +91 9876543210
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .invoice-container { 
            box-shadow: none; 
            margin: 0;
            padding: 1rem;
          }
        }
      `}</style>
        </div>
    );
};

export default Invoice;

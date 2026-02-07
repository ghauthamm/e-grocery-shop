/**
 * CHECKOUT PAGE
 * Address input and payment method selection with UPI/COD support
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCreditCard, FaQrcode, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, getSubtotal, getDeliveryCharge, getTax, getTotal, clearCart } = useCart();
    const { user, userProfile } = useAuth();

    // Form state
    const [address, setAddress] = useState({
        fullName: userProfile?.name || '',
        phone: userProfile?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [upiPaymentDone, setUpiPaymentDone] = useState(false);

    // Order totals
    const subtotal = getSubtotal();
    const deliveryCharge = getDeliveryCharge();
    const tax = getTax();
    const total = getTotal();

    // Handle address input change
    const handleAddressChange = (e) => {
        setAddress(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Validate form
    const isFormValid = () => {
        return (
            address.fullName &&
            address.phone &&
            address.street &&
            address.city &&
            address.state &&
            address.pincode &&
            paymentMethod &&
            (paymentMethod === 'cod' || (paymentMethod === 'upi' && upiPaymentDone))
        );
    };

    // Simulate UPI payment
    const handleUpiPayment = () => {
        setShowUpiModal(true);
    };

    const confirmUpiPayment = () => {
        // Simulate payment success
        setTimeout(() => {
            setUpiPaymentDone(true);
            setShowUpiModal(false);
        }, 1500);
    };

    // Place order
    const handlePlaceOrder = async () => {
        if (!isFormValid()) {
            alert('Please fill all required fields and complete payment');
            return;
        }

        setLoading(true);

        try {
            // Generate order number
            const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

            // Prepare order items
            const orderItems = cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
                image: item.image,
                total: item.price * item.quantity
            }));

            // Create order document
            const orderData = {
                orderNumber,
                userId: user.uid,
                userEmail: user.email,
                items: orderItems,
                subtotal,
                deliveryCharge,
                tax,
                total,
                address: {
                    fullName: address.fullName,
                    phone: address.phone,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    fullAddress: `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`
                },
                paymentMethod,
                paymentStatus: paymentMethod === 'upi' ? 'success' : 'pending',
                orderStatus: 'confirmed',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add order to Firestore
            const orderRef = await addDoc(collection(db, 'orders'), orderData);

            // Create payment record
            const paymentData = {
                orderId: orderRef.id,
                orderNumber,
                userId: user.uid,
                amount: total,
                method: paymentMethod,
                status: paymentMethod === 'upi' ? 'success' : 'pending',
                transactionId: paymentMethod === 'upi' ? `TXN${Date.now()}` : null,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'payments'), paymentData);

            // Update product stock
            for (const item of cart) {
                const productRef = doc(db, 'products', item.id);
                await updateDoc(productRef, {
                    stock: increment(-item.quantity)
                });
            }

            // Clear cart
            clearCart();

            // Navigate to confirmation
            navigate('/order-confirmation', {
                state: {
                    orderId: orderRef.id,
                    orderNumber,
                    total,
                    paymentMethod
                }
            });

        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="products-title mb-4">Checkout</h1>

                <div className="checkout-container">
                    {/* Left Column - Forms */}
                    <div>
                        {/* Delivery Address Section */}
                        <div className="checkout-section">
                            <h2>
                                <span className="step-number">1</span>
                                <FaMapMarkerAlt /> Delivery Address
                            </h2>

                            <div className="grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="form-input"
                                        value={address.fullName}
                                        onChange={handleAddressChange}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        value={address.phone}
                                        onChange={handleAddressChange}
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Street Address *</label>
                                <input
                                    type="text"
                                    name="street"
                                    className="form-input"
                                    value={address.street}
                                    onChange={handleAddressChange}
                                    placeholder="House no., Building, Street"
                                    required
                                />
                            </div>

                            <div className="grid-2" style={{ gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-input"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                        placeholder="Enter city"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-input"
                                        value={address.state}
                                        onChange={handleAddressChange}
                                        placeholder="Enter state"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">PIN Code *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    className="form-input"
                                    value={address.pincode}
                                    onChange={handleAddressChange}
                                    placeholder="Enter PIN code"
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="checkout-section">
                            <h2>
                                <span className="step-number">2</span>
                                <FaCreditCard /> Payment Method
                            </h2>

                            <div className="payment-methods">
                                {/* UPI Option */}
                                <label
                                    className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('upi')}
                                >
                                    <input type="radio" name="payment" value="upi" />
                                    <span className="payment-radio"></span>
                                    <span className="payment-icon">📱</span>
                                    <div className="payment-details">
                                        <h4>UPI Payment</h4>
                                        <p>Pay using UPI apps like GPay, PhonePe, Paytm</p>
                                    </div>
                                    {upiPaymentDone && paymentMethod === 'upi' && (
                                        <span style={{ color: 'var(--success)', marginLeft: 'auto' }}>
                                            <FaCheck /> Paid
                                        </span>
                                    )}
                                </label>

                                {/* COD Option */}
                                <label
                                    className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                    onClick={() => {
                                        setPaymentMethod('cod');
                                        setUpiPaymentDone(false);
                                    }}
                                >
                                    <input type="radio" name="payment" value="cod" />
                                    <span className="payment-radio"></span>
                                    <span className="payment-icon">💵</span>
                                    <div className="payment-details">
                                        <h4>Cash on Delivery</h4>
                                        <p>Pay when your order is delivered</p>
                                    </div>
                                </label>
                            </div>

                            {/* UPI Payment Section */}
                            {paymentMethod === 'upi' && !upiPaymentDone && (
                                <div className="upi-section">
                                    <div className="qr-code-container">
                                        <div className="qr-placeholder">
                                            <FaQrcode />
                                        </div>
                                        <p style={{ marginBottom: '1rem' }}>Scan QR code to pay</p>
                                        <div className="upi-id-display">
                                            <span>UPI ID: 8056644344@upi</span>
                                        </div>
                                    </div>
                                    <p style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        Amount to pay: <strong>₹{total.toFixed(2)}</strong>
                                    </p>
                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={handleUpiPayment}
                                    >
                                        I have completed the payment
                                    </button>
                                </div>
                            )}

                            {paymentMethod === 'upi' && upiPaymentDone && (
                                <div className="upi-section" style={{
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    borderColor: 'var(--success)'
                                }}>
                                    <div style={{ textAlign: 'center', color: 'var(--success)' }}>
                                        <FaCheck style={{ fontSize: '2rem', marginBottom: '0.5rem' }} />
                                        <h4>Payment Successful!</h4>
                                        <p>Amount: ₹{total.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.id} style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    padding: '0.75rem 0',
                                    borderBottom: '1px solid var(--gray-100)'
                                }}>
                                    <img
                                        src={item.image || 'https://via.placeholder.com/50'}
                                        alt={item.name}
                                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</p>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                            {item.quantity} x ₹{item.price}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery</span>
                            <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax (5% GST)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>

                        <button
                            className="btn btn-primary btn-full btn-lg mt-3"
                            onClick={handlePlaceOrder}
                            disabled={!isFormValid() || loading}
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </button>

                        <p style={{
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            marginTop: '1rem'
                        }}>
                            By placing this order, you agree to our Terms & Conditions
                        </p>
                    </div>
                </div>
            </div>

            {/* UPI Payment Modal */}
            {showUpiModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: 'var(--radius-xl)',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <div className="loader-spinner" style={{ margin: '0 auto 1rem' }}></div>
                        <h3>Verifying Payment...</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                            Please wait while we confirm your payment
                        </p>
                        <button
                            className="btn btn-primary btn-full mt-3"
                            onClick={confirmUpiPayment}
                        >
                            Confirm Payment (Demo)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;

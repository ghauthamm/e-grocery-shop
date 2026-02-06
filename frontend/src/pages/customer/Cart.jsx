/**
 * CART PAGE
 * Shopping cart with item management and checkout link
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaPlus, FaMinus, FaArrowRight, FaTruck } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Cart = () => {
    const {
        cart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        getSubtotal,
        getDeliveryCharge,
        getTax,
        getTotal,
        clearCart
    } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const subtotal = getSubtotal();
    const deliveryCharge = getDeliveryCharge();
    const tax = getTax();
    const total = getTotal();

    const handleCheckout = () => {
        if (!user) {
            navigate('/login', { state: { from: '/checkout' } });
        } else {
            navigate('/checkout');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">
                            <FaShoppingCart />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Looks like you haven't added any products yet
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
        <div className="cart-page">
            <div className="container">
                <div className="cart-container">
                    {/* Cart Items */}
                    <div className="cart-items">
                        <div className="cart-header">
                            <h2>Shopping Cart ({cart.length} items)</h2>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={clearCart}
                            >
                                Clear Cart
                            </button>
                        </div>

                        {cart.map(item => (
                            <div key={item.id} className="cart-item">
                                <img
                                    src={item.image || 'https://via.placeholder.com/100x80?text=Product'}
                                    alt={item.name}
                                    className="cart-item-image"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/100x80?text=Product';
                                    }}
                                />

                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p>₹{item.price} / {item.unit}</p>
                                </div>

                                <div className="quantity-control">
                                    <button
                                        className="qty-btn"
                                        onClick={() => decrementQuantity(item.id)}
                                    >
                                        <FaMinus />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={() => incrementQuantity(item.id)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <FaPlus />
                                    </button>
                                </div>

                                <div className="cart-item-price">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </div>

                                <button
                                    className="remove-item-btn"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        {subtotal < 500 && (
                            <div className="free-delivery-msg">
                                <FaTruck /> Add ₹{(500 - subtotal).toFixed(2)} more for FREE delivery
                            </div>
                        )}

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Delivery Charge</span>
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
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout <FaArrowRight />
                        </button>

                        <Link
                            to="/products"
                            className="btn btn-secondary btn-full mt-2"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

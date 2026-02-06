/**
 * FOOTER COMPONENT
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBasket, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-grid">
                <div className="footer-brand">
                    <Link to="/" className="navbar-brand">
                        <div className="navbar-logo">
                            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span className="navbar-title" style={{ color: 'white' }}>SRI RANGA SUPER MARKET</span>
                    </Link>
                    <p>
                        Your one-stop shop for fresh groceries delivered to your doorstep.
                        Quality products at competitive prices with fast delivery.
                    </p>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Quick Links</h4>
                    <ul className="footer-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><Link to="/cart">Cart</Link></li>
                        <li><Link to="/orders">My Orders</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Categories</h4>
                    <ul className="footer-links">
                        <li><Link to="/products?category=fruits">Fruits</Link></li>
                        <li><Link to="/products?category=vegetables">Vegetables</Link></li>
                        <li><Link to="/products?category=dairy">Dairy</Link></li>
                        <li><Link to="/products?category=beverages">Beverages</Link></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-title">Contact Us</h4>
                    <ul className="footer-links">
                        <li>
                            <FaMapMarkerAlt style={{ marginRight: '0.5rem' }} />
                            123 Market Street, City
                        </li>
                        <li>
                            <FaPhone style={{ marginRight: '0.5rem' }} />
                            +91 9876543210
                        </li>
                        <li>
                            <FaEnvelope style={{ marginRight: '0.5rem' }} />
                            support@egrocery.com
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2024 SRI RANGA SUPER MARKET. All rights reserved. | MCA Final Year Project</p>
            </div>
        </footer>
    );
};

export default Footer;

/**
 * NAVBAR COMPONENT
 * Main navigation with responsive design
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaShoppingBasket,
    FaShoppingCart,
    FaUser,
    FaBars,
    FaTimes,
    FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, userProfile, logout, isAdmin } = useAuth();
    const { getCartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const cartCount = getCartCount();

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/products', label: 'Products' },
    ];

    if (user) {
        navLinks.push({ path: '/orders', label: 'My Orders' });
    }

    if (isAdmin()) {
        navLinks.push({ path: '/admin', label: 'Dashboard' });
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    {/* Brand */}
                    <Link to="/" className="navbar-brand">
                        <div className="navbar-logo">
                            <FaShoppingBasket />
                        </div>
                        <span className="navbar-title">E-Grocery</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar-actions">
                        <Link to="/cart" className="cart-btn">
                            <FaShoppingCart />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                            )}
                        </Link>

                        {user ? (
                            <div className="user-menu">
                                <Link to="/profile" className="btn btn-secondary btn-sm">
                                    <FaUser />
                                    <span>{userProfile?.name?.split(' ')[0] || 'Profile'}</span>
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-sm">
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <FaBars />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <div className="mobile-menu-header">
                        <span className="navbar-title">Menu</span>
                        <button onClick={() => setMobileMenuOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="mobile-nav-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                className="mobile-nav-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FaUser /> Profile
                            </Link>
                            <button
                                className="mobile-nav-link"
                                onClick={handleLogout}
                                style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none' }}
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="mobile-nav-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;

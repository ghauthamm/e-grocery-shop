/**
 * NAVBAR COMPONENT
 * Main navigation with responsive design
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaShoppingBasket,
    FaShoppingCart,
    FaUser,
    FaBars,
    FaTimes,
    FaSignOutAlt,
    FaSearch
} from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, userProfile, logout, isAdmin } = useAuth();
    const { getCartCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    // Search functionality
    const [allProducts, setAllProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const cartCount = getCartCount();

    // Fetch products for search on mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const q = query(collection(db, 'products'), where('isActive', '==', true));
                const snapshot = await getDocs(q);
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllProducts(products);
            } catch (error) {
                console.error("Error fetching search products:", error);
            }
        };
        fetchProducts();
    }, []);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchInput = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.category?.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5); // Limit to 5 results
            setSearchResults(filtered);
            setShowDropdown(true);
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setShowDropdown(false);
        }
    };

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
                            <img src="/logo.png" alt="SRI RANGA SUPER MARKET" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <span className="navbar-title">SRI RANGA SUPER MARKET</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="navbar-search" ref={searchRef} style={{ flex: 1, margin: '0 2rem', maxWidth: '500px', display: 'none', position: 'relative' }}>
                        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex' }}>
                            <input
                                type="text"
                                name="search"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    borderRadius: '50px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <FaSearch style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }} />
                        </form>

                        {/* Live Search Results Dropdown */}
                        {showDropdown && searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '120%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                borderRadius: '1rem',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                overflow: 'hidden',
                                zIndex: 1000,
                                border: '1px solid #f1f5f9'
                            }}>
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        onClick={() => {
                                            navigate(`/products?search=${encodeURIComponent(product.name)}`);
                                            setSearchQuery(product.name);
                                            setShowDropdown(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '0.75rem 1rem',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid #f8fafc',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                    >
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#f1f5f9' }}>
                                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product.category}</div>
                                        </div>
                                        <div style={{ fontWeight: '700', color: '#10b981', fontSize: '0.9rem' }}>
                                            ₹{product.price}
                                        </div>
                                    </div>
                                ))}
                                <div
                                    onClick={handleSearchSubmit}
                                    style={{
                                        padding: '0.75rem',
                                        textAlign: 'center',
                                        color: '#6366f1',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        background: '#f8fafc'
                                    }}
                                >
                                    View all results for "{searchQuery}"
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Style injection for responsiveness */}
                    <style>{`
                        @media (min-width: 768px) {
                            .navbar-search { display: block !important; }
                        }
                    `}</style>

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

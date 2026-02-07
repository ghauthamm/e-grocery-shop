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
    FaSearch,
    FaHeart
} from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, userProfile, logout, isAdmin } = useAuth();
    const { getCartCount } = useCart();
    const { wishlistCount } = useWishlist();
    const location = useLocation();
    const navigate = useNavigate();

    // Search functionality
    const [allProducts, setAllProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);

    const [selectedCategory, setSelectedCategory] = useState('All');
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
        { path: '/', label: 'Home', icon: <FaShoppingBasket /> },
        { path: '/products', label: 'Products', icon: <FaSearch /> },
    ];

    if (user) {
        navLinks.push({ path: '/orders', label: 'My Orders', icon: <FaShoppingCart /> });
        navLinks.push({ path: '/wishlist', label: 'Favorites', icon: <FaHeart /> });
    }

    if (isAdmin()) {
        navLinks.push({ path: '/admin', label: 'Dashboard', icon: <FaUser /> });
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

                    {/* Amazon-style Search Bar - Desktop */}
                    <div className="navbar-search desktop-only" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="search-form">
                            <div className="search-category">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="category-select"
                                >
                                    <option>All</option>
                                    <option>Fruits</option>
                                    <option>Vegetables</option>
                                    <option>Dairy</option>
                                    <option>Bakery</option>
                                    <option>Beverages</option>
                                    <option>Snacks</option>
                                </select>
                            </div>
                            <input
                                type="text"
                                name="search"
                                className="search-input"
                                placeholder="Search Sri Ranga Super Market"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                            />
                            <button type="submit" className="search-submit-btn">
                                <FaSearch />
                            </button>
                        </form>

                        {/* Live Search Results Dropdown */}
                        {showDropdown && searchResults.length > 0 && (
                            <div className="search-dropdown">
                                {searchResults.map(product => (
                                    <div
                                        key={product.id}
                                        className="search-result-item"
                                        onClick={() => {
                                            navigate(`/products?search=${encodeURIComponent(product.name)}`);
                                            setSearchQuery(product.name);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <FaSearch className="suggestion-icon" />
                                        <div className="suggestion-text">
                                            <span className="match">{searchQuery}</span>
                                            <span>{product.name.toLowerCase().replace(searchQuery.toLowerCase(), '')}</span>
                                        </div>
                                        <div className="suggestion-category">in {product.category}</div>
                                    </div>
                                ))}
                                <div
                                    onClick={handleSearchSubmit}
                                    className="search-view-all"
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
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {link.icon}
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

                        {user && (
                            <Link to="/wishlist" className="cart-btn" title="Favorites">
                                <FaHeart />
                                {wishlistCount > 0 && (
                                    <span className="cart-badge" style={{ background: '#ef4444' }}>
                                        {wishlistCount > 99 ? '99+' : wishlistCount}
                                    </span>
                                )}
                            </Link>
                        )}

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
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                        >
                            {link.icon} {link.label}
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

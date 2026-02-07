/**
 * WISHLIST PAGE
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingBasket, FaArrowLeft } from 'react-icons/fa';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/products/ProductCard';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useWishlist();

    return (
        <div className="wishlist-page">
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Link to="/products" className="btn btn-secondary btn-sm">
                        <FaArrowLeft /> Back to Shopping
                    </Link>
                    <h1 className="products-title" style={{ margin: 0 }}>My Favorites</h1>
                </div>

                {wishlist.length > 0 ? (
                    <div className="products-grid">
                        {wishlist.map(product => (
                            <div key={product.id} style={{ position: 'relative' }}>
                                <ProductCard product={product} />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        removeFromWishlist(product.id);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'white',
                                        color: '#ef4444',
                                        width: '35px',
                                        height: '35px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                        zIndex: 20,
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    title="Remove from favorites"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center" style={{ padding: '5rem 0' }}>
                        <div style={{ fontSize: '4rem', color: '#e2e8f0', marginBottom: '1.5rem' }}>
                            <FaHeart />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                            Save items you love to find them easily later.
                        </p>
                        <Link to="/products" className="btn btn-primary">
                            Explore Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;

/**
 * PRODUCT CARD COMPONENT
 * Displays individual product with cart actions
 */

import React from 'react';
import { FaPlus, FaMinus, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
    const { addToCart, isInCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();

    const inWishlist = isInWishlist(product.id);

    const inCart = isInCart(product.id);
    const quantity = getItemQuantity(product.id);

    const isLowStock = product.stock <= product.lowStockThreshold;
    const isOutOfStock = product.stock === 0;

    return (
        <div className="product-card">
            <div className="product-image">
                <img
                    src={product.image || 'https://via.placeholder.com/300x200?text=Product'}
                    alt={product.name}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Product';
                    }}
                />
                {isOutOfStock && (
                    <span className="product-badge out-of-stock">Out of Stock</span>
                )}
                {!isOutOfStock && isLowStock && (
                    <span className="product-badge low-stock">Low Stock</span>
                )}
                <button
                    className={`wishlist-toggle ${inWishlist ? 'active' : ''}`}
                    onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product);
                    }}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'white',
                        border: 'none',
                        width: '35px',
                        height: '35px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: inWishlist ? '#ef4444' : '#94a3b8',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        transition: 'all 0.3s ease'
                    }}
                >
                    {inWishlist ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>

                <div className="product-price">
                    <span className="price-current">₹{product.price}</span>
                    <span className="price-unit">/ {product.unit}</span>
                </div>

                <div className="product-actions">
                    {!inCart ? (
                        <button
                            className="add-to-cart-btn"
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock}
                        >
                            <FaShoppingCart />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    ) : (
                        <div className="quantity-control" style={{ flex: 1, justifyContent: 'center' }}>
                            <button className="qty-btn" onClick={() => decrementQuantity(product.id)}>
                                <FaMinus />
                            </button>
                            <span className="qty-value">{quantity}</span>
                            <button
                                className="qty-btn"
                                onClick={() => incrementQuantity(product.id)}
                                disabled={quantity >= product.stock}
                            >
                                <FaPlus />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

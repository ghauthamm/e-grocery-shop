/**
 * HOME PAGE
 * Landing page with hero section, categories, and features
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FaShoppingBasket,
    FaTruck,
    FaLeaf,
    FaCreditCard,
    FaHeadset,
    FaArrowRight
} from 'react-icons/fa';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ProductCard from '../../components/products/ProductCard';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Categories for the home page
    const categories = [
        { id: 'fruits', name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=300' },
        { id: 'vegetables', name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=300' },
        { id: 'dairy', name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=300' },
        { id: 'bakery', name: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
        { id: 'beverages', name: 'Beverages', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300' },
        { id: 'snacks', name: 'Snacks', image: 'https://images.unsplash.com/photo-1621939514649-28b5fe2f88ae?auto=format&fit=crop&q=80&w=300' },
        { id: 'grains', name: 'Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300' },
        { id: 'household', name: 'Household', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=300' },
    ];

    // Features list
    const features = [
        {
            icon: <FaTruck />,
            title: 'Fast Delivery',
            description: 'Get your groceries delivered within hours. Free delivery on orders above ₹500.'
        },
        {
            icon: <FaLeaf />,
            title: 'Fresh Products',
            description: 'We source directly from farms to ensure you get the freshest produce every time.'
        },
        {
            icon: <FaCreditCard />,
            title: 'Secure Payment',
            description: 'Multiple payment options including UPI and Cash on Delivery for your convenience.'
        },
        {
            icon: <FaHeadset />,
            title: '24/7 Support',
            description: 'Our customer support team is always ready to help you with any queries.'
        }
    ];

    // Fetch featured products
    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const q = query(
                    collection(db, 'products'),
                    where('isActive', '==', true),
                    limit(8)
                );
                const snapshot = await getDocs(q);
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setFeaturedProducts(products);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
    }, []);

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1>
                            Fresh Groceries,<br />
                            <span>Delivered Fast</span>
                        </h1>
                        <p>
                            Shop from a wide selection of fresh fruits, vegetables, dairy products,
                            and everyday essentials. Quality guaranteed with doorstep delivery.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                <FaShoppingBasket /> Shop Now
                            </Link>
                            <Link to="/products" className="btn btn-outline btn-lg">
                                Browse Categories
                            </Link>
                        </div>

                        <div className="hero-features">
                            <div className="hero-feature">
                                <div className="hero-feature-icon">
                                    <FaTruck />
                                </div>
                                <span>Free Delivery</span>
                            </div>
                            <div className="hero-feature">
                                <div className="hero-feature-icon">
                                    <FaLeaf />
                                </div>
                                <span>100% Fresh</span>
                            </div>
                            <div className="hero-feature">
                                <div className="hero-feature-icon">
                                    <FaCreditCard />
                                </div>
                                <span>Secure Payment</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"
                            alt="Fresh Groceries"
                        />
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                        <p>Browse our wide range of categories to find what you need</p>
                    </div>

                    <div className="categories-grid">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                className="category-card"
                                onClick={() => navigate(`/products?category=${category.id}`)}
                            >
                                <h3 className="category-name">{category.name}</h3>
                                <div className="category-icon" style={{ padding: 0, overflow: 'hidden' }}>
                                    <img src={category.image} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                padding: '5rem 0',
                textAlign: 'center',
                color: 'white'
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        Ready to Start Shopping?
                    </h2>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '2rem' }}>
                        Join thousands of happy customers who trust us for their daily needs
                    </p>
                    <Link to="/register" className="btn btn-lg" style={{
                        background: 'white',
                        color: 'var(--primary)',
                        padding: '1rem 2.5rem'
                    }}>
                        Create Account Free
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;

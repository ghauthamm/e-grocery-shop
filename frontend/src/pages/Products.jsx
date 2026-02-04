/**
 * PRODUCTS PAGE
 * Display all products with search and filter
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaBoxOpen } from 'react-icons/fa';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import ProductCard from '../components/products/ProductCard';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

    // Categories list
    const categories = [
        { id: 'all', name: 'All Products' },
        { id: 'fruits', name: 'Fruits' },
        { id: 'vegetables', name: 'Vegetables' },
        { id: 'dairy', name: 'Dairy' },
        { id: 'bakery', name: 'Bakery' },
        { id: 'beverages', name: 'Beverages' },
        { id: 'snacks', name: 'Snacks' },
        { id: 'grains', name: 'Grains & Pulses' },
        { id: 'household', name: 'Household' },
    ];

    // Fetch products from Firestore
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const q = query(
                    collection(db, 'products'),
                    where('isActive', '==', true)
                );
                const snapshot = await getDocs(q);
                const productsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter products based on search and category
    useEffect(() => {
        let result = [...products];

        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term) ||
                p.category?.toLowerCase().includes(term)
            );
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, searchTerm]);

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        if (category === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', category);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1 className="products-title">
                        {selectedCategory === 'all'
                            ? 'All Products'
                            : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
                    </h1>

                    <div className="products-filters">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <select
                            className="category-filter"
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center" style={{ padding: '4rem' }}>
                        <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                        <p className="mt-2">Loading products...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="no-products">
                        <div className="no-products-icon">
                            <FaBoxOpen />
                        </div>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;

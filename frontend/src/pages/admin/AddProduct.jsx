/**
 * ADD PRODUCT PAGE
 * Admin form to add new products
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSpinner } from 'react-icons/fa';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'fruits',
        stock: '',
        unit: 'kg',
        image: '',
        lowStockThreshold: '10'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    // Check admin access
    if (!isAdmin()) {
        navigate('/');
        return null;
    }

    const categories = [
        { id: 'fruits', name: 'Fruits' },
        { id: 'vegetables', name: 'Vegetables' },
        { id: 'dairy', name: 'Dairy' },
        { id: 'bakery', name: 'Bakery' },
        { id: 'beverages', name: 'Beverages' },
        { id: 'snacks', name: 'Snacks' },
        { id: 'grains', name: 'Grains & Pulses' },
        { id: 'household', name: 'Household' },
    ];

    const units = ['kg', 'g', 'litre', 'ml', 'pcs', 'pack', 'dozen', '500g', '250g', '100g', '1L'];

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.price || !formData.stock) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);

        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                stock: parseInt(formData.stock),
                unit: formData.unit,
                image: formData.image || 'https://via.placeholder.com/300x200?text=Product',
                lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'products'), productData);

            alert('Product added successfully!');
            navigate('/admin');
        } catch (error) {
            console.error('Error adding product:', error);
            setError('Failed to add product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/admin" className="btn btn-secondary">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2>Add New Product</h2>
                </div>

                <div className="card-body">
                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--error)',
                            color: 'var(--error)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Product Name *</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter product description"
                                rows={3}
                            />
                        </div>

                        <div className="grid-2" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Price (₹) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="form-input"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid-2" style={{ gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Stock Quantity *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    className="form-input"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Unit</label>
                                <select
                                    name="unit"
                                    className="form-select"
                                    value={formData.unit}
                                    onChange={handleChange}
                                >
                                    {units.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Low Stock Threshold</label>
                            <input
                                type="number"
                                name="lowStockThreshold"
                                className="form-input"
                                value={formData.lowStockThreshold}
                                onChange={handleChange}
                                placeholder="10"
                                min="0"
                            />
                            <small style={{ color: 'var(--text-secondary)' }}>
                                Alert when stock falls below this number
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Image URL</label>
                            <input
                                type="url"
                                name="image"
                                className="form-input"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    style={{
                                        marginTop: '0.75rem',
                                        maxWidth: '200px',
                                        borderRadius: '8px'
                                    }}
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg btn-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spin" /> Adding Product...
                                </>
                            ) : (
                                <>
                                    <FaPlus /> Add Product
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProduct;

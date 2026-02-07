/**
 * ADMIN LOGIN PAGE
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaSpinner, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || '/admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                // Check if the user is actually an admin
                if (result.profile?.role === 'admin') {
                    navigate(from, { replace: true });
                } else {
                    setError('Access denied. Admin privileges required.');
                }
            } else {
                setError(result.error || 'Failed to login');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card" style={{ position: 'relative' }}>
                    {/* Back and Close Buttons */}
                    <div className="auth-card-top-actions">
                        <button
                            type="button"
                            className="auth-action-btn back-btn"
                            onClick={() => navigate(-1)}
                            title="Go Back"
                        >
                            <FaArrowLeft />
                        </button>
                        <button
                            type="button"
                            className="auth-action-btn close-btn"
                            onClick={() => navigate('/')}
                            title="Close"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="auth-header" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                        <div className="auth-logo-box" style={{
                            background: '#000',
                            width: '100px',
                            height: '100px',
                            margin: '0 auto 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 1)'
                        }}>
                            <img src="/logo.png" alt="Logo" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c', marginBottom: '0.75rem' }}>Admin Portal</h1>
                        <p style={{ color: '#4a5568', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto' }}>
                            Sign in to manage SRI RANGA SUPER MARKET
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #ef4444',
                            color: '#b91c1c',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{
                                    position: 'absolute',
                                    left: '1.25rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#718096'
                                }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{
                                        paddingLeft: '3.25rem',
                                        background: '#ebf4ff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        height: '55px'
                                    }}
                                    placeholder="admin@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="form-label" style={{ fontWeight: '600', color: '#2d3748' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{
                                    position: 'absolute',
                                    left: '1.25rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#718096'
                                }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    style={{
                                        paddingLeft: '3.25rem',
                                        background: '#ebf4ff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        height: '55px'
                                    }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full"
                            style={{
                                background: '#1e293b',
                                height: '60px',
                                borderRadius: '12px',
                                fontSize: '1.25rem',
                                fontWeight: '700'
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spin" /> Verifying...
                                </>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

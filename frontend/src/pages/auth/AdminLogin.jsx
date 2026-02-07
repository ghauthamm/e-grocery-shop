/**
 * ADMIN LOGIN PAGE
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserShield, FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
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
        <div className="auth-page" style={{ background: '#f1f5f9' }}>
            <div className="auth-container">
                <div className="auth-card" style={{ borderTop: '4px solid #1e293b' }}>
                    <div className="auth-header">
                        <div className="auth-logo" style={{ color: '#1e293b', fontSize: '2.5rem', marginBottom: '1rem' }}>
                            <FaUserShield />
                        </div>
                        <h1 style={{ color: '#1e293b' }}>Admin Portal</h1>
                        <p>Sign in to manage SRI RANGA SUPER MARKET</p>
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
                        <div className="form-group">
                            <label className="form-label">Admin Email</label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b'
                                }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <FaLock style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#64748b'
                                }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            style={{ background: '#1e293b', borderColor: '#1e293b' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spin" /> Authenticating...
                                </>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="auth-link" style={{ marginTop: '2rem' }}>
                        <Link to="/" style={{ color: '#64748b' }}>← Return to Store</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

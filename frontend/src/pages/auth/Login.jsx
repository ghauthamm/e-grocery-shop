/**
 * LOGIN PAGE
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingBasket, FaEnvelope, FaLock, FaSpinner, FaGoogle, FaArrowLeft, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.error || 'Failed to login');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setGoogleLoading(true);

        try {
            const result = await signInWithGoogle();

            if (result.success) {
                navigate(from, { replace: true });
            } else {
                setError(result.error || 'Google sign-in failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setGoogleLoading(false);
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

                    <div className="auth-header" style={{ marginTop: '1.5rem' }}>
                        <div className="auth-logo">
                            <img src="/logo.png" alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                        </div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue to SRI RANGA SUPER MARKET</p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--error)',
                            color: 'var(--error)',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '1.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <FaEnvelope style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-light)'
                                }} />
                                <input
                                    type="email"
                                    className="form-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="Enter your email"
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
                                    color: 'var(--text-light)'
                                }} />
                                <input
                                    type="password"
                                    className="form-input"
                                    style={{ paddingLeft: '2.75rem' }}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-full btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="spin" /> Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <button
                        type="button"
                        className="btn btn-outline btn-full btn-lg"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading || loading}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                    >
                        {googleLoading ? (
                            <>
                                <FaSpinner className="spin" /> Signing in...
                            </>
                        ) : (
                            <>
                                <FaGoogle /> Continue with Google
                            </>
                        )}
                    </button>

                    <div className="auth-divider" style={{ margin: '1.5rem 0' }}>
                    </div>

                    <div className="auth-link">
                        Don't have an account?{' '}
                        <Link to="/register">Create Account</Link>
                    </div>

                    <div className="auth-link" style={{ marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                        <Link to="/admin/login" style={{ color: '#64748b', fontSize: '0.85rem' }}>Admin Portal Access</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

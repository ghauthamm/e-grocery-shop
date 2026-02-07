/**
 * PROTECTED ROUTE COMPONENT
 * Handles authentication-based route protection
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute - Requires user to be logged in
 */
export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: '4rem' }}>
                <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                <p className="mt-2">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

/**
 * AdminRoute - Requires user to be admin
 */
export const AdminRoute = ({ children }) => {
    const { user, userProfile, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: '4rem' }}>
                <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                <p className="mt-2">Loading...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
    }

    if (userProfile?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

/**
 * GuestRoute - Only accessible to non-logged-in users
 */
export const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="text-center" style={{ padding: '4rem' }}>
                <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                <p className="mt-2">Loading...</p>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;

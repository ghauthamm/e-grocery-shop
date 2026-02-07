/**
 * ============================================================================
 * SRI RANGA SUPER MARKET - ORDERING & INVENTORY MANAGEMENT SYSTEM
 * ============================================================================
 * 
 * Main Application Component
 * 
 * Features:
 * - React Router for navigation
 * - Authentication context
 * - Cart context
 * - Protected routes
 * - Page loader
 * 
 * Technology: React JS with Vite
 * Author: MCA Final Year Project
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import PageLoader from './components/common/PageLoader';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// Customer Pages
import Home from './pages/customer/Home';
import Products from './pages/customer/Products';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import OrderConfirmation from './pages/customer/OrderConfirmation';
import Orders from './pages/customer/Orders';
import Invoice from './pages/customer/Invoice';
import Wishlist from './pages/customer/Wishlist';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddProduct from './pages/admin/AddProduct';

// Styles
import './index.css';
import './styles/pages.css';

/**
 * Main App Component
 */
function App() {
  const [loading, setLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            {/* Page Loader */}
            <PageLoader loading={loading} />

            {/* Main App Content */}
            <div className="page-wrapper">
              {/* Navbar - Hidden on auth pages */}
              <Routes>
                <Route path="/login" element={null} />
                <Route path="/register" element={null} />
                <Route path="/admin/*" element={null} />
                <Route path="*" element={<Navbar />} />
              </Routes>

              {/* Main Content */}
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* Guest Only Routes */}
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <Login />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <Register />
                      </GuestRoute>
                    }
                  />

                  {/* Protected Routes (Authenticated Users) */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-confirmation"
                    element={
                      <ProtectedRoute>
                        <OrderConfirmation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/invoice/:orderId"
                    element={
                      <ProtectedRoute>
                        <Invoice />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/login"
                    element={
                      <GuestRoute>
                        <AdminLogin />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/add-product"
                    element={
                      <AdminRoute>
                        <AddProduct />
                      </AdminRoute>
                    }
                  />

                  {/* 404 Page */}
                  <Route
                    path="*"
                    element={
                      <div className="text-center" style={{ padding: '4rem' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>404</h1>
                        <h2>Page Not Found</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                          The page you're looking for doesn't exist.
                        </p>
                        <a href="/" className="btn btn-primary">Go Home</a>
                      </div>
                    }
                  />
                </Routes>
              </main>

              {/* Footer - Hidden on auth and admin pages */}
              <Routes>
                <Route path="/login" element={null} />
                <Route path="/register" element={null} />
                <Route path="/admin/*" element={null} />
                <Route path="*" element={<Footer />} />
              </Routes>
            </div>

            {/* Toast Notifications */}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

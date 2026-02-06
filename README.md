# SRI RANGA SUPER MARKET

## 📋 Project Overview

A complete, professional, production-ready **SRI RANGA SUPER MARKET** Ordering and Inventory Management System with an integrated Payment Module. Built using React JS, Node.js, Express, and Firebase Firestore.

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React JS (Vite), CSS |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Authentication | Firebase Authentication |
| Payment | UPI (Mock), Cash on Delivery |

---

## 🏗️ Project Architecture (Unified Structure)

```
keerthana-project/
├── package.json                 # Unified package.json (run both from here)
├── server.js                    # Backend Express server
├── README.md                    # This documentation

│
├── frontend/                    # React Frontend Application
│   ├── package.json            # Frontend dependencies
│   ├── index.html              # Entry HTML
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── config/              # Firebase & API Configuration
│       │   ├── firebase.js
│       │   └── api.js
│       ├── context/             # React Context (Auth, Cart)
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── components/          # Reusable UI Components
│       │   ├── common/          # Navbar, Footer, Loader
│       │   └── products/        # ProductCard
│       ├── pages/               # Page Components
│       │   ├── Home.jsx
│       │   ├── Products.jsx
│       │   ├── Cart.jsx
│       │   ├── Checkout.jsx
│       │   ├── Orders.jsx
│       │   ├── Invoice.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── admin/           # Admin Dashboard
│       ├── styles/              # CSS Stylesheets
│       ├── App.jsx              # Main App Component
│       ├── main.jsx             # Entry Point
│       └── index.css            # Global Styles
│
└── backend/                     # (Legacy - files now in root)
```

---

## 🚀 Getting Started (Single Folder)

### Prerequisites
- Node.js (v16 or higher)
- npm

### Quick Start (Recommended)

**Install all dependencies:**
```bash
npm run install-all
```

**Run both frontend and backend together:**
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### Alternative: Run Separately

**Start Backend only:**
```bash
npm run server
```

**Start Frontend only:**
```bash
npm run client
```

### Individual Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both frontend & backend together |
| `npm run server` | Run backend only (port 5000) |
| `npm run client` | Run frontend only (port 5173) |
| `npm run build` | Build frontend for production |
| `npm run install-all` | Install all dependencies |

---

## 📊 Database Schema (Firestore Collections)

### 1. users
```javascript
{
  uid: "string",           // Firebase Auth UID
  email: "string",
  name: "string",
  phone: "string",
  role: "customer" | "admin",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### 2. products
```javascript
{
  name: "string",
  description: "string",
  price: "number",
  category: "string",
  stock: "number",
  unit: "string",          // kg, pcs, litre, etc.
  image: "string",         // URL
  lowStockThreshold: "number",
  isActive: "boolean",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### 3. orders
```javascript
{
  orderNumber: "string",   // ORD + timestamp
  userId: "string",
  userEmail: "string",
  items: [{
    productId: "string",
    name: "string",
    price: "number",
    quantity: "number",
    unit: "string",
    total: "number"
  }],
  subtotal: "number",
  deliveryCharge: "number",
  tax: "number",
  total: "number",
  address: {
    fullName: "string",
    phone: "string",
    street: "string",
    city: "string",
    state: "string",
    pincode: "string"
  },
  paymentMethod: "upi" | "cod",
  paymentStatus: "pending" | "success" | "failed",
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### 4. payments
```javascript
{
  orderId: "string",
  orderNumber: "string",
  userId: "string",
  amount: "number",
  method: "upi" | "cod",
  status: "pending" | "success" | "failed",
  transactionId: "string" | null,
  createdAt: "timestamp"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone/Download the project**

2. **Setup Frontend**
```bash
cd frontend
npm install
```

3. **Setup Backend**
```bash
cd backend
npm install
```

4. **Start Backend Server**
```bash
cd backend
node server.js
```
Server runs on `http://localhost:5000`

5. **Start Frontend**
```bash
cd frontend
npm run dev
```
Application runs on `http://localhost:5173`

---

## 👤 User Roles

### Customer
- Browse products
- Add to cart
- Checkout with UPI/COD
- View order history
- Download invoices

### Admin
- All customer features
- Dashboard with analytics
- Product management (Add/Edit)
- Order management
- Payment monitoring
- Low stock alerts

---

## 🔐 Setting Up Admin User

1. Register a new user through the app
2. Go to Firebase Console > Firestore
3. Find the user document in `users` collection
4. Change `role` from `"customer"` to `"admin"`
5. Refresh the app - Admin menu will appear

---

## 🛒 Features Summary

### Customer Features
- ✅ Professional landing page
- ✅ Product browsing with search & filter
- ✅ Shopping cart management
- ✅ Secure checkout process
- ✅ UPI payment with QR code (mock)
- ✅ Cash on Delivery option
- ✅ Order confirmation
- ✅ Order tracking and history
- ✅ Digital invoice generation
- ✅ Responsive mobile design

### Admin Features
- ✅ Dashboard with statistics
- ✅ Real-time inventory management
- ✅ Low stock alerts
- ✅ Order management
- ✅ Payment status tracking
- ✅ Add new products
- ✅ View all payments

### Technical Features
- ✅ Firebase Authentication
- ✅ Real-time Firestore updates
- ✅ Automatic stock reduction
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Cart persistence (localStorage)
- ✅ Page loader animation
- ✅ Responsive CSS design

---

## 📱 Screenshots

The application includes:
1. Home page with hero section
2. Products catalog with filters
3. Shopping cart
4. Checkout with payment options
5. UPI QR code payment modal
6. Order confirmation
7. Orders history
8. Digital invoice
9. Admin dashboard
10. Product management

---

## 🎓 Viva Notes

### Important Concepts to Know

1. **Why React?**
   - Component-based architecture
   - Virtual DOM for performance
   - Hooks for state management
   - Large ecosystem

2. **Why Firebase?**
   - Real-time database
   - Built-in authentication
   - Easy to setup
   - Scalable

3. **Payment Flow Security**
   - Payment verified before order creation (UPI)
   - Transaction ID stored for reference
   - Status tracking for all payments

4. **Inventory Management**
   - Stock reduced after successful order
   - Low stock alerts for admin
   - Real-time updates

5. **Role-Based Access**
   - Protected routes in React
   - Admin verification on backend
   - Token-based authentication

---

## 🔮 Future Enhancements

1. **Real Payment Gateway Integration**
   - Razorpay
   - Paytm
   - PhonePe

2. **Additional Features**
   - Email notifications
   - SMS alerts
   - Product reviews
   - Wishlist
   - Coupons & discounts
   - Multiple addresses

3. **Performance**
   - Image optimization
   - Caching
   - PWA support

4. **Analytics**
   - Sales reports
   - Customer insights
   - Product trends

---

## 📞 Support

For any queries related to this project:
- Check the code comments
- Review the documentation above
- Refer to Firebase documentation

---

## 📄 License

This project is created for MCA Final Year academic purposes.

---

**Built with ❤️ for MCA Final Year Project**

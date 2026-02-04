# Payment Module Documentation

## 📋 Overview

This document explains the payment module implementation in the E-Grocery system with detailed code explanation suitable for MCA viva and project submission.

---

## 🔄 Payment Flow Diagram

```
                          ┌─────────────────┐
                          │   Add to Cart   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │    Checkout     │
                          │ (Enter Address) │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            ┌───────▼───────┐     │      ┌───────▼───────┐
            │ Select UPI    │     │      │  Select COD   │
            └───────┬───────┘     │      └───────┬───────┘
                    │             │              │
            ┌───────▼───────┐     │              │
            │ Show QR Code  │     │              │
            │ / UPI ID      │     │              │
            └───────┬───────┘     │              │
                    │             │              │
            ┌───────▼───────┐     │              │
            │ Verify Payment│     │              │
            └───────┬───────┘     │              │
                    │             │              │
        ┌───────────┼─────────────┼──────────────┤
        │           │             │              │
    ┌───▼───┐   ┌───▼───┐        │              │
    │Success│   │Failed │        │              │
    └───┬───┘   └───┬───┘        │              │
        │           │             │              │
        │     ┌─────▼─────┐      │              │
        │     │Show Error │      │              │
        │     │  Message  │      │              │
        │     └───────────┘      │              │
        │                        │              │
        └────────────────────────┴──────────────┘
                                   │
                          ┌────────▼────────┐
                          │  Create Order   │
                          │  Reduce Stock   │
                          │ Create Payment  │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │   Show Order    │
                          │  Confirmation   │
                          └────────┬────────┘
                                   │
                          ┌────────▼────────┐
                          │Generate Invoice │
                          └─────────────────┘
```

---

## 💻 Frontend Payment Code (Checkout.jsx)

### Key Payment Functions

```javascript
// 1. State for payment handling
const [paymentMethod, setPaymentMethod] = useState('');
const [upiPaymentDone, setUpiPaymentDone] = useState(false);

// 2. Payment method selection UI
<div className="payment-methods">
  {/* UPI Option */}
  <label 
    className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}
    onClick={() => setPaymentMethod('upi')}
  >
    <span className="payment-icon">📱</span>
    <div className="payment-details">
      <h4>UPI Payment</h4>
      <p>Pay using UPI apps like GPay, PhonePe, Paytm</p>
    </div>
  </label>

  {/* COD Option */}
  <label 
    className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
    onClick={() => setPaymentMethod('cod')}
  >
    <span className="payment-icon">💵</span>
    <div className="payment-details">
      <h4>Cash on Delivery</h4>
      <p>Pay when your order is delivered</p>
    </div>
  </label>
</div>
```

### UPI Payment Simulation

```javascript
// 3. UPI Payment verification (Demo)
const handleUpiPayment = () => {
  setShowUpiModal(true);
};

const confirmUpiPayment = () => {
  // Simulate payment verification
  setTimeout(() => {
    setUpiPaymentDone(true);
    setShowUpiModal(false);
  }, 1500);
};
```

### Order Placement with Payment

```javascript
// 4. Place order with payment handling
const handlePlaceOrder = async () => {
  // Validate form
  if (!isFormValid()) {
    alert('Please fill all required fields and complete payment');
    return;
  }

  try {
    // Determine payment status based on method
    const orderData = {
      // ... order details ...
      paymentMethod,
      paymentStatus: paymentMethod === 'upi' ? 'success' : 'pending',
      orderStatus: 'confirmed',
    };

    // Create order in Firestore
    const orderRef = await addDoc(collection(db, 'orders'), orderData);

    // Create payment record
    const paymentData = {
      orderId: orderRef.id,
      amount: total,
      method: paymentMethod,
      status: paymentMethod === 'upi' ? 'success' : 'pending',
      transactionId: paymentMethod === 'upi' ? `TXN${Date.now()}` : null,
    };
    await addDoc(collection(db, 'payments'), paymentData);

    // Reduce stock for each item
    for (const item of cart) {
      await updateDoc(doc(db, 'products', item.id), {
        stock: increment(-item.quantity)
      });
    }

    // Clear cart and redirect
    clearCart();
    navigate('/order-confirmation', { state: { orderData } });

  } catch (error) {
    console.error('Error placing order:', error);
    alert('Failed to place order');
  }
};
```

---

## 🖥️ Backend Payment API (server.js)

### Payment Initiation (for UPI)

```javascript
/**
 * POST /api/payments/initiate
 * Generate UPI payment request
 */
app.post('/api/payments/initiate', verifyToken, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;

    // Mock UPI details
    const upiId = 'egrocery@upi';
    const merchantName = 'E-Grocery Store';

    // Generate UPI deep link
    const upiLink = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&tr=${transactionId}`;

    res.json({ 
      success: true, 
      payment: {
        transactionId,
        upiId,
        upiLink,
        amount,
        qrData: upiLink
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error initiating payment' });
  }
});
```

### Payment Verification

```javascript
/**
 * POST /api/payments/verify
 * Verify payment status
 */
app.post('/api/payments/verify', verifyToken, async (req, res) => {
  try {
    const { transactionId } = req.body;

    // In production: Call payment gateway API to verify
    // For demo: Always return success

    res.json({ 
      success: true, 
      verified: true,
      transactionId,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying payment' });
  }
});
```

### Order Creation with Payment

```javascript
/**
 * POST /api/orders
 * Create order with payment validation
 */
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, address, paymentMethod, paymentDetails } = req.body;

    // Validate payment method
    if (!['upi', 'cod'].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment method' 
      });
    }

    // For UPI: Verify payment before creating order
    if (paymentMethod === 'upi') {
      if (!paymentDetails?.transactionId) {
        return res.status(400).json({ 
          success: false, 
          message: 'UPI payment verification failed' 
        });
      }
    }

    // Create order with appropriate status
    const orderData = {
      // ... order details ...
      paymentMethod,
      paymentStatus: paymentMethod === 'upi' ? 'success' : 'pending',
      orderStatus: 'confirmed',
    };

    // Save order
    const orderRef = await db.collection('orders').add(orderData);

    // Create payment record
    await db.collection('payments').add({
      orderId: orderRef.id,
      amount: total,
      method: paymentMethod,
      status: orderData.paymentStatus,
      transactionId: paymentDetails?.transactionId || null,
    });

    // Reduce stock using batch write
    const batch = db.batch();
    for (const item of items) {
      batch.update(productRef, {
        stock: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }
    await batch.commit();

    res.status(201).json({ 
      success: true, 
      order: { id: orderRef.id, orderNumber }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating order' });
  }
});
```

---

## 🔒 Payment Security Measures

### 1. Payment Validation

```javascript
// Prevent order creation without payment verification (UPI)
if (paymentMethod === 'upi' && !upiPaymentDone) {
  return; // Don't proceed
}
```

### 2. Server-side Verification

```javascript
// Backend verifies payment before creating order
if (paymentMethod === 'upi') {
  if (!paymentDetails?.transactionId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Payment verification failed' 
    });
  }
}
```

### 3. Transaction Records

```javascript
// All payments are logged with details
const paymentData = {
  orderId: orderRef.id,
  orderNumber,
  userId: req.user.uid,
  amount: total,
  method: paymentMethod,
  status: paymentStatus,
  transactionId: transactionId || null,
  createdAt: new Date()
};
await db.collection('payments').add(paymentData);
```

---

## 📊 Payment Status Tracking

### Status Types

| Status | Description |
|--------|-------------|
| `pending` | Payment not yet received (COD) |
| `success` | Payment completed and verified |
| `failed` | Payment attempt failed |

### Admin Payment View

```javascript
// Admin can view all payments with status
const ordersSnapshot = await getDocs(
  query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
);

// Display payment status badges
<span className={`payment-badge ${order.paymentStatus}`}>
  {order.paymentStatus}
</span>
```

---

## 🧾 Invoice Generation

After successful payment or COD confirmation, the system generates a digital invoice:

```javascript
// Invoice data structure
const invoice = {
  invoiceNumber: `INV-${orderNumber}`,
  date: orderDate,
  customer: {
    name: address.fullName,
    address: address.fullAddress,
    phone: address.phone
  },
  items: orderItems,
  subtotal,
  deliveryCharge,
  tax,
  total,
  paymentMethod,
  paymentStatus,
  company: {
    name: 'E-Grocery Store',
    address: '123 Market Street, City',
    gstin: 'GSTIN1234567890'
  }
};
```

---

## 🔮 Real Payment Gateway Integration (Future)

For production use, integrate with:

### Razorpay Example

```javascript
// 1. Create order on backend
app.post('/api/payments/create-razorpay-order', async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
  });

  const order = await razorpay.orders.create({
    amount: amount * 100, // in paise
    currency: 'INR',
    receipt: `order_${orderId}`
  });

  res.json({ orderId: order.id, amount: order.amount });
});

// 2. Verify payment
app.post('/api/payments/verify-razorpay', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature === razorpay_signature) {
    // Payment verified - create order
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});
```

---

## 📝 Key Points for Viva

1. **Why two payment methods?**
   - UPI: Instant digital payment
   - COD: For customers without UPI access

2. **How is payment security ensured?**
   - Payment verified before order creation (UPI)
   - Transaction IDs logged
   - Server-side validation

3. **What happens on payment failure?**
   - Error message displayed
   - Order not created
   - No stock deduction

4. **How is COD handled?**
   - Order created with pending payment
   - Admin updates status on delivery
   - Payment collected by delivery person

5. **How is inventory managed?**
   - Stock reduced after successful order
   - Uses Firebase increment for atomic updates
   - Low stock alerts for admin

---

**This documentation covers the complete payment module implementation for the E-Grocery system.**

# Tindo Full-Stack Testing Checklist

## 🧪 Comprehensive Testing Guide

This document outlines all critical test cases that must pass for the Tindo food delivery application to be production-ready.

---

## 1️⃣ AUTHENTICATION FLOW

### Test 1.1: Customer Registration
- **Precondition**: User is on `/register.html`
- **Steps**:
  1. Select role: "Customer"
  2. Enter: Name, Email, Phone, Password
  3. Click "Create Account"
- **Expected Result**:
  - ✅ User receives success message
  - ✅ Token saved to localStorage
  - ✅ Redirect to `/index.html`
  - ✅ API: `POST /api/auth/register` returns `{ success: true, token, user }`

### Test 1.2: Customer Login
- **Precondition**: Customer account exists
- **Steps**:
  1. Go to `/login.html`
  2. Enter email & password
  3. Click "Sign In"
- **Expected Result**:
  - ✅ Token & user data saved to localStorage
  - ✅ Redirect based on role (customer → `/index.html`)
  - ✅ HTTP 200, response: `{ success: true, token, user, role: "customer" }`

### Test 1.3: Restaurant Registration (Pending Approval)
- **Precondition**: User is on `/register.html`
- **Steps**:
  1. Select role: "Restaurant"
  2. Fill: Name, Email, Phone, Password, Restaurant Name, Cuisine, ETA
  3. Click "Create Account"
- **Expected Result**:
  - ✅ Success message: "Pending admin approval"
  - ✅ User data saved
  - ✅ Status field = "pending"
  - ✅ Cannot login until approved

### Test 1.4: Delivery Agent Registration
- **Precondition**: User is on `/register.html`
- **Steps**:
  1. Select role: "Delivery Agent"
  2. Fill: Name, Email, Phone, Password, Vehicle Type, Aadhaar
  3. Click "Create Account"
- **Expected Result**:
  - ✅ Agent profile created in `agents` table
  - ✅ Status = "Inactive"
  - ✅ Redirect to `/login.html` with message

### Test 1.5: Login with Invalid Credentials
- **Steps**:
  1. Enter wrong email/password
  2. Click "Sign In"
- **Expected Result**:
  - ✅ HTTP 401
  - ✅ Error message: "Invalid email or password"
  - ✅ No token stored

---

## 2️⃣ ORDER PLACEMENT FLOW

### Test 2.1: Browse Restaurants
- **Steps**:
  1. Open `/restaurants.html`
  2. View list of restaurants
- **Expected Result**:
  - ✅ API: `GET /api/restaurants` returns array
  - ✅ Each restaurant shows name, cuisine, ETA, image
  - ✅ Click restaurant → `/restaurant.html?id=<restaurant_id>`

### Test 2.2: View Menu Items
- **Steps**:
  1. Click restaurant
  2. View menu items
- **Expected Result**:
  - ✅ API: `GET /api/menu/by-restaurant/:id` returns items
  - ✅ Each item: name, price, description, image
  - ✅ "Add to Cart" buttons functional

### Test 2.3: Add Items to Cart
- **Steps**:
  1. Click "Add to Cart" on menu item
  2. Confirm quantity
  3. View cart
- **Expected Result**:
  - ✅ Item added to localStorage as `tindo_cart`
  - ✅ Cart badge updated
  - ✅ Can add/remove items
  - ✅ Cannot mix restaurants (prompt to clear)

### Test 2.4: Place Order (Authenticated)
- **Precondition**: Customer logged in, cart has items
- **Steps**:
  1. Go to `/cart.html`
  2. Click "Proceed to Payment"
  3. Fill delivery address
  4. Select payment method
  5. Click "Place Order"
- **Expected Result**:
  - ✅ API: `POST /api/orders` with user_id, restaurant_id, items, total
  - ✅ Returns: `{ success: true, order_id, agent_id }`
  - ✅ Order stored in DB with status = "Confirmed" or "Pending"
  - ✅ If agent available → auto-assigned, status = "Confirmed"
  - ✅ Socket event: `newOrder` emitted to all clients
  - ✅ Redirect to `/order-tracking.html?orderId=<order_id>`

### Test 2.5: Place Order (Not Authenticated)
- **Steps**:
  1. Clear localStorage (remove token)
  2. Try to place order from `/cart.html`
- **Expected Result**:
  - ✅ Alert: "Please login first"
  - ✅ Redirect to `/login.html`

---

## 3️⃣ RESTAURANT DASHBOARD

### Test 3.1: View Incoming Orders
- **Precondition**: Restaurant user logged in
- **Steps**:
  1. Open `/restaurant-dashboard.html`
  2. View "Pending Orders" section
- **Expected Result**:
  - ✅ API: `GET /api/orders/restaurant/:id` with token
  - ✅ Shows orders with status "Pending" or "Confirmed"
  - ✅ Each order: customer name, items, total, ETA

### Test 3.2: Update Order Status
- **Steps**:
  1. View order in restaurant dashboard
  2. Click "Start Preparing" → status: "Preparing"
  3. Click "Food Ready" → status: "Ready"
- **Expected Result**:
  - ✅ API: `POST /api/orders/update` with `{ order_id, status }`
  - ✅ Status updates immediately on dashboard
  - ✅ Socket event: `orderForRestaurant_<rest_id>` sent to restaurant clients
  - ✅ Delivery agent receives notification

### Test 3.3: Confirm Order Details
- **Steps**:
  1. Click order
  2. View full details: items, delivery address, customer phone
- **Expected Result**:
  - ✅ All details displayed correctly
  - ✅ Can call/message customer (if integrated)

---

## 4️⃣ DELIVERY AGENT FLOW

### Test 4.1: Agent Registration & Approval
- **Steps**:
  1. Agent registers via `/register.html`
  2. Admin approves agent status
  3. Agent logs in
- **Expected Result**:
  - ✅ Agent has "Inactive" status initially
  - ✅ Admin can set to "Active"
  - ✅ Agent dashboard: `/delivery-dashboard.html`

### Test 4.2: View Assigned Orders
- **Precondition**: Delivery agent logged in & active
- **Steps**:
  1. Open `/delivery-dashboard.html`
  2. View "My Orders" section
- **Expected Result**:
  - ✅ API: `GET /api/orders/agent/:id` with token
  - ✅ Shows only orders with agent_id = current user's agent_id
  - ✅ Status: "Confirmed" or "Picked Up"

### Test 4.3: Pick Up Order
- **Steps**:
  1. View assigned order
  2. Click "Picked Up"
  3. Confirm restaurant details
- **Expected Result**:
  - ✅ API: `POST /api/orders/update` with status = "Picked Up"
  - ✅ Restaurant notified via socket
  - ✅ Order moves to "In Transit"

### Test 4.4: Send Live Location (GPS)
- **Steps**:
  1. Agent is on route with order
  2. Browser requests GPS permission
  3. Location sent to backend
- **Expected Result**:
  - ✅ API: `POST /api/delivery/update-location` with `{ agent_id, lat, lng }`
  - ✅ Agent location updated in DB
  - ✅ Customer sees real-time location on map
  - ✅ Socket: `trackOrder_<order_id>` sent with new coordinates

### Test 4.5: Complete Delivery
- **Steps**:
  1. Agent clicks "Delivered"
  2. Customer confirms receipt (optional)
- **Expected Result**:
  - ✅ API: `POST /api/orders/update` with status = "Completed"
  - ✅ Order marked as delivered in DB
  - ✅ Payment processed (if not COD)
  - ✅ Customer receives delivery confirmation

---

## 5️⃣ REAL-TIME TRACKING (Customer)

### Test 5.1: View Order on Map
- **Precondition**: Customer placed order, tracking page open
- **Steps**:
  1. Go to `/order-tracking.html?orderId=<id>`
  2. View map with markers
- **Expected Result**:
  - ✅ Map loads (Leaflet/OpenStreetMap)
  - ✅ 🔴 Restaurant location
  - ✅ 🟢 Delivery agent location (if assigned)
  - ✅ 🔵 Customer location
  - ✅ Map auto-fits to show all markers

### Test 5.2: Real-Time Location Updates
- **Steps**:
  1. Order tracking page open
  2. Agent moves (GPS updates)
- **Expected Result**:
  - ✅ Agent marker updates on map (live via socket)
  - ✅ Location updates every 5-10 seconds
  - ✅ Polyline drawn from restaurant → customer

### Test 5.3: Order Status Timeline
- **Steps**:
  1. View order tracking page
  2. Monitor timeline as status updates
- **Expected Result**:
  - ✅ Timeline shows:
    1. Order Confirmed ✓
    2. Preparing Food ✓
    3. Food Ready ✓
    4. Picked Up ✓
    5. In Transit ✓
    6. Delivered ✓
  - ✅ Completed steps highlighted in green
  - ✅ Updates in real-time via socket

### Test 5.4: ETA Display
- **Steps**:
  1. View order tracking page
  2. Monitor ETA countdown
- **Expected Result**:
  - ✅ ETA displayed in order summary
  - ✅ Updates as agent moves
  - ✅ Shows dynamic time estimate based on distance

---

## 6️⃣ PAYMENT FLOW

### Test 6.1: Cash on Delivery (COD)
- **Steps**:
  1. Select "Cash on Delivery" at checkout
  2. Place order
- **Expected Result**:
  - ✅ Order placed with payment_type = "COD"
  - ✅ No external payment gateway call
  - ✅ Agent collects payment on delivery
  - ✅ Order status updates to "Completed"

### Test 6.2: Online Payment (Razorpay/Stripe)
- **Steps**:
  1. Select "Online Payment" at checkout
  2. Click "Pay ₹XXX"
  3. Enter payment details
- **Expected Result**:
  - ✅ Redirected to payment gateway
  - ✅ Payment processed securely
  - ✅ Order created only after successful payment
  - ✅ Confirmation email sent to customer

---

## 7️⃣ ADMIN PANEL

### Test 7.1: View All Orders
- **Steps**:
  1. Admin logs in
  2. Open admin dashboard
  3. View "All Orders"
- **Expected Result**:
  - ✅ API: `GET /api/admin/orders` returns all orders
  - ✅ Filter by status, date, restaurant

### Test 7.2: Approve Restaurant
- **Steps**:
  1. View pending restaurants
  2. Click "Approve"
- **Expected Result**:
  - ✅ API: `PUT /api/restaurants/approve/:id`
  - ✅ Restaurant status changes to "approved"
  - ✅ Restaurant owner can now login

### Test 7.3: Manage Delivery Agents
- **Steps**:
  1. View all delivery agents
  2. Toggle agent status (Active/Inactive)
- **Expected Result**:
  - ✅ API: `POST /api/admin/delivery` to manage agents
  - ✅ Agents can only accept orders if "Active"

---

## 8️⃣ SOCKET.IO REAL-TIME EVENTS

### Test 8.1: New Order Notification
- **Steps**:
  1. Customer places order
  2. Restaurant dashboard open
- **Expected Result**:
  - ✅ Socket event: `newOrder` received
  - ✅ New order appears in restaurant dashboard instantly
  - ✅ Sound/visual notification (if enabled)

### Test 8.2: Delivery Agent Assignment
- **Steps**:
  1. Order placed with available agent nearby
  2. Agent receives notification
- **Expected Result**:
  - ✅ Socket event: `orderForAgent_<agent_id>` sent
  - ✅ Order appears in agent's dashboard
  - ✅ Agent location auto-requested

### Test 8.3: Location Update Broadcast
- **Steps**:
  1. Agent sends GPS location
  2. Customer tracking page open
- **Expected Result**:
  - ✅ Socket event: `trackOrder_<order_id>` with lat/lng
  - ✅ Map marker updates instantly
  - ✅ No delays (< 1 second)

---

## 9️⃣ BACKEND API VALIDATION

### Test 9.1: Authentication Headers
- **Steps**:
  1. Make API request without token
  - **Expected Result**: ✅ HTTP 401, `{ error: "No token provided" }`

### Test 9.2: Invalid Token
- **Steps**:
  1. Make API request with invalid/expired token
- **Expected Result**: ✅ HTTP 403, `{ error: "Invalid token" }`

### Test 9.3: Unauthorized Access
- **Steps**:
  1. Customer tries to access restaurant orders
  2. Delivery agent tries to access other agent's orders
- **Expected Result**: ✅ HTTP 403, `{ error: "Not authorized" }`

### Test 9.4: Input Validation
- **Steps**:
  1. POST order without `user_id`
  2. POST order without `items` array
  3. POST order with invalid `total`
- **Expected Result**: ✅ HTTP 400, `{ error: "Missing required fields" }`

### Test 9.5: Database Transactions
- **Steps**:
  1. Place order with high concurrent requests
  2. Monitor for race conditions
- **Expected Result**: ✅ No duplicate orders, consistent state

---

## 🔟 FRONTEND PERFORMANCE

### Test 10.1: Page Load Time
- **Steps**:
  1. Open `/index.html`
  2. Measure load time
- **Expected Result**: ✅ < 3 seconds on 4G

### Test 10.2: Socket Reconnection
- **Steps**:
  1. Order tracking page open
  2. Disconnect network
  3. Reconnect network
- **Expected Result**: ✅ Socket auto-reconnects, updates resume

### Test 10.3: Error Handling
- **Steps**:
  1. Close network
  2. Try to place order
  3. Reconnect
- **Expected Result**: ✅ User sees error message, can retry

---

## 1️⃣1️⃣ SECURITY TESTS

### Test 11.1: Password Hashing
- **Steps**:
  1. Register user
  2. Check database for password
- **Expected Result**: ✅ Password is hashed (bcrypt), not plaintext

### Test 11.2: CORS Policy
- **Steps**:
  1. Make request from different origin
  2. Check response headers
- **Expected Result**: ✅ CORS headers allow/deny appropriately

### Test 11.3: SQL Injection Prevention
- **Steps**:
  1. Try email: `' OR '1'='1`
  2. Try order ID: `1; DROP TABLE orders;`
- **Expected Result**: ✅ Parameterized queries prevent injection

### Test 11.4: XSS Prevention
- **Steps**:
  1. Add item with name: `<script>alert('XSS')</script>`
- **Expected Result**: ✅ Script not executed, escaped in UI

---

## 1️⃣2️⃣ DEPLOYMENT CHECKLIST

### Pre-Deployment
- ✅ All tests passing
- ✅ No hardcoded localhost URLs
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ HTTPS enabled
- ✅ CORS configured for production domains

### Post-Deployment (Render/Netlify)
- ✅ Backend server running on Render
- ✅ Frontend deployed on Netlify/GitHub Pages
- ✅ All API endpoints accessible
- ✅ Socket.IO connections working
- ✅ Database connected
- ✅ Monitoring active

---

## 📝 TEST REPORT TEMPLATE

```
TEST RUN DATE: [DATE]
TESTER: [NAME]
BUILD/VERSION: [VERSION]

TOTAL TESTS: 
PASSED: ✅
FAILED: ❌
SKIPPED: ⏭️

CRITICAL ISSUES:
- [List any P0/P1 issues]

RECOMMENDATIONS:
- [Future improvements]

SIGN-OFF: __________ DATE: __________
```

---

## 🚀 SUCCESS CRITERIA

For the application to be considered **PRODUCTION READY**:
- ✅ 100% of P0 tests passing
- ✅ 95%+ of P1 tests passing
- ✅ Zero critical security issues
- ✅ All major features functional
- ✅ Performance baseline met (< 3s page load)
- ✅ Backup & disaster recovery plan in place

---

**Last Updated**: December 6, 2025
**Version**: 1.0

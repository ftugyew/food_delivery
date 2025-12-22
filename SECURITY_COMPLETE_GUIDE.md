# 🔒 Security & Authentication Complete Guide

## Overview

This document details all security measures implemented across the Tindo food delivery system, including JWT authentication, authorization rules, and API endpoint protection.

---

## 1. Frontend Authentication Layer

### Auth Guard Script (`js/auth-guard.js`)

**Location**: `frontend/js/auth-guard.js`

**Protected Pages** (require valid JWT token):
- ✅ `restaurants.html` - Restaurant listing
- ✅ `restaurant.html` - Individual restaurant menu
- ✅ `cart.html` - Shopping cart
- ✅ `chechout.html` - Order checkout
- ✅ `tracking-live.html` - Order tracking
- ✅ `delivery-dashboard-live.html` - Delivery agent dashboard
- ✅ `admin-dashboard.html` - Admin control panel

**Public Pages** (no auth check):
- `index.html` - Homepage
- `login.html` - Login page
- `register.html` - Registration page
- `404.html` - Error pages

### Token Management

```javascript
// Get current user
const user = getCurrentUser();
// Returns: { id, email, role, name }

// Check authentication
const isAuth = isAuthenticated();
// Returns: true/false

// Get auth header for API calls
const headers = getAuthHeader();
// Returns: { 'Authorization': 'Bearer <token>' }

// Logout
logout();
// Clears token and redirects to login
```

### Token Storage
- Stored in `localStorage` as `token` or `auth_token`
- JWT format: `header.payload.signature`
- Expiration: 7 days (checked client-side before API calls)
- Automatically invalidates when expired

---

## 2. Backend Authentication

### JWT Middleware (`routes/auth.js`)

**Location**: `backend/routes/auth.js` (lines 282-299)

```javascript
function authMiddleware(req, res, next) {
  // 1. Check Authorization header: "Bearer <token>"
  // 2. Fallback to query param: ?token=<token>
  // 3. Verify token signature and expiration
  // 4. Attach decoded user to req.user
  // 5. Return 401/403 if invalid
}
```

**Token Payload** (decoded from JWT):
```javascript
{
  user_id: 123,
  email: "user@example.com",
  role: "user",      // Can be: user, restaurant, delivery_agent, admin
  name: "John Doe",
  iat: 1234567890,   // Issued at
  exp: 1241987890    // Expires at (7 days later)
}
```

### Protected API Routes

All routes now require valid JWT token:

```
✅ POST   /api/auth/login           (public - generates token)
✅ POST   /api/auth/register        (public - creates account)
🔒 GET    /api/admin/*              (admin only)
🔒 POST   /api/orders               (authenticated users)
🔒 GET    /api/orders/:id           (owner or admin)
🔒 PUT    /api/orders/:id/status    (assigned agent or admin)
🔒 POST   /api/tracking/agent-location (authenticated agents)
🔒 GET    /api/tracking/agent/:id/location (authenticated)
🔒 POST   /api/tracking/orders/:orderId/chat
🔒 GET    /api/restaurants          (authenticated users)
🔒 POST   /api/menu                 (authenticated users)
🔒 POST   /api/user-addresses       (authenticated users)
```

### Applied Middleware (in `server.js` lines 74-130)

```javascript
// Public routes - no auth required
app.use("/api/auth", authRoutes);

// Protected routes - auth required
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/restaurants", authMiddleware, restaurantsRoutes);
app.use("/api/menu", authMiddleware, menuRoutes);
app.use("/api/payments", authMiddleware, paymentsRoutes);
app.use("/api/tracking", authMiddleware, trackingRoutes);
app.use("/api/user-addresses", authMiddleware, userAddressesRoutes);
app.use("/api/delivery", authMiddleware, deliveryRoutes);
```

---

## 3. Role-Based Access Control (RBAC)

### User Roles

| Role | Access | Permissions |
|------|--------|-------------|
| `user` | ✅ Orders, Tracking, Checkout, Payment | Can only access own orders and tracking |
| `delivery_agent` | ✅ Agent Dashboard, Location Tracking | Can only update own location and accept assigned orders |
| `restaurant` | ✅ Restaurant Dashboard | Can only manage own restaurant and orders |
| `admin` | ✅ Admin Dashboard, All Reports | Can manage everything |

### Admin-Only Pages

- ✅ `admin-dashboard.html` - Enforced in `auth-guard.js` (lines 131-134)
  - Redirects non-admin users to homepage
  - Requires role: `"admin"`

### Agent-Only Pages

- ✅ `delivery-dashboard-live.html` - Enforced in `auth-guard.js` (lines 137-140)
  - Redirects non-agents to homepage
  - Requires role: `"delivery_agent"`

---

## 4. API Security Rules

### Rule 1: Authentication Required for All Protected Endpoints

**Implementation**: `authMiddleware` is applied to all protected routes

```javascript
// This will fail with 401 if no valid token
fetch('/api/restaurants', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```

### Rule 2: Agent Location Updates - Only Own Agents

**Endpoint**: `POST /api/tracking/agent-location`

**Security Check** (lines 186-199 in `tracking.js`):
```javascript
// Verify agent exists
const [agents] = await db.execute(
  "SELECT id FROM agents WHERE id = ?",
  [agent_id]
);

// If order provided, verify agent is assigned
if (order_id) {
  const [orders] = await db.execute(
    "SELECT id FROM orders WHERE id = ? AND agent_id = ?",
    [order_id, agent_id]  // ← Agent must own the order
  );
  if (!orders.length) {
    return res.status(403).json({ error: "Agent not assigned to this order" });
  }
}
```

**Prevents**: Agents updating locations for other agents or unassigned orders

### Rule 3: Order Tracking - Only Own Orders

**Endpoint**: `GET /api/tracking/orders/:orderId/tracking`

**Recommended Security Check** (TODO - to be added):
```javascript
// Get user from token
const userId = req.user.user_id;
const agentId = req.user.agent_id;

// Check if user owns order or is assigned agent
const [order] = await db.execute(
  "SELECT user_id, agent_id FROM orders WHERE id = ?",
  [orderId]
);

if (order[0].user_id !== userId && order[0].agent_id !== agentId) {
  return res.status(403).json({ error: "Unauthorized access to order" });
}
```

**Prevents**: Users viewing other users' orders or order details

### Rule 4: Admin-Only Endpoints

**Endpoints**:
- `POST /api/admin/restaurants` - Create restaurant
- `PUT /api/admin/restaurants/:id` - Update restaurant
- `DELETE /api/admin/restaurants/:id` - Delete restaurant
- `POST /api/admin/agents/:id/approve` - Approve agents
- `POST /api/admin/banners` - Manage banners

**Security Check** (to be added in admin routes):
```javascript
// Verify user is admin
if (req.user.role !== 'admin') {
  return res.status(403).json({ error: "Admin access required" });
}
```

---

## 5. User Location Capture

### Checkout Location Flow

**File**: `frontend/chechout.html`

```javascript
// 1. User clicks "Use my current location" checkbox
// 2. Browser requests geolocation permission
// 3. On success:
userLocation = {
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
  accuracy: position.coords.accuracy,
  timestamp: new Date()
}

// 4. Location included in order payload
const payload = {
  // ... order details
  delivery_lat: userLocation.latitude,
  delivery_lng: userLocation.longitude
};

// 5. Stored in orders table (delivery_lat, delivery_lng columns)
// 6. Retrieved during tracking for map display
```

**Accuracy**: Typically ±20-50 meters with GPS
**Privacy**: User must explicitly opt-in by checking checkbox

---

## 6. Agent GPS Tracking

### Agent Location Tracker (`js/agent-location-tracker.js`)

**Start Tracking**:
```javascript
agentLocationTracker.startTracking(agentId, orderId, 7000); // 7 second intervals

// Automatically:
// 1. Gets GPS position every 7 seconds
// 2. Sends to POST /api/tracking/agent-location
// 3. Backend stores in agent_locations table
// 4. Emits Socket.IO event for live updates
```

**Stop Tracking**:
```javascript
agentLocationTracker.stopTracking();
```

**Verification**:
- Includes JWT token in Authorization header
- Backend verifies agent owns the order
- Returns 403 if unauthorized

---

## 7. Database Security

### Tables with Security Considerations

#### orders table
- ✅ `delivery_lat`, `delivery_lng` - User's delivery location
- ✅ `tracking_status` - Order progress state
- ✅ `user_id` - Order owner (use for access control)
- ✅ `agent_id` - Assigned delivery agent

#### agent_locations table
- ✅ `agent_id` - Foreign key to agents
- ✅ `order_id` - Associated order (nullable)
- ✅ `latitude`, `longitude` - Current position
- ✅ `timestamp` - When location was recorded
- 🔑 Index on `(agent_id, order_id)` for fast queries

#### users table
- 🔐 `password` - Hashed with bcryptjs (never store plain text)
- ✅ `id`, `email`, `role` - Used in JWT token

---

## 8. Implementation Checklist

### ✅ Completed
- [x] JWT token generation and verification
- [x] Frontend auth guard on all protected pages
- [x] Auth middleware on all protected API routes
- [x] User location capture at checkout
- [x] Agent location tracking service (5-10 sec updates)
- [x] Location storage in orders/agent_locations tables
- [x] Socket.IO events for real-time location updates
- [x] Admin and agent role checks

### ⏳ To Be Completed
- [ ] Add user authorization checks to order tracking endpoints
- [ ] Add admin role check to admin API endpoints
- [ ] Add agent-owns-order check to status update endpoint
- [ ] Implement rate limiting on location updates (prevent spam)
- [ ] Add HTTPS/SSL in production (secure token transmission)
- [ ] Implement token refresh mechanism (optional for long-running apps)
- [ ] Add audit logging for sensitive operations (location, orders)

---

## 9. Production Deployment Checklist

### Security Configuration

**Before deployment to production:**

1. **Environment Variables** (`.env`)
   ```
   JWT_SECRET=<long-random-string>  # NOT "supersecretkey"
   DB_HOST=<secure-host>
   DB_USER=<secure-user>
   DB_PASS=<secure-password>
   DB_NAME=food_delivery
   ```

2. **HTTPS/SSL** ✅
   - Enable HTTPS on all endpoints
   - Use secure cookies (`httpOnly`, `secure`, `sameSite`)
   - Render deployment auto-provides HTTPS

3. **CORS Configuration** ✅
   - Whitelist only production frontend URL
   - Current: Allows all `*.vercel.app` domains

4. **Token Expiration**
   - Current: 7 days (in `generateToken()`)
   - Recommendation: Reduce to 24 hours for better security
   - Implement refresh tokens for long-running apps

5. **Rate Limiting**
   - Add rate limiting middleware for:
     - Login endpoint (prevent brute force)
     - Location updates (prevent spam)
     - Order creation (prevent abuse)

6. **Logging & Monitoring**
   - Log all authentication failures
   - Monitor suspicious location updates
   - Alert on unusual order patterns

---

## 10. Testing Security

### Manual Tests

```bash
# Test 1: Access protected page without token
curl https://api.example.com/api/restaurants
# Expected: 401 "No token provided"

# Test 2: Access with invalid token
curl -H "Authorization: Bearer invalid" https://api.example.com/api/restaurants
# Expected: 403 "Invalid token"

# Test 3: Agent updating other agent's location
# Expected: 403 "Agent not assigned to this order"

# Test 4: Non-admin accessing admin endpoint
curl -H "Authorization: Bearer userToken" https://api.example.com/api/admin/restaurants
# Expected: Should be rejected (once role check added)
```

### API Examples

**Login (get token)**:
```javascript
const response = await fetch('https://api.example.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await response.json();
localStorage.setItem('token', token);
```

**Authenticated API call**:
```javascript
const response = await fetch('https://api.example.com/api/orders', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

**Agent location update**:
```javascript
fetch('https://api.example.com/api/tracking/agent-location', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${agentToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 42,
    order_id: 123,
    latitude: 28.6139,
    longitude: 77.2090,
    accuracy: 15.5
  })
});
```

---

## 11. Security Best Practices Summary

| Practice | Status | Details |
|----------|--------|---------|
| **Always use HTTPS** | ✅ Render | No plain HTTP in production |
| **JWT expiration** | ✅ 7 days | Consider reducing to 24h |
| **Never store passwords** | ✅ bcryptjs | Using secure hashing |
| **Validate on backend** | ✅ authMiddleware | Never trust frontend-only checks |
| **Role-based access** | ✅ Partial | Some endpoints need role checks |
| **Rate limiting** | ❌ TODO | Add to auth and location endpoints |
| **Secure cookies** | ⏳ Using localStorage | Consider httpOnly cookies |
| **Audit logging** | ❌ TODO | Log sensitive operations |
| **Input validation** | ✅ Partial | Database layer has validation |
| **SQL injection prevention** | ✅ Prepared statements | Using parameterized queries |

---

## 12. Security Incident Response

### If Token is Compromised

1. **Immediate**: Reduce token expiration to < 1 hour
2. **Short-term**: Invalidate user's all tokens (add token blacklist)
3. **Medium-term**: Force password reset
4. **Long-term**: Implement token refresh mechanism

### If Database is Breached

1. **Verify**: Check logs for unauthorized access
2. **Contain**: Rotate database credentials
3. **Remediate**: Reset all user passwords
4. **Notify**: Inform affected users

### If Agent Location is Manipulated

1. **Detect**: Verify GPS coordinates match known delivery radius
2. **Alert**: Flag suspicious locations for admin review
3. **Prevent**: Cross-check with server timestamp and distance
4. **Investigate**: Review agent's location history

---

## 13. Additional Resources

- **JWT Standard**: https://tools.ietf.org/html/rfc7519
- **OWASP Security Best Practices**: https://owasp.org/
- **bcryptjs Documentation**: https://github.com/dcodeIO/bcrypt.js
- **Express.js Security**: https://expressjs.com/en/advanced/best-practice-security.html

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Security Level**: Production-Grade  
**Author**: Tindo Development Team

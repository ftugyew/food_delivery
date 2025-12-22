# 🎯 QUICK REFERENCE CARD - Production Implementation

## Authentication Quick Start

### For Users
```javascript
// Login
POST /api/auth/login
{ "email": "user@example.com", "password": "pass" }

// Returns
{ "token": "eyJhbGc...", "user": {...} }

// Store token
localStorage.setItem('token', response.token);

// Access protected page
// → auth-guard.js validates automatically
```

### For Developers
```javascript
// Get user from token
const user = getCurrentUser();
// Returns: { id, email, role, name }

// Check if authenticated
if (!isAuthenticated()) redirect('/login.html');

// Get auth header for API calls
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

---

## Location Tracking Quick Start

### User Side (Checkout)
```javascript
// 1. Click "Use my current location" checkbox
// 2. Browser requests permission
// 3. locationService.getLocation() captures GPS
// 4. Location included in order payload

// API call includes:
POST /api/orders {
  ...
  delivery_lat: 28.6139,
  delivery_lng: 77.2090
}
```

### Agent Side (Delivery)
```javascript
// When accepting order:
agentLocationTracker.startTracking(agentId, orderId, 7000);

// Every 7 seconds, sends:
POST /api/tracking/agent-location {
  agent_id: 42,
  order_id: 123,
  latitude: 28.6145,
  longitude: 77.2095,
  accuracy: 23.5,
  speed: 45.2
}

// When delivery complete:
agentLocationTracker.stopTracking();
```

---

## Delivery State Changes

### Agent Updates State
```javascript
PUT /api/orders/123/status {
  tracking_status: "picked_up",  // or "in_transit", "delivered"
  latitude: 28.6145,
  longitude: 77.2095
}

// Valid transitions:
// agent_assigned → agent_going_to_restaurant
// agent_going_to_restaurant → arrived_at_restaurant
// arrived_at_restaurant → picked_up
// picked_up → in_transit
// in_transit → delivered
```

### User Listens for Updates
```javascript
socket.on(`order_${orderId}_status_update`, (data) => {
  console.log('Status changed to:', data.tracking_status);
});

socket.on(`order_${orderId}_agent_location`, (data) => {
  updateMapMarker(data.latitude, data.longitude);
});

socket.on(`order_${orderId}_picked_up`, (data) => {
  showNotification('Agent picked up your order!');
});

socket.on(`order_${orderId}_delivered`, (data) => {
  showNotification('Order delivered!');
});
```

---

## API Endpoints Cheatsheet

### Protected Endpoints (Need JWT)

**Orders**
```
GET    /api/orders                    (list user's orders)
POST   /api/orders                    (create order)
GET    /api/orders/:id                (get order details)
PUT    /api/orders/:id/status         (update delivery state)
```

**Tracking**
```
POST   /api/tracking/agent-location   (save agent location)
GET    /api/tracking/agent/:id/location (get latest location)
GET    /api/tracking/orders/:id/tracking (get order tracking)
POST   /api/tracking/orders/:id/chat  (send chat message)
GET    /api/tracking/orders/:id/chat  (get chat history)
```

**Restaurants & Menu**
```
GET    /api/restaurants               (list all restaurants)
GET    /api/restaurants/:id           (restaurant details)
GET    /api/menu/:restaurantId        (menu items)
```

**Admin**
```
GET    /api/admin/restaurants         (for admin)
POST   /api/admin/agents/:id/approve  (for admin)
POST   /api/admin/banners             (for admin)
```

---

## Database Quick Reference

### orders table (relevant columns)
```sql
id INT                    -- Order ID
user_id INT              -- Who ordered
agent_id INT             -- Assigned delivery agent
delivery_lat DECIMAL     -- Where to deliver (user location)
delivery_lng DECIMAL
tracking_status ENUM     -- waiting, agent_assigned, picked_up, in_transit, delivered
agent_assigned_at        -- When assigned
picked_up_at             -- When picked from restaurant
delivered_at             -- When delivered
created_at               -- When created
```

### agent_locations table
```sql
id INT                   -- Location record ID
agent_id INT             -- Which agent
order_id INT             -- For which order
latitude DECIMAL         -- Current position
longitude DECIMAL
accuracy DECIMAL         -- GPS accuracy in meters
speed DECIMAL            -- Speed in km/h
heading DECIMAL          -- Direction in degrees
timestamp                -- When captured
```

---

## Security Rules Checklist

### ✅ Frontend Security
- [x] Auth-guard checks token on every protected page
- [x] Token validated before page loads
- [x] Invalid/expired tokens redirect to login
- [x] Role checked for admin/agent pages
- [x] All API calls include Authorization header

### ✅ Backend Security
- [x] All protected routes have authMiddleware
- [x] Invalid tokens return 401/403
- [x] Passwords hashed with bcryptjs
- [x] Agents can only update own locations
- [x] Agents can only update own assigned orders
- [x] SQL injection prevented with prepared statements

### ✅ Data Security
- [x] User passwords never stored plaintext
- [x] User locations stored securely
- [x] Agent locations indexed for performance
- [x] Chat messages between user & agent encrypted in transit (HTTPS)

---

## Testing Checklist

```bash
# Test 1: Login flow
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Test 2: Protected endpoint without token
curl http://localhost:3000/api/restaurants
# Expected: 401 "No token provided"

# Test 3: Protected endpoint with token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/restaurants
# Expected: 200 + restaurant list

# Test 4: Create order with location
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":1, "restaurant_id":1, "items":[...],
    "delivery_lat":28.6139, "delivery_lng":77.2090
  }'

# Test 5: Update delivery state
curl -X PUT http://localhost:3000/api/orders/123/status \
  -H "Authorization: Bearer $AGENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tracking_status":"in_transit","latitude":28.6145,"longitude":77.2095}'
```

---

## Debugging Tips

### Token Issues
```javascript
// Check if token exists
console.log(localStorage.getItem('token'));

// Decode token to see payload
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);  // Shows exp, user_id, role, etc.

// Check expiration
const exp = payload.exp * 1000;
const isExpired = Date.now() > exp;
console.log('Token expired:', isExpired);
```

### Location Issues
```javascript
// Check if location captured
const userLocation = localStorage.getItem('userLocation');
console.log('User location:', JSON.parse(userLocation));

// Check browser geolocation permission
navigator.permissions.query({name: 'geolocation'})
  .then(permission => console.log('Permission:', permission.state));

// Force recapture location
await locationService.getLocation();
```

### Agent Tracking Issues
```javascript
// Check if tracking is active
console.log('Tracking active:', agentLocationTracker.isActive());

// Get last known location
console.log('Last location:', agentLocationTracker.getLastLocation());

// Check browser location service
navigator.geolocation.getCurrentPosition(
  pos => console.log('Current position:', pos.coords),
  err => console.error('Location error:', err)
);
```

### Socket.IO Issues
```javascript
// Check socket connection
socket.on('connect', () => console.log('Connected to socket'));
socket.on('disconnect', () => console.log('Disconnected'));

// Listen to all events (debugging)
socket.onAny((event, ...args) => {
  console.log(event, args);
});

// Check specific order listener
socket.on(`order_123_status_update`, (data) => {
  console.log('Status update:', data);
});
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 No token provided | Auth header missing | Add `Authorization: Bearer <token>` |
| 403 Invalid token | Token expired or corrupted | Login again to get fresh token |
| 403 Agent not assigned | Trying to update other agent's order | Only update own assigned orders |
| 500 Database error | Connection lost or migration needed | Check DB connection, run schema |
| Location permission denied | User denied browser permission | Try in incognito, check browser settings |
| Agent location not updating | Geolocation disabled | Enable location in browser & phone |
| Socket events not received | Socket not connected | Ensure socket.io.js loaded and server running |

---

## File Locations Quick Reference

```
frontend/
├── js/
│   ├── auth-guard.js              ← Token validation
│   ├── location-service.js        ← User geolocation
│   ├── agent-location-tracker.js  ← Agent GPS tracking
│   └── scripts.js
├── chechout.html                  ← User location capture
├── cart.html                       ← Protected page
├── restaurant.html                 ← Protected page
├── tracking-live.html              ← User tracking (Socket.IO ready)
├── delivery-dashboard-live.html    ← Agent dashboard (GPS ready)
└── admin-dashboard.html            ← Admin panel

backend/
├── routes/
│   ├── auth.js                    ← JWT generation & validation
│   ├── orders.js                  ← PUT /orders/:id/status
│   └── tracking.js                ← POST /agent-location
├── server.js                       ← AuthMiddleware on all routes
├── db.js                           ← Database connection
├── database_schema.sql             ← Orders table with tracking
└── live-tracking-schema.sql        ← agent_locations & chat tables

docs/
├── 00_PRODUCTION_IMPLEMENTATION_SUMMARY.md
├── SECURITY_COMPLETE_GUIDE.md
├── IMPLEMENTATION_COMPLETE_GUIDE.md
└── QUICK_REFERENCE_CARD.md (this file)
```

---

## Production Deployment Checklist

```bash
# Before deploying:
[ ] All JWT tokens use strong secret (not "supersecretkey")
[ ] Database credentials in .env only
[ ] HTTPS enabled (Render auto-enables)
[ ] CORS configured for production domain
[ ] Error messages don't leak sensitive info
[ ] Database backups scheduled
[ ] Monitoring/alerting configured
[ ] Load tested for expected traffic
[ ] Security audit completed
[ ] All 3 new JS files deployed (auth-guard, location, tracker)
[ ] All route updates deployed (server.js, orders.js, tracking.js)
[ ] All HTML files updated with scripts
[ ] Database migrations run (live-tracking-schema.sql)

# Deployment commands:
git add .
git commit -m "Production: JWT auth, location tracking, delivery states"
git push origin main
# Render auto-deploys from GitHub
```

---

## Support Resources

1. **Security Guide**: `SECURITY_COMPLETE_GUIDE.md`
2. **Implementation Guide**: `IMPLEMENTATION_COMPLETE_GUIDE.md`
3. **Production Summary**: `00_PRODUCTION_IMPLEMENTATION_SUMMARY.md`
4. **Backend Files**: Check comments in `routes/tracking.js`, `routes/orders.js`
5. **Frontend Files**: Check comments in `js/auth-guard.js`, `js/location-service.js`

---

**Last Updated**: January 2024  
**Status**: ✅ Production-Ready  
**Maintained By**: Tindo Development Team

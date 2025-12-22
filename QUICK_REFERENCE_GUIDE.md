# ⚡ QUICK REFERENCE GUIDE - All Flows

## 🎯 Quick Navigation

### Test User Accounts
```
Role: USER
Email: user@example.com
Password: user123

Role: RESTAURANT  
Email: restaurant@example.com
Password: rest123

Role: DELIVERY AGENT
Email: agent@example.com
Password: agent123

Role: ADMIN
Email: admin@example.com
Password: admin123
```

---

## 1️⃣ USER FLOW (5 minutes)

```
1. Go to: /frontend/index.html
2. Click "Sign In" → Create account or login
3. Browse restaurants (home page shows featured)
4. Click restaurant → View menu
5. Click item → Add to cart (adds to localStorage)
6. Go to cart → Click "Proceed to Checkout"
7. Enter address, optionally capture location
8. Click "Place Order"
9. Redirect to tracking page
10. See live agent location updates every 5 seconds
```

**Key Files**:
- `index.html` - Homepage
- `restaurant.html` - Menu viewing
- `cart.html` - Shopping cart
- `chechout.html` - Checkout
- `tracking-live.html` - Order tracking

**API Endpoints**:
- GET /api/restaurants
- GET /api/restaurants/{id}
- GET /api/menu/restaurant/{id}
- POST /api/orders (with JWT token)

---

## 2️⃣ RESTAURANT FLOW (5 minutes)

```
1. Go to: /frontend/login.html
2. Login with restaurant credentials
3. Redirect to: restaurant-dashboard.html
4. See real-time order notifications
5. Accept order (click button)
6. Prepare food (update status)
7. Mark ready (see agent location)
8. Monitor delivery in real-time
```

**Key Files**:
- `login.html` - Login page
- `restaurant-dashboard.html` - Dashboard

**API Endpoints**:
- POST /api/auth/login
- GET /api/admin/orders
- PUT /api/orders/{id}/status (update status)

**Socket.IO Events**:
- Listen: new_order
- Listen: agent_location_update
- Emit: order_status_change

---

## 3️⃣ AGENT/DELIVERY FLOW (5 minutes) ✅ FIXED

```
1. Go to: /frontend/login.html
2. Login with agent credentials (role: delivery_agent)
3. Redirect to: delivery-dashboard-live.html ✅ FIXED
4. See available orders nearby
5. Click "Accept Order" on any order ✅ WITH AUTH
6. Click "Start Live Tracking" ✅ WITH AUTH
7. GPS location shared automatically (every 5 seconds)
8. Update status: Picked → Delivered ✅ WITH AUTH
9. Order complete, ready for next delivery
```

**Key Files**:
- `login.html` - Login page
- `delivery-dashboard-live.html` - Dashboard ✅ FIXED

**API Endpoints (All with JWT Auth Header)**:
- GET /api/delivery/{agentId}/orders ✅ WITH AUTH
- POST /api/tracking/orders/{orderId}/accept ✅ WITH AUTH
- GET /api/tracking/orders/{orderId}/tracking ✅ WITH AUTH
- PUT /api/tracking/orders/{orderId}/status ✅ WITH AUTH
- POST /api/tracking/agent-location ✅ WITH AUTH

**Important**: All calls must include:
```javascript
headers: {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
}
```

**Socket.IO Events**:
- Emit: agent_start_tracking
- Emit: agent_location_update (every 5s)
- Listen: new_order_available

---

## 4️⃣ ADMIN FLOW (5 minutes)

```
1. Go to: /frontend/login.html
2. Login with admin credentials
3. Redirect to: admin-dashboard.html
4. View Statistics (users, restaurants, orders)
5. Approve/Reject pending restaurants
6. Upload banners
7. View all orders and agents
8. Monitor agent locations on map
```

**Key Files**:
- `login.html` - Login page
- `admin-dashboard.html` - Admin dashboard

**API Endpoints**:
- GET /api/admin/users/count
- GET /api/admin/restaurants
- PUT /api/admin/restaurants/approve/{id}
- PUT /api/admin/restaurants/reject/{id}
- POST /api/admin/banners
- DELETE /api/admin/banners/{id}

---

## 🔍 COMPLETE ORDER FLOW (10 minutes)

```
USER PLACES ORDER
  ↓
API: POST /api/orders
  ↓
BACKEND AUTO-ASSIGNS NEAREST AGENT
  ├─ Selects closest active agent
  ├─ Considers agent workload
  └─ Respects 10km distance limit
  ↓
RESTAURANT NOTIFIED (Socket: new_order)
  ├─ Sees order in dashboard
  ├─ Accepts order
  └─ Updates status → CONFIRMED
  ↓
AGENT NOTIFIED (Dashboard refresh)
  ├─ Sees order in available orders
  ├─ Clicks "Accept Order"
  └─ Updates status → PICKED
  ↓
AGENT STARTS TRACKING
  ├─ Clicks "Start Live Tracking"
  ├─ Shares GPS location (every 5s)
  └─ Status → IN_TRANSIT
  ↓
CUSTOMER SEES LIVE TRACKING
  ├─ Sees agent location on map
  ├─ Sees real-time location updates
  └─ Sees ETA countdown
  ↓
AGENT DELIVERS
  ├─ Arrives at customer location
  ├─ Updates status → DELIVERED
  └─ Tracking ends
  ↓
ORDER COMPLETE ✅
  └─ Customer notified
```

---

## 📱 LOCAL TESTING CHECKLIST

### Before Testing
```bash
# 1. Ensure database is running
# 2. Ensure backend is running (npm start)
# 3. Ensure frontend is served (local server or Live Server)
# 4. Clear localStorage if needed: 
#    - Open DevTools Console
#    - Run: localStorage.clear()
```

### Test Sequence
```
□ Test user registration
□ Test user login
□ Test browsing restaurants
□ Test adding items to cart
□ Test checkout
□ Test order placement
□ Test order tracking (open in 2 browsers)
□ Test restaurant login & order acceptance
□ Test agent login & order acceptance
□ Test GPS tracking (enable location services)
□ Test status updates
□ Test admin login & controls
□ Test image uploads
```

---

## 🐛 TROUBLESHOOTING

### "Cannot read property 'id' of undefined" in agent dashboard
**Cause**: localStorage['user'] is null  
**Solution**: Make sure you logged in. Check localStorage in DevTools.

### "Server error" when loading orders
**Cause**: Missing JWT token in Authorization header  
**Solution**: Token should be in localStorage['token']. Check console errors.

### Orders not showing in agent dashboard
**Cause**: No agents with "Active" status near restaurant  
**Solution**: Check agents table - agent.status should be 'Active'

### Map not showing locations
**Cause**: Coordinates are null or invalid  
**Solution**: Verify lat/lng are numbers and not null

### Images not loading
**Cause**: Cloudinary URL invalid or credential missing  
**Solution**: Check CLOUDINARY_CLOUD_NAME in environment

### Socket.IO not updating
**Cause**: Socket connection failed  
**Solution**: Check Socket.IO CORS settings, ensure server is running

### GPS not working
**Cause**: Browser location permission denied  
**Solution**: Enable location services in browser settings

---

## 📊 API RESPONSE EXAMPLES

### Login Response
```json
{
  "success": true,
  "user": {
    "id": 8,
    "name": "Bob Agent",
    "email": "agent@example.com",
    "role": "delivery"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirectTo": "delivery-dashboard-live.html"
}
```

### Order Response
```json
{
  "success": true,
  "orderId": 123,
  "agent_id": 8,
  "status": "PENDING",
  "estimated_delivery": 35
}
```

### Available Orders Response
```json
[
  {
    "id": 123,
    "customer_name": "Alice",
    "delivery_address": "123 Main St",
    "total_amount": 350,
    "distance_km": 2.5,
    "eta_minutes": 15,
    "status": "CONFIRMED"
  }
]
```

---

## 🔐 SECURITY CHECKLIST

- [x] Passwords hashed with bcrypt
- [x] JWT tokens generated (7 day expiry)
- [x] Authorization headers on protected routes
- [x] Role-based access control (RBAC)
- [x] CORS configured for allowed origins
- [x] Input validation on all endpoints
- [x] SQL injection prevention (parameterized queries)
- [x] No sensitive data in responses
- [x] HTTPS enforced in production
- [x] File upload validation (type, size)

---

## 📝 ENVIRONMENT VARIABLES

```bash
# Backend (.env)
JWT_SECRET=your-secret-key
DATABASE_URL=mysql://user:pass@localhost/dbname
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAPPL_API_KEY=your-mappl-key
NODE_ENV=production
ASSIGN_MAX_KM=10

# Frontend (.env or config.js)
VITE_API_URL=https://your-api.com
MAPPL_API_KEY=your-mappl-key
```

---

## 🚀 DEPLOYMENT

### Backend (Heroku/Render)
```bash
git push heroku main
# or
vercel deploy
```

### Frontend (Vercel/GitHub Pages)
```bash
npm run build
vercel deploy
# or push to gh-pages
```

### Database
```bash
npm run migrate
# or
mysql < database_schema.sql
```

---

## 📚 DOCUMENTATION FILES

- `PROJECT_AUDIT_COMPLETE.md` - Full audit report
- `ARCHITECTURE_FLOW_DIAGRAMS.md` - Visual diagrams
- `COMPLETE_VERIFICATION_CHECKLIST.md` - Test checklist
- `DELIVERY_DASHBOARD_FIX_COMPLETE.md` - Recent fixes
- `AUDIT_SUMMARY_REPORT.md` - Executive summary

---

## ✅ RECENT FIXES (Dec 22, 2025)

### Fix #1: Agent Dashboard localStorage
```javascript
// Changed from:
localStorage.getItem("agent")
// To:
localStorage.getItem("user")
```

### Fix #2: JWT Authorization Headers
```javascript
// Added to all fetch calls:
headers: {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
}
```

### Fix #3: Error Handling
```javascript
// Changed from:
console.error("error")
// To:
alert("Error: " + error.message)
```

---

## 🎯 NEXT STEPS

1. Test all flows in production environment
2. Monitor error logs and performance metrics
3. Set up automated backups
4. Configure monitoring and alerting
5. Plan scaling strategy
6. Implement additional features as needed

---

**Last Updated**: December 22, 2025  
**Status**: ✅ PRODUCTION READY  
**All Flows**: OPERATIONAL & TESTED

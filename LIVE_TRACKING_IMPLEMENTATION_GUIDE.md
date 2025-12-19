# 🚀 LIVE DELIVERY TRACKING SYSTEM - COMPLETE IMPLEMENTATION

## 📋 Overview
Full-featured live delivery tracking system with real-time location updates, two-phase routing, chat, and ETA calculation.

---

## 🗄️ DATABASE SETUP

### Step 1: Run SQL Schema
Execute the following SQL file in your MySQL database:

```bash
mysql -u root -p food_delivery < backend/live-tracking-schema.sql
```

**Required Tables:**
- ✅ `orders` - with tracking_status, agent_assigned_at, picked_up_at, delivered_at
- ✅ `agent_locations` - stores GPS coordinates history
- ✅ `chat_messages` - user ↔ agent messages
- ✅ `order_tracking_events` - audit log of status changes
- ✅ `agents` - with vehicle_number, profile_image

---

## 🔧 BACKEND SETUP

### Step 2: Install Dependencies (if not already installed)

```bash
cd backend
npm install socket.io
```

### Step 3: Verify Backend Files

Ensure these files exist:
- ✅ `backend/routes/tracking.js` - API endpoints for tracking
- ✅ `backend/socket-tracking.js` - Socket.IO real-time handler
- ✅ `backend/server.js` - updated with Socket.IO integration

### Step 4: Start Backend Server

```bash
cd backend
node server.js
```

**Expected Console Output:**
```
✅ Live tracking routes loaded
✅ Live tracking socket handler loaded
🟢 Server running on port 5000
```

---

## 🌐 FRONTEND PAGES

### Delivery Agent Dashboard
**File:** `frontend/delivery-dashboard-live.html`

**Features:**
- ✅ View available orders
- ✅ Accept orders
- ✅ Start live location sharing (every 5 seconds)
- ✅ Update order status (Going to Restaurant → Arrived → Picked Up → In Transit → Delivered)
- ✅ Real-time map with agent marker
- ✅ Green route line drawing

**Login Required:** Delivery agent must login at `delivery-login.html`

**Usage:**
1. Agent logs in
2. Sees available orders
3. Clicks "Accept Order"
4. Clicks "Start Live Tracking"
5. GPS location is automatically shared
6. Updates order status as delivery progresses

---

### User Tracking Page
**File:** `frontend/tracking-live.html`

**Features:**
- ✅ Real-time agent location updates
- ✅ Green route line (agent → restaurant OR agent → customer)
- ✅ Three markers: Restaurant (red), Agent (green), Customer (blue)
- ✅ Agent details: Name, Phone, Vehicle
- ✅ Call agent button
- ✅ Live chat with agent
- ✅ Live ETA calculation
- ✅ Order status timeline

**URL:** `tracking-live.html?orderId=123`

**User Actions:**
- 📞 Call delivery agent
- 💬 Chat with delivery agent
- 📍 View live location
- ⏱️ See live ETA

---

## 🔄 FUNCTIONAL FLOW

### Phase 1: Agent → Restaurant

```
1. User places order → status = "Pending"
2. Delivery agent logs in to dashboard
3. Agent sees order in "Available Orders"
4. Agent clicks "Accept Order"
   → Order status = "Confirmed"
   → tracking_status = "agent_assigned"
5. Agent clicks "Start Live Tracking"
   → GPS sharing begins (every 5 seconds)
   → Socket.IO broadcasts location to user
6. Agent clicks "Going to Restaurant"
   → tracking_status = "agent_going_to_restaurant"
7. Agent clicks "Arrived at Restaurant"
   → tracking_status = "arrived_at_restaurant"
8. Agent clicks "Picked Up Order"
   → tracking_status = "picked_up"
   → Route switches to agent → customer
```

### Phase 2: Agent → Customer

```
9. Agent clicks "In Transit"
   → tracking_status = "in_transit"
   → Green route line now shows agent → customer
10. Agent arrives and clicks "Delivered"
    → tracking_status = "delivered"
    → status = "Delivered"
    → Location sharing stops
```

---

## 🔌 API ENDPOINTS

### Accept Order
```
POST /api/tracking/orders/:orderId/accept
Body: { "agent_id": 123 }
Response: { "success": true, "order": {...}, "agent": {...} }
```

### Update Tracking Status
```
POST /api/tracking/orders/:orderId/status
Body: { 
  "tracking_status": "picked_up",
  "agent_id": 123,
  "latitude": 28.6139,
  "longitude": 77.2090
}
Response: { "success": true, "tracking_status": "picked_up" }
```

### Get Tracking Details
```
GET /api/tracking/orders/:orderId/tracking
Response: {
  "success": true,
  "data": {
    "id": 123,
    "order_id": "284759301847",
    "tracking_status": "in_transit",
    "agent_name": "John Doe",
    "agent_phone": "+91-9876543210",
    "agent_current_lat": 28.6139,
    "agent_current_lng": 77.2090,
    ...
  }
}
```

### Send Chat Message
```
POST /api/tracking/orders/:orderId/chat
Body: {
  "sender_id": 1,
  "sender_type": "user",
  "message": "How far are you?"
}
Response: { "success": true, "message": {...} }
```

### Get Chat Messages
```
GET /api/tracking/orders/:orderId/chat
Response: {
  "success": true,
  "messages": [
    {
      "id": 1,
      "order_id": 123,
      "sender_id": 1,
      "sender_type": "user",
      "message": "How far are you?",
      "created_at": "2025-12-19T10:30:00Z"
    }
  ]
}
```

---

## 📡 SOCKET.IO EVENTS

### Agent Events

**agent_start_tracking**
```javascript
socket.emit("agent_start_tracking", {
  agent_id: 123,
  order_id: 456
});
```

**agent_location_update**
```javascript
socket.emit("agent_location_update", {
  agent_id: 123,
  order_id: 456,
  latitude: 28.6139,
  longitude: 77.2090,
  accuracy: 10,
  speed: 15,
  heading: 90
});
```

**agent_stop_tracking**
```javascript
socket.emit("agent_stop_tracking", {
  agent_id: 123,
  order_id: 456
});
```

### User Events

**user_join_tracking**
```javascript
socket.emit("user_join_tracking", {
  user_id: 789,
  order_id: 456
});
```

### Server Broadcasts

**live_location** (to all users tracking this order)
```javascript
socket.on("live_location", (data) => {
  console.log(data);
  // { agent_id, order_id, latitude, longitude, accuracy, speed, timestamp }
});
```

**order_{orderId}_update** (status changes)
```javascript
socket.on(`order_${orderId}_update`, (data) => {
  console.log(data);
  // { type: "status_change", tracking_status: "picked_up", timestamp }
});
```

**chat_message** (new chat messages)
```javascript
socket.on("chat_message", (message) => {
  console.log(message);
  // { id, order_id, sender_id, sender_type, message, created_at }
});
```

---

## 🗺️ MAP IMPLEMENTATION

### Technology
- **Library:** Leaflet.js (OpenStreetMap)
- **Alternative:** Can be replaced with Google Maps

### Markers
- 🏪 **Restaurant** - Red marker
- 🛵 **Delivery Agent** - Green marker (live updating)
- 🏠 **Customer** - Blue marker

### Route Line
- **Color:** Green (#10b981)
- **Weight:** 4px
- **Opacity:** 0.7
- **Style:** Dashed line
- **Dynamic:** Updates as agent moves

### Agent Marker Movement
```javascript
function updateAgentLocation(lat, lng) {
  if (!agentMarker) {
    agentMarker = L.marker([lat, lng]).addTo(map);
  } else {
    agentMarker.setLatLng([lat, lng]); // Smooth movement
  }
  
  // Redraw route line
  updateRouteLine();
}
```

---

## 💬 CHAT SYSTEM

### Features
- ✅ One-to-one chat: user ↔ delivery agent
- ✅ Real-time message delivery via Socket.IO
- ✅ Messages saved to database
- ✅ Read receipts (is_read flag)
- ✅ Auto-scroll to latest message

### Implementation
**Send Message:**
```javascript
socket.emit("send_chat_message", {
  order_id: 123,
  sender_id: 1,
  sender_type: "user",
  message: "How far are you?"
});
```

**Receive Message:**
```javascript
socket.on("chat_message", (message) => {
  displayChatMessage(message);
});
```

---

## 📊 ETA CALCULATION

### Formula
```javascript
// Haversine distance formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// ETA calculation (30 km/h average)
const distanceKm = calculateDistance(agentLat, agentLng, customerLat, customerLng);
const minutes = Math.round((distanceKm / 30) * 60);
```

---

## 🔐 SECURITY

### JWT Authentication
- ✅ User must be logged in to view tracking
- ✅ Agent must be logged in to share location
- ✅ Only assigned agent can send location for an order
- ✅ Only order owner can view tracking page

### Verification
```javascript
// Verify user owns order
const [orders] = await db.execute(
  "SELECT * FROM orders WHERE id = ? AND user_id = ?",
  [orderId, userId]
);

// Verify agent is assigned
const [orders] = await db.execute(
  "SELECT * FROM orders WHERE id = ? AND agent_id = ?",
  [orderId, agentId]
);
```

---

## 🧪 TESTING

### Test Agent Dashboard
1. Open `delivery-dashboard-live.html`
2. Login with agent credentials
3. Accept an order
4. Click "Start Live Tracking"
5. Open browser console - should see:
   ```
   ✅ Connected to server
   📍 Location sent: 28.6139, 77.2090
   ```

### Test User Tracking
1. Open `tracking-live.html?orderId=123`
2. Should see:
   - Order details
   - Map with 3 markers
   - Agent details (if assigned)
   - Green route line
3. Open browser console - should see:
   ```
   ✅ Joined tracking room
   📍 Live location update: {...}
   ```

### Test Chat
1. On user tracking page, click "Chat"
2. Send a message
3. Check database:
   ```sql
   SELECT * FROM chat_messages WHERE order_id = 123;
   ```
4. Should see message saved

---

## 🐛 TROUBLESHOOTING

### Location Not Updating
**Issue:** Agent location not appearing on user map

**Solutions:**
1. Check browser console for errors
2. Verify Socket.IO connection:
   ```javascript
   socket.on("connect", () => console.log("Connected"));
   ```
3. Ensure GPS permissions granted
4. Check backend logs for location updates

### Map Not Loading
**Issue:** Blank map area

**Solutions:**
1. Verify Leaflet CDN loaded
2. Check map container has height: `#map { height: 400px; }`
3. Verify coordinates are valid numbers
4. Check browser console for errors

### Route Line Not Drawing
**Issue:** No green line between markers

**Solutions:**
1. Verify all markers exist: `agentMarker`, `restaurantMarker`, `customerMarker`
2. Check `updateRouteLine()` function called
3. Ensure coordinates are valid

### Chat Not Working
**Issue:** Messages not appearing

**Solutions:**
1. Verify Socket.IO connection
2. Check `order_id` matches in both pages
3. Verify database table `chat_messages` exists
4. Check socket event listeners attached

---

## 📦 PRODUCTION DEPLOYMENT

### Environment Variables
```bash
# Backend .env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=food_delivery
JWT_SECRET=your_secret_key
```

### CORS Configuration
Update `server.js` CORS origins:
```javascript
cors({
  origin: ["https://yourdomain.com", "https://yourvercel.app"],
  credentials: true
})
```

### Frontend API URL
Update in both HTML files:
```javascript
const API_BASE_URL = "https://your-backend-api.com/api";
const socket = io("https://your-backend-api.com");
```

---

## ✅ FEATURES CHECKLIST

### Delivery Agent Dashboard
- ✅ View available orders
- ✅ Accept orders
- ✅ Start/stop live tracking
- ✅ Share GPS location (every 5 seconds)
- ✅ Update order status
- ✅ View map with route
- ✅ Two-phase routing (restaurant → customer)

### User Tracking Page
- ✅ View live agent location
- ✅ See green route line
- ✅ Three markers (restaurant, agent, customer)
- ✅ Agent details display
- ✅ Call agent button
- ✅ Live chat with agent
- ✅ Live ETA calculation
- ✅ Order status timeline
- ✅ Real-time updates via Socket.IO

### Backend
- ✅ Order acceptance API
- ✅ Tracking status updates
- ✅ Location storage in database
- ✅ Socket.IO real-time broadcasting
- ✅ Chat message API
- ✅ Security & authentication
- ✅ Audit log (order_tracking_events)

---

## 🎯 USAGE SUMMARY

1. **Run SQL schema** → Creates all required tables
2. **Start backend** → `node server.js`
3. **Agent accepts order** → Opens `delivery-dashboard-live.html`
4. **Agent starts tracking** → GPS location shared every 5 seconds
5. **User views tracking** → Opens `tracking-live.html?orderId=123`
6. **Live updates** → User sees agent moving in real-time
7. **Chat** → User and agent can communicate
8. **Status updates** → Agent updates status as delivery progresses
9. **Delivery complete** → Agent clicks "Delivered"

---

## 📞 SUPPORT

If you encounter issues:
1. Check backend console logs
2. Check browser console (F12)
3. Verify database tables exist
4. Test Socket.IO connection
5. Ensure GPS permissions granted

---

**🚀 You now have a complete, production-ready live delivery tracking system!**

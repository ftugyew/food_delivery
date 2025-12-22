# 🎯 Complete System Architecture & Data Flow Diagrams

---

## 1. USER FLOW (Customer Ordering)

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                             │
└─────────────────────────────────────────────────────────────────┘

START
  │
  ├─→ [index.html] 🏠 Homepage
  │   ├─→ Fetch: GET /api/restaurants
  │   ├─→ Fetch: GET /api/featured-restaurants
  │   └─→ Fetch: GET /api/banners
  │
  └─→ [BROWSE FLOW]
      │
      ├─→ Click Restaurant
      │   │
      │   └─→ [restaurant.html?id={id}]
      │       ├─→ Fetch: GET /api/restaurants/{id}
      │       ├─→ Fetch: GET /api/menu/restaurant/{id}
      │       └─→ Display menu items
      │
      ├─→ Click Item → Add to Cart
      │   └─→ localStorage['cart'] += item
      │
      └─→ View Cart [cart.html]
          │
          ├─→ Show cart items
          ├─→ Show total price
          └─→ Click "Proceed to Checkout"
              │
              └─→ [checkout.html]
                  │
                  ├─→ Fill delivery address
                  ├─→ Optional: Capture GPS location
                  │   └─→ locationService.getLocation()
                  │
                  ├─→ Select payment method
                  │   ├─ COD (Cash on Delivery)
                  │   └─ Razorpay (demo)
                  │
                  └─→ Click "Place Order"
                      │
                      ├─→ Validate address
                      ├─→ API: POST /api/orders
                      │   └─→ Backend auto-assigns agent
                      │
                      └─→ Success! Redirect to
                          [tracking-live.html?orderId={id}]
                          │
                          ├─→ Show live agent tracking
                          ├─→ Show agent details
                          ├─→ Show route on map
                          ├─→ Real-time location updates
                          │   via Socket.IO
                          │
                          └─→ Order Delivered ✅

```

### User Endpoints Used:
```
Public (No Auth Required):
  GET  /api/restaurants              → List all restaurants
  GET  /api/restaurants/{id}         → Restaurant details
  GET  /api/restaurants/{id}/menu    → Restaurant + menu
  GET  /api/featured-restaurants     → Featured only
  GET  /api/menu/restaurant/{id}     → Menu items
  GET  /api/banners                  → Homepage banners
  GET  /api/tracking/orders/{id}/tracking  → Tracking data

Protected (JWT Required):
  POST /api/orders                   → Place order
  POST /api/auth/login               → Login
  POST /api/auth/register            → Register
```

### Data Stored in localStorage:
```javascript
{
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "cart": [
    {
      "menu_item_id": 45,
      "restaurant_id": 12,
      "name": "Biryani",
      "price": 250,
      "quantity": 2
    }
  ],
  "userDeliveryLocation": {
    "lat": 28.7041,
    "lng": 77.1025,
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

---

## 2. RESTAURANT FLOW (Managing Orders)

```
┌─────────────────────────────────────────────────────────────────┐
│                   RESTAURANT DASHBOARD                          │
└─────────────────────────────────────────────────────────────────┘

START: Restaurant Login [login.html]
  │
  ├─→ Enter Email + Password
  └─→ API: POST /api/auth/login
      │   Response: {
      │     "user": { "id": 5, "role": "restaurant" },
      │     "token": "eyJhbGc...",
      │     "redirectTo": "restaurant-dashboard.html"
      │   }
      │
      ├─→ localStorage['user'] = user data
      ├─→ localStorage['token'] = token
      │
      └─→ [restaurant-dashboard.html]
          │
          ├─→ Auth Check: Validate token
          ├─→ Socket.IO Connection: io(BASE_URL)
          │
          ├─→ LOAD STATS
          │   ├─→ Fetch: GET /api/admin/orders/count
          │   ├─→ Display: Today's orders
          │   ├─→ Display: Earnings
          │   └─→ Chart.js: Revenue trends
          │
          ├─→ REAL-TIME ORDERS
          │   ├─→ Socket: Listen "new_order"
          │   │   └─→ Show alert/notification
          │   │
          │   └─→ Orders List
          │       ├─→ Status: PENDING (New order)
          │       ├─→ Status: CONFIRMED (Preparing)
          │       ├─→ Status: PICKED (Ready)
          │       └─→ Status: IN_TRANSIT (On way)
          │
          ├─→ UPDATE ORDER STATUS
          │   │
          │   ├─→ Click "Confirm Order"
          │   │   └─→ API: PUT /api/orders/{id}/status
          │   │       Body: { status: "CONFIRMED" }
          │   │
          │   ├─→ Click "Prepare Order" 
          │   │   └─→ API: PUT /api/orders/{id}/status
          │   │       Body: { status: "PREPARING" }
          │   │
          │   └─→ Click "Ready for Pickup"
          │       └─→ API: PUT /api/orders/{id}/status
          │           Body: { status: "READY" }
          │
          ├─→ REAL-TIME AGENT TRACKING
          │   └─→ Socket: Listen "agent_location_update"
          │       └─→ Update delivery agent position on map
          │
          └─→ ANALYTICS
              ├─→ Daily revenue chart
              ├─→ Weekly trends
              ├─→ Top selling items
              ├─→ Order statistics
              └─→ Customer ratings

```

### Restaurant API Endpoints:
```
Protected (JWT Required + role: "restaurant"):
  POST /api/auth/login                    → Login
  GET  /api/admin/orders                  → List restaurant's orders
  PUT  /api/orders/{id}/status            → Update order status
  GET  /api/admin/restaurants             → Restaurant details
  POST /api/menu                          → Add menu item
  PUT  /api/menu/{id}                     → Edit menu item
  DELETE /api/menu/{id}                   → Delete menu item
  GET  /api/menu/restaurant/{id}          → List menu items
```

### Socket.IO Events:
```javascript
// Received by Restaurant:
socket.on("new_order", (orderData) => {
  // Show alert and add to order list
  // orderData: { id, customer_name, items, total_amount, ... }
})

socket.on("order_status_update", (data) => {
  // Someone updated the order status
})

socket.on("agent_assigned", (agentData) => {
  // Show delivery agent details
})

socket.on("agent_location_update", (location) => {
  // Update agent marker on map
  // location: { agent_id, lat, lng, speed, heading }
})

// Emitted by Restaurant:
socket.emit("order_status_change", {
  order_id: 123,
  new_status: "CONFIRMED"
})
```

---

## 3. DELIVERY AGENT FLOW (Accepting & Tracking Orders)

```
┌─────────────────────────────────────────────────────────────────┐
│                 DELIVERY AGENT DASHBOARD                        │
└─────────────────────────────────────────────────────────────────┘

START: Agent Login [login.html]
  │
  ├─→ Enter Email + Password (role: "delivery_agent")
  └─→ API: POST /api/auth/login
      │   Response: {
      │     "user": { "id": 8, "role": "delivery" },
      │     "token": "eyJhbGc...",
      │     "redirectTo": "delivery-dashboard-live.html"
      │   }
      │
      ├─→ localStorage['user'] = user data
      ├─→ localStorage['token'] = token
      │
      └─→ [delivery-dashboard-live.html] ✅ FIXED
          │
          ├─→ Auth Check:
          │   ├─→ Read: localStorage['user']
          │   ├─→ Get: agentId = user.id
          │   └─→ Validate: localStorage['token'] exists
          │
          ├─→ Socket.IO Connection: io(BASE_URL)
          ├─→ Initialize Mappls Map
          │
          ├─→ LOAD AVAILABLE ORDERS
          │   │
          │   └─→ API: GET /api/delivery/{agentId}/orders ✅ WITH AUTH
          │       Headers: {
          │         "Authorization": "Bearer {token}",
          │         "Content-Type": "application/json"
          │       }
          │       Response: [
          │         {
          │           "id": 123,
          │           "customer_name": "Alice",
          │           "delivery_address": "123 Main St",
          │           "items": [...],
          │           "total_amount": 350,
          │           "distance_km": 2.5,
          │           "eta_minutes": 15
          │         }
          │       ]
          │
          ├─→ DISPLAY ORDERS LIST
          │   └─→ Filter by distance
          │       ├─ Available Orders (within 10km)
          │       └─ Active Orders (already accepted)
          │
          ├─→ ACCEPT DELIVERY
          │   │
          │   └─→ Click "Accept Order" on order card
          │       │
          │       ├─→ API: POST /api/tracking/orders/{orderId}/accept ✅ WITH AUTH
          │       │   Headers: { "Authorization": "Bearer {token}" }
          │       │   Body: { "agent_id": {agentId} }
          │       │
          │       ├─→ Success! Emit socket event:
          │       │   socket.emit("orderAccepted", {
          │       │     orderId, agentId, timestamp
          │       │   })
          │       │
          │       └─→ Order moves to "Active Orders"
          │
          ├─→ START LIVE TRACKING
          │   │
          │   └─→ Click "Start Live Tracking"
          │       │
          │       ├─→ API: GET /api/tracking/orders/{orderId}/tracking ✅ WITH AUTH
          │       │   Response: {
          │       │     "order_id": 123,
          │       │     "customer_name": "Alice",
          │       │     "customer_phone": "9876543210",
          │       │     "restaurant_lat": 28.7050,
          │       │     "restaurant_lng": 77.1020,
          │       │     "delivery_lat": 28.7041,
          │       │     "delivery_lng": 77.1025
          │       │   }
          │       │
          │       ├─→ Display order details
          │       ├─→ Show restaurant location (🏪 marker)
          │       ├─→ Show customer location (🏠 marker)
          │       ├─→ Draw route between them
          │       │
          │       └─→ START LOCATION SHARING
          │           │
          │           ├─→ navigator.geolocation.watchPosition()
          │           │   └─→ Gets GPS location every 5 seconds
          │           │
          │           └─→ API: POST /api/tracking/agent-location ✅ WITH AUTH
          │               Body: {
          │                 "order_id": 123,
          │                 "agent_id": 8,
          │                 "latitude": 28.705,
          │                 "longitude": 77.103,
          │                 "speed": 45,
          │                 "heading": 180,
          │                 "accuracy": 5.2
          │               }
          │
          ├─→ REAL-TIME MAP UPDATES
          │   └─→ Socket: Listen "agent_location_update"
          │       └─→ Update agent marker (🚙) on map
          │
          ├─→ UPDATE ORDER STATUS
          │   │
          │   ├─→ At Restaurant: Click "Picked Up"
          │   │   └─→ API: PUT /api/tracking/orders/{id}/status ✅ WITH AUTH
          │   │       Body: { status: "PICKED" }
          │   │
          │   └─→ At Customer: Click "Delivered"
          │       └─→ API: PUT /api/tracking/orders/{id}/status ✅ WITH AUTH
          │           Body: { status: "DELIVERED" }
          │
          └─→ ORDER COMPLETE ✅
              └─→ Tracking ended
              └─→ Ready for next delivery

```

### Agent API Endpoints (All Protected with JWT):
```
Headers for ALL endpoints:
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}

GET  /api/delivery/{agentId}/orders              → Available orders
POST /api/tracking/orders/{orderId}/accept       → Accept delivery
GET  /api/tracking/orders/{orderId}/tracking     → Order & route details
POST /api/tracking/agent-location                → Send GPS location
PUT  /api/tracking/orders/{orderId}/status       → Update delivery status
```

### Socket.IO Events (Agent):
```javascript
// Received by Agent:
socket.on("orderAccepted", (data) => {
  // Confirmation that order was accepted
})

socket.on("restaurant_ready", (data) => {
  // Food is ready for pickup
})

socket.on("customer_message", (message) => {
  // Message from customer
})

// Emitted by Agent:
socket.emit("agent_start_tracking", {
  agent_id: 8,
  order_id: 123
})

socket.emit("agent_location_update", {
  agent_id: 8,
  lat: 28.705,
  lng: 77.103,
  speed: 45,
  heading: 180
})

socket.emit("order_status_change", {
  order_id: 123,
  status: "PICKED"
})
```

### Geolocation Tracking:
```javascript
// Browser API used:
navigator.geolocation.getCurrentPosition(success, error, options)
  options: {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }

// Returns:
{
  coords: {
    latitude: 28.705,
    longitude: 77.103,
    accuracy: 5.2,      // meters
    speed: 45,          // km/h
    heading: 180,       // degrees
    altitude: 150
  },
  timestamp: 1703250600000
}

// Sent to backend every 5 seconds
```

---

## 4. AUTO-ASSIGNMENT ALGORITHM

```
┌─────────────────────────────────────────────────────────────────┐
│          AUTOMATIC DELIVERY AGENT ASSIGNMENT                    │
└─────────────────────────────────────────────────────────────────┘

When Customer Places Order:
  │
  └─→ Backend receives: POST /api/orders
      │
      ├─→ Extract location:
      │   └─→ Restaurant coordinates (from DB)
      │
      ├─→ pickNearestAgent(lat, lng)
      │   │
      │   ├─→ Query all active agents:
      │   │   SELECT id, lat, lng FROM agents
      │   │   WHERE status = 'Active'
      │   │   AND lat IS NOT NULL
      │   │   AND lng IS NOT NULL
      │   │
      │   ├─→ For each agent, calculate:
      │   │   │
      │   │   ├─→ Distance using Haversine formula
      │   │   │   distance = 2 * R * asin(sqrt(
      │   │   │     sin²((lat2-lat1)/2) + 
      │   │   │     cos(lat1)*cos(lat2)*sin²((lng2-lng1)/2)
      │   │   │   ))
      │   │   │
      │   │   ├─→ Current workload:
      │   │   │   SELECT COUNT(*) FROM orders
      │   │   │   WHERE agent_id = {id}
      │   │   │   AND status IN ('Pending','Confirmed','Picked')
      │   │   │
      │   │   └─→ Score: (distance, workload)
      │   │
      │   ├─→ Filter: distance ≤ ASSIGN_MAX_KM (default 10km)
      │   │
      │   ├─→ Sort by:
      │   │   1. Lowest workload (ascending)
      │   │   2. Closest distance (ascending)
      │   │
      │   └─→ Return: Top candidate agent_id
      │
      ├─→ Save order:
      │   INSERT INTO orders (
      │     user_id, restaurant_id, agent_id,
      │     items, total_amount, status,
      │     delivery_address, delivery_lat, delivery_lng,
      │     restaurant_lat, restaurant_lng
      │   ) VALUES (...)
      │
      ├─→ Emit socket event:
      │   socket.emit("new_order", {
      │     order_id: 123,
      │     customer_name: "Alice",
      │     items: [...],
      │     delivery_address: "...",
      │     agent_id: 8,
      │     restaurant_name: "Taj Curry"
      │   })
      │
      └─→ Response to customer:
          {
            "success": true,
            "orderId": 123,
            "agent_id": 8,
            "estimated_delivery": 35
          }
```

### Configuration (from .env):
```
ASSIGN_MAX_KM=10              # Max distance to assign agent (km)
ASSIGN_LOAD_STATUSES=Pending,Confirmed,Picked  # Statuses to count as load
```

---

## 5. ADMIN CONTROL FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                              │
└─────────────────────────────────────────────────────────────────┘

Admin Login [login.html]
  │
  └─→ API: POST /api/auth/login
      │   Validate: role === "admin"
      │
      └─→ [admin-dashboard.html]
          │
          ├─→ STATISTICS SECTION
          │   │
          │   ├─→ API: GET /api/admin/users/count
          │   │   Response: { count: 245 }
          │   │
          │   ├─→ API: GET /api/admin/restaurants/count
          │   │   Response: { count: 42 }
          │   │
          │   ├─→ API: GET /api/admin/orders/count
          │   │   Response: { count: 1523 }
          │   │
          │   └─→ Display on Charts (Chart.js)
          │       ├─ User growth trend
          │       ├─ Daily revenue
          │       ├─ Order statistics
          │       └─ Geographic distribution
          │
          ├─→ RESTAURANT MANAGEMENT
          │   │
          │   ├─→ API: GET /api/admin/restaurants
          │   │   Response: [
          │   │     {
          │   │       "id": 5,
          │   │       "name": "Taj Curry",
          │   │       "status": "pending",
          │   │       "image_url": "...",
          │   │       "lat": 28.7050,
          │   │       "lng": 77.1020
          │   │     }, ...
          │   │   ]
          │   │
          │   ├─→ Filter by status:
          │   │   ├─ Pending (awaiting approval)
          │   │   ├─ Approved (verified)
          │   │   └─ Active (operating)
          │   │
          │   ├─→ Click "Approve"
          │   │   └─→ API: PUT /api/admin/restaurants/approve/{id}
          │   │       Body: { status: "approved" }
          │   │
          │   ├─→ Click "Reject"
          │   │   └─→ API: PUT /api/admin/restaurants/reject/{id}
          │   │       Body: { reason: "..." }
          │   │
          │   └─→ Show map with restaurant locations
          │       └─→ Markers for each restaurant
          │
          ├─→ AGENT MANAGEMENT
          │   │
          │   ├─→ API: GET /api/admin/agents
          │   │   Response: [
          │   │     {
          │   │       "id": 8,
          │   │       "name": "Bob",
          │   │       "status": "Active",
          │   │       "lat": 28.705,
          │   │       "lng": 77.103,
          │   │       "current_orders": 3
          │   │     }, ...
          │   │   ]
          │   │
          │   ├─→ Show map with agent locations
          │   │   └─→ Real-time location updates via Socket.IO
          │   │
          │   └─→ View workload per agent
          │
          ├─→ ORDER MANAGEMENT
          │   │
          │   ├─→ API: GET /api/admin/orders
          │   │   Response: [
          │   │     {
          │   │       "id": 123,
          │   │       "customer_name": "Alice",
          │   │       "restaurant_name": "Taj Curry",
          │   │       "agent_name": "Bob",
          │   │       "status": "IN_TRANSIT",
          │   │       "total_amount": 350,
          │   │       "created_at": "..."
          │   │     }, ...
          │   │   ]
          │   │
          │   ├─→ Filter by:
          │   │   ├─ Status
          │   │   ├─ Restaurant
          │   │   ├─ Agent
          │   │   └─ Date range
          │   │
          │   └─→ Click order to see tracking details
          │
          ├─→ BANNER MANAGEMENT
          │   │
          │   ├─→ API: GET /api/admin/banners
          │   │   Response: [
          │   │     {
          │   │       "id": 1,
          │   │       "title": "Holiday Sale",
          │   │       "image_url": "https://cloudinary.com/...",
          │   │       "active": true
          │   │     }, ...
          │   │   ]
          │   │
          │   ├─→ Click "Upload Banner"
          │   │   └─→ Form: [File Input] [Title]
          │   │       └─→ API: POST /api/admin/banners
          │   │           Multipart: {file, title}
          │   │           Upload to Cloudinary
          │   │
          │   └─→ Click "Delete"
          │       └─→ API: DELETE /api/admin/banners/{id}
          │
          └─→ MAPS INTEGRATION
              └─→ Mappls Advanced Maps SDK
                  ├─ Restaurant locations
                  ├─ Agent real-time locations
                  ├─ Active order routes
                  └─ Geographic statistics

```

### Admin Endpoints (All Protected with JWT + role: "admin"):
```
GET  /api/admin/users/count                     → User count
GET  /api/admin/restaurants/count               → Restaurant count
GET  /api/admin/orders/count                    → Order count
GET  /api/admin/users                           → User list
GET  /api/admin/restaurants                     → Restaurant list
GET  /api/admin/orders                          → Order list
GET  /api/admin/agents                          → Agent list
PUT  /api/admin/restaurants/approve/{id}        → Approve restaurant
PUT  /api/admin/restaurants/reject/{id}         → Reject restaurant
POST /api/admin/banners                         → Create banner
DELETE /api/admin/banners/{id}                  → Delete banner
GET  /api/admin/banners                         → List banners
```

---

## 6. IMAGE UPLOAD & STORAGE

```
┌─────────────────────────────────────────────────────────────────┐
│                 IMAGE UPLOAD ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘

UPLOAD SOURCES:
│
├─→ Restaurant Image (on registration/edit)
│   └─→ frontend/login.html [register form]
│       └─→ POST /api/auth/register
│           └─→ Multipart: {restaurantImage}
│
├─→ Menu Item Images
│   └─→ admin-dashboard.html [menu management]
│       └─→ POST /api/menu
│           └─→ Multipart: {image}
│
└─→ Banner Images
    └─→ admin-dashboard.html [banner section]
        └─→ POST /api/admin/banners
            └─→ Multipart: {image, title}

UPLOAD FLOW:
│
├─→ Frontend: File selected
│   │   <input type="file" accept="image/*" />
│   │
│   ├─→ File validation (client-side)
│   │   ├─ Check MIME type
│   │   ├─ Check file size
│   │   └─ Alert user if invalid
│   │
│   └─→ FormData construction
│       └─→ formData.append('file', fileInput.files[0])
│           formData.append('restaurantImage', file)
│
├─→ Send to Backend
│   └─→ POST /api/auth/register
│       └─→ Headers: {multipart/form-data}
│
├─→ Backend: Multer Middleware
│   │   (middleware/upload.js)
│   │
│   ├─→ File validation (server-side)
│   │   ├─ Check MIME type (image/jpeg, image/png, etc.)
│   │   ├─ Check file size (max 10MB)
│   │   └─ Reject if invalid
│   │
│   └─→ Cloudinary Storage Plugin
│       ├─ Folder mapping:
│       │   ├─ /tindo/restaurants
│       │   ├─ /tindo/menu
│       │   └─ /tindo/banners
│       │
│       └─→ CloudinaryStorage uploads to Cloudinary
│           ├─ Auto optimization
│           ├─ Returns: secure_url
│           └─ Example: https://res.cloudinary.com/...
│
├─→ Database: Save URL
│   └─→ INSERT/UPDATE with image_url
│       ├─ restaurants.image_url = "https://..."
│       ├─ menu_items.image_url = "https://..."
│       └─ banners.image_url = "https://..."
│
└─→ Frontend: Display Image
    └─→ <img src={image_url} />
        └─→ Served from Cloudinary CDN
            ├─ Automatic scaling
            ├─ Format optimization
            └─ HTTPS (no mixed content issues)


CLOUDINARY INTEGRATION:
│
├─→ Config (/backend/config/cloudinary.js)
│   └─→ cloudinary.config({
│       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
│       api_key: process.env.CLOUDINARY_API_KEY,
│       api_secret: process.env.CLOUDINARY_API_SECRET
│     })
│
├─→ Upload Limits
│   ├─ Max file size: 10 MB
│   ├─ Allowed formats: jpg, jpeg, png, gif, webp
│   └─ Resource type: auto (auto-detect)
│
└─→ URL Example
    └─→ https://res.cloudinary.com/{cloud_name}/image/upload/
        v{version}/{folder}/{public_id}.{format}


BENEFITS:
✅ No local storage needed (no /uploads dir required)
✅ Automatic image optimization
✅ CDN distribution (fast delivery)
✅ HTTPS URLs (secure, no mixed content)
✅ Automatic scaling for different devices
✅ Backup and redundancy
✅ Scales to production without changes

```

---

## 7. AUTHENTICATION & SECURITY

```
┌─────────────────────────────────────────────────────────────────┐
│              AUTHENTICATION FLOW (JWT)                          │
└─────────────────────────────────────────────────────────────────┘

LOGIN REQUEST:
│
├─→ User enters: Email + Password
└─→ POST /api/auth/login
    Body: {
      "email": "user@example.com",
      "password": "plaintext_password"
    }

BACKEND PROCESSING:
│
├─→ Query user from database
│   └─→ SELECT * FROM users WHERE email = ?
│
├─→ Validate password
│   └─→ bcrypt.compare(
│         plaintext_password,
│         stored_hashed_password
│       )
│
├─→ If valid, generate JWT token
│   └─→ jwt.sign({
│         "id": 123,
│         "email": "user@example.com",
│         "role": "user",
│         "restaurant_id": null
│       }, JWT_SECRET, {
│         "expiresIn": "7d"
│       })
│
└─→ Return response
    {
      "success": true,
      "user": {
        "id": 123,
        "name": "John Doe",
        "email": "user@example.com",
        "role": "user"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "redirectTo": "index.html"
    }

FRONTEND STORAGE:
│
├─→ localStorage.setItem('user', JSON.stringify(user))
├─→ localStorage.setItem('token', token)
└─→ Redirect to redirectTo page

AUTHENTICATED REQUESTS:
│
├─→ API call with token:
│   fetch(url, {
│     headers: {
│       "Authorization": "Bearer eyJhbGci...",
│       "Content-Type": "application/json"
│     }
│   })
│
└─→ Backend validation:
    ├─→ authMiddleware checks:
    │   ├─ Extract token from Authorization header
    │   ├─ Verify token signature with JWT_SECRET
    │   ├─ Check token expiration
    │   ├─ Extract user ID and role
    │   └─ Attach to req.user for route handler
    │
    └─→ Route handler checks role:
        ├─ Admin routes: require role === "admin"
        ├─ Restaurant routes: require role === "restaurant"
        └─ Delivery routes: require role === "delivery"

TOKEN EXPIRATION:
│
├─→ Token expires in 7 days
├─→ Frontend checks expiration:
│   └─→ Decode JWT (split by ".")
│   └─→ Check exp * 1000 < Date.now()
│
└─→ If expired:
    ├─→ Alert user "Session expired"
    └─→ Redirect to login.html
    └─→ Clear localStorage

SECURITY FEATURES:
│
├─→ Passwords hashed with bcrypt (12 rounds)
├─→ JWT token signed with secret key
├─→ Token includes user role for authorization
├─→ CORS enabled only for allowed origins
├─→ HTTPS enforced in production
├─→ Token stored in localStorage (or sessionStorage for extra security)
├─→ Session expiration (7 days)
└─→ Role-based access control (RBAC)

```

---

## 8. REAL-TIME COMMUNICATION (Socket.IO)

```
┌─────────────────────────────────────────────────────────────────┐
│                   SOCKET.IO EVENT FLOW                          │
└─────────────────────────────────────────────────────────────────┘

CONNECTION:
│
├─→ Frontend: const socket = io(BASE_URL)
├─→ Backend: socket.io server listening
└─→ WebSocket established

RESTAURANT EVENTS:
│
├─→ Received: "new_order"
│   │   Source: Backend (when order placed)
│   │   Data: {
│   │     order_id: 123,
│   │     customer_name: "Alice",
│   │     items: [...],
│   │     total_amount: 350,
│   │     delivery_address: "...",
│   │     restaurant_name: "Taj Curry"
│   │   }
│   │   Action: Show alert, add to orders list
│   │
│   ├─→ Received: "agent_assigned"
│   │   Source: Backend (auto-assignment)
│   │   Data: {
│   │     order_id: 123,
│   │     agent_id: 8,
│   │     agent_name: "Bob",
│   │     vehicle: "Bike",
│   │     phone: "9876543210"
│   │   }
│   │   Action: Show agent details
│   │
│   ├─→ Received: "agent_location_update"
│   │   Source: Agent (every 5 seconds)
│   │   Data: {
│   │     agent_id: 8,
│   │     lat: 28.705,
│   │     lng: 77.103,
│   │     speed: 45,
│   │     heading: 180,
│   │     accuracy: 5.2
│   │   }
│   │   Action: Update marker on map
│   │
│   └─→ Emit: "order_status_change"
│       Data: {
│         order_id: 123,
│         status: "CONFIRMED"
│       }

CUSTOMER EVENTS:
│
├─→ Received: "order_status_update"
│   │   Source: Restaurant (status changes)
│   │   Data: {
│   │     order_id: 123,
│   │     status: "CONFIRMED",
│   │     timestamp: "..."
│   │   }
│   │   Action: Update tracking page
│   │
│   └─→ Received: "agent_location_update"
│       Source: Agent (every 5 seconds)
│       Data: {
│         agent_id: 8,
│         lat: 28.705,
│         lng: 77.103,
│         speed: 45,
│         heading: 180
│       }
│       Action: Update agent marker on map

AGENT EVENTS:
│
├─→ Received: "new_order_available"
│   │   Source: Backend (new order assigned)
│   │   Data: {
│   │     order_id: 123,
│   │     customer_name: "Alice",
│   │     distance_km: 2.5,
│   │     restaurant: "Taj Curry"
│   │   }
│   │   Action: Show in available orders list
│   │
│   ├─→ Received: "restaurant_ready"
│   │   Source: Restaurant (order ready)
│   │   Data: { order_id: 123 }
│   │   Action: Notify agent to pick up
│   │
│   └─→ Emit: "agent_location_update"
│       Data: {
│         agent_id: 8,
│         lat: 28.705,
│         lng: 77.103,
│         speed: 45,
│         heading: 180,
│         accuracy: 5.2
│       }
│       Interval: Every 5 seconds

ADMIN EVENTS:
│
├─→ Received: "agent_online"
│   │   Source: Agent (connects to dashboard)
│   │   Data: { agent_id: 8 }
│   │   Action: Update agent list, show on map
│   │
├─→ Received: "agent_offline"
│   │   Source: Agent (disconnects)
│   │   Data: { agent_id: 8 }
│   │   Action: Update agent list, remove from map
│   │
└─→ Received: "agent_location_update"
    Source: Agent (real-time location)
    Data: { agent_id: 8, lat, lng, ... }
    Action: Update agent marker on map

```

---

This comprehensive architecture ensures seamless integration of all flows and real-time communication across the entire food delivery platform! 🚀

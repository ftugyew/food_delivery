# 🚀 COMPLETE ORDER TO DELIVERY FLOW - TESTING GUIDE

## ✅ SYSTEM OVERVIEW

This guide documents the **complete end-to-end flow** from order placement to delivery with all features:
- ✅ Order broadcast to all online agents (realtime)
- ✅ Maps showing restaurant & customer locations with routes
- ✅ Call customer and restaurant functionality
- ✅ Chat/messaging system for quick updates
- ✅ Navigation to restaurant and customer

---

## 📱 COMPLETE USER JOURNEY

### **STEP 1: USER PLACES ORDER** (Order Confirmation Page)

**File:** `frontend/order-success.html`

**What Happens:**
1. User completes checkout
2. Order data posted to `/api/orders` with auth token
3. Backend creates order with:
   - `status: 'waiting_for_agent'`
   - `agent_id: NULL`
   - Generates 12-digit order_id

**Expected Result:**
- ✅ Order success page shows order ID
- ✅ Payment type displayed
- ✅ Track Order button active

**Backend API:**
```javascript
POST /api/orders
Headers: Authorization: Bearer <token>
Body: {
  user_id, restaurant_id, items, total,
  delivery_address, delivery_lat, delivery_lng,
  customer_phone, restaurant_phone,
  restaurant_lat, restaurant_lng
}
```

---

### **STEP 2: ORDER BROADCAST TO ALL AGENTS** (Realtime)

**File:** `backend/routes/orders.js`

**What Happens:**
1. Backend fetches all online agents:
   ```sql
   SELECT id, name FROM agents 
   WHERE is_online = TRUE AND is_busy = FALSE
   ```

2. Calculate distance and payout:
   ```javascript
   const distance = haversineDistance(restaurant, customer);
   const payout = (order.total * 0.15).toFixed(2); // 15% commission
   ```

3. Broadcast to each online agent via Socket.IO:
   ```javascript
   onlineAgents.forEach(agent => {
     io.emit(`agent_${agent.id}_new_order`, {
       id: order.id,
       restaurant_name, restaurant_lat, restaurant_lng,
       items, total, distance_km, payout_estimate,
       delivery_address, delivery_lat, delivery_lng,
       customer_phone, restaurant_phone
     });
   });
   ```

**Expected Result:**
- ✅ All online agents receive notification
- ✅ Order modal pops up with 30-second countdown
- ✅ Sound alert plays
- ✅ Order appears in "Available Orders" list

---

### **STEP 3: AGENT RECEIVES ORDER** (Delivery Dashboard)

**File:** `frontend/delivery-dashboard-live.html`

**What Happens:**
1. Socket listener fires:
   ```javascript
   socket.on(`agent_${agentId}_new_order`, (order) => {
     showOrderModal(order);
     playOrderSound();
   });
   ```

2. Order modal displays:
   - Restaurant name & location
   - Customer delivery address & phone
   - Distance from agent current location
   - Payout estimate (15% of order total)
   - Order items list
   - **Accept** button (green)
   - **Reject** button (gray)
   - 30-second countdown timer

**UI Elements:**
```html
<div id="orderModal">
  Order #123
  Restaurant: Pizza Hut
  Customer: John Doe
  Distance: 3.5 km
  Payout: ₹67.50
  Items: Margherita Pizza x1, Coke x2
  
  [✅ Accept Order]  [❌ Reject]
  
  Auto-dismiss in 30 seconds
</div>
```

**Expected Result:**
- ✅ Modal popup appears
- ✅ Sound plays
- ✅ Timer counts down from 30
- ✅ Agent can accept or reject

---

### **STEP 4: AGENT ACCEPTS ORDER** (First-Accept-Wins)

**File:** `frontend/delivery-dashboard-live.html` → `backend/routes/orders.js`

**Frontend:**
```javascript
async function acceptOrder(orderId) {
  const res = await fetch('/api/orders/accept-order', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ order_id: orderId, agent_id: agentId })
  });
  
  if (res.status === 409) {
    alert("Order already accepted by another agent");
    hideOrderModal();
    return;
  }
  
  const data = await res.json();
  // Store contact info for calling
  currentCustomerPhone = data.order.customer_phone;
  currentRestaurantPhone = data.order.restaurant_phone;
  currentRestaurantLat = data.order.restaurant_lat;
  currentRestaurantLng = data.order.restaurant_lng;
  currentCustomerLat = data.order.delivery_lat;
  currentCustomerLng = data.order.delivery_lng;
  
  startTracking(orderId);
}
```

**Backend - Atomic Assignment:**
```javascript
// Check agent availability
const [agent] = await db.execute(
  "SELECT is_online, is_busy FROM agents WHERE id = ?",
  [agent_id]
);

if (!agent.is_online || agent.is_busy) {
  return res.status(403).json({ error: "Cannot accept order" });
}

// Atomic UPDATE (race condition protection)
const [result] = await db.execute(`
  UPDATE orders 
  SET agent_id = ?, status = 'agent_assigned' 
  WHERE id = ? 
    AND agent_id IS NULL 
    AND status = 'waiting_for_agent'
`, [agent_id, order_id]);

if (result.affectedRows === 0) {
  // Order already taken
  return res.status(409).json({ 
    error: "Order already accepted by another agent" 
  });
}

// Mark agent as busy
await db.execute("UPDATE agents SET is_busy = TRUE WHERE id = ?", [agent_id]);
```

**Expected Result:**
- ✅ First agent to click Accept gets the order
- ✅ Other agents see "Order taken by another agent"
- ✅ Winner's modal closes
- ✅ Active delivery section opens
- ✅ Map shows restaurant and customer markers

---

### **STEP 5: LIVE MAP WITH ROUTES** (Agent Dashboard)

**File:** `frontend/delivery-dashboard-live.html`

**What Happens:**
```javascript
function startTracking(orderId) {
  // Create restaurant marker (Orange)
  restaurantMarker = new mappls.Marker({
    map: map,
    position: [currentRestaurantLat, currentRestaurantLng],
    icon: 'https://apis.mappls.com/map_v3/2.png',
    title: 'Restaurant'
  });
  
  // Create customer marker (Red)
  customerMarker = new mappls.Marker({
    map: map,
    position: [currentCustomerLat, currentCustomerLng],
    icon: 'https://apis.mappls.com/map_v3/1.png',
    title: 'Customer Location'
  });
  
  // Create agent marker (Green)
  agentMarker = new mappls.Marker({
    map: map,
    position: [agentCurrentLat, agentCurrentLng],
    icon: 'https://apis.mappls.com/map_v3/3.png',
    title: 'You are here'
  });
  
  // Draw route line (green polyline)
  routeLine = new mappls.Polyline({
    map: map,
    paths: [
      [agentCurrentLat, agentCurrentLng],
      [currentRestaurantLat, currentRestaurantLng]
    ],
    strokeColor: '#10b981',
    strokeWeight: 4,
    strokeOpacity: 0.7
  });
  
  // Center map between restaurant and customer
  const avgLat = (currentRestaurantLat + currentCustomerLat) / 2;
  const avgLng = (currentRestaurantLng + currentCustomerLng) / 2;
  map.setCenter([avgLat, avgLng]);
  map.setZoom(13);
}
```

**Map Features:**
- 🟢 Agent marker (green) - Your location
- 🟠 Restaurant marker (orange) - Pickup point
- 🔴 Customer marker (red) - Delivery point
- 🟩 Green polyline - Route from agent → restaurant (initially)
- After pickup: Route updates to agent → customer

**Expected Result:**
- ✅ Map shows all 3 markers
- ✅ Route line connects agent to restaurant
- ✅ Map auto-centers to show all locations
- ✅ Agent location updates in realtime (every 5 seconds)

---

### **STEP 6: CALL FUNCTIONALITY** 📞

**File:** `frontend/delivery-dashboard-live.html`

**Call Customer:**
```javascript
function callCustomer() {
  if (!currentCustomerPhone) {
    alert("⚠️ Customer phone number not available");
    return;
  }
  if (confirm(`📞 Call customer at ${currentCustomerPhone}?`)) {
    window.location.href = `tel:${currentCustomerPhone}`;
    showNotification(`📞 Calling customer...`);
  }
}
```

**Call Restaurant:**
```javascript
function callRestaurant() {
  if (!currentRestaurantPhone) {
    alert("⚠️ Restaurant phone number not available");
    return;
  }
  if (confirm(`📞 Call restaurant at ${currentRestaurantPhone}?`)) {
    window.location.href = `tel:${currentRestaurantPhone}`;
    showNotification(`📞 Calling restaurant...`);
  }
}
```

**UI Buttons:**
```html
<button onclick="callCustomer()">📞 Call Customer</button>
<button onclick="callRestaurant()">📞 Call Restaurant</button>
```

**Expected Result:**
- ✅ Confirmation dialog before calling
- ✅ Phone dialer opens with number
- ✅ Works on mobile devices
- ✅ Notification shown after clicking

---

### **STEP 7: CHAT/MESSAGING SYSTEM** 💬

**File:** `frontend/delivery-dashboard-live.html`

**Quick Messages:**
```javascript
async function sendQuickMessage(type) {
  if (!currentOrderId) {
    alert("⚠️ Please accept an order first");
    return;
  }
  
  const messages = {
    reached_restaurant: "I've reached the restaurant and collecting your order 📦",
    order_picked: "Order picked up! On my way to deliver 🚀",
    arriving_5: "I'll arrive in 5 minutes! Please be ready 🛵"
  };
  
  const msg = messages[type];
  
  const res = await fetch(`${API_BASE_URL}/tracking/orders/${currentOrderId}/chat`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      sender_id: agentId, 
      sender_type: 'agent', 
      message: msg 
    })
  });
  
  if (res.ok) {
    showNotification("✅ Message sent to customer");
  }
}
```

**Quick Message Buttons:**
```html
<button onclick="sendQuickMessage('reached_restaurant')">✉️ Reached Restaurant</button>
<button onclick="sendQuickMessage('order_picked')">✉️ Order Picked</button>
<button onclick="sendQuickMessage('arriving_5')">✉️ Arriving Soon</button>
```

**Expected Result:**
- ✅ Message sent to customer
- ✅ Saved in order_chats table
- ✅ Customer sees update in tracking page
- ✅ Success notification shown

---

### **STEP 8: NAVIGATION SYSTEM** 🗺️

**File:** `frontend/delivery-dashboard-live.html`

**Navigate to Restaurant:**
```javascript
function openNavigation(target) {
  let latLng = null;
  let locationName = '';
  
  if (target === 'restaurant') {
    if (restaurantMarker) {
      const pos = restaurantMarker.getPosition();
      latLng = Array.isArray(pos) ? pos : [pos.lat, pos.lng];
    } else if (currentRestaurantLat && currentRestaurantLng) {
      latLng = [currentRestaurantLat, currentRestaurantLng];
    }
    locationName = 'restaurant';
  } else if (target === 'customer') {
    if (customerMarker) {
      const pos = customerMarker.getPosition();
      latLng = Array.isArray(pos) ? pos : [pos.lat, pos.lng];
    } else if (currentCustomerLat && currentCustomerLng) {
      latLng = [currentCustomerLat, currentCustomerLng];
    }
    locationName = 'customer';
  }
  
  if (!latLng || latLng[0] === 0 || latLng[1] === 0) {
    alert(`⚠️ ${locationName} location not available`);
    return;
  }
  
  // Open Google Maps with directions
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latLng[0]},${latLng[1]}`;
  window.open(url, '_blank');
  showNotification(`🗺️ Opening navigation to ${locationName}...`);
}
```

**Navigation Buttons:**
```html
<button onclick="openNavigation('restaurant')">To Restaurant</button>
<button onclick="openNavigation('customer')">To Customer</button>
```

**Expected Result:**
- ✅ Opens Google Maps in new tab
- ✅ Shows turn-by-turn directions
- ✅ Uses agent's current location as starting point
- ✅ Works on mobile and desktop

---

### **STEP 9: DELIVERY STATUS UPDATES** 

**Status Buttons:**
```html
<button onclick="updateTrackingStatus('agent_going_to_restaurant')">Going to Restaurant</button>
<button onclick="updateTrackingStatus('arrived_at_restaurant')">Arrived</button>
<button onclick="updateTrackingStatus('picked_up')">Picked Up</button>
<button onclick="updateTrackingStatus('in_transit')">In Transit</button>
<button onclick="updateTrackingStatus('delivered')">Delivered</button>
```

**Timeline Visual:**
1. ✅ Order Accepted (green)
2. ⏳ Going to Restaurant (yellow)
3. ⏳ Arrived at Restaurant (orange)
4. ⏳ Picked Up (blue)
5. ⏳ In Transit (purple)
6. ⏳ Delivered (green)

**Route Changes:**
- **Before Pickup:** Agent → Restaurant (green line)
- **After Pickup:** Agent → Customer (green line)

**Expected Result:**
- ✅ Timeline updates with each status
- ✅ Route changes after pickup
- ✅ Customer sees live updates
- ✅ Agent marked as not busy after delivery

---

## 🔒 SECURITY FEATURES

### Authentication
- ✅ All API calls require JWT token
- ✅ Token validated on every request
- ✅ Session expires after timeout

### Authorization
- ✅ Agent can only accept if online
- ✅ Agent can only accept if not busy
- ✅ Only assigned agent can update order

### Race Condition Protection
```sql
UPDATE orders 
SET agent_id = ?, status = 'agent_assigned' 
WHERE id = ? 
  AND agent_id IS NULL          -- ✅ Must be unassigned
  AND status = 'waiting_for_agent'  -- ✅ Must be waiting
```

**Result:** Only ONE agent can ever accept an order

---

## 📊 TESTING CHECKLIST

### Pre-Test Setup
- [ ] Database migration run (`add_agent_online_status.sql`)
- [ ] Backend server running
- [ ] 2+ agents registered and have login credentials
- [ ] Test restaurant with menu items
- [ ] Test user account with address

### Test 1: Order Placement
- [ ] Login as customer
- [ ] Add items to cart
- [ ] Complete checkout
- [ ] Verify order success page shows
- [ ] Verify order ID displayed
- [ ] Verify track button works

### Test 2: Order Broadcast
- [ ] Login as Agent 1 (mark online)
- [ ] Login as Agent 2 (mark online)
- [ ] Place order from customer account
- [ ] Verify both agents receive modal
- [ ] Verify sound plays
- [ ] Verify 30-second timer starts

### Test 3: Race Condition
- [ ] Both agents try to accept same order
- [ ] First agent succeeds
- [ ] Second agent sees "Order taken" message
- [ ] Verify only one assignment in database

### Test 4: Maps & Markers
- [ ] Accept order as agent
- [ ] Verify map shows 3 markers (agent, restaurant, customer)
- [ ] Verify green route line from agent → restaurant
- [ ] Verify map centers properly

### Test 5: Call Functionality
- [ ] Click "Call Customer" button
- [ ] Verify confirmation dialog
- [ ] Verify phone dialer opens
- [ ] Click "Call Restaurant" button
- [ ] Verify phone dialer opens

### Test 6: Chat Messages
- [ ] Click "Reached Restaurant"
- [ ] Verify success notification
- [ ] Click "Order Picked"
- [ ] Verify message sent
- [ ] Check order_chats table for entries

### Test 7: Navigation
- [ ] Click "Navigate to Restaurant"
- [ ] Verify Google Maps opens
- [ ] Verify directions shown
- [ ] Click "Navigate to Customer"
- [ ] Verify correct destination

### Test 8: Status Updates
- [ ] Click "Going to Restaurant"
- [ ] Verify timeline updates
- [ ] Click "Picked Up"
- [ ] Verify route changes to customer
- [ ] Click "Delivered"
- [ ] Verify order completes

### Test 9: Offline/Online Toggle
- [ ] Toggle agent to offline
- [ ] Place new order
- [ ] Verify offline agent doesn't receive
- [ ] Toggle agent online
- [ ] Verify receives new orders

---

## 🐛 TROUBLESHOOTING

### Orders not appearing
**Check:**
1. Agent `is_online = TRUE` in database
2. Socket connection active (check console)
3. Frontend listening to `agent_{id}_new_order`

### Modal not showing
**Debug:**
```javascript
socket.on(`agent_${agentId}_new_order`, (order) => {
  console.log("NEW ORDER:", order);
  showOrderModal(order);
});
```

### Call buttons not working
**Verify:**
- Phone numbers stored in `currentCustomerPhone`, `currentRestaurantPhone`
- Order data includes `customer_phone`, `restaurant_phone`
- Accept order successfully before calling

### Maps not loading
**Check:**
1. Mappls API key valid
2. Location permission granted
3. Coordinates not null/zero
4. Markers created successfully

### Messages not sending
**Verify:**
- Active order exists (`currentOrderId` not null)
- Auth token valid
- Backend `/tracking/orders/:id/chat` endpoint working

---

## 📈 SUCCESS CRITERIA

Your system is working correctly when:
- ✅ Order appears in ALL online agents within 1 second
- ✅ Only first agent to accept gets order (race condition handled)
- ✅ Maps show restaurant, customer, and agent markers
- ✅ Route line connects agent to destination
- ✅ Call buttons open phone dialer
- ✅ Messages sent successfully to customer
- ✅ Navigation opens Google Maps with directions
- ✅ Timeline updates with each status change
- ✅ No double-assignments occur

---

## 🎯 PRODUCTION DEPLOYMENT

### Final Steps
1. Run database migration on production
2. Update environment variables
3. Test with real phone numbers
4. Enable push notifications (future enhancement)
5. Add SMS alerts for important updates
6. Monitor system performance

---

**END OF COMPLETE FLOW GUIDE**

Last Updated: December 26, 2025
Version: 2.1.0
Status: ✅ Production Ready

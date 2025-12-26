# ⚡ ORDER BROADCAST - QUICK START TESTING GUIDE

## 🎯 Quick Test (5 Minutes)

### Step 1: Ensure Agents Are Set Up
```sql
-- Make sure you have agents with Active status and valid coordinates
SELECT id, name, status, is_online, is_busy, lat, lng FROM agents LIMIT 5;

-- If needed, update agents to Active status:
UPDATE agents SET status='Active', is_online=1, is_busy=0 WHERE id IN (1,2,3);

-- Set valid coordinates if missing:
UPDATE agents SET lat=28.6050, lng=77.1998 WHERE id=1;
UPDATE agents SET lat=28.5900, lng=77.2100 WHERE id=2;
UPDATE agents SET lat=28.6200, lng=77.1850 WHERE id=3;
```

### Step 2: Open Multiple Agent Dashboards
1. **Agent 1 Dashboard:** Open `frontend/delivery-dashboard-live.html` as Agent #1
2. **Agent 2 Dashboard:** Open in new tab/window as Agent #2
3. **Agent 3 Dashboard:** Open in new tab/window as Agent #3

Each must be logged in as different agents.

### Step 3: Create an Order via Customer App
1. Go to customer homepage
2. Select restaurant
3. Add items to cart
4. Enter delivery address with coordinates:
   - **Example:** [28.6139, 77.2090] (center of city)
5. Complete payment
6. Click **Place Order**

### Step 4: Watch Agents Receive Orders
✅ All agent dashboards should show:
- 🔔 Modal popup with "New Order Available!"
- 📱 Order details including:
  - Restaurant name
  - Items ordered
  - Total amount
  - Delivery address with coordinates
  - Distance to delivery location
  - Estimated arrival time

### Step 5: Test Acceptance
- **Agent 1:** Click ✅ **Accept Order**
- **Agent 2 & 3:** Should see notification "Order taken by another agent"
- Check backend logs for broadcast confirmation

---

## 🔍 Verification Points

### Backend Logs Should Show:
```
📡 Broadcasting order #15 to 5 ACTIVE online agents
   Restaurant: [28.5244, 77.1855] → Delivery: [28.6139, 77.2090]
  ✅ Sent to agent 1 (Name) - Rank: 1/5 - Distance: 4.52km - ETA: 18min
  ✅ Sent to agent 2 (Name) - Rank: 2/5 - Distance: 6.23km - ETA: 25min
  ✅ Sent to agent 3 (Name) - Rank: 3/5 - Distance: 7.15km - ETA: 29min
```

### Frontend Console Should Show:
```
📢 NEW ORDER BROADCAST: {
  id: 15,
  restaurant_name: "Biryani Palace",
  restaurant_lat: 28.5244,
  restaurant_lng: 77.1855,
  delivery_lat: 28.6139,
  delivery_lng: 77.2090,
  distance_to_delivery_km: "4.52",
  estimated_arrival_mins: 18,
  agent_rank: 1,
  total_agents_notified: 5,
  ...
}
```

### Database Should Show:
```sql
-- After agent accepts:
SELECT id, status, agent_id FROM orders WHERE id=15;
-- Result: 15, "assigned", 1

SELECT id, is_busy FROM agents WHERE id=1;
-- Result: 1, 1 (agent is now busy)
```

---

## 🐛 Troubleshooting

### ❌ Agents not receiving orders?

**Check 1: Agent Status**
```sql
SELECT id, name, status, is_online, is_busy FROM agents;
-- All should be: status='Active', is_online=1, is_busy=0
```

**Check 2: Agent Coordinates**
```sql
SELECT id, name, lat, lng FROM agents;
-- All should have valid lat/lng (not NULL)
```

**Check 3: Socket.io Connection**
Open browser DevTools → Console
```javascript
// Should show "connected"
socket.connected  // true or false

// Check if listening for orders
// Should log when order is broadcasted
socket.on(`agent_${agentId}_new_order`, (order) => {
  console.log("Order received!");
});
```

**Check 4: Backend Logs**
```
// Should see:
📡 Broadcasting order #X to N ACTIVE online agents
// If no agents: ⚠️ No active online agents available
```

### ❌ Modal not appearing?

**Check:** Browser console for errors
```javascript
// Look for:
- Socket.io connection errors
- Order modal visibility errors
- Permission/CORS issues
```

### ❌ Wrong distance calculation?

**Check:** Agent and delivery coordinates
```sql
-- Verify coordinates are valid:
SELECT id, lat, lng FROM agents WHERE id=1;
SELECT delivery_lat, delivery_lng FROM orders WHERE id=15;

-- Both should have [lat, lng] format with ~2 decimal places
-- Example: lat=28.6050, lng=77.1998
```

---

## 📱 Database Setup for Testing

```sql
-- STEP 1: Create test agents with different locations
INSERT INTO agents (name, phone, status, is_online, is_busy, lat, lng, vehicle_type) VALUES
('Raj Kumar', '9876543210', 'Active', 1, 0, 28.6050, 77.1998, 'bike'),
('Priya Singh', '9876543211', 'Active', 1, 0, 28.5900, 77.2100, 'bike'),
('Amit Patel', '9876543212', 'Active', 1, 0, 28.6200, 77.1850, 'car'),
('Neha Verma', '9876543213', 'Active', 1, 0, 28.6150, 77.2050, 'bike'),
('Vikram Rao', '9876543214', 'Active', 1, 0, 28.5850, 77.1950, 'car');

-- STEP 2: Verify agents are set up correctly
SELECT id, name, status, is_online, is_busy, lat, lng FROM agents;

-- STEP 3: When you create an order, verify broadcast:
-- (Check backend logs for "Broadcasting order #X to Y ACTIVE online agents")

-- STEP 4: Verify order was created:
SELECT id, status, agent_id, customer_name, delivery_lat, delivery_lng 
FROM orders 
WHERE id = (SELECT MAX(id) FROM orders);

-- STEP 5: After agent accepts, verify assignment:
SELECT id, agent_id, status FROM orders WHERE id = (SELECT MAX(id) FROM orders);
-- Should show: id, agent_id=1 (or whichever accepted), status='assigned'
```

---

## 🎬 Demo Scenario

### Setup:
- **Restaurant:** Biryani Palace [28.5244, 77.1855]
- **Delivery Location:** Flat 101, Delhi [28.6139, 77.2090]
- **Agent 1 Location:** 4.5 km away → ETA: 18 min
- **Agent 2 Location:** 6.2 km away → ETA: 25 min
- **Agent 3 Location:** 7.1 km away → ETA: 29 min

### Expected Flow:
1. Customer orders biryani + drinks worth ₹450
2. All 3 agents receive notification within 100ms
3. Agent 1 (closest) sees ETA=18min, accepts immediately
4. Agents 2 & 3 see "Order taken by another agent"
5. Agent 1 sees order in tracking with pickup/delivery locations
6. Order is assigned to Agent 1 in database
7. Tracking starts with real-time location updates

### Success Criteria:
- ✅ All agents receive notification
- ✅ Order details are complete and correct
- ✅ Distance and ETA calculations are accurate
- ✅ First agent to accept gets the order
- ✅ Other agents notified order is taken
- ✅ Database reflects assignment
- ✅ Tracking page loads correctly

---

## 💡 Tips for Testing

### Test With Real Locations:
- Use actual Delhi coordinates for restaurants
- Use delivery addresses with coordinates from Google Maps
- Makes distance calculations realistic

### Test With Multiple Agents:
- Use 3+ agents to see ranking by proximity
- Test with agents at different distances
- Verify closest agent gets best ETA

### Test Acceptance Race:
- Two agents try to accept same order
- See who wins (should be whoever clicks first)
- Verify other agent gets "Order taken" notification

### Test With Offline Agents:
- Set one agent is_online=0
- Verify they DON'T receive the order
- Only Active, Online agents should receive

### Check Browser DevTools:
- **Network tab:** Verify Socket.io messages are sent
- **Console tab:** Check for JavaScript errors
- **Application tab:** Verify localStorage has token and agent_id

---

## 📊 What Gets Broadcast to Each Agent

```javascript
{
  // Order basics
  id: 15,
  order_id: "ORD-2024-15",
  status: "waiting_for_agent",
  
  // Restaurant (PICKUP LOCATION)
  restaurant_name: "Biryani Palace",
  restaurant_lat: 28.5244,
  restaurant_lng: 77.1855,
  
  // Delivery (CUSTOMER LOCATION)
  delivery_lat: 28.6139,
  delivery_lng: 77.2090,
  delivery_address: {"house": "101", "street": "MG Road", "city": "Delhi"},
  
  // Customer info
  customer_name: "John Doe",
  customer_phone: "9999999999",
  
  // Order items
  items: [
    {"name": "Biryani", "quantity": 2, "price": 250},
    {"name": "Coke", "quantity": 1, "price": 50}
  ],
  total: 450,
  payment_type: "online",
  
  // MAPS DATA
  delivery_maps: {
    lat: 28.6139,
    lng: 77.2090,
    address: "101 MG Road, Delhi",
    zoom: 15
  },
  restaurant_maps: {
    lat: 28.5244,
    lng: 77.1855,
    name: "Biryani Palace",
    zoom: 15
  },
  
  // AGENT DATA
  agent_current_location: {lat: 28.6050, lng: 77.1998},
  distance_to_delivery_km: "4.52",
  agent_rank: 1,
  total_agents_notified: 3,
  estimated_arrival_mins: 18
}
```

---

## ✅ Acceptance Test Checklist

- [ ] Agent receives modal within 1 second of order creation
- [ ] Modal shows all order details clearly
- [ ] Modal displays coordinates: [lat, lng] format
- [ ] Distance is calculated correctly (can verify with Google Maps)
- [ ] ETA is reasonable (distance / 15 km/h * 60 minutes)
- [ ] Agent can accept order by clicking button
- [ ] Agent can reject order by clicking button
- [ ] Modal auto-dismisses after 30 seconds if no action
- [ ] Backend logs show broadcast to all eligible agents
- [ ] Accepted order appears in agent's tracking page
- [ ] Other agents notified order is taken
- [ ] Database shows order assigned to correct agent
- [ ] Acceptance rate tracking works
- [ ] All coordinates are in correct [lat, lng] format
- [ ] Maps functionality works (if implemented)

---

## 🚀 Go Live

Once testing passes:
1. Deploy backend to production
2. Update frontend API_BASE_URL to production endpoint
3. Monitor logs for first 100 orders
4. Check agent feedback on distance accuracy
5. Verify no orders are missed by any eligible agent
6. Monitor acceptance rates

---

**Status:** Ready to test 🎯

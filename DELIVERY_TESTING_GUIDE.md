# 🧪 Delivery Dashboard Testing Guide

## Quick Start Testing

### 1️⃣ Test Agent Login & Location Permission
```
URL: http://localhost/food-delivery/frontend/delivery-login.html

Steps:
1. Login with delivery agent credentials
2. Expect: Location permission dialog appears immediately
3. Click "Allow" 
4. ✅ Success: Dashboard loads with agent's location on map
5. ✅ Success: "Location Active" shown in tracking status
```

### 2️⃣ Test Order Loading
```
URL: http://localhost/food-delivery/frontend/delivery-dashboard-live.html

Expectations:
1. Available orders count shows correct number
2. Order cards display with full details:
   - Order ID
   - Items list
   - Restaurant name
   - Customer name and phone
   - Delivery address
3. Real-time updates when new orders arrive
4. Toast notification appears for new orders
```

### 3️⃣ Test Order Acceptance
```
Steps:
1. Click "Accept Order" on any available order
2. ✅ Success message appears
3. Order moves to "Active Deliveries" count
4. "Start Live Tracking" button appears
5. Socket event sent to customer tracking page
```

### 4️⃣ Test Live Tracking (Agent Side)
```
Steps:
1. Click "Start Live Tracking" on accepted order
2. Active Delivery section appears
3. Map shows:
   - 🏪 Restaurant marker (red)
   - 🛵 Agent marker (green) - your location
   - 🏠 Customer marker (blue)
   - Green route line
4. Status buttons appear:
   - Going to Restaurant
   - Arrived at Restaurant
   - Picked Up Order
   - In Transit
   - Delivered
5. Agent location updates every 5 seconds
```

### 5️⃣ Test Customer Tracking View
```
URL: http://localhost/food-delivery/frontend/tracking-live.html?orderId=123

Prerequisites:
- Replace 123 with actual order ID
- Order must be placed by logged-in user

Expectations:
1. Order status badge shows current status
2. Progress bar updates with delivery stage
3. Map displays:
   - Restaurant location
   - Customer location
   - Agent location (after acceptance)
   - Animated route line
4. Agent details card appears after assignment:
   - Agent name
   - Phone number
   - Vehicle details
   - Profile photo
5. ETA updates in real-time
6. "Call Agent" button works
7. Chat button available
```

### 6️⃣ Test Status Updates
```
Agent Actions:
1. Click "🚗 Going to Restaurant"
   → Customer sees: Status changes, progress bar updates
   
2. Click "🏪 Arrived at Restaurant"
   → Customer sees: Status update, progress advances
   
3. Click "📦 Picked Up Order"
   → Customer sees: Status changes
   → Map: Route line now goes from agent to customer
   
4. Click "🚀 In Transit"
   → Customer sees: Status update, ETA countdown
   
5. Click "✅ Delivered"
   → Tracking stops
   → Success message shown
   → Order marked complete
```

### 7️⃣ Test Real-Time Updates
```
Scenario: Multiple agents, one customer

Agent 1 Browser:
- Login as Agent 1
- See available orders

Restaurant Dashboard:
- Create new order
- Assign to Agent 1

Agent 1 Browser:
✅ Toast notification appears
✅ Order list refreshes automatically
✅ New order count increments

Customer Browser (tracking page):
✅ Sees "Agent Assigned" notification
✅ Agent details appear
✅ Map updates with agent location
```

### 8️⃣ Test Offline/Online Toggle
```
Steps:
1. Agent turns toggle to "Offline"
   ✅ Status shows "🔴 Offline"
   ✅ Warning message appears
   ✅ Order list clears
   ✅ New orders not shown

2. Agent turns toggle back to "Online"
   ✅ Status shows "🟢 Online"
   ✅ Warning message hides
   ✅ Orders load immediately
```

### 9️⃣ Test Location Permission Denial
```
Steps:
1. Block location in browser settings
2. Login to delivery dashboard
3. ✅ Error message shown
4. ✅ Cannot accept orders
5. ✅ Red warning banner visible
6. Enable location in settings
7. Refresh page
8. ✅ Location permission re-requested
9. ✅ Normal functionality restored
```

### 🔟 Test Socket Notifications
```
Test Multiple Events:

Event: newAvailableOrder
✅ Agent receives toast notification
✅ Orders auto-refresh

Event: agent_{id}_order
✅ Specific agent gets notification
✅ Order appears in their list

Event: orderAccepted
✅ Customer tracking page updates
✅ Agent details appear
✅ Success notification shown

Event: agent_location_update
✅ Customer map updates agent marker
✅ Route line redraws
✅ ETA recalculates

Event: order_{id}_update
✅ Status changes propagate
✅ Progress bar updates
✅ UI reflects new state
```

---

## 🐛 Common Issues & Solutions

### Issue: Orders Not Loading
**Symptoms**: Empty order list, "Loading orders..." stuck

**Check**:
```javascript
// Browser Console:
localStorage.getItem('token')  // Should return JWT token
localStorage.getItem('user')   // Should return user object with id

// Network tab:
GET /api/delivery/{agentId}/orders → Status 200
```

**Solution**:
- Re-login if token expired
- Check agent ID is correct
- Verify online toggle is ON
- Check location permission granted

---

### Issue: Location Not Updating
**Symptoms**: Agent marker doesn't move, customer doesn't see updates

**Check**:
```javascript
// Browser Console:
navigator.geolocation.getCurrentPosition(
  pos => console.log(pos.coords), 
  err => console.error(err)
)
```

**Solution**:
- Enable location in browser settings
- Use HTTPS (geolocation requires secure context)
- Check socket connection: `socket.connected`
- Verify tracking has started

---

### Issue: Map Not Displaying
**Symptoms**: Blank map area, no markers

**Check**:
```javascript
// Browser Console:
typeof mappls  // Should return 'object'
map            // Should return Map instance
```

**Solution**:
- Wait for Mappls SDK to load (500ms timeout in code)
- Check API key is valid
- Clear browser cache
- Check console for JavaScript errors

---

### Issue: No Real-Time Updates
**Symptoms**: Customer doesn't see agent location changes

**Check**:
```javascript
// Browser Console (both agent & customer):
socket.connected  // Should be true
socket.id        // Should return socket ID
```

**Solution**:
- Verify socket server is running
- Check firewall/CORS settings
- Ensure same socket URL in both pages
- Check order ID matches in URL

---

## 📊 Test Checklist

### Agent Dashboard:
- [ ] Location permission requested on login
- [ ] Location permission denial handled gracefully
- [ ] Map centers on agent's location
- [ ] Agent marker appears on map
- [ ] Orders load with full details
- [ ] Available count updates correctly
- [ ] Active count updates correctly
- [ ] Accept order button works
- [ ] Start tracking button appears after acceptance
- [ ] Status update buttons work
- [ ] Online/Offline toggle works
- [ ] Toast notifications appear
- [ ] Socket events received
- [ ] Location updates sent every 5 seconds
- [ ] Logout clears data properly

### Customer Tracking:
- [ ] Order ID from URL loads correctly
- [ ] Order status displays correctly
- [ ] Progress bar shows accurate stage
- [ ] Restaurant marker appears
- [ ] Customer marker appears
- [ ] Agent marker appears after assignment
- [ ] Agent details card shows
- [ ] Agent photo displays
- [ ] Route line draws correctly
- [ ] Route updates when status changes
- [ ] ETA calculates and updates
- [ ] Call agent button works
- [ ] Chat button opens chat box
- [ ] Real-time location updates work
- [ ] Status change notifications appear
- [ ] Socket events received

### Integration:
- [ ] Agent acceptance triggers customer update
- [ ] Agent location updates reach customer
- [ ] Status changes sync in real-time
- [ ] Multiple agents can work simultaneously
- [ ] Multiple customers can track simultaneously
- [ ] No conflicts between orders
- [ ] Performance remains smooth with multiple updates

---

## 🎯 Performance Tests

### Load Test:
```
Scenario: 10 simultaneous orders
Expected: All agents receive notifications within 2 seconds
```

### Location Update Frequency:
```
Expected: Every 5 seconds
Tolerance: ±1 second
```

### Map Rendering:
```
Expected: Markers appear within 1 second
Route draws within 500ms
Smooth animations, no lag
```

### Socket Latency:
```
Expected: Events received within 500ms
Max acceptable: 2 seconds
```

---

## 🔒 Security Tests

### Authentication:
- [ ] Expired token redirects to login
- [ ] Invalid token shows error
- [ ] No token redirects to login
- [ ] Token persists across page refresh

### Authorization:
- [ ] Agent can only see their orders
- [ ] Customer can only track their orders
- [ ] Location data is validated
- [ ] API endpoints check permissions

---

## 📱 Device Testing

### Desktop:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari

### Mobile:
- [ ] Chrome (Android)
- [ ] Safari (iOS)
- [ ] Responsive layout
- [ ] Touch-friendly buttons
- [ ] Map controls work

---

## 🎬 End-to-End Test Script

```javascript
// Complete Flow Test
async function testCompleteFlow() {
  console.log("🧪 Starting End-to-End Test...");
  
  // 1. Login
  console.log("Step 1: Agent Login");
  await loginAgent();
  
  // 2. Location Permission
  console.log("Step 2: Grant Location Permission");
  await grantLocationPermission();
  
  // 3. Load Orders
  console.log("Step 3: Load Available Orders");
  const orders = await loadOrders();
  console.assert(orders.length > 0, "Orders should be available");
  
  // 4. Accept Order
  console.log("Step 4: Accept Order");
  const orderId = orders[0].id;
  await acceptOrder(orderId);
  
  // 5. Start Tracking
  console.log("Step 5: Start Live Tracking");
  await startTracking(orderId);
  
  // 6. Verify Customer Sees Updates
  console.log("Step 6: Customer Tracking Page");
  // Open tracking-live.html?orderId={orderId} in another window
  
  // 7. Update Status
  console.log("Step 7: Update Status to Picked Up");
  await updateStatus('picked_up');
  
  // 8. Complete Delivery
  console.log("Step 8: Mark as Delivered");
  await updateStatus('delivered');
  
  console.log("✅ All tests passed!");
}
```

---

## 📞 Quick Support

**Location Issues**: Check browser permissions → Settings → Site Settings → Location

**Socket Issues**: Verify connection → Console: `socket.connected`

**Map Issues**: Reload page → Clear cache → Check API key

**Order Issues**: Re-login → Check token → Verify agent ID

---

**Happy Testing! 🎉**

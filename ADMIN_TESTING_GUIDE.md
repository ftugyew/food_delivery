# 🧪 Admin Dashboard - Quick Testing Guide

**Updated**: December 6, 2025

---

## 🚀 Quick Start

### 1. Open Admin Dashboard
```
https://your-domain.com/admin-dashboard.html
```

### 2. Admin Login Required
- Email: Use an admin account
- Role must be: `admin`
- Token must be valid (not expired)

### 3. Expected Page Load
- ✅ No console errors
- ✅ "Dashboard loaded successfully" toast appears
- ✅ Stats load (may show 0 if no data)
- ✅ All sections appear

---

## 🧪 Test Cases (15 minutes)

### Test 1: Authentication Check
**Expected**: Admin-only access

```javascript
// Browser Console Test:
JSON.parse(localStorage.getItem("user"))
// Should show: { id: ..., name: ..., role: "admin", ... }
```

**Pass if**:
- ✅ Non-admin users redirected to login
- ✅ Expired token redirects to login
- ✅ No token redirects to login

---

### Test 2: Load Statistics
**Expected**: Stats display counts

**Steps**:
1. Open Admin Dashboard
2. Check top 3 cards: Total Users, Restaurants, Orders

**Pass if**:
- ✅ Numbers display (not undefined)
- ✅ Numbers match database counts
- ✅ Fallback works if endpoint missing

---

### Test 3: Pending Restaurants
**Expected**: Show restaurants with `status = 'pending'`

**Setup**: Create pending restaurant first
```javascript
// In database: status = 'pending'
```

**Steps**:
1. Scroll to "🏪 Pending Restaurants" section
2. Click "✅ Approve" button

**Pass if**:
- ✅ Pending restaurants display
- ✅ "✅ Approve" button works
- ✅ Success toast shows
- ✅ List refreshes (item removed)
- ✅ Stats update (+1 approved)

**Test Reject**:
1. Create another pending restaurant
2. Click "❌ Reject"

**Pass if**:
- ✅ "❌ Restaurant rejected" toast
- ✅ Item removed from pending
- ✅ Stats update

---

### Test 4: Menu Items
**Expected**: Display all menu items from all restaurants

**Steps**:
1. Scroll to "🍽️ All Menu Items" section
2. Check grid displays items

**Pass if**:
- ✅ Items load in 3-column grid
- ✅ Shows name, price, description
- ✅ Shows restaurant name
- ✅ Images display (or placeholder)
- ✅ No items → "No menu items found"

---

### Test 5: Delivery Boys
**Expected**: List active agents with map markers

**Steps**:
1. Scroll to "🚴 Delivery Boys" section
2. Toggle filter: "Active only" ↔ "All"
3. Check map for markers

**Pass if**:
- ✅ Filter toggles show/hide inactive
- ✅ Name, email, phone display
- ✅ Green markers appear on map for each agent
- ✅ Marker shows agent name on hover
- ✅ No agents → "No delivery boys"

---

### Test 6: Active Orders
**Expected**: Show pending/active orders with auto-assign

**Setup**: Create orders in database

**Steps**:
1. Scroll to "📦 Active Orders" section
2. See order card with "🤖 Auto-Assign Agent" button
3. Click button

**Pass if**:
- ✅ Order displays with ID, items, status
- ✅ Status shows color badge
- ✅ "🤖 Auto-Assign Agent" button works
- ✅ Success toast: "✅ Agent assigned"
- ✅ Order updates with agent_id

---

### Test 7: Featured Restaurants
**Expected**: CRUD operations for featured list

**Steps**:
1. Scroll to "🌟 Featured Restaurants"
2. Enter Restaurant ID (e.g., 1) and Position (e.g., 1)
3. Click "Add Featured"

**Pass if**:
- ✅ "✅ Restaurant added to featured list!" toast
- ✅ Restaurant appears in list below
- ✅ Shows position #, name, cuisine, status
- ✅ "Deactivate" button works (toggle active status)
- ✅ "Remove" button works (with confirmation)
- ✅ No featured items → "No featured restaurants yet"

---

### Test 8: Top Restaurants
**Expected**: CRUD operations for top list

**Steps**:
1. Scroll to "⭐ Top Restaurants"
2. Enter Restaurant ID and Position
3. Click "Add Top"

**Pass if**:
- ✅ "✅ Restaurant added to top list!" toast
- ✅ Restaurant appears with blue badge
- ✅ Can activate/deactivate
- ✅ Can remove with confirmation
- ✅ List shows position numbers

---

### Test 9: Banners Management
**Expected**: Upload and delete banner images

**Steps**:
1. Scroll to "🖼️ Homepage Popup Banner"
2. Click "Choose File" in upload form
3. Select image file (JPG/PNG)
4. Click "Upload"

**Pass if**:
- ✅ "✅ Banner uploaded" toast
- ✅ Banner appears in grid below
- ✅ Thumbnail displays
- ✅ Shows banner ID and status
- ✅ Click "×" button removes banner
- ✅ Confirmation dialog appears

---

### Test 10: Delivery Location Map
**Expected**: Interactive map for restaurant location

**Steps**:
1. Scroll to "📍 Delivery Boys Location" section
2. Enter restaurant ID in input
3. Click on map to place marker
4. Drag marker to refine location

**Pass if**:
- ✅ Map initializes (Mappls)
- ✅ Existing restaurants show as markers
- ✅ Click on marker → populates ID input
- ✅ Enter ID → existing restaurant location shows
- ✅ Can click map to place new marker
- ✅ Can drag marker to move
- ✅ On drag end → location saves
- ✅ "✅ Saved restaurant location" toast

---

### Test 11: Real-Time Notifications
**Expected**: Receive live order notifications via Socket.IO

**Steps**:
1. Open Admin Dashboard
2. Place order from customer app (different browser)
3. Watch "🔔 Notifications" section

**Pass if**:
- ✅ Notification appears in list
- ✅ "📦 New Order #X placed" format
- ✅ Active orders list updates
- ✅ Stats update (+1 order)

---

### Test 12: Agent Location Updates
**Expected**: Delivery boy location updates on map

**Steps**:
1. Open Admin Dashboard
2. Have agent app send location update
3. Watch map markers

**Pass if**:
- ✅ Agent marker moves on map
- ✅ Marker shows agent name & order ID
- ✅ Can open fullscreen map
- ✅ Route displays from agent → restaurant → customer

---

### Test 13: Fullscreen Map
**Expected**: Detailed route visualization

**Steps**:
1. Scroll to map section
2. Click "⤢ Fullscreen" button
3. Check route drawing

**Pass if**:
- ✅ Modal opens with large map
- ✅ Order info shows in top-left
- ✅ Three markers: Agent (green), Restaurant (red), Customer (blue)
- ✅ Polyline connects all three
- ✅ Bounds fit all markers
- ✅ Can close with ×  or Escape

---

### Test 14: Charts
**Expected**: Demo charts with sample data

**Steps**:
1. Scroll to "📈 Platform Analytics"
2. Check "Orders Growth" bar chart
3. Check "Revenue Growth" line chart

**Pass if**:
- ✅ Bar chart shows Mon-Sun with values
- ✅ Line chart shows Jan-Jun revenue
- ✅ Charts responsive on mobile
- ✅ No console errors if Chart.js missing

---

### Test 15: Error Scenarios
**Expected**: Graceful error handling

**Test 15a: Network Error**
```javascript
// Simulate offline in DevTools
// Try to perform action
```
**Pass if**: Error toast shows gracefully

**Test 15b: Invalid Token**
```javascript
// Edit token in localStorage
localStorage.setItem("token", "invalid.token.here");
// Refresh page
```
**Pass if**: Redirects to login

**Test 15c: Missing API Endpoint**
```javascript
// Change BASE URL to wrong address
// Refresh page
```
**Pass if**: Falls back to alternative endpoints or shows error

---

## 🐛 Debug Console Commands

### Check User
```javascript
JSON.parse(localStorage.getItem("user"))
```

### Check Token
```javascript
localStorage.getItem("token")
```

### Check All Local Storage
```javascript
for (let i = 0; i < localStorage.length; i++) {
  console.log(localStorage.key(i), localStorage.getItem(localStorage.key(i)))
}
```

### Manually Trigger Functions
```javascript
loadStats()
loadPendingRestaurants()
loadDeliveryBoys()
loadActiveOrders()
```

### Check Socket.IO Connection
```javascript
socket.connected  // true/false
socket.id         // unique socket ID
```

### Listen to Socket Events
```javascript
socket.onAny((event, ...args) => {
  console.log(event, args)
})
```

---

## 📊 Expected API Responses

### GET /api/admin/users/count
```json
{ "count": 42 }
```

### GET /api/admin/restaurants
```json
[
  { "id": 1, "name": "Pizza Place", "status": "pending", "email": "...", ... },
  { "id": 2, "name": "Burger King", "status": "approved", "email": "...", ... }
]
```

### GET /api/admin/orders
```json
[
  { 
    "id": 1, 
    "user_id": 5, 
    "restaurant_id": 2, 
    "items": "[{\"name\": \"Pizza\"}]", 
    "status": "pending",
    "delivery_address": "123 Main St",
    "delivery_lat": 17.385,
    "delivery_lng": 78.486
  }
]
```

### POST /api/admin/orders/:id/assign
```json
{ "success": true, "agent_id": 3 }
```

---

## ✅ Final Checklist

Before declaring ready:

- [ ] All 15 test cases pass
- [ ] No console errors
- [ ] No console warnings (except maybe Mappls)
- [ ] All toasts show correctly
- [ ] All API calls have Authorization header
- [ ] Non-admin redirects to login
- [ ] Expired token redirects to login
- [ ] Fallback endpoints work
- [ ] Mobile responsive
- [ ] Charts load
- [ ] Map loads
- [ ] Socket.IO connected
- [ ] Real-time updates work
- [ ] All CRUD operations work
- [ ] Error handling graceful

---

## 🆘 Troubleshooting

### Issue: "No pending restaurants" always shows
**Solution**: Check database has restaurants with `status = 'pending'`

### Issue: Stats show 0
**Solution**: Check database has data, or API endpoints working

### Issue: Map doesn't load
**Solution**: Check Mappls API key valid, may be rate-limited

### Issue: Delivery boys not on map
**Solution**: Check agents table has lat/lng values

### Issue: Agent assignment fails
**Solution**: Check `/api/admin/orders/:id/assign` endpoint exists

### Issue: Socket notifications don't appear
**Solution**: Check Socket.IO connection: `socket.connected`

### Issue: "Not authorized" error
**Solution**: Check token is admin role and not expired

---

## 📱 Mobile Testing

- [ ] Landscape mode works
- [ ] Cards stack single column
- [ ] Buttons stay clickable
- [ ] Map scrollable
- [ ] Forms usable on mobile keyboard
- [ ] Toast notifications visible
- [ ] No horizontal scroll

---

## 🎯 Performance Benchmarks

| Metric | Target | Check |
|--------|--------|-------|
| Dashboard load | < 3s | Time to all data loaded |
| API response | < 500ms | Network tab |
| Chart render | < 1s | Should show quickly |
| Map init | < 2s | Mappls marker setup |
| Toast animation | 0.3s | Smooth fade |

---

## 📞 Support

If issues occur:
1. Check browser console for errors
2. Check Network tab for failed requests
3. Check backend server logs
4. Verify API endpoints exist
5. Verify database has test data
6. Check token is valid

---

**Last Updated**: December 6, 2025  
**Status**: Testing Guide Complete ✅

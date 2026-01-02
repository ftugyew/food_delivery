# 🗺️ LIVE TRACKING - QUICK REFERENCE CARD

## Socket Events Summary

| Event | Direction | Listener | Payload |
|-------|-----------|----------|---------|
| `new_order_restaurant` | Backend→Restaurant | Restaurant HTML | Order details |
| `new_order_for_agents` | Backend→Agents | Agent Dashboard | Order + location |
| `order_accepted_by_agent` | Backend→All | Customer/Restaurant/Admin | Agent ID |
| `agent_location_update` | Agent→Backend→Maps | Customer/Restaurant/Admin | lat, lng, timestamp |
| `order_status_change` | Agent→Backend→All | All watchers | tracking_status |
| `order_delivered` | Agent→Backend→All | All watchers | Delivery confirmed |
| `order_taken` | Backend→Agents | Other agents | "Order already taken" |

---

## API Endpoints

### Restaurant
```
POST /api/restaurant/orders/:id/accept
  Input: auth token
  Output: { status: "waiting_for_agent" }

POST /api/restaurant/orders/:id/ready
  Input: auth token
  Output: { tracking_status: "ready" }

GET /api/restaurant/orders
  Input: auth token, ?status=...
  Output: [ order, order, ... ]
```

### Agent
```
POST /api/agent/orders/:id/accept
  Input: auth token
  Output: { status: "agent_assigned", agent_id: 5 }
  Error 409: "Order already taken by another agent"

POST /api/agent/orders/:id/status
  Input: { tracking_status: "in_transit" }
  Output: { tracking_status: "in_transit" }

GET /api/agent/orders
  Input: auth token
  Output: [ { order, restaurant, customer }, ... ]
```

---

## Socket Events (Frontend Code)

### Customer Side
```javascript
// Listen for assignment
socket.on(`order_${orderId}_customers`, (data) => {
  if (data.event === 'agent_assigned') {
    console.log('Agent assigned:', data.agent_id);
    updateMapMarker(data.agent_current_lat, data.agent_current_lng);
  }
});

// Listen for live tracking
socket.on(`order_${orderId}_tracking`, (data) => {
  if (data.event === 'agent_location_update') {
    updateAgentMarker(data.latitude, data.longitude);
    recalculateETA();
  }
  if (data.event === 'status_change') {
    updateStatusDisplay(data.tracking_status);
  }
});
```

### Agent Side
```javascript
// Send location every 5 seconds
setInterval(() => {
  navigator.geolocation.getCurrentPosition((pos) => {
    socket.emit('agent_location_update', {
      agent_id: agentId,
      order_id: orderId,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
    });
  });
}, 5000);

// Update status
socket.emit('update_tracking_status', {
  order_id: orderId,
  agent_id: agentId,
  tracking_status: 'in_transit'
});

// Mark delivered
socket.emit('order_delivered', {
  order_id: orderId,
  agent_id: agentId
});
```

### Restaurant Side
```javascript
// Join restaurant room
socket.emit('join_restaurant', { restaurant_id: restaurantId });

// Listen for new orders
socket.on('new_order_restaurant', (order) => {
  addOrderCard(order);
});

// Accept order
fetch(`/api/restaurant/orders/${orderId}/accept`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Status Flow

```
waiting_for_restaurant (customer placed)
    ↓ [restaurant accepts]
waiting_for_agent (broadcasting to agents)
    ↓ [agent accepts]
agent_assigned + tracking: "accepted"
    ↓ [agent moves]
tracking: "going_to_restaurant"
    ↓ [agent arrives]
tracking: "arrived_at_restaurant"
    ↓ [food ready, agent picks up]
tracking: "picked_up"
    ↓ [agent leaves]
tracking: "in_transit"
    ↓ [agent arrives at customer]
tracking: "delivered"
    ↓ [complete]
Delivered
```

---

## Database Checks

### Check Order Status
```sql
SELECT id, status, tracking_status, agent_id, created_at 
FROM orders WHERE id = 123;
```

### Check Agent Availability
```sql
SELECT id, is_busy, lat, lng FROM agents WHERE id = 5;
```

### View Location History
```sql
SELECT * FROM agent_locations 
WHERE order_id = 123 
ORDER BY created_at DESC 
LIMIT 20;
```

### Find Stuck Orders
```sql
SELECT id, status, agent_id, created_at 
FROM orders 
WHERE status IN ('waiting_for_agent', 'agent_assigned')
AND created_at < NOW() - INTERVAL 1 HOUR;
```

---

## Race Condition Test

### Scenario: 2 Agents Accept Same Order

```javascript
// Start 2 simultaneous requests
Promise.all([
  fetch('/api/agent/orders/123/accept', {
    headers: { 'Authorization': `Bearer ${agent1Token}` }
  }),
  fetch('/api/agent/orders/123/accept', {
    headers: { 'Authorization': `Bearer ${agent2Token}` }
  })
]).then(async (responses) => {
  const r1 = await responses[0].json();
  const r2 = await responses[1].json();
  
  console.log('Agent 1:', r1); // { success: true }
  console.log('Agent 2:', r2); // { error: "Order already taken" }
});
```

**Expected:**
- Agent 1: HTTP 200 ✅
- Agent 2: HTTP 409 ❌

---

## Common Issues

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Agent doesn't see orders | is_online=0 or no lat/lng | `UPDATE agents SET is_online=1, lat=..., lng=...` |
| Both agents get same order | No transaction locks | Verify `SELECT FOR UPDATE` in code |
| Location not updating | Agent not sending/socket error | Check agent app logs |
| Status stuck in "agent_assigned" | Delivery endpoint not called | Call `socket.emit('order_delivered', ...)` |
| Customer map not updating | Not subscribed to room | `socket.emit('join_order_room', ...)` |

---

## Testing Checklist

- [ ] Create order
- [ ] Restaurant accepts
- [ ] Agents receive broadcast
- [ ] 2 agents accept simultaneously (only 1 wins)
- [ ] Agent sends location every 5s
- [ ] Maps update in real-time
- [ ] Status changes propagate
- [ ] Delivery complete → agent freed
- [ ] Database shows location history
- [ ] No duplicate assignments

---

## Performance Targets

| Operation | Time |
|-----------|------|
| Accept order | < 500ms |
| Location update | < 100ms |
| Socket broadcast | < 50ms |
| Race detection | < 1ms |

---

## Files Created

1. `backend/routes/restaurant-orders.js` - Restaurant endpoints
2. `backend/routes/agent-orders.js` - Agent endpoints (race-safe)
3. `backend/socket-handlers.js` - Real-time socket events
4. `LIVE_TRACKING_COMPLETE_IMPLEMENTATION.md` - Full design doc
5. `LIVE_TRACKING_TESTING_GUIDE.md` - Test procedures
6. `LIVE_TRACKING_IMPLEMENTATION_SUMMARY.md` - Summary

---

## Integration Checklist

- [ ] Add routes to server.js
- [ ] Initialize socket handler
- [ ] Create `agent_locations` table
- [ ] Test restaurant accept
- [ ] Test agent race condition
- [ ] Test location updates
- [ ] Test status progression
- [ ] Frontend map integration
- [ ] Deploy to staging
- [ ] 1-day monitoring
- [ ] Production rollout

---

## Success Criteria

✅ Order flows from restaurant → agents → delivery  
✅ Only 1 agent can accept per order  
✅ Live map updates every 5 seconds  
✅ Status changes broadcast to all watchers  
✅ Agent freed after delivery  
✅ Zero race condition conflicts  
✅ All operations complete within target times

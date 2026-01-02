# 🧪 LIVE TRACKING IMPLEMENTATION - TESTING GUIDE

## Quick Start Testing

### Prerequisites
- Backend running (Render or local)
- 3+ agents with is_online=1, is_busy=0, lat/lng set
- 1 restaurant with lat/lng set
- 1 customer with delivery address (lat/lng)

---

## Test Scenario: Complete Order Flow

### 1️⃣ Customer Places Order

```bash
curl -X POST https://food-delivery-backend-cw3m.onrender.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -d '{
    "user_id": 1,
    "restaurant_id": 5,
    "items": [{"id": 1, "name": "Biryani", "price": 300, "quantity": 1}],
    "total": 350,
    "payment_type": "COD"
  }'
```

**Expected Response:**
```json
{
  "message": "Order created",
  "order": {
    "id": 123,
    "order_id": "TND-20260102-4521",
    "status": "waiting_for_restaurant",
    "tracking_status": "pending",
    "delivery_lat": 28.6139,
    "delivery_lng": 77.2090
  }
}
```

**Check Database:**
```sql
SELECT * FROM orders WHERE id = 123;
-- status = 'waiting_for_restaurant'
-- agent_id = NULL
```

---

### 2️⃣ Restaurant Accepts Order

**URL:** `POST /api/restaurant/orders/:orderId/accept`

```bash
curl -X POST https://food-delivery-backend-cw3m.onrender.com/api/restaurant/orders/123/accept \
  -H "Authorization: Bearer $RESTAURANT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order accepted by restaurant",
  "order_id": 123,
  "status": "waiting_for_agent"
}
```

**Check Database:**
```sql
SELECT status FROM orders WHERE id = 123;
-- status = 'waiting_for_agent'
```

**Check Socket Events (Browser Console):**
```javascript
// Should see in frontend logs:
// "Order #123 broadcasted to agents"
```

---

### 3️⃣ Agents Receive Broadcast

**On Agent Dashboard (should appear automatically):**
- Order card appears with restaurant name and location
- Distance to restaurant calculated
- "Accept Order" button enabled

**Check Frontend Console:**
```javascript
socket.on('new_order_for_agents', (order) => {
  console.log('📡 Order for agents:', order);
  // order_id: 123
  // restaurant_lat: 28.5355
  // restaurant_lng: 77.3910
  // delivery_lat: 28.6139
  // delivery_lng: 77.2090
});
```

---

### 4️⃣ Agent Accepts Order (Race Test)

**Agent 1 accepts:**

```bash
curl -X POST https://food-delivery-backend-cw3m.onrender.com/api/agent/orders/123/accept \
  -H "Authorization: Bearer $AGENT_1_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order accepted successfully",
  "order_id": 123,
  "agent_id": 5,
  "status": "agent_assigned"
}
```

**Check Database:**
```sql
SELECT agent_id, status FROM orders WHERE id = 123;
-- agent_id = 5
-- status = 'agent_assigned'

SELECT is_busy FROM agents WHERE id = 5;
-- is_busy = 1
```

---

### 5️⃣ Race Condition: Agent 2 Tries Same Order

**Agent 2 tries to accept (should fail):**

```bash
curl -X POST https://food-delivery-backend-cw3m.onrender.com/api/agent/orders/123/accept \
  -H "Authorization: Bearer $AGENT_2_TOKEN"
```

**Expected Response (409 Conflict):**
```json
{
  "error": "Order was accepted by another agent",
  "status": "conflict"
}
```

**Frontend Behavior:**
- Agent 2's UI receives socket event `order_taken`
- Order card disappears from Agent 2's dashboard
- Agent 2 can still accept other orders

---

### 6️⃣ Live Location Tracking

**Agent sends location every 5 seconds:**

```javascript
// In agent app
setInterval(() => {
  navigator.geolocation.getCurrentPosition((pos) => {
    socket.emit('agent_location_update', {
      agent_id: 5,
      order_id: 123,
      latitude: 28.5355 + (Math.random() * 0.01),
      longitude: 77.3910 + (Math.random() * 0.01)
    });
  });
}, 5000);
```

**Check Database (location history):**
```sql
SELECT * FROM agent_locations 
WHERE agent_id = 5 AND order_id = 123 
ORDER BY created_at DESC 
LIMIT 10;
```

**Should see ~10-20 rows if tracking for 1-2 minutes**

**Check Frontend (Customer/Restaurant/Admin):**
- Agent marker moves on map every 5 seconds
- ETA updates dynamically
- Polyline recalculates

---

### 7️⃣ Status Progression

**Agent marks "Going to Restaurant":**

```javascript
socket.emit('update_tracking_status', {
  order_id: 123,
  agent_id: 5,
  tracking_status: 'going_to_restaurant'
});
```

**Check Database:**
```sql
SELECT tracking_status FROM orders WHERE id = 123;
-- tracking_status = 'going_to_restaurant'
```

**Status sequence:**
1. `going_to_restaurant`
2. `arrived_at_restaurant`
3. `picked_up`
4. `in_transit`
5. `delivered`

---

### 8️⃣ Order Delivered

**Agent marks delivered:**

```javascript
socket.emit('order_delivered', {
  order_id: 123,
  agent_id: 5
});
```

**Check Database:**
```sql
SELECT status, tracking_status FROM orders WHERE id = 123;
-- status = 'Delivered'
-- tracking_status = 'delivered'

SELECT is_busy FROM agents WHERE id = 5;
-- is_busy = 0 (agent freed)
```

**Frontend Behavior:**
- Customer sees "Delivered!" message
- Rating prompt appears
- Live map hides order
- Admin dashboard moves to completed

---

## Automated Test Cases

### Test 1: Happy Path (All Green)

```javascript
async function testHappyPath() {
  // 1. Create order
  const order = await createOrder(customerId, restaurantId);
  assert.equal(order.status, 'waiting_for_restaurant');

  // 2. Restaurant accepts
  await restaurantAccept(order.id, restaurantId);
  const updated = await getOrder(order.id);
  assert.equal(updated.status, 'waiting_for_agent');

  // 3. Agent accepts
  const result = await agentAccept(order.id, agentId);
  assert.equal(result.status, 'agent_assigned');

  // 4. Track location
  for (let i = 0; i < 5; i++) {
    await updateLocation(agentId, order.id, lat + i*0.001, lng + i*0.001);
    await sleep(1000);
  }

  // 5. Mark delivered
  await deliverOrder(order.id, agentId);
  const final = await getOrder(order.id);
  assert.equal(final.status, 'Delivered');
}
```

### Test 2: Race Condition (Only One Wins)

```javascript
async function testRaceCondition() {
  const order = await createOrder(customerId, restaurantId);
  await restaurantAccept(order.id, restaurantId);

  // Both agents try simultaneously
  const results = await Promise.allSettled([
    agentAccept(order.id, agent1Id),
    agentAccept(order.id, agent2Id)
  ]);

  // One succeeds, one fails
  const successes = results.filter(r => r.status === 'fulfilled' && r.value.status === 'agent_assigned');
  const failures = results.filter(r => r.status === 'fulfilled' && r.value.status === 'conflict');
  
  assert.equal(successes.length, 1);
  assert.equal(failures.length, 1);
}
```

### Test 3: Agent Can't Accept If Busy

```javascript
async function testAgentBusyCheck() {
  // Create 2 orders
  const order1 = await createOrder(customerId, restaurantId);
  const order2 = await createOrder(customerId, restaurantId);
  
  await restaurantAccept(order1.id, restaurantId);
  await restaurantAccept(order2.id, restaurantId);

  // Agent accepts order 1
  await agentAccept(order1.id, agentId);
  const agent = await getAgent(agentId);
  assert.equal(agent.is_busy, 1);

  // Agent tries to accept order 2 (should fail)
  try {
    await agentAccept(order2.id, agentId);
    assert.fail('Should have thrown');
  } catch (err) {
    assert.equal(err.status, 409);
    assert.includes(err.message, 'already busy');
  }
}
```

---

## Monitoring Checklist

Before production:

- [ ] All 3 agents receive order notification
- [ ] Only 1 agent can accept
- [ ] 2 other agents see "already taken" error
- [ ] Customer sees agent location update every 5s
- [ ] Restaurant sees agent moving on map
- [ ] Admin dashboard shows live agents
- [ ] Each status update broadcast to all watchers
- [ ] Database shows location history
- [ ] Agent freed after delivery
- [ ] Order marked as Delivered

---

## Common Issues & Solutions

### Issue: Agent doesn't receive order broadcast
**Solution:** Check if agent is online and has lat/lng
```sql
SELECT is_online, lat, lng FROM agents WHERE id = ?;
-- All should be non-NULL
```

### Issue: Race condition - two agents get same order
**Solution:** Verify SELECT FOR UPDATE + transaction
```javascript
// Log should show "affected_rows = 0" for loser
console.log('Update result:', result[0].affectedRows);
```

### Issue: Location not updating on map
**Solution:** Check socket room subscriptions
```javascript
// Customer should be in room:
socket.join(`order_${orderId}_customers`);
socket.on(`order_${orderId}_tracking`, ...);
```

### Issue: Agent stuck in is_busy=1
**Solution:** Check delivered webhook
```sql
SELECT * FROM orders WHERE agent_id = 5 AND is_busy = 1;
-- Should be empty after delivery
```

---

## Load Testing

For production readiness, test with:
- 100 simultaneous orders
- 50 agents competing
- Each agent sending location every 5s (10 updates/minute per agent)
- 500 total location updates/minute

**Expected Performance:**
- Order acceptance: < 500ms
- Location update: < 100ms
- Socket broadcast: < 50ms latency

---

## Success Criteria

✅ Customer places order → Restaurant notified in < 1s  
✅ Restaurant accepts → Agents notified in < 2s  
✅ Only 1 agent accepts (race-safe)  
✅ Live map updates < 1s latency  
✅ Status changes broadcast to all watchers  
✅ Agent freed after delivery  
✅ Database consistent (no duplicates or orphans)

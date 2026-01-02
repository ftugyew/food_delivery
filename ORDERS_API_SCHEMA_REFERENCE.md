# POST /api/orders - SCHEMA & SQL REFERENCE

## orders Table Schema (CONFIRMED)

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  restaurant_id INT NOT NULL,
  agent_id INT DEFAULT NULL,
  items JSON DEFAULT NULL,
  total DECIMAL(10,2) DEFAULT NULL,
  order_id VARCHAR(12) UNIQUE NOT NULL,
  payment_type VARCHAR(50) DEFAULT NULL,
  estimated_delivery DATETIME DEFAULT NULL,
  status ENUM(
    'waiting_for_agent',
    'agent_assigned',
    'confirmed',
    'picked_up',
    'delivered',
    'cancelled'
  ) DEFAULT 'waiting_for_agent',
  delivery_address VARCHAR(255) DEFAULT NULL,
  delivery_lat DECIMAL(10,7) DEFAULT NULL,
  delivery_lng DECIMAL(10,7) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  tracking_status ENUM(
    'pending',
    'accepted',
    'going_to_restaurant',
    'arrived_at_restaurant',
    'picked_up',
    'in_transit',
    'delivered',
    'cancelled'
  ) DEFAULT 'pending',
  agent_assigned_at DATETIME DEFAULT NULL,
  picked_up_at DATETIME DEFAULT NULL,
  delivered_at DATETIME DEFAULT NULL,
  customer_phone VARCHAR(20) DEFAULT NULL,
  restaurant_phone VARCHAR(20) DEFAULT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  INDEX idx_user_id (user_id),
  INDEX idx_restaurant_id (restaurant_id),
  INDEX idx_agent_id (agent_id),
  INDEX idx_status (status),
  INDEX idx_tracking_status (tracking_status),
  INDEX idx_created_at (created_at)
);
```

---

## Column Reference (POST /api/orders)

### ✅ CORRECT COLUMNS (Must Use These)

| Column | Type | Source | Notes |
|--------|------|--------|-------|
| user_id | INT | req.body.user_id | Customer ID |
| restaurant_id | INT | req.body.restaurant_id | Restaurant ID |
| **delivery_lat** | DECIMAL | **users.lat** | ⭐ DELIVERY LATITUDE |
| **delivery_lng** | DECIMAL | **users.lng** | ⭐ DELIVERY LONGITUDE |
| **delivery_address** | VARCHAR | req.body.delivery_address OR users.address | Delivery location |
| customer_phone | VARCHAR | users.phone | Customer contact |
| restaurant_phone | VARCHAR | restaurants.phone | Restaurant contact |
| items | JSON | req.body.items | Order items |
| total | DECIMAL | req.body.total | Order total |
| order_id | VARCHAR | Generated (random 12-digit) | Unique order ID |
| payment_type | VARCHAR | req.body.payment_type | Payment method |
| estimated_delivery | DATETIME | req.body.estimated_delivery | Delivery time |
| status | ENUM | 'waiting_for_agent' | Order status |
| tracking_status | ENUM | 'pending' | Tracking status |

### ❌ WRONG COLUMNS (NEVER USE These)

```
❌ orders.lat       (DOES NOT EXIST - use delivery_lat)
❌ orders.lng       (DOES NOT EXIST - use delivery_lng)
❌ orders.address   (DOES NOT EXIST - use delivery_address)
```

---

## Enum Values

### Order Status (orders.status)
```
'waiting_for_agent'  ← POST /api/orders uses this
'agent_assigned'     ← agent-orders.js sets this
'confirmed'
'picked_up'
'delivered'
'cancelled'
```

### Tracking Status (orders.tracking_status)
```
'pending'            ← POST /api/orders uses this
'accepted'           ← agent-orders.js sets this
'going_to_restaurant'
'arrived_at_restaurant'
'picked_up'
'in_transit'
'delivered'
'cancelled'
```

**Rule:** Only use these exact values. Do NOT invent new status strings.

---

## SQL Queries for POST /api/orders

### 1. Fetch User Location (Source)
```sql
SELECT lat, lng, address, phone 
FROM users 
WHERE id = ?
LIMIT 1;
```
**Purpose:** Get delivery location from user profile  
**Parameters:** [userId]  
**Returns:** User's lat (→ delivery_lat), lng (→ delivery_lng), address (→ delivery_address), phone (→ customer_phone)

### 2. Check Order ID Uniqueness
```sql
SELECT id 
FROM orders 
WHERE order_id = ? 
LIMIT 1;
```
**Purpose:** Verify generated order_id is unique  
**Parameters:** [randomOrderId]  
**Returns:** Empty if unique, 1 row if duplicate

### 3. Fetch Restaurant Phone
```sql
SELECT phone 
FROM restaurants 
WHERE id = ? 
LIMIT 1;
```
**Purpose:** Get restaurant contact info  
**Parameters:** [restaurantId]  
**Returns:** restaurant_phone

### 4. INSERT Base Order
```sql
INSERT INTO orders (
  user_id,
  restaurant_id,
  delivery_lat,
  delivery_lng,
  delivery_address,
  customer_phone,
  restaurant_phone,
  status,
  tracking_status
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
```

**Parameters:**
```javascript
[
  userId,                    // req.body.user_id
  restaurantId,              // req.body.restaurant_id
  snapLat,                   // users.lat
  snapLng,                   // users.lng
  snapAddress,               // req.body.delivery_address OR users.address
  customerPhone,             // users.phone
  restaurantPhone,           // restaurants.phone
  'waiting_for_agent',       // Enum value
  'pending'                  // Enum value
]
```

**Returns:** insertId (new order's database ID)

### 5. UPDATE Order with Items/Total
```sql
UPDATE orders
SET items = ?,
    total = ?,
    order_id = ?,
    payment_type = ?,
    estimated_delivery = ?
WHERE id = ?;
```

**Parameters:**
```javascript
[
  itemsJsonString,           // JSON.stringify(req.body.items)
  totalValue,                // req.body.total
  uniqueOrderId,             // Generated 12-digit ID
  paymentType,               // req.body.payment_type
  estimatedDeliveryTime,     // req.body.estimated_delivery
  orderDbId                  // From INSERT result
]
```

---

## Data Mapping (Explicit)

### Request → Database Mapping
```
Frontend sends:
{
  user_id: 5,
  restaurant_id: 3,
  items: [{id: 1, qty: 2, price: 100}],
  total: 200,
  payment_type: "card",
  estimated_delivery: "2025-01-02 14:30:00",
  delivery_address: "Optional override"
}

Backend fetches:
SELECT lat, lng, address, phone FROM users WHERE id = 5
→ {lat: 28.7041, lng: 77.1025, address: "Default Address", phone: "9999999999"}

SELECT phone FROM restaurants WHERE id = 3
→ {phone: "8888888888"}

Backend creates mapping:
user_id ← 5
restaurant_id ← 3
delivery_lat ← 28.7041 (from users.lat)
delivery_lng ← 77.1025 (from users.lng)
delivery_address ← "Optional override" (request) OR "Default Address" (users.address)
customer_phone ← "9999999999" (users.phone)
restaurant_phone ← "8888888888" (restaurants.phone)
items ← JSON.stringify([{id: 1, qty: 2, price: 100}])
total ← 200
order_id ← Generated random 12-digit
payment_type ← "card"
estimated_delivery ← "2025-01-02 14:30:00"
status ← "waiting_for_agent"
tracking_status ← "pending"

Database stores:
id | user_id | restaurant_id | delivery_lat | delivery_lng | delivery_address | customer_phone | restaurant_phone | items | total | order_id | payment_type | estimated_delivery | status | tracking_status
123| 5       | 3             | 28.7041      | 77.1025      | Optional override| 9999999999    | 8888888888       | [...]| 200   | 123456789012 | card | 2025-01-02 14:30:00 | waiting_for_agent | pending
```

---

## Validation Rules

### Required Fields
```javascript
if (!userId || !restaurantId || !totalVal) {
  return 400: "Missing required fields: user_id, restaurant_id, total"
}
```

### User Validation
```javascript
const [userRows] = await db.execute(
  "SELECT id, lat, lng FROM users WHERE id = ?",
  [userId]
);
if (!userRows || userRows.length === 0) {
  return 404: "User not found"
}
```

### Location Validation
```javascript
const snapLat = Number(user.lat);
const snapLng = Number(user.lng);

if (!Number.isFinite(snapLat) || !Number.isFinite(snapLng)) {
  return 400: "User delivery location missing. Please set location in profile."
}
```

### Order ID Uniqueness
```javascript
for (let i = 0; i < 10; i++) {
  const randId = generateRandomId();
  const [existing] = await db.execute(
    "SELECT id FROM orders WHERE order_id = ? LIMIT 1",
    [randId]
  );
  if (!existing || !existing.length) {
    uniqueOrderId = randId;
    break;
  }
}
if (!uniqueOrderId) {
  uniqueOrderId = Date.now().toString();  // Fallback
}
```

---

## Response Format

### Success (201 Created)
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 123,
    "order_id": "123456789012",
    "user_id": 5,
    "restaurant_id": 3,
    "items": [{"id": 1, "qty": 2, "price": 100}],
    "total": 200,
    "agent_id": null,
    "status": "waiting_for_agent",
    "tracking_status": "pending",
    "payment_type": "card",
    "estimated_delivery": "2025-01-02 14:30:00",
    "delivery_address": "Apt 5",
    "delivery_lat": 28.7041,
    "delivery_lng": 77.1025,
    "customer_phone": "9999999999",
    "restaurant_phone": "8888888888"
  }
}
```

### Error: Missing Location (400)
```json
{
  "error": "User delivery location missing. Please set location in profile."
}
```

### Error: Missing Fields (400)
```json
{
  "error": "Missing required fields: user_id, restaurant_id, total"
}
```

### Error: User Not Found (404)
```json
{
  "error": "User not found"
}
```

### Error: Server Error (500)
```json
{
  "error": "Order creation failed",
  "details": "Error message here"
}
```

---

## Database Verification Queries

### Check Order Was Created Correctly
```sql
SELECT 
  id,
  user_id,
  restaurant_id,
  delivery_lat,
  delivery_lng,
  delivery_address,
  customer_phone,
  restaurant_phone,
  status,
  tracking_status,
  created_at
FROM orders
WHERE id = 123
LIMIT 1;
```

**Expected:**
- All fields populated
- delivery_lat and delivery_lng are numeric
- status = 'waiting_for_agent'
- tracking_status = 'pending'
- No NULL values in critical fields

### Check All Orders Are Correct
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN delivery_lat IS NOT NULL THEN 1 END) as with_lat,
  COUNT(CASE WHEN delivery_lng IS NOT NULL THEN 1 END) as with_lng,
  COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user,
  COUNT(CASE WHEN restaurant_id IS NOT NULL THEN 1 END) as with_restaurant
FROM orders
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

**Expected:** All counts should be equal

### Verify No Legacy Columns
```sql
-- These should all fail with "Unknown column" error:
SELECT lat FROM orders LIMIT 1;
-- Error: Unknown column 'lat'

SELECT lng FROM orders LIMIT 1;
-- Error: Unknown column 'lng'

-- This is CORRECT - orders.address doesn't exist (use delivery_address):
SELECT address FROM orders LIMIT 1;
-- Error: Unknown column 'address'
```

### Check Status Values
```sql
SELECT DISTINCT status FROM orders;
-- Should return: waiting_for_agent, agent_assigned, confirmed, picked_up, delivered, cancelled

SELECT DISTINCT tracking_status FROM orders;
-- Should return: pending, accepted, going_to_restaurant, arrived_at_restaurant, picked_up, in_transit, delivered, cancelled
```

### Find Problematic Orders
```sql
SELECT id, user_id, delivery_lat, delivery_lng, status
FROM orders
WHERE delivery_lat IS NULL 
   OR delivery_lng IS NULL 
   OR user_id IS NULL
   OR restaurant_id IS NULL;
-- Should return: (empty)
```

---

## Integration with Agent Assignment

When agent accepts order (in agent-orders.js):

```sql
-- SAFE: Updates agent_id and status, does NOT touch delivery location
UPDATE orders
SET agent_id = ?,
    status = 'agent_assigned',
    tracking_status = 'accepted',
    agent_assigned_at = NOW()
WHERE id = ? 
  AND agent_id IS NULL  -- Race condition prevention
FOR UPDATE;  -- Transaction lock
```

**CRITICAL RULES:**
- ✅ DO update: agent_id, status, tracking_status
- ❌ DO NOT update: delivery_lat, delivery_lng, delivery_address (immutable)
- ✅ DO use: FOR UPDATE (prevents race conditions)
- ✅ DO use: Transaction (atomic operation)

---

## Performance Optimized Queries

### Indexes Created
```sql
INDEX idx_user_id (user_id)
INDEX idx_restaurant_id (restaurant_id)
INDEX idx_agent_id (agent_id)
INDEX idx_status (status)
INDEX idx_tracking_status (tracking_status)
INDEX idx_created_at (created_at)
```

### Query Performance
- Fetch user: O(1) with idx_user_id
- Check unique order_id: O(log n) with unique constraint
- Fetch restaurant: O(1) with primary key
- Insert order: O(log n) with auto-increment
- Find orders by status: O(log n) with idx_status

---

## Summary

### What to Use
```
✅ delivery_lat      (from users.lat)
✅ delivery_lng      (from users.lng)
✅ delivery_address  (from users.address or override)
✅ customer_phone    (from users.phone)
✅ restaurant_phone  (from restaurants.phone)
```

### What NOT to Use
```
❌ lat      (does not exist)
❌ lng      (does not exist)
❌ address  (does not exist)
```

### SQL to Execute
```
1. SELECT lat, lng, address, phone FROM users WHERE id = ?
2. SELECT id FROM orders WHERE order_id = ? (for uniqueness)
3. SELECT phone FROM restaurants WHERE id = ?
4. INSERT INTO orders (user_id, restaurant_id, delivery_lat, delivery_lng, ...)
5. UPDATE orders SET items = ?, total = ?, order_id = ?, ...
```

### Status Values
```
Order status: 'waiting_for_agent'
Tracking status: 'pending'
```

That's it! You now have everything needed to understand and fix POST /api/orders.

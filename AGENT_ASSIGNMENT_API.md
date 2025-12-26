# Agent Auto-Assignment API Documentation

## Endpoint Overview

**Route**: `POST /api/admin/orders/:orderId/assign`  
**Authentication**: Required (Admin Bearer Token)  
**Database Transaction**: Yes (Atomic with row locking)

## Purpose

Automatically finds and assigns the nearest available delivery agent to a waiting order. Uses Haversine formula to calculate distances and MySQL transactions with row locking to ensure data consistency.

## Request

```http
POST /api/admin/orders/123/assign
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**URL Parameters**:
- `orderId` (required): The numeric ID of the order to assign

**Request Body**: Empty object `{}`

## Response Formats

### ✅ Success Response (200)

```json
{
  "success": true,
  "message": "Agent assigned successfully",
  "orderId": 123,
  "agentId": 5,
  "agent": {
    "id": 5,
    "name": "Rajesh Kumar",
    "phone": "9876543210",
    "vehicleType": "Bike",
    "distanceKm": "2.34",
    "currentLocation": {
      "lat": 28.6139,
      "lng": 77.2090
    }
  }
}
```

### ❌ Error: Order Not Found (404)

```json
{
  "success": false,
  "error": "Order not found",
  "orderId": 999
}
```

### ❌ Error: Order Already Assigned (400)

```json
{
  "success": false,
  "error": "Order is already assigned to an agent",
  "orderId": 123,
  "assignedAgentId": 5
}
```

### ❌ Error: Invalid Order Status (400)

```json
{
  "success": false,
  "error": "Order status is 'Delivered', must be 'waiting_for_agent'",
  "orderId": 123,
  "currentStatus": "Delivered"
}
```

### ❌ Error: No Available Agents (503)

```json
{
  "success": false,
  "error": "No available agents at the moment",
  "orderId": 123,
  "message": "All delivery agents are either offline or busy. Please try again shortly."
}
```

### ❌ Error: Invalid Delivery Coordinates (400)

```json
{
  "success": false,
  "error": "Invalid delivery coordinates",
  "orderId": 123,
  "coordinates": {
    "lat": null,
    "lng": null
  }
}
```

### ❌ Error: Database Error (500)

```json
{
  "success": false,
  "error": "Failed to assign agent",
  "orderId": 123,
  "details": "Database connection lost"
}
```

## Implementation Details

### 1. Order Validation

The endpoint validates:
- ✅ Order exists in database
- ✅ Order status is exactly `'waiting_for_agent'`
- ✅ Order is not already assigned (agent_id IS NULL)
- ✅ Delivery coordinates are valid (not NULL, not NaN)

### 2. Agent Selection Criteria

The nearest agent is selected based on:
- ✅ `is_online = 1` (agent is currently online)
- ✅ `is_busy = 0` (agent is not currently delivering)
- ✅ `status = 'Active'` (agent is approved and active)
- ✅ `lat IS NOT NULL AND lng IS NOT NULL` (location available)

### 3. Distance Calculation

Uses Haversine formula in SQL:

```sql
6371 * acos(
  cos(radians(delivery_lat)) * 
  cos(radians(agent.lat)) * 
  cos(radians(agent.lng) - radians(delivery_lng)) +
  sin(radians(delivery_lat)) * 
  sin(radians(agent.lat))
) as distance_km
```

Returns distance in kilometers.

### 4. Atomic Database Operations

Uses MySQL transaction with row locking:

```
1. BEGIN TRANSACTION
2. SELECT ... FROM orders WHERE id = ? (validate order)
3. SELECT ... FROM restaurants (get coordinates)
4. SELECT ... FROM agents WHERE ... FOR UPDATE (lock agent row)
   - Ensures no other process assigns this agent
5. UPDATE agents SET is_busy = 1, status = 'Busy' WHERE id = ?
6. UPDATE orders SET agent_id = ?, status = 'agent_assigned', tracking_status = 'accepted' WHERE id = ?
7. COMMIT TRANSACTION
8. Release connection
```

### 5. Error Handling

- Validates all inputs before database operations
- Rolls back transaction on any error
- Releases database connection in finally block
- Logs operations for debugging

## Database Schema Requirements

### Orders Table

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_id INT NULL,
  restaurant_id INT NOT NULL,
  status ENUM('waiting_for_agent', 'agent_assigned', ...) DEFAULT 'waiting_for_agent',
  tracking_status VARCHAR(50),
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  ...
);
```

### Agents Table

```sql
CREATE TABLE agents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  is_online BOOLEAN DEFAULT FALSE,
  is_busy BOOLEAN DEFAULT FALSE,
  status ENUM('Active', 'Inactive', 'Busy') DEFAULT 'Inactive',
  name VARCHAR(255),
  phone VARCHAR(20),
  vehicle_type VARCHAR(50),
  ...
);
```

### Restaurants Table

```sql
CREATE TABLE restaurants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lat DECIMAL(10, 8),     -- or latitude
  lng DECIMAL(11, 8),     -- or longitude
  ...
);
```

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:5000/api/admin/orders/123/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:5000/api/admin/orders/123/assign', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

const data = await response.json();
if (data.success) {
  console.log(`Assigned to agent: ${data.agent.name}`);
}
```

### JavaScript (Axios)

```javascript
const client = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

try {
  const response = await client.post(`/admin/orders/123/assign`);
  console.log(response.data);
} catch (error) {
  console.error(error.response.data);
}
```

### Python

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'http://localhost:5000/api/admin/orders/123/assign',
    headers=headers,
    json={}
)

if response.status_code == 200:
    data = response.json()
    print(f"Assigned to: {data['agent']['name']}")
else:
    print(f"Error: {response.json()['error']}")
```

## Testing

### Run Test Suite

```bash
cd backend
node test-assignment-api.js
```

The test script:
1. ✅ Checks for orders awaiting assignment
2. ✅ Lists available agents
3. ✅ Attempts assignment on first waiting order
4. ✅ Verifies database was updated

### Manual Testing Steps

1. **Create Test Data**:
   ```sql
   -- Create test order with waiting_for_agent status
   INSERT INTO orders (user_id, restaurant_id, delivery_lat, delivery_lng, status)
   VALUES (1, 1, 28.6139, 77.2090, 'waiting_for_agent');
   
   -- Create test agent online and available
   UPDATE agents SET is_online = 1, is_busy = 0, status = 'Active', lat = 28.5355, lng = 77.3910
   WHERE id = 1;
   ```

2. **Make API Call**:
   ```bash
   curl -X POST http://localhost:5000/api/admin/orders/1/assign \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

3. **Verify Results**:
   ```sql
   -- Check order was updated
   SELECT id, agent_id, status, tracking_status FROM orders WHERE id = 1;
   -- Should show: agent_id = 1, status = 'agent_assigned', tracking_status = 'accepted'
   
   -- Check agent was marked busy
   SELECT id, is_busy, status FROM agents WHERE id = 1;
   -- Should show: is_busy = 1, status = 'Busy'
   ```

## Performance Considerations

- **Haversine in SQL**: Calculated for all available agents, uses index on `(is_online, is_busy, status)`
- **Row Locking**: Prevents double-assignment in high-concurrency scenarios
- **Connection Pool**: Uses mysql2 connection pooling
- **Index Recommendations**:
  ```sql
  CREATE INDEX idx_agents_availability ON agents(is_online, is_busy, status);
  CREATE INDEX idx_orders_status_agent ON orders(status, agent_id);
  ```

## Troubleshooting

### Issue: "No available agents"
- Check agents have `is_online = 1`, `is_busy = 0`, `status = 'Active'`
- Verify agents have valid coordinates (`lat IS NOT NULL AND lng IS NOT NULL`)
- Check restaurant and delivery coordinates are valid

### Issue: 401 Unauthorized
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Ensure request is sent to admin endpoint (`/api/admin/...`)

### Issue: 404 Order Not Found
- Verify order ID exists and matches parameter
- Check order status is `'waiting_for_agent'`
- Don't confuse numeric ID with order_id string

### Issue: Connection Timeout
- Verify MySQL server is running
- Check database credentials in .env
- Verify connection pool size is adequate

## Security Notes

- ✅ Requires admin authentication (Bearer token)
- ✅ Uses parameterized queries (no SQL injection)
- ✅ Transaction isolation prevents race conditions
- ✅ Row locking prevents concurrent assignment
- ✅ Input validation on all parameters
- ✅ Comprehensive error messages without exposing internals

## Future Enhancements

- [ ] Priority assignment (VIP orders, higher ratings)
- [ ] Zone-based assignment (specific areas)
- [ ] Load balancing (balance orders among agents)
- [ ] Rejection handling (allow agents to reject)
- [ ] Timeout handling (auto-reassign if agent doesn't accept)
- [ ] Metrics tracking (assignment success rate, average distance)

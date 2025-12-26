# Agent Auto-Assignment - Implementation Checklist & Commands

## 🎯 Quick Start

### 1. Verify Installation
```bash
cd c:\xampp\htdocs\food-delivery\backend
node -v                    # Check Node.js is installed
npm list mysql2            # Verify mysql2 is installed
npm list express           # Verify express is installed
```

### 2. Check Database Connection
```bash
# The db.js file now supports MYSQL* environment variables from .env
cat .env | grep MYSQL      # Verify credentials are set
```

### 3. Start Backend Server
```bash
npm start
# or
node server.js
```

Watch for logs:
```
✅ MySQL Connected Successfully
✅ Server running on port 5000
```

### 4. Test the Endpoint
```bash
# Method 1: cURL
curl -X POST http://localhost:5000/api/admin/orders/1/assign \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Method 2: Run test script
node test-assignment-api.js
```

### 5. Verify in Database
```bash
# Check order was assigned
mysql -u root food_delivery
SELECT id, agent_id, status FROM orders WHERE id=1;

# Check agent is busy
SELECT id, is_busy, status FROM agents WHERE id=1;
```

## 📋 Files Created/Modified

### Modified Files (2)
- ✅ `backend/routes/admin.js` - Added POST /api/admin/orders/:orderId/assign
- ✅ `backend/db.js` - Fixed environment variable mapping

### New Documentation Files (4)
- ✅ `AGENT_ASSIGNMENT_API.md` - Full API documentation
- ✅ `AGENT_ASSIGNMENT_QUICK_REF.md` - Quick reference guide
- ✅ `AGENT_ASSIGNMENT_IMPLEMENTATION.md` - Implementation summary
- ✅ `AGENT_ASSIGNMENT_CODE_REFERENCE.md` - Exact code added

### New Helper Files (2)
- ✅ `backend/test-assignment-api.js` - Automated test script
- ✅ `backend/AGENT_ASSIGNMENT_SQL_HELPER.sql` - SQL helper commands

## 🔍 Verification Steps

### Step 1: Database Schema Check
```sql
-- Run in MySQL
USE food_delivery;

-- Verify orders table has required columns
DESCRIBE orders;
-- Must have: id, agent_id, restaurant_id, status, tracking_status, delivery_lat, delivery_lng

-- Verify agents table has required columns  
DESCRIBE agents;
-- Must have: id, lat, lng, is_online, is_busy, status, name, phone, vehicle_type

-- Verify restaurants table has required columns
DESCRIBE restaurants;
-- Must have: id, lat/latitude, lng/longitude
```

### Step 2: Prepare Test Data
```sql
-- Set up test agent (available)
UPDATE agents SET 
  is_online = 1, 
  is_busy = 0, 
  status = 'Active', 
  lat = 28.5355, 
  lng = 77.3910
WHERE id = 1;

-- Create test order (waiting for assignment)
INSERT INTO orders (
  user_id, 
  restaurant_id, 
  delivery_lat, 
  delivery_lng, 
  status,
  delivery_address,
  items,
  total
) VALUES (
  1, 
  1, 
  28.6139, 
  77.2090, 
  'waiting_for_agent',
  '123 Test St',
  '[{"name":"Test","quantity":1}]',
  299.99
);

-- Get the new order ID (note it down)
SELECT LAST_INSERT_ID() as order_id;
```

### Step 3: Get Admin Token
```bash
# Make a login request to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'

# Response will include "token": "eyJhbGc..."
# Copy this token for the next step
```

### Step 4: Call the Assignment API
```bash
# Replace ORDER_ID with the ID from Step 2
# Replace YOUR_TOKEN with the token from Step 3

curl -X POST http://localhost:5000/api/admin/orders/ORDER_ID/assign \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Success response should look like:
# {
#   "success": true,
#   "message": "Agent assigned successfully",
#   "orderId": ORDER_ID,
#   "agentId": 1,
#   "agent": {
#     "id": 1,
#     "name": "Agent Name",
#     "phone": "9876543210",
#     "vehicleType": "Bike",
#     "distanceKm": "12.34",
#     "currentLocation": {
#       "lat": 28.5355,
#       "lng": 77.3910
#     }
#   }
# }
```

### Step 5: Verify Database Changes
```sql
-- Check order was updated
SELECT id, agent_id, status, tracking_status FROM orders WHERE id = ORDER_ID;
-- Expected: agent_id=1, status='agent_assigned', tracking_status='accepted'

-- Check agent was marked busy
SELECT id, is_busy, status FROM agents WHERE id = 1;
-- Expected: is_busy=1, status='Busy'
```

## 📊 Full Test Workflow

### Terminal Commands (Copy-Paste Ready)

```bash
# 1. Open MySQL and create test data
mysql -u root food_delivery << 'EOF'
UPDATE agents SET is_online=1, is_busy=0, status='Active', lat=28.5355, lng=77.3910 WHERE id=1;
INSERT INTO orders (user_id, restaurant_id, delivery_lat, delivery_lng, status, delivery_address, items, total) 
VALUES (1, 1, 28.6139, 77.2090, 'waiting_for_agent', 'Test Address', '[{"name":"Item","quantity":1}]', 299.99);
SELECT LAST_INSERT_ID() as new_order_id;
EOF

# 2. Save the order ID from output above

# 3. Get admin token
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin_password"}')
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 4. Assign agent to order (replace ORDER_ID with the ID from step 2)
curl -X POST http://localhost:5000/api/admin/orders/ORDER_ID/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Verify in MySQL
mysql -u root food_delivery -e "SELECT agent_id, status FROM orders WHERE id=ORDER_ID; SELECT is_busy, status FROM agents WHERE id=1;"
```

## 🧪 Automated Test Script

```bash
# Make sure test-assignment-api.js is executable
cd backend
chmod +x test-assignment-api.js

# Run the test (requires ADMIN_TOKEN env var)
ADMIN_TOKEN="your_jwt_token" node test-assignment-api.js
```

## 🐛 Debugging

### Check Backend Logs
```bash
# Watch backend console for logs:
# 📍 Attempting to assign agent for order X
# ✅ Found nearest agent: Y (Agent Name) at Z km away
# 🔒 Agent Y marked as busy
# 📦 Order X assigned to agent Y
```

### Common Issues

**Issue**: 404 Not Found
```
Solution: Verify route is registered in admin.js
Check: POST /api/admin/orders/:orderId/assign exists
```

**Issue**: 401 Unauthorized  
```
Solution: Check JWT token is valid
Command: curl ... -H "Authorization: Bearer YOUR_TOKEN"
```

**Issue**: 400 Bad Request
```
Solution: Check order status is 'waiting_for_agent'
Query: SELECT status FROM orders WHERE id=ORDER_ID;
```

**Issue**: 503 No available agents
```
Solution: Create available agents with correct status
Query: UPDATE agents SET is_online=1, is_busy=0, status='Active', lat=..., lng=...
```

**Issue**: 500 Database Error
```
Solution: Check MySQL is running and credentials are correct
Check .env file has MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE
```

## 📈 Performance Testing

### Load Test
```bash
# Install Apache Bench if needed: apt-get install apache2-utils

# Run 100 assignment requests
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -p /dev/null \
  http://localhost:5000/api/admin/orders/1/assign
```

### Monitor Database Performance
```sql
-- Check query execution time
EXPLAIN SELECT a.id FROM agents a 
WHERE a.is_online=1 AND a.is_busy=0 AND a.status='Active' 
ORDER BY DISTANCE_CALC ASC LIMIT 1;

-- Create indexes if needed
CREATE INDEX idx_agents_availability ON agents(is_online, is_busy, status);
CREATE INDEX idx_orders_status_agent ON orders(status, agent_id);
```

## 📚 Documentation Links

- **Full API Docs**: [AGENT_ASSIGNMENT_API.md](AGENT_ASSIGNMENT_API.md)
- **Quick Reference**: [AGENT_ASSIGNMENT_QUICK_REF.md](AGENT_ASSIGNMENT_QUICK_REF.md)
- **Implementation Details**: [AGENT_ASSIGNMENT_IMPLEMENTATION.md](AGENT_ASSIGNMENT_IMPLEMENTATION.md)
- **Code Reference**: [AGENT_ASSIGNMENT_CODE_REFERENCE.md](AGENT_ASSIGNMENT_CODE_REFERENCE.md)
- **SQL Helper**: [backend/AGENT_ASSIGNMENT_SQL_HELPER.sql](backend/AGENT_ASSIGNMENT_SQL_HELPER.sql)
- **Test Script**: [backend/test-assignment-api.js](backend/test-assignment-api.js)

## ✅ Final Checklist

- [ ] Backend code deployed
- [ ] Database schema verified
- [ ] Environment variables set (.env file)
- [ ] MySQL running and accessible
- [ ] Test data created (agent and order)
- [ ] Admin token obtained
- [ ] API endpoint tested (GET request returns 200)
- [ ] Database changes verified (agent busy, order assigned)
- [ ] Logs show successful assignment
- [ ] Error handling works (test with invalid order ID)
- [ ] Documentation reviewed
- [ ] Ready for production use

## 🚀 Deployment Checklist

- [ ] Code pushed to repository
- [ ] Backend restarted with new code
- [ ] .env file verified on production server
- [ ] Database backups taken
- [ ] Test run on production with test data
- [ ] Monitor logs for first 24 hours
- [ ] Performance baseline established
- [ ] Team notified of new endpoint
- [ ] Documentation shared with team

## 📞 Support

For issues or questions:

1. **Check Logs**: Review backend console and MySQL logs
2. **Run Test Script**: `node test-assignment-api.js`
3. **Verify Data**: Use SQL helper script to check database
4. **Review Documentation**: Check API docs for response formats
5. **Debug SQL**: Use EXPLAIN to analyze query performance

## 🎉 Success Indicators

✅ GET `/api/admin/orders/1/assign` returns 200  
✅ Response includes `success: true` and agent details  
✅ `orders.agent_id` is updated in database  
✅ `orders.status` is set to 'agent_assigned'  
✅ `agents.is_busy` is set to 1  
✅ Backend logs show "Assignment successful"  
✅ No errors in MySQL logs  

**You're ready to go! 🚀**

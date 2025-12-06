# 🔌 Tindo API Documentation

**Base URL**: `https://food-delivery-backend-cw3m.onrender.com/api`

**Authentication**: Include `Authorization: Bearer <token>` header for protected routes

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [Orders](#orders)
3. [Restaurants](#restaurants)
4. [Delivery](#delivery)
5. [Users](#users)
6. [Menu](#menu)
7. [Search](#search)
8. [Error Handling](#error-handling)

---

## 🔐 Authentication

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepass123",
  "role": "customer" | "restaurant" | "delivery_agent",
  
  // For restaurants:
  "restaurant_name": "Pizza Palace",
  "description": "Best pizza in town",
  "cuisine": "Italian",
  "eta": 30,
  
  // For delivery agents:
  "vehicle_type": "Motorcycle",
  "aadhar": "123456789012"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```

---

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "customer",
  "redirectTo": "/index.html",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

---

## 📦 Orders

### Place Order
```http
POST /api/orders/new
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": 1,
  "restaurant_id": 5,
  "items": [
    {
      "menu_item_id": 12,
      "name": "Margherita Pizza",
      "price": 250,
      "quantity": 2
    }
  ],
  "total_price": 500,
  "payment_method": "COD" | "razorpay",
  "address": "123 Main St, Delhi",
  "lat": 28.6139,
  "lng": 77.2090
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "order_id": 101,
  "order_code": "TND-20251206-4521",
  "agent_id": 3,
  "message": "Order placed successfully"
}
```

---

### Get All Orders (Customer)
```http
GET /api/orders
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": 101,
    "user_id": 1,
    "restaurant_id": 5,
    "restaurant_name": "Pizza Palace",
    "items": "[{...}]",
    "total": 500,
    "status": "Confirmed",
    "agent_id": 3,
    "created_at": "2025-12-06T10:30:00Z",
    "delivery_address": "123 Main St",
    "payment_type": "COD"
  }
]
```

---

### Get Orders for Restaurant
```http
GET /api/orders/restaurant/:restaurant_id
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": 101,
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "items": "[...]",
    "total": 500,
    "status": "Preparing",
    "created_at": "2025-12-06T10:30:00Z"
  }
]
```

---

### Get Orders for Delivery Agent
```http
GET /api/orders/agent/:agent_id
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
[
  {
    "id": 101,
    "restaurant_name": "Pizza Palace",
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "delivery_address": "123 Main St",
    "total": 500,
    "status": "Picked Up",
    "items": "[...]"
  }
]
```

---

### Update Order Status
```http
POST /api/orders/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 101,
  "status": "Preparing" | "Ready" | "Picked Up" | "In-Transit" | "Completed"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Order updated successfully"
}
```

---

## 🏪 Restaurants

### Get All Restaurants
```http
GET /api/restaurants
```

**Response** (200 OK):
```json
[
  {
    "id": 5,
    "name": "Pizza Palace",
    "description": "Best pizza in town",
    "cuisine": "Italian",
    "eta": 30,
    "image_url": "pizza-palace.jpg",
    "status": "approved",
    "phone": "9876543210",
    "address": "123 Main St, Delhi"
  }
]
```

---

### Get Featured Restaurants
```http
GET /api/featured-restaurants
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "restaurant_id": 5,
    "restaurant_name": "Pizza Palace",
    "position": 1,
    "is_active": 1
  }
]
```

---

### Approve Restaurant (Admin)
```http
PUT /api/restaurants/approve/:restaurant_id
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "message": "Restaurant approved ✅"
}
```

---

## 🚗 Delivery

### Update Agent Location
```http
POST /api/delivery/update-location
Authorization: Bearer <token>
Content-Type: application/json

{
  "agent_id": 3,
  "lat": 28.6245,
  "lng": 77.2156
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Location updated",
  "agent_id": 3,
  "lat": 28.6245,
  "lng": 77.2156
}
```

**Socket Event** (Emitted to customer):
```json
{
  "agent_id": 3,
  "lat": 28.6245,
  "lng": 77.2156
}
```

---

### Get Agent Location
```http
GET /api/delivery/location/:order_id
```

**Response** (200 OK):
```json
{
  "agent_id": 3,
  "name": "Raj Kumar",
  "phone": "9876543210",
  "lat": 28.6245,
  "lng": 77.2156
}
```

---

### Set Agent Availability
```http
POST /api/delivery/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "agent_id": 3,
  "available": true | false
}
```

**Response** (200 OK):
```json
{
  "message": "Availability updated",
  "status": "Active" | "Inactive"
}
```

---

## 👤 Users

### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "role": "customer",
  "status": "approved"
}
```

---

### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com",
  "password": "newpass123"
}
```

**Response** (200 OK):
```json
{
  "message": "Profile updated"
}
```

---

## 🍽️ Menu

### Get Menu for Restaurant
```http
GET /api/menu/by-restaurant/:restaurant_id
```

**Response** (200 OK):
```json
[
  {
    "id": 12,
    "restaurant_id": 5,
    "item_name": "Margherita Pizza",
    "description": "Classic pizza with cheese",
    "price": 250,
    "category": "Pizza",
    "image_url": "margherita.jpg",
    "created_at": "2025-12-01T00:00:00Z"
  }
]
```

---

### Add Menu Item (Restaurant)
```http
POST /api/menu
Authorization: Bearer <restaurant_token>
Content-Type: multipart/form-data

form-data:
  item_name: "Margherita Pizza"
  price: 250
  description: "Classic pizza with cheese"
  category: "Pizza"
  image: <file>
```

**Response** (201 Created):
```json
{
  "message": "Dish added",
  "id": 12
}
```

---

### Delete Menu Item (Restaurant)
```http
DELETE /api/menu/:menu_id
Authorization: Bearer <restaurant_token>
```

**Response** (200 OK):
```json
{
  "message": "Deleted"
}
```

---

## 🔍 Search

### Search Items & Restaurants
```http
GET /api/search?q=pizza&limit=10&offset=0
```

**Query Parameters**:
- `q` (required): Search query
- `limit` (optional): Max results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "results": [
    {
      "menu_id": 12,
      "item_name": "Margherita Pizza",
      "price": 250,
      "restaurant_id": 5,
      "restaurant_name": "Pizza Palace",
      "restaurant_address": "123 Main St"
    }
  ],
  "total": 45
}
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": "Optional error details"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Order retrieved |
| 201 | Created | Order placed |
| 400 | Bad Request | Missing fields |
| 401 | Unauthorized | Invalid token |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Order doesn't exist |
| 500 | Server Error | Database error |

---

### Example Error Response
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Missing required fields: user_id, restaurant_id, items, total",
  "details": "user_id is required"
}
```

---

## 🔄 WebSocket Events (Socket.IO)

### Client → Server Events

**Send Agent Location**:
```javascript
socket.emit('agentLocation', {
  agentId: 3,
  lat: 28.6245,
  lng: 77.2156
});
```

---

### Server → Client Events

**New Order Notification** (Restaurant):
```javascript
socket.on('newOrder', (order) => {
  console.log('New order received:', order);
});
```

**Order Status Update** (Customer):
```javascript
socket.on(`trackOrder_${orderId}`, (location) => {
  console.log('Agent location:', location);
});
```

**Agent Location Update** (Broadcast):
```javascript
socket.on('agentLocation', (data) => {
  console.log('Agent moved:', data);
});
```

**Order for Specific Agent**:
```javascript
socket.on(`orderForAgent_${agentId}`, (order) => {
  console.log('New order assigned:', order);
});
```

---

## 📊 Rate Limiting

All endpoints are subject to rate limiting:
- **Per IP**: 100 requests per 15 minutes
- **Per Token**: 500 requests per hour

Rate limit headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1702036200
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS**
2. **Store token securely** (httpOnly cookie or localStorage)
3. **Validate all inputs** server-side
4. **Use parameterized queries** (prevent SQL injection)
5. **Implement CORS** for frontend origin
6. **Rotate JWT secret** regularly

---

## 📝 Example Client Code

```javascript
const API_BASE = "https://food-delivery-backend-cw3m.onrender.com/api";

async function placeOrder(orderData) {
  const token = localStorage.getItem("token");
  
  const response = await fetch(`${API_BASE}/orders/new`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return await response.json();
}

// Usage
try {
  const result = await placeOrder({
    user_id: 1,
    restaurant_id: 5,
    items: [...],
    total_price: 500,
    payment_method: "COD",
    address: "123 Main St",
    lat: 28.6139,
    lng: 77.2090
  });
  console.log("Order placed:", result);
} catch (error) {
  console.error("Error:", error.message);
}
```

---

**Last Updated**: December 6, 2025
**API Version**: 1.0

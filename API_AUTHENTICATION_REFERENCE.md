# API Authentication Reference

## Endpoints Summary

### POST `/api/auth/register` - Customer/Admin Registration
**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "9876543210",
  "password": "securePassword123",
  "role": "customer"
}
```

**Response (Success - Auto-Approved):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Response (Pending Approval - Restaurant/Delivery):**
```json
{
  "message": "Registration submitted, pending admin approval",
  "user": {
    "id": 2,
    "name": "Restaurant Owner",
    "email": "restaurant@example.com",
    "role": "restaurant"
  }
}
```

---

### POST `/api/auth/register-restaurant` - Restaurant Registration with Photo
**Request:** (multipart/form-data)
```
name: "Owner Name"
email: "owner@example.com"
phone: "9876543210"
password: "securePassword123"
role: "restaurant"
restaurant_name: "Pizza Palace"
description: "Best pizza in town"
cuisine: "Italian"
eta: 30
photo: <file>
```

**Response:**
```json
{
  "message": "Restaurant registration submitted, pending admin approval",
  "user": {
    "id": 3,
    "name": "Owner Name",
    "email": "owner@example.com",
    "role": "restaurant"
  }
}
```

---

### POST `/api/auth/login` - Universal Login Endpoint
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response: Invalid Credentials
```json
{
  "error": "Invalid email or password"
}
```
**HTTP Status:** 401

#### Response: Customer Login
```json
{
  "success": true,
  "role": "customer",
  "redirectTo": "/index.html",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

#### Response: Admin Login
```json
{
  "success": true,
  "role": "admin",
  "redirectTo": "/admin-dashboard.html",
  "token": "eyJhbGc...",
  "user": {
    "id": 4,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Response: Restaurant Login - Pending Approval
```json
{
  "success": false,
  "status": "pending",
  "role": "restaurant",
  "message": "Waiting for admin approval",
  "user": {
    "id": 5,
    "name": "Restaurant Owner",
    "email": "restaurant@example.com",
    "role": "restaurant",
    "restaurant_id": 10
  }
}
```

#### Response: Restaurant Login - Rejected
```json
{
  "success": false,
  "status": "rejected",
  "role": "restaurant",
  "message": "Your restaurant was rejected",
  "user": {
    "id": 5,
    "name": "Restaurant Owner",
    "email": "restaurant@example.com",
    "role": "restaurant",
    "restaurant_id": 10
  }
}
```

#### Response: Restaurant Login - Approved
```json
{
  "success": true,
  "status": "approved",
  "role": "restaurant",
  "redirectTo": "/restaurant-dashboard.html",
  "token": "eyJhbGc...",
  "user": {
    "id": 5,
    "name": "Restaurant Owner",
    "email": "restaurant@example.com",
    "role": "restaurant",
    "restaurant_id": 10
  }
}
```

#### Response: Delivery Agent Login
```json
{
  "success": true,
  "role": "delivery",
  "redirectTo": "/delivery-dashboard.html",
  "token": "eyJhbGc...",
  "user": {
    "id": 6,
    "name": "Delivery Agent",
    "email": "agent@example.com",
    "role": "delivery"
  }
}
```

---

## Key Features

### ✅ Bcrypt Password Hashing
- All passwords are hashed using bcrypt with 10 salt rounds
- Passwords are verified using `bcrypt.compare()`
- No plain-text passwords are stored or returned

### ✅ Role-Based Access
- **customer** → Redirects to index.html
- **restaurant** → Redirects to restaurant-dashboard.html (after approval)
- **delivery_agent** → Redirects to delivery-dashboard.html
- **admin** → Redirects to admin-dashboard.html

### ✅ Restaurant Status Tracking
- **pending** → Waiting for admin approval
- **rejected** → Application was rejected
- **approved** → Can login and access dashboard

### ✅ JWT Token Generation
- Token includes: id, email, role, restaurant_id (if applicable)
- Expires in 7 days
- Use in Authorization header: `Authorization: Bearer <token>`

### ✅ Secure Password Handling
- Passwords NEVER sent in API responses
- Only password_hash stored in database
- Safe against rainbow table attacks
- Safe against timing attacks (bcrypt.compare)

---

## Frontend Integration Example

```javascript
// Handle login response
if (response.status === 401) {
  alert("Invalid email or password");
} else {
  const json = await response.json();
  
  if (json.success === false && json.status === "pending") {
    alert("Your restaurant is waiting for admin approval");
    return;
  }
  
  if (json.success === false && json.status === "rejected") {
    alert("Your restaurant application was rejected");
    return;
  }
  
  // Store authentication data
  if (json.token) {
    localStorage.setItem("token", json.token);
  }
  if (json.user) {
    localStorage.setItem("user", JSON.stringify(json.user));
  }
  
  // Redirect to appropriate dashboard
  if (json.redirectTo) {
    window.location.href = json.redirectTo;
  } else {
    window.location.href = "index.html";
  }
}
```

---

## Error Responses

| Scenario | Status | Response |
|----------|--------|----------|
| Missing email/password | 400 | `{ "error": "Email and password required" }` |
| Email not found | 401 | `{ "error": "Invalid email or password" }` |
| Wrong password | 401 | `{ "error": "Invalid email or password" }` |
| Server error | 500 | `{ "error": "Login failed" }` |
| Registration: Email exists | 400 | `{ "error": "Email already registered" }` |
| Registration: Missing fields | 400 | `{ "error": "All fields required" }` |


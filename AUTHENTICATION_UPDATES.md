# Authentication System Update - Railway MySQL Integration

## Overview
Updated the entire authentication system to properly integrate with Railway MySQL database using bcrypt password hashing and secure password verification.

## Changes Made

### 1. Database Column Updates
**Old Column Name:** `password` (plain text)  
**New Column Name:** `password_hash` (bcrypt hashed)

All SQL queries updated from:
```sql
-- OLD (UNSAFE)
INSERT INTO users (..., password, ...) VALUES (?, ?, ?)
SELECT * FROM users WHERE email = ? AND password = ?
```

To:
```sql
-- NEW (SECURE)
INSERT INTO users (..., password_hash, ...) VALUES (?, ?, ?)
SELECT * FROM users WHERE email = ?
-- Password verified separately using bcrypt.compare()
```

### 2. Backend Dependencies
**File:** `backend/package.json`
- ✅ `bcryptjs` already installed (v3.0.2)
- ✅ `jsonwebtoken` already installed (v9.0.2)

### 3. Routes File Updates
**File:** `backend/routes/auth.js`

#### 3.1 Added Bcrypt Import
```javascript
const bcrypt = require("bcryptjs");
```

#### 3.2 POST `/api/auth/register` Endpoint
**Changes:**
- ✅ Hash password before storing: `await bcrypt.hash(password, 10)`
- ✅ Insert using `password_hash` column
- ✅ Returns `success: true` flag with token (if approved)
- ✅ No password/password_hash sent in response
- ✅ Response format:
```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

#### 3.3 POST `/api/auth/register-restaurant` Endpoint
**Changes:**
- ✅ Hash password before storing: `await bcrypt.hash(password, 10)`
- ✅ Insert using `password_hash` column
- ✅ Returns user data without password_hash
- ✅ Same secure response format

#### 3.4 POST `/api/auth/login` Endpoint
**Key Changes:**
- ✅ Fetch user by email only: `SELECT * FROM users WHERE email = ?`
- ✅ Removed unsafe password comparison
- ✅ Use bcrypt verification: `await bcrypt.compare(password, user.password_hash)`
- ✅ Return 401 on invalid credentials
- ✅ Role-based responses with proper redirects:

**Admin Login Response:**
```json
{
  "success": true,
  "role": "admin",
  "redirectTo": "/admin-dashboard.html",
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Restaurant Login - Pending Approval:**
```json
{
  "success": false,
  "status": "pending",
  "role": "restaurant",
  "message": "Waiting for admin approval",
  "user": { ... }
}
```

**Restaurant Login - Rejected:**
```json
{
  "success": false,
  "status": "rejected",
  "role": "restaurant",
  "message": "Your restaurant was rejected",
  "user": { ... }
}
```

**Restaurant Login - Approved:**
```json
{
  "success": true,
  "status": "approved",
  "role": "restaurant",
  "redirectTo": "/restaurant-dashboard.html",
  "token": "<JWT_TOKEN>",
  "user": { ... }
}
```

**Delivery Agent Login Response:**
```json
{
  "success": true,
  "role": "delivery",
  "redirectTo": "/delivery-dashboard.html",
  "token": "<JWT_TOKEN>",
  "user": { ... }
}
```

**Customer Login Response:**
```json
{
  "success": true,
  "role": "customer",
  "redirectTo": "/index.html",
  "token": "<JWT_TOKEN>",
  "user": { ... }
}
```

### 4. Security Improvements
✅ **Password Hashing:** All passwords now bcrypt-hashed with 10 salt rounds  
✅ **No Plain Text Passwords:** `password_hash` never sent in API responses  
✅ **Secure Comparison:** Uses `bcrypt.compare()` instead of `===`  
✅ **Error Logging:** Console logs all auth errors for debugging  
✅ **401 Status:** Returns 401 for invalid credentials (not 400)  

### 5. Response Format Standardization
All endpoints now include `success` flag for client-side handling:
```javascript
// Client-side example
if (json.success) {
  // Store token and redirect
  localStorage.setItem("token", json.token);
  window.location.href = json.redirectTo || "index.html";
} else if (json.status === "pending") {
  alert("Your restaurant is waiting for approval");
} else if (json.status === "rejected") {
  alert("Your application was rejected");
}
```

### 6. Database Schema Requirements
Ensure your Railway MySQL `users` table has:
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hashed (NOT plain password)
  role ENUM('customer', 'restaurant', 'delivery_agent', 'admin') DEFAULT 'customer',
  restaurant_id INT,
  status VARCHAR(50) DEFAULT 'approved',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

### 7. Migration Notes
If migrating from old plain-text passwords:
```bash
# DO NOT execute - just for reference
# You'll need to re-hash existing passwords or require password reset
UPDATE users SET password_hash = CONCAT('$2a$10$...') WHERE ...
```

## Testing Checklist

- [ ] Test customer registration and auto-login
- [ ] Test restaurant registration (pending approval flow)
- [ ] Test admin login → redirects to admin-dashboard.html
- [ ] Test restaurant login (pending status) → shows approval message
- [ ] Test restaurant login (approved status) → redirects to restaurant-dashboard.html
- [ ] Test delivery agent login → redirects to delivery-dashboard.html
- [ ] Test invalid credentials → 401 response with error message
- [ ] Test non-existent email → 401 response
- [ ] Test bcrypt password comparison with long passwords
- [ ] Verify password_hash is NEVER sent in API response

## Frontend Integration
The frontend (login.html) is already wired to handle:
- ✅ `success` flag checking
- ✅ Status checking for pending/rejected restaurants
- ✅ Token storage via `localStorage.setItem("token", json.token)`
- ✅ Role-based redirects using `json.redirectTo`
- ✅ Spoon mascot animations on success/failure
- ✅ Error messages for locked/rejected accounts

## Files Modified
1. ✅ `backend/routes/auth.js` - Complete password hashing implementation
2. ✅ `backend/server.js` - Already has bcrypt imported
3. ✅ `frontend/login.html` - Already handles new response format

## Security Notes
- Bcrypt automatically handles salt generation
- 10 rounds is secure and balances security with performance
- Passwords are hashed server-side only
- Never log passwords (including hashes) in production
- Use HTTPS in production (Render/Railway provide this)
- Store JWT_SECRET in .env file (not hardcoded)

## Rollback Plan
If issues occur, previous version used plain-text password comparison:
```javascript
if (user.password !== password) // UNSAFE - DO NOT USE
```
New version uses:
```javascript
const isValid = await bcrypt.compare(password, user.password_hash); // SECURE
```

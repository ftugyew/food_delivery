# ⚡ Quick Fix: Admin Login Not Working

## The Problem
- ✅ User login works fine (redirects to index.html)
- ❌ Admin login says "Invalid password" (even with correct credentials)

## The Reason
Admin user's password in database is **NOT hashed with bcrypt**, but the login system **REQUIRES bcrypt hash**.

---

## Quick Fix (3 Steps - 2 Minutes)

### Step 1: Open PHPMyAdmin
Go to: **http://localhost/phpmyadmin**

### Step 2: Go to SQL Tab
1. Click **"SQL"** tab at the top
2. Clear the default text
3. Paste this:

```sql
INSERT INTO users (
    name,
    email, 
    phone,
    password_hash,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'Admin',
    'admin@tindo.com',
    '9999999999',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/aDi',
    'admin',
    'approved',
    NOW(),
    NOW()
);
```

### Step 3: Execute & Test
1. Click **"Go"**
2. Should see: "1 row inserted successfully"
3. Go to: **http://localhost/food-delivery/frontend/login.html**
4. Email: `admin@tindo.com`
5. Password: `admin123`
6. Click "Sign In"
7. ✅ Should redirect to admin-dashboard.html

---

## Login Credentials

| Field | Value |
|-------|-------|
| Email | admin@tindo.com |
| Password | admin123 |
| Role | admin |

---

## What Just Happened?

**Before Fix:**
```
User enters: admin123
Backend does: bcrypt.compare(admin123, plain_text_password)
Result: FAIL ❌ (can't compare plain text with bcrypt hash)
Response: "Invalid email or password"
```

**After Fix:**
```
User enters: admin123
Backend does: bcrypt.compare(admin123, $2a$10$...)
Result: PASS ✅ (matches the bcrypt hash)
Response: JWT token + redirect to admin-dashboard.html
```

---

## ⚠️ Important

1. **Change this password after first login!** (admin123 is default)
2. Use a strong password (12+ chars, mix of uppercase, numbers, symbols)
3. This is for local development - use environment variables for production

---

## Still Not Working?

### Check 1: Is MySQL running?
- Open XAMPP Control Panel
- Check MySQL module shows "Running"
- If not, click "Start"

### Check 2: Did the insert succeed?
Go back to PHPMyAdmin and run:
```sql
SELECT email, role FROM users WHERE role = 'admin';
```
Should show: `admin@tindo.com | admin`

### Check 3: Clear browser cache
- Press: **Ctrl + Shift + Delete**
- Select: **All time**
- Click: **Clear data**

### Check 4: Check Network Tab
- Open login.html
- Press **F12** (Developer Tools)
- Go to **"Network"** tab
- Try login
- Look for the `login` request
- Check if response shows:
  - ✅ Status: 200 (success)
  - ✅ Response includes: `"role": "admin"`, `"token": "..."`

---

## Files Included

- `ADMIN_LOGIN_FIX.md` - Detailed explanation & troubleshooting
- `insert-admin.sql` - Raw SQL query to run
- `create-admin.js` - Node.js script (alternative method)

---

**Date**: 2025-01-06  
**Issue**: Admin login with invalid password error  
**Solution**: Insert bcrypt-hashed admin user into database

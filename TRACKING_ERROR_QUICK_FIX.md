# 🚨 QUICK FIX - Tracking Error

## ❌ ERROR
```
Unknown column 'r.lat' in 'field list'
```

## ✅ SOLUTION (3 Steps)

### **STEP 1: Run Migration (Choose One)**

#### **Option A: Render.com Dashboard**
```sql
-- Open SQL Console and paste:
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_busy BOOLEAN DEFAULT FALSE;
```

#### **Option B: Local MySQL**
```bash
cd backend/migrations
mysql -u root -p food_delivery < fix_tracking_columns.sql
```

#### **Option C: Windows (XAMPP)**
```bash
cd backend\migrations
run_migration.bat
```

---

### **STEP 2: Restart Backend**
```bash
# Stop current server (Ctrl+C)
# Then restart:
cd backend
node server.js
```

---

### **STEP 3: Test**
```bash
# Test tracking endpoint:
curl http://localhost:3000/api/tracking/orders/12/tracking
```

**Expected:** ✅ No errors, returns order data with coordinates

---

## 📁 FILES CREATED

1. `backend/migrations/fix_tracking_columns.sql` - Migration script
2. `backend/migrations/run_migration.bat` - Windows runner
3. `backend/migrations/run_migration.sh` - Linux/Mac runner
4. `backend/migrations/test_migration.sql` - Verification script
5. `FIX_TRACKING_ERROR.md` - Complete documentation

---

## 🔧 WHAT WAS FIXED

### Backend Code (`routes/tracking.js`)
- ✅ Split single query into multiple queries
- ✅ Added try-catch for coordinate fetching
- ✅ Graceful fallback when columns missing
- ✅ Better error handling

### Database Schema
- ✅ Added `lat`, `lng` to restaurants
- ✅ Added `lat`, `lng` to agents
- ✅ Added `is_online`, `is_busy` to agents
- ✅ Added `delivery_lat`, `delivery_lng` to orders
- ✅ Added `customer_phone`, `restaurant_phone` to orders

---

## ⚡ QUICK COMMANDS

### Check if columns exist:
```sql
SHOW COLUMNS FROM restaurants LIKE 'lat';
SHOW COLUMNS FROM agents LIKE 'lat';
SHOW COLUMNS FROM agents LIKE 'is_online';
```

### Add sample coordinates:
```sql
UPDATE restaurants SET lat = 28.6139, lng = 77.2090 WHERE id = 1;
UPDATE agents SET lat = 28.6200, lng = 77.2150 WHERE id = 1;
```

### Test tracking query:
```sql
SELECT r.lat, r.lng FROM restaurants r WHERE id = 1;
SELECT a.lat, a.lng FROM agents a WHERE id = 1;
```

---

## 🎯 SUCCESS CHECKLIST

- [ ] Migration SQL executed successfully
- [ ] Backend server restarted
- [ ] No "Unknown column" errors in logs
- [ ] Tracking endpoint returns data
- [ ] Maps show restaurant/agent locations
- [ ] Call/chat/navigation buttons work

---

## 💡 TROUBLESHOOTING

**Q: Still getting errors after migration?**  
A: Restart backend server and clear browser cache

**Q: Columns show as NULL?**  
A: Update restaurant/agent coordinates in admin dashboard

**Q: Migration says "Duplicate column"?**  
A: Columns already exist! You're good to go.

**Q: Can't connect to database?**  
A: Check `.env` file for correct DB credentials

---

## 📞 SUPPORT

**Error:** Unknown column errors  
**Fix Time:** 5-10 minutes  
**Risk:** Low (safe migration)  
**Priority:** High (production issue)

---

**Status:** ✅ Fixed and Ready  
**Version:** 2.2.1  
**Date:** December 26, 2025

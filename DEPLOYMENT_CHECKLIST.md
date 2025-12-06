# 🎯 DEPLOYMENT CHECKLIST - Print & Use

## PRE-DEPLOYMENT (Do These First)

### Day Before / Week Before
- [ ] Read DEPLOYMENT_GUIDE.md (required)
- [ ] Review AUTHENTICATION_UPDATES.md (technical lead)
- [ ] Notify team of scheduled deployment
- [ ] Schedule maintenance window (if needed)
- [ ] Prepare test account credentials

### 24 Hours Before Deployment
- [ ] Verify Railway MySQL access
- [ ] Verify Render access
- [ ] Verify Vercel frontend access
- [ ] Test remote database connection
- [ ] Confirm backup tools ready
- [ ] Get team sign-off

### 1 Hour Before Deployment
- [ ] Close any active user sessions (send warning)
- [ ] Prepare monitoring dashboard
- [ ] Have rollback plan visible
- [ ] Ensure all team on standby
- [ ] Backup external systems (if applicable)

---

## DEPLOYMENT DAY

### Step 1: Backup Database (CRITICAL - 5 mins)
```bash
[ ] Log into Railway MySQL
[ ] Run backup command (see DEPLOYMENT_GUIDE.md)
[ ] Save backup file with timestamp
[ ] Verify backup file is not empty
[ ] Store backup in secure location
```

**Backup Command:**
```bash
mysqldump -h [HOST] -u [USER] -p [DATABASE] users > users_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Verify Database Schema (2 mins)
```bash
[ ] Connect to Railway MySQL
[ ] Run: DESCRIBE users;
[ ] Verify columns exist:
    [ ] id (INT, PRIMARY KEY)
    [ ] name (VARCHAR)
    [ ] email (VARCHAR)
    [ ] password_hash (VARCHAR) ← CRITICAL: must be password_hash, not password
    [ ] role (ENUM)
    [ ] created_at (TIMESTAMP)

[ ] If password_hash doesn't exist, run migration:
    ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255);
```

### Step 3: Verify Dependencies (1 min)
```bash
[ ] SSH into backend server (or check locally)
[ ] Run: npm list bcryptjs
[ ] Confirm: bcryptjs@3.0.2 (or higher)
[ ] If not installed: npm install bcryptjs
```

### Step 4: Deploy Code (5 mins)
```bash
[ ] Open terminal in backend directory
[ ] Run: git status
    (should show backend/routes/auth.js modified)
[ ] Run: git add backend/routes/auth.js
[ ] Run: git commit -m "Security: Implement bcrypt password hashing"
[ ] Run: git push origin main

[ ] Render detects change automatically
[ ] Wait for build to complete (2-3 minutes)
[ ] Check Render logs for "Build succeeded"
[ ] Check logs for "Server running" message
```

### Step 5: Verify Deployment (5 mins)
```bash
[ ] Check Render dashboard → Logs tab
    [ ] No error messages
    [ ] "Server running" message present
    [ ] No "bcryptjs not found" errors
    [ ] No "ER_BAD_FIELD" errors

[ ] Test endpoint connectivity:
    curl https://food-delivery-backend-cw3m.onrender.com/api/auth/login \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{"email":"test@test.com","password":"test"}'
    [ ] Should return JSON response (not 404)
```

---

## POST-DEPLOYMENT TESTING (15-30 mins)

### Test 1: Invalid Credentials
```bash
[ ] Go to: https://food-ameerpet.vercel.app/login.html
[ ] Email: nonexistent@test.com
[ ] Password: anything
[ ] Expected: "Invalid email or password" error
[ ] HTTP Status: 401
[ ] No token in localStorage
[ ] ✅ PASS / ❌ FAIL
```

### Test 2: Customer Login
```bash
[ ] Create test customer:
    Name: Test Customer
    Email: test_cust_@timestamp.com
    Password: TestPass@123
    Role: customer

[ ] Try login:
    [ ] Email: test_cust_@timestamp.com
    [ ] Password: TestPass@123
[ ] Expected: 
    [ ] Auto-login succeeds
    [ ] Redirected to index.html
    [ ] localStorage has token
    [ ] localStorage has user (id, name, email, role)
[ ] Check token in DevTools → Storage → localStorage
    [ ] token: "eyJhbGc..." present
    [ ] user: JSON object present
[ ] ✅ PASS / ❌ FAIL
```

### Test 3: Restaurant Registration
```bash
[ ] Go to register page
[ ] Register restaurant:
    Name: Test Restaurant Owner
    Email: test_rest_@timestamp.com
    Password: RestPass@123
    Role: restaurant
    Restaurant: Test Pizza
    Cuisine: Italian

[ ] Expected:
    [ ] Shows "pending admin approval" message
    [ ] Does NOT auto-login
    [ ] localStorage is empty
    [ ] No token generated
[ ] ✅ PASS / ❌ FAIL
```

### Test 4: Restaurant Login - Pending
```bash
[ ] Try login with restaurant email (before approval):
    Email: test_rest_@timestamp.com
    Password: RestPass@123

[ ] Expected:
    [ ] Login request accepted
    [ ] Returns status: "pending"
    [ ] Shows alert: "Your restaurant is waiting for admin approval"
    [ ] NO token returned
    [ ] NO redirect
[ ] ✅ PASS / ❌ FAIL
```

### Test 5: Admin Approves Restaurant (Admin Panel)
```bash
[ ] Go to admin dashboard
[ ] Find test restaurant
[ ] Click "Approve"
[ ] Verify database: status = "approved"
[ ] ✅ PASS / ❌ FAIL
```

### Test 6: Restaurant Login - Approved
```bash
[ ] Try login with restaurant email (after approval):
    Email: test_rest_@timestamp.com
    Password: RestPass@123

[ ] Expected:
    [ ] Login succeeds
    [ ] Returns token
    [ ] Returns redirectTo: "/restaurant-dashboard.html"
    [ ] Redirects to restaurant dashboard
    [ ] localStorage has token
[ ] ✅ PASS / ❌ FAIL
```

### Test 7: Admin Login
```bash
[ ] Try login with admin email:
    Email: admin@example.com
    Password: [admin_password]

[ ] Expected:
    [ ] Login succeeds
    [ ] Returns token
    [ ] Returns redirectTo: "/admin-dashboard.html"
    [ ] Redirects to admin dashboard
    [ ] Role is "admin"
[ ] ✅ PASS / ❌ FAIL
```

### Test 8: Delivery Agent Login
```bash
[ ] Try login with delivery email:
    Email: delivery@example.com
    Password: [delivery_password]

[ ] Expected:
    [ ] Login succeeds
    [ ] Returns token
    [ ] Returns redirectTo: "/delivery-dashboard.html"
    [ ] Redirects to delivery dashboard
    [ ] Role is "delivery"
[ ] ✅ PASS / ❌ FAIL
```

### Test 9: Password Verification
```bash
[ ] Test with CORRECT password:
    [ ] Login succeeds
    [ ] Token returned

[ ] Test with WRONG password:
    [ ] Login fails
    [ ] Error message shown
    [ ] No token

[ ] Test with COMPLEX password:
    Password: P@ssw0rd!#$%Complex123
    [ ] Hashes correctly
    [ ] Verifies correctly
[ ] ✅ PASS / ❌ FAIL
```

### Test 10: Browser Console Check
```bash
[ ] Open DevTools (F12)
[ ] Console tab: [ ] No errors
[ ] Network tab: [ ] All requests successful
[ ] Storage tab:
    [ ] localStorage has token
    [ ] localStorage has user
    [ ] Cookies look normal
[ ] ✅ PASS / ❌ FAIL
```

---

## MONITORING (First 24 Hours)

### Hourly Checks (First 4 Hours)
- [ ] **Hour 1:** Render logs - no errors
- [ ] **Hour 1:** Test login - works correctly
- [ ] **Hour 2:** Check error logs - nothing unusual
- [ ] **Hour 2:** Monitor CPU/memory - normal
- [ ] **Hour 3:** User reports - any issues?
- [ ] **Hour 3:** Database connections - healthy
- [ ] **Hour 4:** Random user test - login works
- [ ] **Hour 4:** Performance - response times normal

### Every 4 Hours (First 24 Hours)
- [ ] Spot check random logins
- [ ] Verify token generation
- [ ] Check error logs
- [ ] Monitor server health
- [ ] Check database connections

### Daily (Day 2+)
- [ ] Review authentication logs
- [ ] Check for failed attempts
- [ ] Verify no security issues
- [ ] Confirm user happiness
- [ ] Plan rollback if needed (by day 3, should be safe)

---

## ISSUES? TROUBLESHOOTING

### Issue: "ER_BAD_FIELD: Unknown column 'password_hash'"
```bash
[ ] Stop deployment
[ ] SSH into database
[ ] Run: ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255);
[ ] Retry deployment
[ ] Re-test
```

### Issue: Login returns 401 for valid credentials
```bash
[ ] Check bcryptjs is installed: npm list bcryptjs
[ ] Check password_hash column exists
[ ] Check hash format: SELECT password_hash FROM users LIMIT 1;
    Should start with: $2a or $2b
    If not: passwords need re-hashing
[ ] Check logs for bcrypt errors
[ ] Rollback if critical
```

### Issue: "bcryptjs not found" error
```bash
[ ] SSH into backend
[ ] npm install bcryptjs
[ ] Verify: npm list bcryptjs
[ ] Restart application
[ ] Re-test
```

### Issue: Slow login (> 1 second)
```bash
[ ] Normal: bcrypt adds 50-100ms
[ ] If > 1s: Check database response time
[ ] Run: EXPLAIN SELECT * FROM users WHERE email = 'test@test.com';
[ ] If slow: May need index on email column
```

### Issue: Users reporting can't login (widespread)
```bash
[ ] Check if you're on Render/Railway status pages
[ ] Check error logs for patterns
[ ] Count failing logins in logs
[ ] If > 50% failing: Consider rollback
[ ] Run: git revert HEAD && git push
[ ] Render auto-deploys old version in 2-3 mins
```

---

## IF YOU NEED TO ROLLBACK

### Rollback Steps (5 mins)
```bash
[ ] Step 1: Notify team
[ ] Step 2: Run in terminal:
    git revert HEAD --no-edit
    git push origin main

[ ] Step 3: Wait 2-3 minutes for Render to rebuild
[ ] Step 4: Test login works with old version
[ ] Step 5: Update team on status
[ ] Step 6: Schedule post-mortem
```

### After Rollback
- [ ] Identify what went wrong
- [ ] Fix issue in development
- [ ] Discuss with team
- [ ] Plan retry deployment
- [ ] Update documentation

---

## SIGN-OFF

### Before Deployment
```
Development Lead: _________________ Date: _________
QA Lead:         _________________ Date: _________
Operations:      _________________ Date: _________
```

### After Successful Deployment
```
Deployment Engineer: _____________ Date: _________
Operations Monitor:  _____________ Date: _________
System Admin:        _____________ Date: _________
```

---

## DEPLOYMENT NOTES

Use this space to document any issues or notes:

```
Time Started: _______________
Time Completed: _______________
Issues Encountered: _________________________________________________________
Resolution: _________________________________________________________________
Tests Passed: _____ / 10
Rollback Used: [ ] Yes [ ] No
Notes: ______________________________________________________________________
```

---

## QUICK REFERENCE

### Important Files
- DEPLOYMENT_GUIDE.md - Full deployment guide
- AUTHENTICATION_UPDATES.md - Technical details
- AUTHENTICATION_CHECKLIST.md - Testing guide
- API_AUTHENTICATION_REFERENCE.md - API docs

### Important URLs
- Render Dashboard: https://dashboard.render.com
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Frontend: https://food-ameerpet.vercel.app/login.html

### Important Credentials
- Railway MySQL: [Stored in your password manager]
- Render: [Stored in your password manager]
- Vercel: [Stored in your password manager]

### Important Contacts
- DevOps Lead: _______________
- Database Admin: _______________
- Frontend Lead: _______________
- On-call Support: _______________

---

## FINAL CHECKLIST

```
✅ Pre-deployment steps complete
✅ Database backed up
✅ Schema verified
✅ Dependencies installed
✅ Code deployed
✅ Deployment verified
✅ All 10 tests passing
✅ No errors in logs
✅ Team notified
✅ Monitoring in place
✅ Rollback plan ready
✅ Sign-offs obtained

🚀 DEPLOYMENT SUCCESSFUL!
```

---

**Print this document and use it during deployment**

**Keep a record of deployment for audit purposes**

**Sign and date at the end**

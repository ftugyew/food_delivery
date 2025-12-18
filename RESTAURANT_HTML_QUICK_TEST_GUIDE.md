# 🚀 Quick Test Guide - restaurant.html API Fix

## The Issue (What Was Wrong)

```
Console showed:
❌ "Restaurant details missing; header will use defaults"
❌ "Items fetched = Array(0)"

Reason:
- Code fetched from /api/menu/restaurant/:id
- Got: { success: true, data: [items...] }
- Code expected: { success: true, data: { restaurant, items } }
- Code tried to access body.data.restaurant → UNDEFINED
- Code tried to access body.data.items → WRONG! data IS the items array
```

## The Fix (What Changed)

✅ Now fetches from TWO endpoints:
1. `/api/restaurants/:id` → Gets restaurant details
2. `/api/menu/restaurant/:id` → Gets menu items array

✅ Correctly parses each response structure

✅ Restaurant details now display correctly

✅ Menu items now populate correctly

---

## Test Steps

### Step 1: Open Browser DevTools
```
Press F12 or Right-click → Inspect
Go to Console tab
```

### Step 2: Navigate to Restaurant Page
```
URL: http://localhost:8000/restaurant.html?id=1
(or your production URL)
```

### Step 3: Check Console Output
You should see (in this order):

```
✅ Debug: restaurantId from URL = 1
✅ Fetching restaurant & menu for restaurantId = 1
✅ Fetching restaurant from: https://food-delivery-backend-cw3m.onrender.com/api/restaurants/1
✅ Restaurant API Response: {success: true, data: {id: 1, name: "udupi", ...}}
✅ Fetching menu from: https://food-delivery-backend-cw3m.onrender.com/api/menu/restaurant/1
✅ Menu API Response: {success: true, data: Array(13)}
✅ Restaurant loaded: udupi
✅ Debug: Items fetched = Array(13) Count: 13
✅ Menu index populated with 13 items
```

**NOT** should you see:
```
❌ Restaurant details missing; header will use defaults
❌ Items fetched = Array(0)
❌ Any red error messages
```

### Step 4: Verify Page Display
You should see:

```
Header:
✅ Logo image (or placeholder)
✅ "Tindo Menu" title
✅ "Cart" and "Home" navigation

Restaurant Banner:
✅ Restaurant name: "udupi" (not "Restaurant")
✅ Restaurant description: "nice"
✅ Delivery time: "⏱️ 30 mins delivery"
✅ Restaurant image (or fallback placeholder)

Menu Section:
✅ 3-column grid of menu items
✅ Each card shows:
   - Item image
   - Item name (e.g., "mklre")
   - Item price (e.g., "₹544.00")
   - Veg/Non-veg badge
   - "Add to Cart" button
```

### Step 5: Test Cart Functionality
```
1. Click "Add to Cart" on any item
2. Button should change to "Added to Cart"
3. Quantity controls should appear
4. Item should appear in cart panel (bottom right)
```

---

## Browser DevTools Debugging

### Network Tab
```
F12 → Network tab

You should see TWO API requests:
1. GET /api/restaurants/1          ✅ 200 OK
2. GET /api/menu/restaurant/1      ✅ 200 OK

If any show 404 or 500:
❌ Check restaurant ID (?id=1)
❌ Check backend is running
```

### Console Tab
```
F12 → Console tab

Look for:
✅ Restaurant API Response log
✅ Menu API Response log
✅ "Restaurant loaded: [name]"
✅ "Menu index populated with X items"

NOT:
❌ Syntax errors
❌ "has already been declared" errors
❌ 404 errors
```

### Application Tab (LocalStorage)
```
F12 → Application → LocalStorage

Check cart items:
- Click "Add to Cart" on menu item
- Go to Application tab
- Find "tindo_cart" in LocalStorage
- Should contain item data as JSON
```

---

## Common Test Cases

### Test 1: Restaurant Details Display
```
Expected:
✅ Restaurant name shows (not "Restaurant" placeholder)
✅ Restaurant description shows
✅ Delivery time shows (e.g., "30 mins")
✅ Restaurant image loads

Check with console:
console.log('Restaurant name:', document.getElementById('restaurant-name').textContent);
// Should output: "udupi" (or actual restaurant name)
```

### Test 2: Menu Items Populate
```
Expected:
✅ 13 menu items display as cards
✅ Each item shows name, price, image
✅ Can scroll through all items

Check with console:
console.log('Menu items count:', window.__restaurantDishes.length);
// Should output: 13 (or total count)

console.log('Menu index:', window.__menuIndex);
// Should show object with item IDs as keys
```

### Test 3: Add to Cart
```
Expected:
✅ Click "Add to Cart" button
✅ Button text changes to "Added to Cart"
✅ Quantity controls appear (+/- buttons)
✅ Item count shows in cart badge

Check with console:
console.log('Cart:', JSON.parse(localStorage.getItem('tindo_cart')));
// Should show array with added items
```

### Test 4: Different Restaurant IDs
```
Test with different restaurant IDs:
http://localhost:8000/restaurant.html?id=1
http://localhost:8000/restaurant.html?id=2
http://localhost:8000/restaurant.html?id=3

Each should load their respective data
```

### Test 5: Missing Restaurant ID
```
Navigate to: http://localhost:8000/restaurant.html (no ?id=)

Expected:
✅ Error message: "Invalid restaurant ID 😔"
✅ Console: "Error: Missing restaurantId in URL"
```

---

## If Something Doesn't Work

### Problem: Restaurant details still don't show
```
1. Check console for error messages
2. Check Network tab for API failures
3. Verify restaurantId in URL (?id=1)
4. Run in console:
   console.log('restaurantId:', restaurantId);
   console.log('API_BASE_URL:', API_BASE_URL);
5. Manually test API endpoint:
   fetch('https://food-delivery-backend-cw3m.onrender.com/api/restaurants/1')
     .then(r => r.json())
     .then(d => console.log('API:', d));
```

### Problem: Menu items still empty
```
1. Check console for "Items fetched = Array(0)"
2. Check Network tab for /api/menu/restaurant/1
3. Manually test:
   fetch('https://food-delivery-backend-cw3m.onrender.com/api/menu/restaurant/1')
     .then(r => r.json())
     .then(d => console.log('Menu API:', d));
4. Verify menu items exist in database
```

### Problem: Images don't load
```
1. Check if image_url_full is provided by API
2. Check if uploads folder exists on server
3. Try directly: [filename]
4. Check onerror fallback to assets/png.jpg
```

---

## Quick Console Commands

```javascript
// Check restaurant ID
console.log('Restaurant ID:', restaurantId);

// Check API base URL
console.log('API URL:', API_BASE_URL);

// Get restaurant data
console.log('Restaurant:', window.__restaurantDishes);

// Get menu items count
console.log('Items count:', window.__restaurantDishes.length);

// Get menu index
console.log('Menu index:', window.__menuIndex);

// Get cart
console.log('Cart:', JSON.parse(localStorage.getItem('tindo_cart')));

// Clear cart (if testing)
localStorage.removeItem('tindo_cart');

// Reload page
location.reload();
```

---

## Expected Console Output (Full)

```
restaurant.html?id=1:158 Debug: restaurantId from URL = 1
restaurant.html?id=1:161 Debug: Fetching restaurant & menu for restaurantId = 1
restaurant.html?id=1:167 Fetching restaurant from: https://food-delivery-backend-cw3m.onrender.com/api/restaurants/1
restaurant.html?id=1:172 Restaurant API Response: 
{success: true, data: {
  id: 1,
  name: "udupi",
  description: "nice",
  image_url: "1765211646544-800567376.jpeg",
  image_url_full: "http://food-delivery-backend-cw3m.onrender.com/uploads/restaurants/1765211646544-800567376.jpeg",
  eta: 30,
  cuisine: "Multi Cuisine",
  rating: "4.5"
}}
restaurant.html?id=1:179 Fetching menu from: https://food-delivery-backend-cw3m.onrender.com/api/menu/restaurant/1
restaurant.html?id=1:185 Menu API Response: 
{success: true, data: [
  {id: 13, item_name: "mklre", price: "544.00", ...},
  {id: 14, item_name: "item2", price: "250.00", ...},
  ...
]}
restaurant.html?id=1:206 Restaurant loaded: udupi
restaurant.html?id=1:215 Debug: Items fetched = Array(13) Count: 13
restaurant.html?id=1:224 Menu index populated with 13 items
```

---

## Success Criteria

✅ Console shows "Restaurant loaded: udupi"  
✅ Console shows "Items fetched = Array(13) Count: 13"  
✅ Restaurant name displays as "udupi"  
✅ Restaurant image displays (or fallback)  
✅ Menu items display as cards  
✅ "Add to Cart" buttons work  
✅ Cart updates when adding items  
✅ No red console errors  

---

**If all above checks pass:** ✅ **Fix is working correctly!**

Deploy with:
```bash
git add frontend/restaurant.html
git commit -m "Fix: Correct API response parsing - fetch from both endpoints"
git push origin main
```

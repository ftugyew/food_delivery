# Menu System Fixes - Complete Implementation

## 1. Database Schema (Required)

Run this SQL in PHPMyAdmin to create the correct menu table:

```sql
CREATE TABLE IF NOT EXISTS menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_veg TINYINT(1) DEFAULT 1,
  image_url VARCHAR(500),
  restaurant_id INT NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);
```

**Fields:**
- `id` - Auto increment primary key
- `item_name` - Menu item name (required)
- `price` - Price in rupees (required)
- `description` - Item description (optional)
- `category` - Category like "Starters", "Main Course" (optional, defaults to Uncategorized)
- `is_veg` - 1 for vegetarian, 0 for non-vegetarian (defaults to 1)
- `image_url` - Path to image file (optional)
- `restaurant_id` - Foreign key to restaurants table (required)

---

## 2. Backend Endpoints (Node.js/Express)

### Endpoint 1: POST /api/menu/add (JSON Body, Recommended)

**URL:** `POST /api/menu/add?token=YOUR_TOKEN`

**Authentication:** Required (Bearer token)

**Request Headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN"
}
```

**Request Body:**
```json
{
  "item_name": "Biryani",
  "price": 250,
  "description": "Fragrant rice and meat curry",
  "category": "Main Course",
  "is_veg": 1
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Menu item added successfully",
  "id": 42
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to add menu item",
  "details": "Error message details"
}
```

**Backend Code:**
```javascript
// POST /api/menu/add - Add menu item (JSON body, authMiddleware, no file upload)
app.post("/api/menu/add", authMiddleware, async (req, res) => {
  try {
    const user = req.user || {};
    console.log("📝 Add menu item - User:", user.id, "Role:", user.role, "Restaurant ID:", user.restaurant_id);
    
    // Validate user
    if (!user.restaurant_id) {
      return res.status(400).json({ 
        success: false,
        error: "No restaurant_id found", 
        details: "Please login as a restaurant owner"
      });
    }
    
    // Get values from JSON body
    const { item_name, price, description, category, is_veg } = req.body;
    
    // Validate required fields
    if (!item_name || price === undefined || price === null) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing item_name or price" 
      });
    }
    
    const restaurantId = user.restaurant_id;
    const finalIsVeg = is_veg === 1 || is_veg === true ? 1 : 0;
    
    console.log("📝 Inserting menu item:", { item_name, price, description, category, is_veg: finalIsVeg, restaurantId });
    
    // Insert into menu table
    const [result] = await db.execute(
      "INSERT INTO menu (restaurant_id, item_name, description, price, category, is_veg) VALUES (?, ?, ?, ?, ?, ?)",
      [restaurantId, item_name, description || "", Number(price) || 0, category || "Uncategorized", finalIsVeg]
    );
    
    console.log("✅ Menu item added, ID:", result.insertId);
    return res.json({ 
      success: true, 
      message: "Menu item added successfully",
      id: result.insertId 
    });
  } catch (err) {
    console.error("❌ Error adding menu item:", err?.message, err?.sqlMessage);
    return res.status(500).json({ 
      success: false,
      error: "Failed to add menu item", 
      details: err.message || err.sqlMessage 
    });
  }
});
```

### Endpoint 2: GET /api/menu/restaurant/:id (Public)

**URL:** `GET /api/menu/restaurant/5`

**Authentication:** Not required

**Response (Success):**
```json
[
  {
    "id": 1,
    "item_name": "Biryani",
    "price": "250.00",
    "description": "Fragrant rice and meat curry",
    "category": "Main Course",
    "is_veg": 0,
    "image_url": null,
    "restaurant_id": 5
  },
  {
    "id": 2,
    "item_name": "Paneer Tikka",
    "price": "180.00",
    "description": "Grilled paneer pieces",
    "category": "Starters",
    "is_veg": 1,
    "image_url": null,
    "restaurant_id": 5
  }
]
```

**Backend Code:**
```javascript
// GET /api/menu/restaurant/:id - Get menu items for a restaurant (no auth required)
app.get("/api/menu/restaurant/:id", async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const [rows] = await db.execute("SELECT * FROM menu WHERE restaurant_id = ? ORDER BY id DESC", [restaurantId]);
    return res.json(rows || []);
  } catch (err) {
    console.error("❌ Error fetching menu by restaurant:", err?.message);
    return res.status(500).json({ success: false, error: "Failed to fetch menu items" });
  }
});
```

---

## 3. Frontend Implementation (restaurant-dashboard.html)

### Function 1: Load Menu

```javascript
// ===== MENU =====
async function loadMenu() {
  try {
    // Use /api/menu/restaurant/:restaurant_id endpoint
    let res = await fetch(`${BASE}/api/menu/restaurant/${restaurantId}`);
    let result = await res.json();
    
    // Handle both array and object responses
    let data = Array.isArray(result) ? result : (result.data || []);
    if (!Array.isArray(data)) {
      console.error("Invalid menu data format:", result);
      data = [];
    }
    
    const list = document.getElementById("menuList");
    if (!list) {
      console.warn("menuList element not found");
      return;
    }
    
    if (!data.length) {
      list.innerHTML = `<p class="text-gray-500 col-span-2 text-center">No dishes added yet.</p>`;
      return;
    }
    
    list.innerHTML = data.map(m => `
      <div class="card bg-green-50 p-4 rounded-xl shadow flex flex-col">
        ${m.image_url ? `<img src="${BASE}/uploads/${m.image_url}" class="h-32 w-full object-cover rounded mb-3" alt="${m.item_name}">` : `<div class="h-32 w-full bg-gray-300 rounded mb-3 flex items-center justify-center text-gray-600 text-sm">No Image</div>`}
        <h3 class="font-bold text-lg">${m.item_name}</h3>
        <p class="text-sm text-gray-500">${m.description || ''}</p>
        <p class="text-green-600 font-semibold">₹${m.price}</p>
        <p class="text-xs text-gray-500 mt-1">${m.is_veg ? '🥬 Veg' : '🍗 Non-Veg'}</p>
        <div class="flex gap-2 mt-3">
          <button onclick="editItem(${m.id}, '${m.item_name}', ${m.price}, '${m.description || ''}')" class="bg-yellow-500 text-white px-3 py-1 rounded text-sm">Edit</button>
          <button onclick="deleteItem(${m.id})" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
        </div>
      </div>
    `).join("");
    
    console.log(`✅ Loaded ${data.length} menu items`);
  } catch (err) {
    console.error("Error loading menu:", err);
    const list = document.getElementById("menuList");
    if (list) {
      list.innerHTML = `<p class="text-red-500 col-span-2 text-center">Error loading menu</p>`;
    }
  }
}
```

### Function 2: Add Menu Item

```javascript
document.getElementById("menuForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type='submit']");
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "⏳ Adding...";

  try {
    // Get form values
    const item_name = document.getElementById("item_name").value.trim();
    const price = document.getElementById("price").value.trim();
    const description = document.getElementById("description").value.trim();
    
    // Get category (handle custom category)
    const catSelect = document.getElementById('categorySelect');
    const customInput = document.getElementById('categoryCustom');
    let category = catSelect.value;
    if (category === 'Other' && customInput.value.trim()) {
      category = customInput.value.trim();
    }
    
    // Convert is_veg from form value (1 or 0)
    const isVegValue = document.getElementById('isVeg').value;
    const is_veg = isVegValue === 'veg' ? 1 : 0;
    
    // Validate required fields
    if (!item_name || !price) {
      showToast("❌ Item name and price are required", false);
      btn.disabled = false;
      btn.textContent = originalText;
      return;
    }
    
    // Build request body
    const body = {
      item_name,
      price: Number(price),
      description,
      category,
      is_veg
    };
    
    console.log("📝 Sending menu request:", body);
    
    // Send JSON request to /api/menu/add
    const url = `${BASE}/api/menu/add?token=${encodeURIComponent(token || '')}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    console.log("📦 Response:", result);
    
    if (res.ok && result.success) {
      showToast("✅ " + (result.message || "Dish added successfully!"));
      e.target.reset();
      // Reset is_veg to default
      document.getElementById('isVeg').value = 'veg';
      document.getElementById('vegBtn').classList.add('bg-green-600', 'text-white');
      document.getElementById('vegBtn').classList.remove('bg-green-100', 'text-green-700');
      document.getElementById('nonVegBtn').classList.remove('bg-red-600', 'text-white');
      document.getElementById('nonVegBtn').classList.add('bg-red-100', 'text-red-700');
      // Reload menu
      await loadMenu();
    } else {
      const errorMsg = result.error || result.details || "Failed to add dish";
      console.error("Add dish error:", errorMsg, result);
      showToast(`❌ ${errorMsg}`, false);
    }
  } catch (err) {
    console.error("Error adding dish:", err);
    showToast("❌ Server error", false);
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
});
```

---

## 4. Testing Checklist

- [ ] Database table created with exact schema
- [ ] Restaurant logged in successfully
- [ ] Click "Add Dish" button
- [ ] Enter: Item name, Price, Description, Category, select Veg/Non-Veg
- [ ] Click "Add Dish" button
- [ ] Success message appears: "✅ Dish added successfully!"
- [ ] Menu list reloads with new item
- [ ] Item shows correct name, price, description, category, veg status
- [ ] No Image placeholder shows if no image_url
- [ ] No 500 errors in server logs
- [ ] No console errors in browser

---

## 5. Common Issues & Fixes

### Issue: "No restaurant_id found"
- **Cause:** User is not logged in as a restaurant owner
- **Fix:** Make sure you're logged in with a restaurant account that has `restaurant_id` set

### Issue: "Missing item_name or price"
- **Cause:** Form values not being sent
- **Fix:** Ensure form fields have correct IDs: `item_name`, `price`, `description`, `category`, `isVeg`

### Issue: Menu items don't show after adding
- **Cause:** loadMenu() not calling correct endpoint
- **Fix:** Ensure loadMenu() calls `/api/menu/restaurant/${restaurantId}`

### Issue: is_veg showing as 0/1 in database but form shows veg/non-veg
- **Cause:** Conversion working correctly - 1 = veg, 0 = non-veg
- **Verify:** Check database: `SELECT * FROM menu WHERE id = YOUR_ID;`

---

## 6. Code Summary

**Frontend Changes:**
- ✅ Updated `loadMenu()` to use `/api/menu/restaurant/:restaurant_id`
- ✅ Updated form submission to send JSON to `/api/menu/add`
- ✅ Convert `is_veg` from "veg"/"non-veg" to 1/0
- ✅ Added placeholder for null images
- ✅ Added veg/non-veg indicator (🥬/🍗)

**Backend Changes:**
- ✅ Created new `POST /api/menu/add` endpoint with JSON body
- ✅ Created `GET /api/menu/restaurant/:id` endpoint
- ✅ Proper is_veg conversion (1/0)
- ✅ Proper error handling and logging
- ✅ Consistent response format: `{ success: true/false, message, error, details }`

---

**Last Updated:** December 7, 2025
**Status:** ✅ Complete and Ready for Testing

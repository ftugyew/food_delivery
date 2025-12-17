# restaurant.html - Fixed Code Reference

## Complete Fixed JavaScript Section

Copy this section to replace lines 195-282 in `restaurant.html`:

```javascript
    const restaurantId = new URLSearchParams(window.location.search).get('id');
    console.log('Debug: restaurantId from URL =', restaurantId);

    // Validate restaurantId before making API calls
    if (!restaurantId) {
      console.error("Error: Missing restaurantId in URL");
      document.getElementById('no-dishes').textContent = "Invalid restaurant ID 😔";
      document.getElementById('no-dishes').classList.remove('hidden');
    } else {
      // ===== Fetch restaurant info + menu =====
      console.log("Debug: Fetching restaurant & menu for restaurantId =", restaurantId);

      async function fetchRestaurantMenu(id) {
        // Backend endpoint returns { success: true, data: { restaurant, items } }
        const url = `${API_BASE_URL}/menu/restaurant/${id}`;
        console.log('Fetching:', url);
        
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }
        
        const body = await res.json();
        console.log('API Response:', body);
        
        // Backend returns { success: true, data: { restaurant, items } }
        if (body && body.success && body.data) {
          return {
            restaurant: body.data.restaurant || null,
            items: body.data.items || []
          };
        }
        
        // Fallback for unexpected format
        throw new Error('Unexpected API response format');
      }

      fetchRestaurantMenu(restaurantId)
        .then(({ restaurant, items }) => {
          // ===== Render restaurant banner =====
          if (restaurant) {
            document.getElementById('restaurant-name').textContent = restaurant.name || 'Restaurant';
            document.getElementById('restaurant-desc').textContent = restaurant.description || 'Delicious food from Tindo partner restaurant 🍴';
            document.getElementById('restaurant-eta').textContent = `⏱️ ${restaurant.eta || 30} mins delivery`;
            
            // Set restaurant image
            const imgEl = document.getElementById('restaurant-image');
            imgEl.src = restaurant.image_url_full || getRestaurantImageUrl(restaurant.image_url, null);
            addImageErrorHandler(imgEl);
            console.log('Restaurant loaded:', restaurant.name);
          } else {
            console.warn('Restaurant details missing; header will use defaults');
          }

          // ===== Prepare menu items =====
          console.log('Debug: Items fetched =', items);
          window.__restaurantDishes = items || [];
          window.__menuIndex = window.__menuIndex || {};
          
          items.forEach((item, idx) => {
            // Primary ID field from backend
            const itemId = item.id || item.item_id || (idx + 1);
            item._client_id = itemId;
            
            window.__menuIndex[itemId] = {
              name: item.item_name || item.name || 'Item',
              price: Number(item.price || 0),
              image_url: item.image_url || '',
              image_url_full: item.image_url_full || null,
              restaurant_id: Number(restaurantId)
            };
          });
          
          renderMenu();
        })
        .catch(err => {
          console.error('Error fetching restaurant/menu:', err.message);
          document.getElementById('no-dishes').textContent = 'Failed to load menu 😔';
          document.getElementById('no-dishes').classList.remove('hidden');
        });
    }
```

## Required DOM IDs in HTML

Make sure your HTML has these elements:

```html
<!-- Restaurant Banner Section -->
<section class="...">
  <img id="restaurant-image" src="assets/png.jpg" alt="Restaurant" class="...">
  <div>
    <h2 id="restaurant-name" class="...">Restaurant Name</h2>
    <p id="restaurant-desc" class="...">Restaurant description</p>
    <p id="restaurant-eta" class="...">⏱️ 25-30 mins delivery</p>
  </div>
</section>

<!-- Menu List Container -->
<div id="menu-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"></div>

<!-- Empty State Message -->
<div id="no-dishes" class="text-center text-gray-500 text-lg py-10 hidden">
  No dishes available yet 🍽️
</div>
```

## API Endpoints Used

### Endpoint 1: Get Restaurant with Menu
```
GET https://food-delivery-backend-cw3m.onrender.com/api/menu/restaurant/1

Response:
{
  "success": true,
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Restaurant Name",
      "description": "...",
      "image_url": "filename.jpg",
      "image_url_full": "https://...render.com/uploads/restaurants/filename.jpg",
      "eta": 30
    },
    "items": [
      {
        "id": 101,
        "item_name": "Dish Name",
        "price": 250,
        "image_url": "dish.jpg",
        "image_url_full": "https://...render.com/uploads/menu/dish.jpg",
        "restaurant_id": 1,
        "is_veg": true
      }
    ]
  }
}
```

## Field Mapping

| API Field | HTML Element | Default |
|-----------|--------------|---------|
| `restaurant.name` | `#restaurant-name` | "Restaurant" |
| `restaurant.description` | `#restaurant-desc` | "Delicious food from Tindo..." |
| `restaurant.eta` | `#restaurant-eta` | "30" mins |
| `restaurant.image_url_full` | `#restaurant-image` src | Helper function result |
| `items[].item_name` | Menu card heading | "Item" |
| `items[].price` | Menu card price | "0" |
| `items[].image_url_full` | Menu card image | Helper function result |

## Image Loading Priority

### Restaurant Image
1. Use `restaurant.image_url_full` (complete URL from API)
2. Fall back to `getRestaurantImageUrl(restaurant.image_url, null)` (helper reconstructs URL)
3. Fall back to `onerror` handler → `assets/png.jpg`

### Menu Item Image
1. Use `item.image_url_full` (complete URL from API)
2. Fall back to `getMenuImageUrl(item.image_url, item.image_url_full)` (helper reconstructs URL)
3. Fall back to `onerror` handler → `assets/png.jpg`

## URL Parameter Usage

```javascript
// Extract restaurant ID from URL
const restaurantId = new URLSearchParams(window.location.search).get('id');

// Example URLs:
// http://localhost:8000/restaurant.html?id=1
// https://food-delivery-backend-cw3m.onrender.com/restaurant.html?id=1
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid restaurant ID" | Missing `?id=` parameter | Add `?id=1` to URL |
| "API Error: 404" | Restaurant doesn't exist | Check restaurant ID exists in database |
| "API Error: 500" | Backend error | Check backend logs |
| "Unexpected API response format" | API returned wrong structure | Verify API endpoint working |
| Placeholder images showing | Image file missing or URL wrong | Check `/uploads` folder has images |

## Browser Console Output

### Success Example
```
Debug: restaurantId from URL = 1
Fetching: https://food-delivery-backend-cw3m.onrender.com/api/menu/restaurant/1
API Response: {success: true, data: {restaurant: {…}, items: Array(5)}}
Restaurant loaded: Pizza Palace
Debug: Items fetched = Array(5)
```

### Error Example
```
Debug: restaurantId from URL = null
Error: Missing restaurantId in URL
```

## Key Differences from Old Code

| Aspect | Old Code | New Code |
|--------|----------|----------|
| Format checks | 8+ different shapes | 1 correct shape |
| API calls | 2+ calls (restaurant + menu) | 1 call gets both |
| Error visibility | Silent failures with continue | Clear throw errors |
| Restaurant image | Helper function always | Direct API URL first |
| Menu items | Complex field checks | Direct field access |
| Debugging | Hard to trace | Clear console logs |

## Troubleshooting Checklist

- [ ] URL has `?id=1` parameter
- [ ] Backend API at `https://food-delivery-backend-cw3m.onrender.com/api` is responsive
- [ ] Browser console shows "API Response: {success: true...}"
- [ ] `#restaurant-name`, `#restaurant-image`, etc. elements exist in HTML
- [ ] Images exist in `/uploads/restaurants/` and `/uploads/menu/`
- [ ] Placeholder image exists at `assets/png.jpg`
- [ ] All script tags load without errors (check Network tab)
- [ ] `imageHelper.js` is loaded (defines `getRestaurantImageUrl`, etc.)

## Quick Test

Run in browser console:
```javascript
// Should return the API URL
console.log(API_BASE_URL);

// Should fetch restaurant 1's menu
fetch(API_BASE_URL + '/menu/restaurant/1').then(r => r.json()).then(d => console.log(d));

// Should return {restaurant: {...}, items: [...]}
```

# 🗺️ Mappls API Integration - Live Tracking

## ✅ Updated Files

Both live tracking pages now use **Mappls API** (MapmyIndia) instead of OpenStreetMap/Leaflet:

1. ✅ `frontend/delivery-dashboard-live.html` - Agent dashboard with Mappls
2. ✅ `frontend/tracking-live.html` - User tracking with Mappls

---

## 🔑 Mappls API Key

**Current Key:** `522d3498e3667eac0fc7f509c00ac75a`

This is the same key used in:
- `user-address.html`
- `admin-dashboard.html`

**SDK URL:**
```html
<script src="https://apis.mappls.com/advancedmaps/api/522d3498e3667eac0fc7f509c00ac75a/map_sdk?v=3.0&layer=vector"></script>
```

---

## 🎨 Marker Icons

Using Mappls default markers:
- 🏪 **Restaurant** - `https://apis.mappls.com/map_v3/1.png` (Red)
- 🏠 **Customer** - `https://apis.mappls.com/map_v3/2.png` (Blue)
- 🛵 **Agent** - `https://apis.mappls.com/map_v3/3.png` (Green)

---

## 📝 Key Changes

### Map Initialization
**Before (Leaflet):**
```javascript
map = L.map('map').setView([28.6139, 77.2090], 13);
```

**After (Mappls):**
```javascript
map = new mappls.Map('map', { 
  center: [28.6139, 77.2090], 
  zoom: 13 
});
```

### Marker Creation
**Before:**
```javascript
marker = L.marker([lat, lng]).addTo(map);
```

**After:**
```javascript
marker = new mappls.Marker({
  map: map,
  position: [lat, lng],
  popupHtml: "Text",
  icon: 'https://apis.mappls.com/map_v3/3.png'
});
```

### Polyline (Route)
**Before:**
```javascript
route = L.polyline(
  [point1, point2],
  { color: '#10b981', weight: 4 }
).addTo(map);
```

**After:**
```javascript
route = new mappls.Polyline({
  map: map,
  paths: [point1, point2],
  strokeColor: '#10b981',
  strokeWeight: 4,
  strokeOpacity: 0.7
});
```

### Update Marker Position
**Before:**
```javascript
marker.setLatLng([lat, lng]);
```

**After:**
```javascript
marker.setPosition([lat, lng]);
```

### Fit Bounds
**Before:**
```javascript
map.fitBounds([point1, point2]);
```

**After:**
```javascript
map.fitBounds([point1, point2]);
```

### Remove Marker
**Before:**
```javascript
map.removeLayer(marker);
```

**After:**
```javascript
marker.remove();
```

---

## 🧪 Testing

### Agent Dashboard Test
1. Open `delivery-dashboard-live.html`
2. Login as agent
3. Accept order and start tracking
4. **Expected:** Mappls map with markers

### User Tracking Test
1. Open `tracking-live.html?orderId=123`
2. **Expected:** Mappls map with 3 markers (restaurant, agent, customer)
3. **Expected:** Green route line

### Console Checks
```javascript
// Should see Mappls object loaded
console.log(typeof mappls); // "object"

// Marker positions (Mappls returns arrays)
console.log(marker.getPosition()); // [28.6139, 77.2090]
```

---

## 🔧 Position Format

**Important:** Mappls uses `[lat, lng]` format consistently:

```javascript
// Create marker
position: [28.6139, 77.2090]  // [lat, lng]

// Get position
const pos = marker.getPosition(); // Returns [lat, lng] or {lat, lng}

// Handle both formats
const lat = Array.isArray(pos) ? pos[0] : pos.lat;
const lng = Array.isArray(pos) ? pos[1] : pos.lng;
```

---

## 🌐 Mappls Features Available

1. ✅ Interactive maps
2. ✅ Markers with custom icons
3. ✅ Polylines (routes)
4. ✅ Popups
5. ✅ Draggable markers
6. ✅ Fit bounds
7. ✅ Event listeners

---

## 🔄 Migration Benefits

1. **Consistency** - Same API across all pages
2. **India-focused** - Better coverage for Indian locations
3. **Performance** - Optimized for Indian users
4. **Features** - Rich Indian POI database

---

## 📞 Support

If map doesn't load:
1. Check Mappls SDK loaded: `console.log(typeof mappls)`
2. Verify API key is valid
3. Check browser console for errors
4. Ensure coordinates are in `[lat, lng]` format

---

**✅ Live tracking now fully integrated with Mappls API!**

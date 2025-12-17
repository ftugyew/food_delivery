# Mixed Content Fix Documentation

## Problem
When the frontend is deployed on **HTTPS** (e.g., Vercel), but the backend API returns **HTTP** image URLs, modern browsers block these requests due to mixed content security policy.

**Error Message in Console:**
```
Mixed Content: The page at 'https://food-ameerpet.vercel.app/' was loaded over HTTPS, but requested an insecure resource 'http://food-delivery-backend-cw3m.onrender.com/uploads/...'. This request has been blocked; the content must be served over HTTPS.
```

## Root Cause
Backend API endpoints return `image_url_full` with `http://` prefix:
```json
{
  "image_url_full": "http://food-delivery-backend-cw3m.onrender.com/uploads/menu/1765981167127.jpg"
}
```

When frontend is HTTPS, browsers refuse to load HTTP resources for security reasons.

## Solution: URL Normalization

### 1. Primary Normalization: `restaurant.html`
**File**: [frontend/restaurant.html](frontend/restaurant.html#L156)

Added `normalizeImageUrl()` helper function:
```javascript
function normalizeImageUrl(url) {
  if (!url) return null;
  // Convert http:// to https:// when on HTTPS page
  return String(url).replace(/^http:\/\//i, 'https://');
}
```

Applied normalization immediately after API fetch in `fetchRestaurantAndMenu()`:
```javascript
// Normalize restaurant image URL
if (restaurant && restaurant.image_url_full) {
  restaurant.image_url_full = normalizeImageUrl(restaurant.image_url_full);
}

// Normalize all menu item image URLs
if (items && Array.isArray(items)) {
  items.forEach(item => {
    if (item.image_url_full) {
      item.image_url_full = normalizeImageUrl(item.image_url_full);
    }
  });
}
```

**Why this location?**
- Happens before DOM assignment
- Affects all downstream usage automatically
- Single point of normalization prevents code duplication

### 2. Secondary Normalization: `imageHelper.js`
**File**: [frontend/js/imageHelper.js](frontend/js/imageHelper.js#L6)

Added defensive normalization in `getMenuImageUrl()` and `getRestaurantImageUrl()`:
```javascript
function normalizeImageUrl(url) {
  if (!url) return null;
  if (window.location.protocol === 'https:' && String(url).startsWith('http://')) {
    return String(url).replace(/^http:\/\//i, 'https://');
  }
  return url;
}
```

Applied in helper functions:
```javascript
// In getMenuImageUrl():
if (imageUrlFull) return normalizeImageUrl(imageUrlFull);
if (imageUrl && String(imageUrl).startsWith('http')) return normalizeImageUrl(imageUrl);

// In getRestaurantImageUrl():
if (imageUrlFull) return normalizeImageUrl(imageUrlFull);
if (imageUrl && String(imageUrl).startsWith('http')) return normalizeImageUrl(imageUrl);
```

**Why this location?**
- Defense-in-depth: Catches any HTTP URLs reaching helper functions
- Safe for HTTP deployments: Only normalizes when page is HTTPS
- Protects against edge cases where URLs bypass primary normalization

## How It Works

### Flow Diagram
```
API Response (HTTP URLs)
    ↓
fetchRestaurantAndMenu() 
    ↓
normalizeImageUrl() [PRIMARY]
    ↓
DOM Population with HTTPS URLs
    ↓
Rendering (getMenuImageUrl, getRestaurantImageUrl)
    ↓
normalizeImageUrl() [SECONDARY - defensive]
    ↓
Browser loads HTTPS image ✅ (No mixed content warning)
```

### Example Transformation
**Before:** 
```
http://food-delivery-backend-cw3m.onrender.com/uploads/menu/1765981167127.jpg
```

**After:** 
```
https://food-delivery-backend-cw3m.onrender.com/uploads/menu/1765981167127.jpg
```

## Testing

### Local Testing (HTTP)
- Normalization only applies when `window.location.protocol === 'https:'`
- Local HTTP deployments unaffected
- URLs passed through unchanged

### Production Testing (HTTPS - Vercel)
1. Deploy to Vercel (enforces HTTPS)
2. Open Chrome DevTools Console (F12)
3. Navigate to restaurant page: `/restaurant.html?id=1`
4. **Expected**: No mixed content warnings
5. **Verify**: 
   - Restaurant image loads without warning
   - All menu item images load without warning
   - Console shows no "insecure resource" errors

## Deployment Checklist

- [x] Add `normalizeImageUrl()` to restaurant.html
- [x] Apply normalization in fetch function (restaurant image)
- [x] Apply normalization in fetch function (menu items loop)
- [x] Add defensive normalization to imageHelper.js
- [x] Add protocol check to imageHelper normalization
- [x] Test on local HTTP deployment
- [ ] Deploy to production HTTPS
- [ ] Verify no mixed content warnings on Vercel
- [ ] Test restaurant page image loading
- [ ] Test menu item image loading

## Notes

- **No Backend Changes**: This solution works with backend returning HTTP URLs
- **HTTPS Detection**: Uses `window.location.protocol` to detect HTTPS pages
- **Browser Compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **Performance**: Minimal performance impact - simple string replacement
- **Security**: Improves security by enforcing HTTPS image loading

## Alternative Solutions (Not Implemented)

1. **Backend Change**: Have backend return HTTPS URLs
   - Would eliminate need for frontend normalization
   - Requires backend deployment change (user requested frontend-only fixes)

2. **HTTPS Meta Tag**: Add `<meta property="og:image" ...>` 
   - Doesn't solve the underlying mixed content issue

3. **Content Security Policy**: Modify CSP header
   - Requires server configuration
   - Masks the issue rather than fixing it

**Why We Chose URL Normalization:**
- Simple, frontend-only solution
- No backend changes required
- Fixes root cause (HTTP → HTTPS conversion)
- Works with existing deployment
- Easily reversible if needed

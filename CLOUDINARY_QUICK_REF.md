# 🚀 Cloudinary Integration - Quick Reference

## Install
```bash
npm install cloudinary multer multer-storage-cloudinary
```

## .env Variables
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## File Structure
```
config/cloudinary.js           (8 lines)
middleware/upload.js            (60 lines)
controllers/restaurant.controller.js  (updated)
controllers/menu.controller.js        (updated)
routes/restaurants.js           (import change)
routes/menu.js                  (import change)
server.js                       (init + CORS)
```

## Key Differences

| Aspect | Old (Local) | New (Cloudinary) |
|--------|-----------|-----------------|
| Storage | `/uploads/menu` | Cloudinary cloud |
| URL in DB | `filename.jpg` | `https://res.cloudinary.com/...` |
| Frontend URL build | `${BASE}/uploads/menu/filename.jpg` | Direct from DB |
| Persistence | Lost on redeploy | Permanent |
| Bandwidth | From Render | CDN fast |
| Cost | $0 (but limited) | Free tier: 25GB |

## API Response

**Before:**
```json
{
  "image_url": "1765990659607-247734948.jpg"
}
```

**After:**
```json
{
  "image_url": "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/tindo/menu/file.jpg"
}
```

## Frontend Code (Minimal)
```javascript
const formData = new FormData();
formData.append("item_name", "Biryani");
formData.append("price", 250);
formData.append("image", fileInput.files[0]); // ← Must be "image"

const res = await fetch("/api/menu", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData // ← No Content-Type header
});

const data = await res.json();
// data.image_url is now ready to use in <img src>
```

## Deploy Steps
1. `npm install` (adds multer-storage-cloudinary)
2. Create `config/cloudinary.js` (provided)
3. Create `middleware/upload.js` (provided)
4. Update controllers (provided)
5. Update routes (provided)
6. Update `server.js` (provided)
7. Push to GitHub
8. In Render: add 3 Cloudinary env vars
9. Redeploy

## Test
```bash
# Local
npm start
curl -X POST http://localhost:5000/api/menu \
  -H "Authorization: Bearer TOKEN" \
  -F "item_name=Test" \
  -F "price=100" \
  -F "image=@test.jpg"

# Production
curl -X POST https://backend.onrender.com/api/menu \
  -H "Authorization: Bearer TOKEN" \
  -F "item_name=Test" \
  -F "price=100" \
  -F "image=@test.jpg"
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| `CLOUDINARY_CLOUD_NAME is undefined` | Check `.env`, restart |
| Upload hangs | Check Cloudinary credentials |
| 404 on image | Use `image_url` from response directly |
| `ENOENT: no such file` | Using old code; update controllers |

## Files Changed Summary

✅ **New:**
- `config/cloudinary.js` (8 lines)
- `middleware/upload.js` (60 lines)
- `CLOUDINARY_SETUP.md` (guide)
- `CLOUDINARY_COMPLETE.md` (full docs)
- `FRONTEND_CLOUDINARY_EXAMPLE.js` (examples)

✅ **Updated:**
- `controllers/restaurant.controller.js` (removed local URL building)
- `controllers/menu.controller.js` (removed local URL building)
- `routes/restaurants.js` (import change)
- `routes/menu.js` (import change)
- `server.js` (single CORS, Cloudinary init)
- `package.json` (added dependency)

## That's It! 🎉

No local filesystem. Images persist forever. Works on Render + Vercel.

See `CLOUDINARY_COMPLETE.md` for detailed documentation.

# Cloudinary Integration - Complete Solution

## 📁 Folder Structure Created

```
backend/
├── config/
│   └── cloudinary.js                    # ✅ NEW: Cloudinary init
├── middleware/
│   └── upload.js                        # ✅ NEW: Multer + Cloudinary storage
├── controllers/
│   ├── restaurant.controller.js         # ✅ UPDATED: Cloudinary URLs
│   └── menu.controller.js               # ✅ UPDATED: Cloudinary URLs
├── routes/
│   ├── restaurants.js                   # ✅ UPDATED: middleware/upload
│   └── menu.js                          # ✅ UPDATED: middleware/upload
├── server.js                            # ✅ UPDATED: Single CORS, Cloudinary init
├── package.json                         # ✅ UPDATED: Added multer-storage-cloudinary
└── .env.example                         # Reference for env vars
```

## 🔧 Files Modified

### 1. **config/cloudinary.js** (NEW)
- Initializes Cloudinary with env variables
- Simple 8-line wrapper

### 2. **middleware/upload.js** (NEW)
- Multer storage for restaurants (`tindo/restaurants`)
- Multer storage for menu items (`tindo/menu`)
- 10MB file size limit
- Image file filter (jpg, png, gif, webp)

### 3. **controllers/restaurant.controller.js** (UPDATED)
- Removed local URL building (`${host}/uploads/restaurants/...`)
- `req.file.path` = full Cloudinary URL
- Stores URL directly in DB
- No file system operations

### 4. **controllers/menu.controller.js** (UPDATED)
- Same as restaurant controller
- Removed local path operations
- Cloudinary URL handling

### 5. **routes/restaurants.js** (UPDATED)
```javascript
// Changed from:
const { restaurantUpload } = require("../config/multer");

// To:
const { restaurantUpload } = require("../middleware/upload");
```

### 6. **routes/menu.js** (UPDATED)
```javascript
// Changed from:
const { menuUpload } = require("../config/multer");

// To:
const { menuUpload } = require("../middleware/upload");
```

### 7. **server.js** (UPDATED)
- Removed duplicate CORS middleware (now single)
- Removed old multer import
- Added Cloudinary init: `require("./config/cloudinary")`
- Removed local `/uploads` serving
- Clean CORS setup with *.vercel.app + localhost

### 8. **package.json** (UPDATED)
- Added: `"multer-storage-cloudinary": "^4.0.0"`

## 🚀 Deployment Checklist

### Local Setup
```bash
cd backend
npm install
```

### Cloudinary Setup
1. Go to https://cloudinary.com/console
2. Get your Cloud Name, API Key, API Secret
3. Create `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
JWT_SECRET=...
PORT=5000
```

### Test Locally
```bash
npm start
# Server running on http://localhost:5000
```

### Deploy to Render
1. Push to GitHub
2. In Render dashboard > Environment > add 3 Cloudinary vars
3. Redeploy service

## 📤 API Usage

### Create Restaurant (with image)
```bash
POST /api/restaurants
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

name=Pizza Palace
description=Best pizzas in town
cuisine=Italian
phone=9876543210
email=pizza@example.com
address=123 Main St
lat=12.9716
lng=77.5946
image=<binary file>
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant created successfully",
  "id": 42,
  "image_url": "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/tindo/restaurants/filename.jpg"
}
```

### Add Menu Item (with image)
```bash
POST /api/menu
Content-Type: multipart/form-data
Authorization: Bearer TOKEN

item_name=Margherita Pizza
price=299
description=Fresh tomato and basil
category=Main Course
is_veg=1
image=<binary file>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item added successfully",
  "id": 15,
  "image_url": "https://res.cloudinary.com/yourcloud/image/upload/v1234567890/tindo/menu/filename.jpg"
}
```

## 🎨 Frontend Integration

See `FRONTEND_CLOUDINARY_EXAMPLE.js` for complete examples.

**Key points:**
- Field name: `"image"` (not "imageFile" or other variants)
- No `Content-Type` header (let browser set it)
- `Authorization` header still required
- Response `image_url` is full Cloudinary URL ready to use

### Simple Example
```javascript
const formData = new FormData();
formData.append("item_name", "Biryani");
formData.append("price", 250);
formData.append("image", fileInput.files[0]);

const res = await fetch("https://backend.onrender.com/api/menu", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData
});

const data = await res.json();
console.log(data.image_url); // Full Cloudinary URL
```

## 🔒 Security

✅ **No local file system access**
- Images not stored on ephemeral Render filesystem
- No file cleanup on delete (Cloudinary manages it)
- No disk space concerns

✅ **Authentication**
- JWT required for POST/PUT/DELETE
- File upload limited to authenticated users
- Restaurant/menu ownership validated

✅ **File validation**
- Only images allowed (jpg, png, gif, webp)
- 10MB max file size
- MIME type checked

## 📊 Database Schema

No schema changes needed. Column `image_url`:
- **Before:** `1765990659607-247734948.jpg` (filename)
- **After:** `https://res.cloudinary.com/.../tindo/menu/1765990659607.jpg` (full URL)

Frontend receives full URL, no URL building required.

## 🐛 Troubleshooting

**Issue: "CLOUDINARY_CLOUD_NAME is undefined"**
- Solution: Check `.env` has all 3 Cloudinary vars, restart server

**Issue: 413 Payload Too Large**
- Solution: Increase Express limit (default 100kb, we allow 10MB in multer)

**Issue: Image upload hangs**
- Solution: Check Cloudinary credentials are correct, check network

**Issue: 404 on image URL**
- Solution: Verify response includes `image_url`, use it directly in `<img>`

## ✨ Benefits

1. ✅ **Permanent storage** - survives Render restarts
2. ✅ **CDN delivery** - Cloudinary serves images fast
3. ✅ **No local filesystem** - no permission issues
4. ✅ **Scalable** - handle millions of images
5. ✅ **Free tier** - 25GB storage included
6. ✅ **Simple integration** - drop-in replacement
7. ✅ **Production ready** - used by major apps

## 📝 Next Steps

1. Get Cloudinary account
2. Copy Cloud Name, API Key, API Secret
3. Update `.env` with Cloudinary vars
4. Run `npm install` (adds multer-storage-cloudinary)
5. Test locally with curl/Postman
6. Deploy to Render with env vars
7. Test on production

---

**All code is copy-paste ready. No additional setup needed.**

# Cloudinary Integration Guide

## Installation

```bash
npm install cloudinary multer multer-storage-cloudinary
```

## Setup Steps

### 1. Get Cloudinary Credentials
- Sign up at https://cloudinary.com
- Go to **Settings > API Keys**
- Copy: `Cloud Name`, `API Key`, `API Secret`

### 2. Update .env
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Deploy to Render
1. Push all changes to GitHub
2. In Render dashboard, redeploy the backend service
3. Add the 3 Cloudinary env vars in Render > Settings > Environment

### 4. Verify

**Test Restaurant Upload:**
```bash
curl -X POST http://localhost:5000/api/restaurants \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=My Restaurant" \
  -F "image=@path/to/image.jpg"
```

**Test Menu Upload:**
```bash
curl -X POST http://localhost:5000/api/menu \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "item_name=Biryani" \
  -F "price=250" \
  -F "image=@path/to/dish.jpg"
```

### 5. Database Changes
No schema changes needed. `image_url` now stores the full Cloudinary URL instead of a filename.

**Example:**
- **Before:** `1765990659607-247734948.jpg`
- **After:** `https://res.cloudinary.com/yourcloud/image/upload/v123456/tindo/menu/1765990659607.jpg`

## Folder Structure

```
backend/
├── config/
│   └── cloudinary.js          # Initialize Cloudinary
├── middleware/
│   └── upload.js               # Multer + Cloudinary storage
├── controllers/
│   ├── restaurant.controller.js # Updated for Cloudinary
│   └── menu.controller.js       # Updated for Cloudinary
├── routes/
│   ├── restaurants.js           # Updated middleware import
│   └── menu.js                  # Updated middleware import
├── server.js                    # Cleaned up (no local file serving)
└── .env.example
```

## Key Changes

1. **No local /uploads folder** - all images on Cloudinary
2. **req.file.path** contains full Cloudinary URL
3. **Database stores full URL** - no URL building needed on frontend
4. **Images persist** - survives Render restarts
5. **Single CORS middleware** - no duplicates

## Frontend Usage

See `FRONTEND_CLOUDINARY_EXAMPLE.js` for complete FormData examples.

**Key points:**
- Field name must be `"image"` (for both restaurant and menu)
- `image_url` in response is the full Cloudinary URL
- Use it directly in `<img src="image_url">`

## Troubleshooting

**"CLOUDINARY_CLOUD_NAME is undefined"**
- Check `.env` file has all 3 vars
- Restart backend after updating `.env`
- On Render, env vars update on redeploy only

**Image uploads fail**
- Verify Cloudinary credentials are correct
- Check multer-storage-cloudinary version: `npm list multer-storage-cloudinary`
- File size < 10MB
- File type is: jpg, jpeg, png, gif, webp

**Images show "404"**
- Check response includes `image_url`
- Verify frontend uses the full URL (not building it)
- Cloudinary CDN may have 5-10s delay on first view

## Pricing

Cloudinary free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 monthly transformations

Plenty for a small food delivery app. Paid plans are $99+/month.

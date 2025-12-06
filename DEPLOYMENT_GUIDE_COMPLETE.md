# 🚀 Tindo Deployment Guide

## Overview
This guide covers deploying the Tindo food delivery application to production on Render (Backend) and Netlify/GitHub Pages (Frontend).

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All tests passing locally
- ✅ No hardcoded URLs (use environment variables)
- ✅ Database migrations applied
- ✅ Environment variables configured
- ✅ SSL/HTTPS certificates ready
- ✅ Backup strategy in place

---

## 🔧 BACKEND DEPLOYMENT (Render)

### Step 1: Prepare Backend

#### 1.1 Update Environment Variables
```bash
cd backend
cp .env.example .env
# Edit .env with production values:
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your_secret_key_here
```

#### 1.2 Install Dependencies
```bash
npm install
```

#### 1.3 Test Locally
```bash
npm start
# Should start server on http://localhost:5000
```

---

### Step 2: Setup Render Account

1. Go to [render.com](https://render.com)
2. Sign up / Log in
3. Create a new "Web Service"

---

### Step 3: Deploy Backend to Render

#### 3.1 Connect GitHub Repository
1. Click "Create New" → "Web Service"
2. Select your GitHub repository
3. Choose branch: `main`

#### 3.2 Configure Service
- **Name**: `food-delivery-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or paid for production)

#### 3.3 Add Environment Variables
In Render dashboard, go to "Environment" and add:
```
DB_HOST=your_database_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=tindo
JWT_SECRET=your_secret_key
NODE_ENV=production
MAPPLS_CLIENT_ID=your_mappls_id
MAPPLS_CLIENT_SECRET=your_mappls_secret
```

#### 3.4 Deploy
- Click "Create Web Service"
- Render will auto-deploy from Git push
- Monitor deployment logs

#### 3.5 Verify Backend
```bash
curl https://food-delivery-backend-cw3m.onrender.com/api/restaurants
```

Should return JSON array of restaurants.

---

## 🎨 FRONTEND DEPLOYMENT (Netlify)

### Step 1: Prepare Frontend

#### 1.1 Update API Configuration
In `frontend/js/api.js`:
```javascript
export const API_BASE_URL = "https://food-delivery-backend-cw3m.onrender.com/api";

if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
}
```

#### 1.2 Update Socket.IO Configuration
In `frontend/js/socket-client.js`:
```javascript
const BACKEND_URL = "https://food-delivery-backend-cw3m.onrender.com";
const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionDelay: 1000
});
```

#### 1.3 Create netlify.toml
```toml
[build]
  command = "echo 'No build required for static site'"
  publish = "."

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Step 2: Deploy Frontend to Netlify

#### 2.1 Connect GitHub
1. Go to [netlify.com](https://netlify.com)
2. Click "Connect to Git"
3. Authorize GitHub
4. Select your repository

#### 2.2 Configure Build
- **Base directory**: `frontend` (or leave blank if frontend is root)
- **Build command**: `echo 'Static site'` (no build needed)
- **Publish directory**: `.` or `frontend/`

#### 2.3 Deploy
- Click "Deploy site"
- Netlify will deploy instantly
- Get your URL: `https://your-site.netlify.app`

#### 2.4 Configure Custom Domain (Optional)
1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Update DNS records

---

## 🗄️ DATABASE SETUP

### Step 1: Railway/AWS RDS Setup

#### Option A: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add MySQL plugin
4. Copy connection string to `DATABASE_URL` in Render

#### Option B: AWS RDS
1. Create RDS MySQL instance
2. Get endpoint: `db-instance.xxxx.us-east-1.rds.amazonaws.com`
3. Create database: `tindo`
4. Set `DATABASE_URL` environment variable

### Step 2: Run Migrations
```bash
# SSH into backend server OR run locally pointing to production DB
node backend/migrate-database.js

# Or setup via backend startup script
npm start
```

---

## 📧 EMAIL & SMS CONFIGURATION

### Twilio SMS (OTP Verification)
```javascript
// In backend/routes/otp.js
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: `Your Tindo OTP: ${otp}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phone
});
```

### SendGrid Email
```javascript
// In backend routes
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: user.email,
  from: 'noreply@tindo.com',
  subject: 'Order Confirmation',
  html: `<h1>Order #${order.id} confirmed</h1>`
});
```

---

## 🔐 SECURITY SETUP

### 1. SSL/HTTPS
- ✅ Render: Auto HTTPS enabled
- ✅ Netlify: Auto HTTPS enabled
- ✅ Custom domains: Use free SSL via Let's Encrypt

### 2. CORS Configuration
```javascript
// backend/server.js
const corsOptions = {
  origin: [
    "https://your-frontend-domain.com",
    "http://localhost:3000" // only for dev
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
};
app.use(cors(corsOptions));
```

### 3. Rate Limiting (Optional but Recommended)
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### 4. API Key Validation
```javascript
// For admin endpoints
app.use('/api/admin', (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: "Invalid API key" });
  }
  next();
});
```

---

## 🚨 MONITORING & LOGGING

### Sentry Error Tracking
```bash
npm install @sentry/node @sentry/tracing
```

```javascript
// backend/server.js
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
```

### CloudWatch Logs (AWS)
- AWS RDS logs automatically captured
- Check via CloudWatch Console

### Application Logs
```bash
# SSH into Render service
render logs
```

---

## 🔄 CI/CD PIPELINE

### GitHub Actions (Auto-Deploy)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }} \
            -H "Content-Type: application/json"
      
      - name: Deploy Frontend to Netlify
        run: |
          npm install -g netlify-cli
          netlify deploy --prod \
            --site=${{ secrets.NETLIFY_SITE_ID }} \
            --auth=${{ secrets.NETLIFY_TOKEN }} \
            --dir=frontend
```

### GitHub Secrets
Set up in repository settings:
- `RENDER_DEPLOY_HOOK`: Render deploy webhook
- `NETLIFY_SITE_ID`: Your Netlify site ID
- `NETLIFY_TOKEN`: Your Netlify personal access token

---

## 📊 PERFORMANCE OPTIMIZATION

### Frontend
1. **Minify CSS/JS**
   ```bash
   npm install -D terser
   ```

2. **Lazy Load Images**
   ```html
   <img src="image.jpg" loading="lazy" />
   ```

3. **Enable GZIP Compression**
   - Netlify: Automatic
   - Custom: Add `Accept-Encoding: gzip` header

### Backend
1. **Database Indexing**
   ```sql
   CREATE INDEX idx_user_email ON users(email);
   CREATE INDEX idx_order_status ON orders(status);
   CREATE INDEX idx_agent_id ON orders(agent_id);
   ```

2. **Connection Pooling**
   ```javascript
   const pool = mysql.createPool({
     connectionLimit: 10,
     host: process.env.DB_HOST,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME
   });
   ```

3. **Cache Responses**
   ```javascript
   app.get('/api/restaurants', (req, res, next) => {
     if (cache.has('restaurants')) {
       return res.json(cache.get('restaurants'));
     }
     next();
   });
   ```

---

## 📱 PWA SETUP

### Add to Android/iOS Home Screen

1. **Create manifest.json**
   ```json
   {
     "name": "Tindo Food Delivery",
     "short_name": "Tindo",
     "start_url": "/index.html",
     "display": "standalone",
     "icons": [
       {
         "src": "assets/icon-192.png",
         "sizes": "192x192",
         "type": "image/png"
       }
     ],
     "theme_color": "#10b981"
   }
   ```

2. **Add to index.html**
   ```html
   <link rel="manifest" href="manifest.json">
   <meta name="theme-color" content="#10b981">
   <meta name="apple-mobile-web-app-capable" content="yes">
   ```

3. **Create Service Worker**
   ```javascript
   // frontend/service-worker.js
   self.addEventListener('install', (event) => {
     // Cache static assets
   });
   
   self.addEventListener('fetch', (event) => {
     // Serve from cache, fallback to network
   });
   ```

---

## ✅ POST-DEPLOYMENT VERIFICATION

Run these checks after deployment:

```bash
# Backend Health Check
curl https://your-backend.onrender.com/api/restaurants

# Frontend Accessibility
curl -I https://your-frontend.netlify.app

# Socket.IO Connection Test
# Open browser console and check:
# io('https://your-backend.onrender.com')

# Database Connection
# Check Render/Railway logs for "DB connected ✅"

# SSL Certificate
curl -v https://your-backend.onrender.com | grep "SSL"
```

---

## 🐛 TROUBLESHOOTING

### Backend won't start
```bash
# Check logs
render logs

# Verify environment variables
echo $DATABASE_URL
echo $JWT_SECRET

# Test database connection
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD
```

### Frontend blank page
- Check browser console for errors
- Verify `API_BASE_URL` correct
- Check CORS headers

### Socket.IO connection fails
- Verify `BACKEND_URL` in socket-client.js
- Check firewall allows WebSocket
- Monitor Render logs

### Database connection timeout
- Check security group allows inbound 3306
- Verify DATABASE_URL format
- Test connection from local machine

---

## 📞 Support & Contacts

- **Backend Issues**: Check Render dashboard
- **Frontend Issues**: Check Netlify logs
- **Database Issues**: Contact your DB provider
- **General**: support@tindo.com

---

**Last Updated**: December 6, 2025
**Version**: 1.0

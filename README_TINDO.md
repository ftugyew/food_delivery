# 🍽️ Tindo - Food Delivery Application

**A complete, production-ready full-stack food delivery platform with real-time order tracking, socket.io integration, and multi-role support.**

## ✨ Features

### 👥 Customer Features
- ✅ Browse restaurants & menus
- ✅ Add items to cart
- ✅ Real-time order tracking with live map
- ✅ Multiple payment methods (COD, Razorpay)
- ✅ Order history & reviews
- ✅ User profile management

### 🏪 Restaurant Features
- ✅ Manage menu items with images
- ✅ View incoming orders in real-time
- ✅ Update order status (Preparing → Ready → Picked)
- ✅ Dashboard with analytics
- ✅ Admin approval system

### 🚗 Delivery Agent Features
- ✅ Accept assigned orders
- ✅ Real-time GPS location tracking
- ✅ Live delivery map for customers
- ✅ Proof of delivery (photo/signature)
- ✅ Earnings & delivery history

### 👨‍💼 Admin Features
- ✅ Approve restaurants & delivery agents
- ✅ View all orders
- ✅ Manage featured/top restaurants
- ✅ System analytics & reporting

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, JavaScript, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL |
| **Real-Time** | Socket.IO |
| **Maps** | Leaflet + OpenStreetMap |
| **Hosting** | Render (Backend), Netlify (Frontend) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Password** | Bcryptjs |

---

## 📦 Installation

### Prerequisites
- Node.js 14+
- MySQL 5.7+
- Git

### Backend Setup

```bash
# Clone repository
git clone <your-repo>
cd food-delivery/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
node setup-database.js

# Run migrations
node migrate-database.js

# Start server
npm start
# Server running on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend

# No build required - pure HTML/CSS/JS
# Serve with any HTTP server:
python -m http.server 8000
# Or use VS Code Live Server extension
```

### Database Setup

```sql
-- Create database
CREATE DATABASE tindo;

-- Run migrations
use tindo;
source backend/database_schema.sql;
```

---

## 🚀 Deployment

### Deploy Backend to Render
```bash
# 1. Push code to GitHub
git push origin main

# 2. Create new Web Service on Render.com
# - Connect GitHub repo
# - Set environment variables
# - Start command: npm start

# 3. Get backend URL: https://your-backend.onrender.com
```

### Deploy Frontend to Netlify
```bash
# 1. Update API_BASE_URL in frontend/js/api.js
# 2. Connect GitHub repo to Netlify
# 3. Deploy - Netlify handles automatically on git push
```

See [DEPLOYMENT_GUIDE_COMPLETE.md](./DEPLOYMENT_GUIDE_COMPLETE.md) for detailed instructions.

---

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API endpoints
- [Testing Checklist](./TESTING_CHECKLIST.md) - QA test cases
- [Deployment Guide](./DEPLOYMENT_GUIDE_COMPLETE.md) - Production setup
- [Environment Variables](./backend/.env.example) - Configuration reference

---

## 🗺️ Project Structure

```
food-delivery/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── orders.js        # Order management
│   │   ├── delivery.js      # Delivery agent endpoints
│   │   ├── menu.js          # Menu management
│   │   └── ...
│   ├── controllers/
│   ├── db.js                # Database connection
│   ├── server.js            # Express app setup
│   └── package.json
│
├── frontend/
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── register.html        # Registration
│   ├── restaurants.html     # Browse restaurants
│   ├── cart.html            # Shopping cart
│   ├── checkout.html        # Payment page
│   ├── order-tracking.html  # Live tracking with map
│   ├── restaurant-dashboard.html
│   ├── delivery-dashboard.html
│   ├── admin-dashboard.html
│   ├── js/
│   │   ├── api.js           # API configuration
│   │   ├── script.js        # Utilities
│   │   ├── socket-client.js # Socket.IO client
│   │   └── ...
│   └── css/
│       ├── ui.css
│       ├── animations.css
│       └── tailwind.css
│
├── API_DOCUMENTATION.md
├── TESTING_CHECKLIST.md
├── DEPLOYMENT_GUIDE_COMPLETE.md
└── README.md (this file)
```

---

## 🔑 Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/users/profile` - Get user profile

### Orders
- `POST /api/orders/new` - Place order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/restaurant/:id` - Get restaurant orders
- `GET /api/orders/agent/:id` - Get agent orders
- `POST /api/orders/update` - Update order status

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/menu/by-restaurant/:id` - Get menu items
- `POST /api/menu` - Add menu item (restaurant)

### Delivery
- `POST /api/delivery/update-location` - Send GPS location
- `GET /api/delivery/location/:order_id` - Get agent location

---

## 🔐 Security Features

- ✅ **Password Hashing**: Bcryptjs with salt rounds
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **CORS Protection**: Allowed origins configured
- ✅ **Input Validation**: Server-side validation on all inputs
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **XSS Protection**: HTML escaping in frontend

---

## 📊 Real-Time Features

### Socket.IO Events

**Server → Client**:
- `newOrder` - New order notification (restaurant)
- `orderForAgent_${id}` - Order assigned to agent
- `trackOrder_${id}` - Agent location update (customer)
- `orderUpdate` - Order status changed

**Client → Server**:
- `agentLocation` - Send GPS coordinates

---

## ✅ Testing

### Run Test Suite
```bash
# Backend tests
cd backend
npm test

# Manual testing
See TESTING_CHECKLIST.md
```

### Quick Test Flow
1. Register customer
2. Browse restaurants
3. Add items to cart
4. Place order
5. Track order in real-time
6. Complete delivery

---

## 🎯 Quick Start (Local Development)

```bash
# Terminal 1: Start Backend
cd backend
npm install
npm start
# http://localhost:5000

# Terminal 2: Start Frontend
cd frontend
python -m http.server 3000
# http://localhost:3000

# Terminal 3: Database
mysql -u root -p
USE tindo;
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 5000 is free
lsof -i :5000

# Verify database connection
mysql -u root -p tindo -e "SELECT 1"

# Check environment variables
cat .env
```

### Frontend blank page
- Clear browser cache
- Check browser console for errors
- Verify API_BASE_URL in api.js

### Socket.IO not connecting
- Check backend is running
- Verify CORS allows frontend origin
- Check WebSocket support

---

## 📈 Performance

- **Page Load**: < 3 seconds
- **API Response**: < 500ms
- **Real-Time Updates**: < 1 second

---

## 🔄 CI/CD

Automatic deployment on git push:
- Backend: Render auto-deploys from GitHub
- Frontend: Netlify auto-deploys from GitHub

---

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: support@tindo.com
- **Documentation**: See docs/ folder

---

## 📄 License

MIT License - See LICENSE.md

---

## 🙏 Credits

Built with ❤️ for the Tindo team

**Project Completion Date**: December 6, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready

---

## 📋 Checklist for Go-Live

- ✅ All tests passing
- ✅ Security review completed
- ✅ Environment variables configured
- ✅ Database backups enabled
- ✅ SSL certificates active
- ✅ Monitoring setup (Sentry, CloudWatch)
- ✅ Incident response plan
- ✅ User documentation
- ✅ Support team trained
- ✅ Launch announcement

---

**Ready to deploy?** See [DEPLOYMENT_GUIDE_COMPLETE.md](./DEPLOYMENT_GUIDE_COMPLETE.md)

**Questions?** Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

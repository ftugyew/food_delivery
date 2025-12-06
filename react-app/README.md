# Tindo - Food Delivery React App

A modern React.js frontend for the Tindo food delivery application.

## Features

- 🍛 Welcome/Home Page
- 🔐 User Login & Signup
- 🏪 Restaurant List
- 📋 Restaurant Menu
- 🛒 Shopping Cart
- 💳 Checkout
- 📦 Order Tracking (Live Updates)
- 👤 User Profile & Logout

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd react-app
   npm install
   ```

2. **Create .env File**
   Create a `.env` file in the `react-app` directory with:
   ```
   REACT_APP_API_URL=https://food-delivery-tidq.onrender.com

   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```
   The build folder will be ready for deployment on Render Static Sites.

## Tech Stack

- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.2
- TailwindCSS 3.4.0
- Context API for State Management

## Project Structure

```
react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── ProtectedRoute.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── CartContext.js
│   ├── pages/
│   │   ├── Welcome.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Restaurants.js
│   │   ├── RestaurantMenu.js
│   │   ├── Cart.js
│   │   ├── Checkout.js
│   │   ├── OrderTracking.js
│   │   └── Profile.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── .env (create this file)
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## API Endpoints Used

- `POST /users/login` - User login
- `POST /users/register` - User registration
- `GET /restaurants` - Get all restaurants
- `GET /restaurants/:id/menu` - Get restaurant menu
- `POST /orders` - Create order
- `GET /orders/:id/tracking` - Get order tracking

## Brand Colors

- Orange: `#FF6B35` (tindo-orange)
- Yellow: `#FFB627` (tindo-yellow)
- Red: `#D32F2F` (tindo-red)
- Dark: `#1A1A1A` (tindo-dark)

## Deployment

The app is configured for deployment on Render Static Sites. After running `npm run build`, upload the `build` folder to Render.



import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    const savedRestaurantId = localStorage.getItem('restaurantId');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedRestaurantId) {
      setRestaurantId(savedRestaurantId);
    }
  }, []);

  const addToCart = (item, restaurantIdParam) => {
    setCart((prevCart) => {
      // If adding from a different restaurant, clear cart
      if (prevCart.length > 0 && restaurantIdParam && restaurantIdParam !== restaurantId) {
        const newCart = [{ ...item, quantity: 1 }];
        localStorage.setItem('cart', JSON.stringify(newCart));
        localStorage.setItem('restaurantId', restaurantIdParam);
        setRestaurantId(restaurantIdParam);
        return newCart;
      }

      // Check if item already exists
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        newCart = [...prevCart, { ...item, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      if (restaurantIdParam) {
        localStorage.setItem('restaurantId', restaurantIdParam);
        setRestaurantId(restaurantIdParam);
      }
      return newCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      if (newCart.length === 0) {
        localStorage.removeItem('restaurantId');
        setRestaurantId(null);
      }
      return newCart;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setRestaurantId(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('restaurantId');
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


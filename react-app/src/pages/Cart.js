import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/restaurants" className="text-gray-700 hover:text-tindo-orange">
              ← Back
            </Link>
            <Link to="/" className="text-2xl font-bold text-tindo-orange">
              Tindo
            </Link>
            <div className="w-20"></div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some delicious food to get started!</p>
          <Link
            to="/restaurants"
            className="bg-tindo-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-block"
          >
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/restaurants" className="text-gray-700 hover:text-tindo-orange">
            ← Back
          </Link>
          <Link to="/" className="text-2xl font-bold text-tindo-orange">
            Tindo
          </Link>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Cart</h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-4 border-b border-gray-200 last:border-b-0"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.item_name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=Food';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{item.item_name}</h3>
                  <p className="text-gray-600 text-sm">₹{item.price?.toFixed(2) || '0.00'} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-tindo-orange">
                    ₹{(item.price * item.quantity)?.toFixed(2) || '0.00'}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 text-sm hover:text-red-700 mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-semibold text-gray-800">Subtotal</span>
              <span className="text-2xl font-bold text-tindo-orange">
                ₹{getTotalPrice().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4 text-gray-600">
              <span>Delivery Fee</span>
              <span>₹30.00</span>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-800">Total</span>
                <span className="text-3xl font-bold text-tindo-orange">
                  ₹{(getTotalPrice() + 30).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={clearCart}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-tindo-orange text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;



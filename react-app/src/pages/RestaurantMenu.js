import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const RestaurantMenu = () => {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, getTotalItems } = useCart();

  useEffect(() => {
    fetchMenu();
  }, [id]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getMenu(id);
      setMenu(response.data.menu || []);
      setRestaurant(response.data.restaurant || null);
    } catch (err) {
      setError('Failed to load menu. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item, parseInt(id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tindo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/restaurants"
            className="bg-tindo-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  // Group menu items by category
  const menuByCategory = menu.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/restaurants" className="text-gray-700 hover:text-tindo-orange">
            ← Back
          </Link>
          <Link to="/" className="text-2xl font-bold text-tindo-orange">
            Tindo
          </Link>
          <Link
            to="/cart"
            className="relative bg-tindo-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Cart
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-tindo-red text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {getTotalItems()}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Restaurant Info */}
      {restaurant && (
        <div className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {restaurant.image_url && (
                <img
                  src={restaurant.image_url}
                  alt={restaurant.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/200?text=Restaurant';
                  }}
                />
              )}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{restaurant.name}</h1>
                <p className="text-gray-600 mb-2">{restaurant.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-gray-700 font-semibold">
                      {restaurant.rating?.toFixed(1) || '4.0'}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    {restaurant.eta || 30} min delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-8">
        {menu.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No menu items available.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                          {item.item_name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {item.description || 'Delicious food item'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-tindo-orange">
                            ₹{item.price?.toFixed(2) || '0.00'}
                          </span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            disabled={item.status === 'unavailable'}
                            className="bg-tindo-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {item.status === 'unavailable' ? 'Unavailable' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="w-24 h-24 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100?text=Food';
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;



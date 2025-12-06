import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { restaurantAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { getTotalItems } = useCart();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data);
    } catch (err) {
      setError('Failed to load restaurants. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tindo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchRestaurants}
            className="bg-tindo-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-tindo-orange">
            Tindo
          </Link>
          <div className="flex items-center gap-4">
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
            <Link
              to="/profile"
              className="text-gray-700 hover:text-tindo-orange transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-tindo-orange to-tindo-yellow text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Restaurants</h1>
          <p className="text-xl">Order from your favorite restaurants</p>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="container mx-auto px-4 py-8">
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No restaurants available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}/menu`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {restaurant.image_url && (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Restaurant';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{restaurant.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {restaurant.description || 'Delicious food awaits'}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-gray-700 font-semibold">
                        {restaurant.rating?.toFixed(1) || '4.0'}
                      </span>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {restaurant.eta || 30} min
                    </span>
                  </div>
                  {restaurant.cuisine && (
                    <span className="inline-block mt-2 px-3 py-1 bg-tindo-yellow/20 text-tindo-orange rounded-full text-xs font-semibold">
                      {restaurant.cuisine}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;



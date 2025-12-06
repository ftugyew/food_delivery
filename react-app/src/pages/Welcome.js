import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Welcome = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-tindo-orange via-tindo-yellow to-tindo-red">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 drop-shadow-lg">
            Tindo
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-semibold">
            Delicious Indian Food Delivered to Your Door
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto">
            Experience authentic flavors from the best restaurants in town
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated ? (
              <Link
                to="/restaurants"
                className="bg-white text-tindo-orange px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Order Now
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white text-tindo-orange px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-tindo-red text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-red-700 transition-colors shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
            <div className="text-4xl mb-4">🍛</div>
            <h3 className="text-xl font-bold mb-2">Fresh Food</h3>
            <p>Prepared with love and authentic ingredients</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
            <p>Get your food delivered in 30 minutes or less</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-white text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">Best Restaurants</h3>
            <p>Curated selection of top-rated restaurants</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;



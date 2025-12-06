import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const OrderTracking = () => {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTracking();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchTracking, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchTracking = async () => {
    try {
      const response = await orderAPI.getTracking(id);
      setTracking(response.data);
      setError('');
    } catch (err) {
      if (!tracking) {
        setError('Failed to load order tracking. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { key: 'Pending', label: 'Order Placed', icon: '📝' },
    { key: 'Confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'Preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'Ready', label: 'Ready', icon: '🍽️' },
    { key: 'Picked Up', label: 'Picked Up', icon: '🚴' },
    { key: 'Delivered', label: 'Delivered', icon: '🎉' },
  ];

  const getCurrentStepIndex = () => {
    if (!tracking?.status) return 0;
    return statusSteps.findIndex((step) => step.key === tracking.status);
  };

  if (loading && !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-tindo-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order tracking...</p>
        </div>
      </div>
    );
  }

  if (error && !tracking) {
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

  const currentStep = getCurrentStepIndex();

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
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Tracking</h1>
            {tracking?.order_id && (
              <p className="text-gray-600">Order ID: {tracking.order_id}</p>
            )}
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
            <div className="relative">
              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                const isLast = index === statusSteps.length - 1;

                return (
                  <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 ${
                          isCompleted
                            ? 'bg-tindo-orange text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {step.icon}
                      </div>
                      {!isLast && (
                        <div
                          className={`absolute top-12 left-6 w-0.5 h-full ${
                            isCompleted ? 'bg-tindo-orange' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <h3
                        className={`font-semibold text-lg ${
                          isCompleted ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </h3>
                      {isCurrent && tracking?.status && (
                        <p className="text-sm text-gray-600 mt-1">
                          Current status: {tracking.status}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details */}
          {tracking && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Details</h2>
              <div className="space-y-2 text-gray-600">
                {tracking.delivery_address && (
                  <p>
                    <span className="font-semibold">Delivery Address:</span>{' '}
                    {tracking.delivery_address}
                  </p>
                )}
                {tracking.estimated_delivery && (
                  <p>
                    <span className="font-semibold">Estimated Delivery:</span>{' '}
                    {tracking.estimated_delivery}
                  </p>
                )}
                {tracking.payment_type && (
                  <p>
                    <span className="font-semibold">Payment:</span>{' '}
                    {tracking.payment_type.toUpperCase()}
                  </p>
                )}
                {tracking.total && (
                  <p>
                    <span className="font-semibold">Total:</span> ₹{tracking.total.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/restaurants"
              className="bg-tindo-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-block"
            >
              Order More Food
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;


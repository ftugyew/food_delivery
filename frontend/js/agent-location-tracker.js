/**
 * Agent Location Tracker Service
 * Continuously tracks agent GPS location during delivery
 * Updates location to backend every 5-10 seconds
 */

class AgentLocationTracker {
  constructor(apiBaseUrl = 'https://food-delivery-backend-cw3m.onrender.com/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.isTracking = false;
    this.updateInterval = 7000; // 7 seconds
    this.intervalId = null;
    this.agentId = null;
    this.orderId = null;
    this.currentLocation = null;
  }

  /**
   * Start tracking agent location
   * @param {number} agentId - Agent ID
   * @param {number} orderId - Current order ID
   * @param {number} interval - Update interval in milliseconds (default 7000ms)
   */
  startTracking(agentId, orderId, interval = 7000) {
    if (this.isTracking) {
      console.warn('⚠️  Location tracking already active');
      return;
    }

    this.agentId = agentId;
    this.orderId = orderId;
    this.updateInterval = interval;
    this.isTracking = true;

    console.log(`🚗 Starting location tracking for agent ${agentId}, order ${orderId}`);

    // Get initial location immediately
    this.updateLocation();

    // Set up periodic updates
    this.intervalId = setInterval(() => this.updateLocation(), this.updateInterval);
  }

  /**
   * Stop tracking agent location
   */
  stopTracking() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    console.log('🛑 Location tracking stopped');
  }

  /**
   * Update location - get GPS and send to backend
   */
  updateLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        
        this.currentLocation = {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: new Date()
        };

        this.sendLocationToBackend(latitude, longitude, accuracy, speed, heading);
      },
      (error) => {
        console.error('❌ Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Send location to backend API
   */
  async sendLocationToBackend(latitude, longitude, accuracy, speed, heading) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token) {
        console.error('❌ No auth token found');
        this.stopTracking();
        return;
      }

      const response = await fetch(`${this.apiBaseUrl}/tracking/agent-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agent_id: this.agentId,
          order_id: this.orderId,
          latitude,
          longitude,
          accuracy: Math.round(accuracy * 100) / 100,
          speed: speed ? Math.round(speed * 100) / 100 : null,
          heading: heading ? Math.round(heading * 100) / 100 : null
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Authentication failed - token expired');
          this.stopTracking();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(`📍 Location updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (accuracy: ${accuracy.toFixed(0)}m)`);
    } catch (error) {
      console.error('❌ Failed to send location to backend:', error);
    }
  }

  /**
   * Get current location without sending to backend
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed, heading } = position.coords;
          resolve({ latitude, longitude, accuracy, speed, heading });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Get last known location
   */
  getLastLocation() {
    return this.currentLocation;
  }

  /**
   * Check if currently tracking
   */
  isActive() {
    return this.isTracking;
  }

  /**
   * Update order ID (useful when agent moves to next order)
   */
  updateOrderId(newOrderId) {
    this.orderId = newOrderId;
    console.log(`📋 Order updated to ${newOrderId}`);
  }
}

// Create global instance
window.agentLocationTracker = new AgentLocationTracker();

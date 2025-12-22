/**
 * Location Utility - Browser Geolocation API Wrapper
 * Provides helper functions for capturing and storing user location
 */

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
  }

  /**
   * Request user permission and get current location once
   * Returns Promise<{latitude, longitude, accuracy}>
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      // Request high-accuracy location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
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
   * Start continuous location tracking
   * Calls callback function with location updates every interval (default 5 seconds)
   */
  startTracking(callback, interval = 5000) {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported');
      return;
    }

    // Get initial location
    this.getLocation()
      .then(location => callback(location))
      .catch(err => console.error('Initial location error:', err));

    // Watch position at regular intervals
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: new Date()
        };
        callback(this.currentLocation);
      },
      (error) => {
        console.error('Tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: interval / 2
      }
    );
  }

  /**
   * Stop continuous location tracking
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known location
   */
  getLastLocation() {
    return this.currentLocation;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Estimate ETA based on distance and average delivery speed
   * Returns minutes
   */
  static estimateETA(distanceKm, averageSpeedKmh = 30) {
    return Math.ceil((distanceKm / averageSpeedKmh) * 60);
  }

  /**
   * Store location in localStorage
   */
  saveToStorage() {
    if (this.currentLocation) {
      localStorage.setItem('userLocation', JSON.stringify(this.currentLocation));
    }
  }

  /**
   * Retrieve stored location from localStorage
   */
  static getFromStorage() {
    const stored = localStorage.getItem('userLocation');
    return stored ? JSON.parse(stored) : null;
  }
}

// Create global instance
window.locationService = new LocationService();

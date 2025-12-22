/**
 * ========================================
 * DELIVERY AGENT GPS TRACKING SYSTEM
 * ========================================
 * Real-time location tracking for delivery agents
 * Updates location every 5-10 seconds via Socket.IO
 * 
 * USAGE: Initialize on delivery dashboard
 * const tracker = new AgentLocationTracker(agentId, orderId, token);
 * tracker.start();
 */

class AgentLocationTracker {
    constructor(agentId, orderId, token, socketUrl = 'http://localhost:5000') {
        this.agentId = agentId;
        this.orderId = orderId;
        this.token = token;
        this.socketUrl = socketUrl;
        this.socket = null;
        this.watchId = null;
        this.updateInterval = 5000; // 5 seconds
        this.isTracking = false;
        this.lastLocation = null;
    }

    /**
     * Initialize Socket.IO connection
     */
    initSocket() {
        this.socket = io(this.socketUrl, {
            auth: {
                token: this.token
            },
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Agent connected to tracking server');
            this.socket.emit('agent:register', {
                agentId: this.agentId,
                orderId: this.orderId
            });
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from tracking server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        this.socket.on('location:update:success', (data) => {
            console.log('✅ Location update confirmed:', data);
        });

        this.socket.on('location:update:error', (error) => {
            console.error('❌ Location update failed:', error);
        });
    }

    /**
     * Start GPS tracking
     */
    start() {
        if (this.isTracking) {
            console.warn('⚠️ Tracking already started');
            return;
        }

        console.log('📍 Starting agent location tracking...');
        this.isTracking = true;

        // Initialize socket connection
        this.initSocket();

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.error('❌ Geolocation not supported');
            this.showError('Your device does not support location tracking');
            return;
        }

        // Start watching position
        this.watchId = navigator.geolocation.watchPosition(
            (position) => this.handleLocationUpdate(position),
            (error) => this.handleLocationError(error),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Also update on interval (backup)
        this.intervalId = setInterval(() => {
            this.getCurrentLocationAndSend();
        }, this.updateInterval);

        this.showTrackingStatus(true);
    }

    /**
     * Stop GPS tracking
     */
    stop() {
        console.log('🛑 Stopping agent location tracking...');
        this.isTracking = false;

        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        if (this.socket) {
            this.socket.emit('agent:unregister', {
                agentId: this.agentId,
                orderId: this.orderId
            });
            this.socket.disconnect();
            this.socket = null;
        }

        this.showTrackingStatus(false);
    }

    /**
     * Handle location update from GPS
     */
    handleLocationUpdate(position) {
        const locationData = {
            agentId: this.agentId,
            orderId: this.orderId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            timestamp: new Date().toISOString()
        };

        // Check if location changed significantly
        if (this.hasLocationChanged(locationData)) {
            this.sendLocationUpdate(locationData);
            this.lastLocation = locationData;
        }
    }

    /**
     * Check if location changed significantly (more than 5 meters)
     */
    hasLocationChanged(newLocation) {
        if (!this.lastLocation) return true;

        const distance = this.calculateDistance(
            this.lastLocation.latitude,
            this.lastLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
        );

        return distance > 5; // 5 meters threshold
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Get current location and send update
     */
    getCurrentLocationAndSend() {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => this.handleLocationUpdate(position),
            (error) => console.error('Location error:', error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }

    /**
     * Send location update via Socket.IO
     */
    sendLocationUpdate(locationData) {
        if (!this.socket || !this.socket.connected) {
            console.warn('⚠️ Socket not connected, queuing update');
            return;
        }

        console.log('📤 Sending location update:', locationData);

        // Emit via socket for real-time updates
        this.socket.emit('agent:location:update', locationData);

        // Also send to REST API as backup
        this.sendLocationToAPI(locationData);

        // Update UI
        this.updateLocationDisplay(locationData);
    }

    /**
     * Send location to REST API (backup)
     */
    async sendLocationToAPI(locationData) {
        try {
            const response = await fetch('http://localhost:5000/api/tracking/agent-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(locationData)
            });

            if (!response.ok) {
                console.error('❌ Failed to save location to API');
            }
        } catch (error) {
            console.error('❌ API location update error:', error);
        }
    }

    /**
     * Handle location error
     */
    handleLocationError(error) {
        let errorMessage = 'Location error';

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = 'Location permission denied. Please enable location access.';
                this.stop();
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location unavailable';
                break;
            case error.TIMEOUT:
                errorMessage = 'Location request timeout';
                break;
        }

        console.error('❌', errorMessage);
        this.showError(errorMessage);
    }

    /**
     * Update location display in UI
     */
    updateLocationDisplay(locationData) {
        const displayEl = document.getElementById('location-display');
        if (displayEl) {
            displayEl.innerHTML = `
                <div style="padding: 10px; background: #e8f5e9; border-radius: 8px;">
                    <div><strong>📍 Tracking Active</strong></div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        Lat: ${locationData.latitude.toFixed(6)}<br>
                        Lng: ${locationData.longitude.toFixed(6)}<br>
                        Accuracy: ${Math.round(locationData.accuracy)}m<br>
                        Speed: ${Math.round(locationData.speed * 3.6)} km/h
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show tracking status
     */
    showTrackingStatus(isActive) {
        const statusEl = document.getElementById('tracking-status');
        if (statusEl) {
            statusEl.innerHTML = isActive 
                ? '<span style="color: #4caf50;">🟢 Tracking Active</span>'
                : '<span style="color: #f44336;">🔴 Tracking Stopped</span>';
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorEl = document.getElementById('tracking-error');
        if (errorEl) {
            errorEl.innerHTML = `<div style="color: #f44336; padding: 10px;">${message}</div>`;
        } else {
            alert(message);
        }
    }
}

/**
 * Initialize agent tracking on page load
 */
function initializeAgentTracking() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    if (user.role !== 'delivery_agent' && user.role !== 'delivery') {
        console.log('⚠️ Not a delivery agent, skipping tracking initialization');
        return;
    }

    // Wait for user to start delivery
    window.startDeliveryTracking = function(orderId) {
        const agentId = user.agentId || user.id;
        window.agentTracker = new AgentLocationTracker(agentId, orderId, token);
        window.agentTracker.start();
    };

    window.stopDeliveryTracking = function() {
        if (window.agentTracker) {
            window.agentTracker.stop();
            window.agentTracker = null;
        }
    };
}

// Auto-initialize if on delivery dashboard
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAgentTracking);
} else {
    initializeAgentTracking();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgentLocationTracker };
}

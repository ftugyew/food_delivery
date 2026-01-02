/**
 * ========================================
 * USER LOCATION CAPTURE MODULE
 * ========================================
 * Captures user location after successful login
 * Stores location in database for order delivery
 * 
 * USAGE: Call after login success
 * captureUserLocation(userId, token);
 */

const USER_LOCATION_API = 'https://food-delivery-backend-cw3m.onrender.com/api/auth/update-location';

/**
 * Request location permission and capture coordinates
 */
async function captureUserLocation(userId, token) {
    console.log('📍 Requesting user location...');

    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            const error = 'Geolocation is not supported by your browser';
            console.error('❌', error);
            reject(new Error(error));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const locationData = {
                    userId: userId,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };

                console.log('✅ Location captured:', locationData);

                try {
                    // Save location to database
                    const response = await fetch(USER_LOCATION_API, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(locationData)
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Location saved to database');
                        
                        // Store in localStorage for quick access
                        localStorage.setItem('userLocation', JSON.stringify({
                            lat: locationData.latitude,
                            lng: locationData.longitude,
                            timestamp: new Date().toISOString()
                        }));

                        resolve(locationData);
                    } else {
                        const error = await response.json();
                        console.error('❌ Failed to save location:', error);
                        reject(new Error(error.error || 'Failed to save location'));
                    }
                } catch (error) {
                    console.error('❌ Network error:', error);
                    reject(error);
                }
            },
            (error) => {
                let errorMessage = 'Unable to retrieve your location';
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access to place orders.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out.';
                        break;
                }

                console.error('❌ Location error:', errorMessage);
                reject(new Error(errorMessage));
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
 * Get stored user location from localStorage
 */
function getStoredUserLocation() {
    const locationStr = localStorage.getItem('userLocation');
    return locationStr ? JSON.parse(locationStr) : null;
}

/**
 * Watch user location in real-time (for future features)
 */
function watchUserLocation(callback) {
    if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        return null;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const locationData = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
            };
            callback(locationData);
        },
        (error) => {
            console.error('❌ Watch location error:', error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );

    return watchId;
}

/**
 * Stop watching location
 */
function stopWatchingLocation(watchId) {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log('✅ Stopped watching location');
    }
}

/**
 * Show location permission modal
 */
function showLocationPermissionModal() {
    const modal = document.createElement('div');
    modal.id = 'location-permission-modal';
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            ">
                <div style="font-size: 48px; margin-bottom: 20px;">📍</div>
                <h2 style="margin: 0 0 15px 0; color: #333;">Enable Location Access</h2>
                <p style="color: #666; margin-bottom: 25px;">
                    We need your location to show nearby restaurants and deliver food to your address.
                </p>
                <button id="allow-location-btn" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    width: 100%;
                    margin-bottom: 10px;
                ">
                    Allow Location Access
                </button>
                <button id="deny-location-btn" style="
                    background: transparent;
                    color: #666;
                    border: none;
                    padding: 10px;
                    cursor: pointer;
                    font-size: 14px;
                ">
                    Not now
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    return new Promise((resolve, reject) => {
        document.getElementById('allow-location-btn').onclick = () => {
            modal.remove();
            resolve(true);
        };

        document.getElementById('deny-location-btn').onclick = () => {
            modal.remove();
            resolve(false);
        };
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        captureUserLocation,
        getStoredUserLocation,
        watchUserLocation,
        stopWatchingLocation,
        showLocationPermissionModal
    };
}

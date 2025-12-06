/**
 * Socket.IO Client - Tindo
 * Manages real-time order updates, location tracking, and notifications
 */

const BACKEND_URL = "https://food-delivery-backend-cw3m.onrender.com";

// Initialize socket connection
const socket = io(BACKEND_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

// ===== CONNECTION EVENTS =====
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error);
});

// ===== ORDER EVENTS =====
// Listen for new orders (for restaurants)
socket.on("newOrder", (order) => {
  console.log("📦 New order received:", order);
  // Trigger callback if handler is registered
  if (window.onNewOrder && typeof window.onNewOrder === "function") {
    window.onNewOrder(order);
  }
});

// Listen for order updates for specific restaurant
socket.on(`orderForRestaurant_${getCurrentRestaurantId()}`, (order) => {
  console.log("🏪 Restaurant order update:", order);
  if (window.onRestaurantOrderUpdate && typeof window.onRestaurantOrderUpdate === "function") {
    window.onRestaurantOrderUpdate(order);
  }
});

// Listen for order updates for specific delivery agent
socket.on(`orderForAgent_${getCurrentAgentId()}`, (order) => {
  console.log("🚗 Delivery agent order update:", order);
  if (window.onAgentOrderUpdate && typeof window.onAgentOrderUpdate === "function") {
    window.onAgentOrderUpdate(order);
  }
});

// Listen for delivery tracking updates
socket.on(`trackOrder_${getCurrentOrderId()}`, (location) => {
  console.log("📍 Order location update:", location);
  if (window.onOrderLocationUpdate && typeof window.onOrderLocationUpdate === "function") {
    window.onOrderLocationUpdate(location);
  }
});

// Listen for general order updates
socket.on("orderUpdate", (data) => {
  console.log("🔄 Order update:", data);
  if (window.onGeneralOrderUpdate && typeof window.onGeneralOrderUpdate === "function") {
    window.onGeneralOrderUpdate(data);
  }
});

// ===== LOCATION EVENTS =====
// Listen for agent location updates
socket.on("locationUpdate", (data) => {
  console.log("📍 Agent location update:", data);
  if (window.onAgentLocationUpdate && typeof window.onAgentLocationUpdate === "function") {
    window.onAgentLocationUpdate(data);
  }
});

socket.on("agentLocation", (data) => {
  console.log("🗺️ Agent location:", data);
  if (window.onAgentLocationEvent && typeof window.onAgentLocationEvent === "function") {
    window.onAgentLocationEvent(data);
  }
});

// ===== AVAILABILITY EVENTS =====
socket.on("agentAvailability", (data) => {
  console.log("🟢 Agent availability:", data);
  if (window.onAgentAvailability && typeof window.onAgentAvailability === "function") {
    window.onAgentAvailability(data);
  }
});

// ===== HELPER FUNCTIONS =====

// Get current user info from localStorage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || {};
  } catch {
    return {};
  }
}

// Get current restaurant ID
function getCurrentRestaurantId() {
  const user = getCurrentUser();
  return user.restaurant_id || null;
}

// Get current agent ID (delivery agent)
function getCurrentAgentId() {
  const user = getCurrentUser();
  return user.id && user.role === "delivery" ? user.id : null;
}

// Get current order ID from URL or localStorage
function getCurrentOrderId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("orderId") || localStorage.getItem("currentOrderId");
}

// ===== EMIT EVENTS =====

/**
 * Send agent location update
 * @param {number} agentId - Agent ID
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function sendAgentLocation(agentId, lat, lng) {
  socket.emit("agentLocation", { agentId, lat, lng });
  console.log("📤 Sent agent location:", { agentId, lat, lng });
}

/**
 * Register callback for new orders (restaurant)
 * @param {function} callback - Callback function(order)
 */
function onNewOrderReceived(callback) {
  window.onNewOrder = callback;
}

/**
 * Register callback for restaurant order updates
 * @param {function} callback - Callback function(order)
 */
function onRestaurantOrderUpdated(callback) {
  window.onRestaurantOrderUpdate = callback;
}

/**
 * Register callback for agent order updates
 * @param {function} callback - Callback function(order)
 */
function onAgentOrderUpdated(callback) {
  window.onAgentOrderUpdate = callback;
}

/**
 * Register callback for order location updates
 * @param {function} callback - Callback function(location)
 */
function onOrderLocationUpdated(callback) {
  window.onOrderLocationUpdate = callback;
}

/**
 * Register callback for agent location updates
 * @param {function} callback - Callback function(location)
 */
function onAgentLocationUpdated(callback) {
  window.onAgentLocationUpdate = callback;
}

// Expose functions globally
if (typeof window !== "undefined") {
  window.socket = socket;
  window.sendAgentLocation = sendAgentLocation;
  window.onNewOrderReceived = onNewOrderReceived;
  window.onRestaurantOrderUpdated = onRestaurantOrderUpdated;
  window.onAgentOrderUpdated = onAgentOrderUpdated;
  window.onOrderLocationUpdated = onOrderLocationUpdated;
  window.onAgentLocationUpdated = onAgentLocationUpdated;
}

export {
  socket,
  sendAgentLocation,
  onNewOrderReceived,
  onRestaurantOrderUpdated,
  onAgentOrderUpdated,
  onOrderLocationUpdated,
  onAgentLocationUpdated
};

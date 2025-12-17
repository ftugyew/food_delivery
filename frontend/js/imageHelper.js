// js/imageHelper.js - Centralized image URL handling

const IMAGE_BASE_URL = "https://food-delivery-backend-cw3m.onrender.com";
const PLACEHOLDER_IMAGE = "assets/png.jpg";

/**
 * Build menu image URL
 * @param {string|null} imageUrl - Filename or full URL from API
 * @param {string|null} imageUrlFull - Full URL from API (preferred)
 * @returns {string} Complete image URL or placeholder
 */
function getMenuImageUrl(imageUrl, imageUrlFull) {
  // Priority 1: Use full URL if provided
  if (imageUrlFull) return imageUrlFull;
  
  // Priority 2: Check if imageUrl is already a full URL
  if (imageUrl && String(imageUrl).startsWith('http')) return imageUrl;
  
  // Priority 3: Build URL from filename
  if (imageUrl) {
    // Ensure menu/ prefix
    const filename = String(imageUrl).includes('menu/') 
      ? imageUrl 
      : `menu/${imageUrl}`;
    return `${IMAGE_BASE_URL}/uploads/${filename}`;
  }
  
  // Fallback: placeholder
  return PLACEHOLDER_IMAGE;
}

/**
 * Build restaurant image URL
 * @param {string|null} imageUrl - Filename or full URL from API
 * @param {string|null} imageUrlFull - Full URL from API (preferred)
 * @returns {string} Complete image URL or placeholder
 */
function getRestaurantImageUrl(imageUrl, imageUrlFull) {
  // Priority 1: Use full URL if provided
  if (imageUrlFull) return imageUrlFull;
  
  // Priority 2: Check if imageUrl is already a full URL
  if (imageUrl && String(imageUrl).startsWith('http')) return imageUrl;
  
  // Priority 3: Build URL from filename
  if (imageUrl) {
    // Ensure restaurants/ prefix
    const filename = String(imageUrl).includes('restaurants/') 
      ? imageUrl 
      : `restaurants/${imageUrl}`;
    return `${IMAGE_BASE_URL}/uploads/${filename}`;
  }
  
  // Fallback: placeholder
  return PLACEHOLDER_IMAGE;
}

/**
 * Add onerror handler to img element
 * @param {HTMLImageElement} imgElement 
 */
function addImageErrorHandler(imgElement) {
  if (!imgElement) return;
  imgElement.onerror = function() {
    this.onerror = null; // Prevent infinite loop
    this.src = PLACEHOLDER_IMAGE;
  };
}

/**
 * Normalize API response (handles multiple formats)
 * @param {Object} response - API response
 * @returns {Object} { restaurant, items }
 */
function normalizeMenuResponse(response) {
  // Case 1: { success: true, data: { restaurant, items } }
  if (response && response.success && response.data) {
    return {
      restaurant: response.data.restaurant || null,
      items: response.data.items || response.data.menu || []
    };
  }
  
  // Case 2: { data: { restaurant, items } }
  if (response && response.data) {
    return {
      restaurant: response.data.restaurant || null,
      items: response.data.items || response.data.menu || []
    };
  }
  
  // Case 3: { restaurant, items }
  if (response && (response.restaurant || response.items)) {
    return {
      restaurant: response.restaurant || null,
      items: response.items || response.menu || []
    };
  }
  
  // Case 4: Array of items only
  if (Array.isArray(response)) {
    return {
      restaurant: null,
      items: response
    };
  }
  
  // Fallback
  return {
    restaurant: null,
    items: []
  };
}

// js/imageHelper.js - Centralized image URL handling

// REMOVED: const IMAGE_BASE_URL - Images should use direct URLs from database only
const PLACEHOLDER_IMAGE = "assets/png.jpg";

/**
 * Normalize image URL to HTTPS to prevent mixed content warnings
 * Converts http:// to https:// when running on HTTPS
 * IMPORTANT: This function does NOT construct URLs. It only normalizes existing full URLs.
 * @param {string} url - Full URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeImageUrl(url) {
  if (!url) return null;
  // If page is HTTPS and URL is HTTP, convert to HTTPS to prevent mixed content warnings
  if (window.location.protocol === 'https:' && String(url).startsWith('http://')) {
    return String(url).replace(/^http:\/\//i, 'https://');
  }
  return url;
}

/**
 * Build menu image URL
 * @param {string|null} imageUrl - Filename or full URL from API
 * @param {string|null} imageUrlFull - Full URL from API (preferred)
 * @returns {string} Complete image URL or placeholder
 */
function getMenuImageUrl(imageUrl, imageUrlFull) {
  // Priority 1: Use full URL if provided
  if (imageUrlFull) return normalizeImageUrl(imageUrlFull);
  
  // Priority 2: Check if imageUrl is already a full URL (direct from database)
  if (imageUrl && String(imageUrl).startsWith('http')) return normalizeImageUrl(imageUrl);
  
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
  if (imageUrlFull) return normalizeImageUrl(imageUrlFull);
  
  // Priority 2: Check if imageUrl is already a full URL (direct from database)
  if (imageUrl && String(imageUrl).startsWith('http')) return normalizeImageUrl(imageUrl);
  
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

export const API_BASE_URL = "https://food-delivery-backend-cw3m.onrender.com/api";

// Expose on window for non-module scripts
if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
}


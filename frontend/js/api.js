export const API_BASE_URL = "https://food-delivery-tidq.onrender.com";

// Expose on window for non-module scripts
if (typeof window !== "undefined") {
  window.API_BASE_URL = API_BASE_URL;
}

// Simple /ping test for debugging
try {
  fetch(`${API_BASE_URL}/ping`)
    .then((res) => res.json())
    .then((data) => {
      console.log("[Tindo API /ping]", data);
    })
    .catch((err) => {
      console.warn("[Tindo API /ping] failed", err);
    });
} catch (err) {
  console.warn("[Tindo API /ping] fetch not available", err);
}



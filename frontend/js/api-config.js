/**
 * Shared API base for all frontend pages.
 * Production (Vercel): https://food-delivery-backend-cw3m.onrender.com
 * Local Express (:5000 / onrender): same-origin
 * Local Live Server / file://: localhost:5000
 */
(function () {
  var RENDER_API = "https://food-delivery-backend-cw3m.onrender.com";

  function resolveApiBase() {
    if (typeof window.API_BASE_URL === "string" && window.API_BASE_URL.trim()) {
      return window.API_BASE_URL.replace(/\/api\/?$/, "");
    }

    var hostname = window.location.hostname || "";
    var port = window.location.port || "";
    var protocol = window.location.protocol || "";

    // Vercel / Netlify frontend → always use Render backend
    if (
      /vercel\.app$/i.test(hostname) ||
      /netlify\.app$/i.test(hostname) ||
      hostname === "food-ameerpet.vercel.app"
    ) {
      return RENDER_API;
    }

    // Backend serving the frontend (Render or local Express on 5000)
    if (hostname.includes("onrender.com") || port === "5000") {
      return "";
    }

    // file:// or local static hosts
    if (protocol === "file:" || hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }

    // Default production API
    return RENDER_API;
  }

  window.TINDO_API_BASE = resolveApiBase();
  window.SERVER = window.TINDO_API_BASE || window.location.origin;
  window.API_BASE_URL = window.TINDO_API_BASE + "/api";
})();

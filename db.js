// Root db wrapper: delegate to backend/db.js for a single canonical DB instance
// This file exists so older code that does `require('./db')` continues to work.
try {
  module.exports = require('./backend/db');
} catch (e) {
  // Fallback to api config pool if backend/db not present
  try {
    module.exports = require('./api/config/db');
  } catch (e2) {
    // If both fail, throw a helpful error during startup
    throw new Error('Missing database configuration: expected backend/db.js or api/config/db.js');
  }
}

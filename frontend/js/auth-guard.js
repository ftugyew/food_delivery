/**
 * ========================================
 * FRONTEND AUTHENTICATION GUARD
 * ========================================
 * Production-grade client-side auth protection
 * Prevents unauthorized access to protected pages
 * 
 * USAGE: Add to ALL protected HTML pages:
 * <script src="js/auth-guard.js"></script>
 */

(function() {
    'use strict';

    const API_BASE_URL = 'https://food-delivery-backend-cw3m.onrender.com/api';

    // ===== PUBLIC PAGES (NO AUTH REQUIRED) =====
    const PUBLIC_PAGES = [
        '/login.html',
        '/register.html',
        '/index.html',
        '/splash.html',
        '/'
    ];

    // ===== ROLE-BASED ACCESS CONTROL =====
    const PAGE_ROLES = {
        '/admin-dashboard.html': ['admin'],
        '/delivery-dashboard.html': ['delivery_agent', 'delivery'],
        '/delivery-dashboard-live.html': ['delivery_agent', 'delivery'],
        '/delivery-admin.html': ['delivery_agent', 'delivery'],
        '/restaurant-dashboard.html': ['restaurant'],
        '/restaurants.html': ['customer', 'admin'],
        '/restaurant.html': ['customer', 'admin'],
        '/cart.html': ['customer', 'admin'],
        '/order-success.html': ['customer', 'admin'],
        '/order-tracking.html': ['customer', 'admin'],
        '/tracking-live.html': ['customer', 'admin'],
        '/user-address.html': ['customer', 'admin']
    };

    /**
     * Get current page path
     */
    function getCurrentPage() {
        return window.location.pathname;
    }

    /**
     * Check if current page is public
     */
    function isPublicPage(page) {
        return PUBLIC_PAGES.some(publicPage => {
            return page === publicPage || page.endsWith(publicPage);
        });
    }

    /**
     * Get JWT token from localStorage
     */
    function getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Get user data from localStorage
     */
    function getUserData() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Decode JWT token (without verification)
     */
    function decodeToken(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    function isTokenExpired(token) {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }

    /**
     * Verify token with backend
     */
    async function verifyTokenWithBackend(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.valid === true;
            }
            return false;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    /**
     * Check if user has required role for current page
     */
    function checkPageAccess(userRole, currentPage) {
        const requiredRoles = PAGE_ROLES[currentPage];
        
        // If no role restriction, allow access
        if (!requiredRoles) return true;
        
        // Check if user's role is in the allowed roles
        return requiredRoles.includes(userRole);
    }

    /**
     * Clear authentication data
     */
    function clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
    }

    /**
     * Redirect to login page
     */
    function redirectToLogin(reason = '') {
        clearAuth();
        const loginUrl = '/login.html';
        const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `${loginUrl}?redirect=${redirectUrl}&reason=${reason}`;
    }

    /**
     * Show access denied message
     */
    function showAccessDenied() {
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    padding: 40px;
                    border-radius: 20px;
                    backdrop-filter: blur(10px);
                    max-width: 500px;
                ">
                    <h1 style="font-size: 72px; margin: 0;">🚫</h1>
                    <h2 style="margin: 20px 0;">Access Denied</h2>
                    <p style="margin: 20px 0; opacity: 0.9;">
                        You don't have permission to access this page.
                    </p>
                    <button onclick="window.location.href='/login.html'" style="
                        background: white;
                        color: #667eea;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 20px;
                    ">
                        Go to Login
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Main authentication check
     */
    async function checkAuth() {
        const currentPage = getCurrentPage();

        // Allow access to public pages
        if (isPublicPage(currentPage)) {
            console.log('✅ Public page - access granted');
            return;
        }

        // Check if token exists
        const token = getToken();
        if (!token) {
            console.log('❌ No token found - redirecting to login');
            redirectToLogin('no_token');
            return;
        }

        // Check if token is expired
        if (isTokenExpired(token)) {
            console.log('❌ Token expired - redirecting to login');
            redirectToLogin('token_expired');
            return;
        }

        // Check role-based access
        const userData = getUserData();
        if (!userData || !userData.role) {
            console.log('❌ No user data found - redirecting to login');
            redirectToLogin('no_user_data');
            return;
        }

        if (!checkPageAccess(userData.role, currentPage)) {
            console.log('❌ Insufficient permissions - access denied');
            showAccessDenied();
            return;
        }

        console.log('✅ Authentication passed - access granted');
    }

    /**
     * Add Authorization header to all fetch requests
     */
    function setupAuthHeaders() {
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            const token = getToken();
            if (token) {
                options.headers = options.headers || {};
                if (typeof options.headers === 'object' && !(options.headers instanceof Headers)) {
                    options.headers['Authorization'] = `Bearer ${token}`;
                } else if (options.headers instanceof Headers) {
                    options.headers.set('Authorization', `Bearer ${token}`);
                }
            }
            return originalFetch.apply(this, [url, options]);
        };
    }

    /**
     * Initialize auth guard
     */
    function init() {
        // Check authentication immediately
        checkAuth();

        // Setup automatic auth headers
        setupAuthHeaders();

        // Re-check auth on page visibility change
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                checkAuth();
            }
        });

        // Expose auth utilities globally
        window.AuthGuard = {
            getToken,
            getUserData,
            clearAuth,
            redirectToLogin,
            isAuthenticated: () => !!getToken() && !isTokenExpired(getToken())
        };
    }


    // Initialize immediately
    init();

})();

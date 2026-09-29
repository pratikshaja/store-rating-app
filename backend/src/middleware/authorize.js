// src/middleware/authorize.js
// ---------------------------------------------------------------
// Role-Based Access Control (RBAC) Middleware
//
// This middleware runs AFTER authenticate.js.
// It checks that the logged-in user's role matches one of the
// allowed roles for the route.
//
// Usage in a route:
//   const authorize = require('./authorize');
//
//   // Only admins can access this:
//   router.get('/dashboard', authenticate, authorize('ADMIN'), handler);
//
//   // Admins and store owners can access this:
//   router.get('/report', authenticate, authorize('ADMIN', 'STORE_OWNER'), handler);
// ---------------------------------------------------------------

const authorize = (...allowedRoles) => {
  // We return a middleware function
  return (req, res, next) => {
    // req.user is set by the authenticate middleware
    // If somehow authorize is used without authenticate, catch it
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}.`,
      });
    }

    // Role is allowed — continue to the route handler
    next();
  };
};

module.exports = authorize;

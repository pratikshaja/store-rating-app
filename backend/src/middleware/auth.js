// src/middleware/auth.js
// ---------------------------------------------------------------
// JWT Authentication Middleware
//
// This middleware runs BEFORE any protected route handler.
// It checks that the request has a valid JWT token in the
// Authorization header, decodes it, and attaches the user's
// data to req.user so controllers can use it.
//
// Usage in a route:
//   router.get('/profile', authenticate, controller.getProfile);
// ---------------------------------------------------------------

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  // 1. Read the Authorization header
  //    It should look like:  "Bearer eyJhbGci..."
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  // 2. Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using our secret key
    //    jwt.verify() throws an error if the token is expired or tampered with
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded payload to req.user
    //    The payload contains: { id, email, role }
    req.user = decoded;

    // 5. Pass control to the next middleware / route handler
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = authenticate;

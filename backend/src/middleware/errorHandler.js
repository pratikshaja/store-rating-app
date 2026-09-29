// src/middleware/errorHandler.js
// ---------------------------------------------------------------
// Centralized Error Handler Middleware
//
// In Express, any middleware with 4 parameters (err, req, res, next)
// is treated as an ERROR HANDLER.
//
// How it works:
//   - When a controller calls next(error) or throws inside an
//     async wrapper, Express skips all normal middleware and
//     calls this handler instead.
//   - This gives us ONE place to format all error responses,
//     so we don't repeat error-handling code in every controller.
//
// Must be registered LAST in server.js (after all routes).
// ---------------------------------------------------------------

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  } else {
    console.error('🔴 Error:', err.message);
  }

  // Default status: 500 Internal Server Error
  const statusCode = err.statusCode || 500;

  // In production, don't leak internal error details for 500 errors
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message || 'Something went wrong.';

  res.status(statusCode).json({
    success: false,
    message,
    // Include a stack trace only in development for easier debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

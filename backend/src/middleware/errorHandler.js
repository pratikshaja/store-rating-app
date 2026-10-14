
const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  } else {
    console.error('🔴 Error:', err.message);
  }

  const statusCode = err.statusCode || 500;

  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message || 'Something went wrong.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;

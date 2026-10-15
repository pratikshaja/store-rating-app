
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } =
  require('sequelize');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';

  // Sequelize validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.errors.map((item) => item.message).join(', ');
  }

  // Duplicate email or another unique field
  if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'A record with this email or unique value already exists.';
  }

  // Invalid foreign key, such as a non-existing owner
  if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    message = 'The referenced record does not exist or cannot be used.';
  }

  // Hide internal error details in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'An internal server error occurred.';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;

// src/middleware/validate.js
// ---------------------------------------------------------------
// express-validator Result Runner Middleware
//
// express-validator works in two steps:
//   Step 1: You declare RULES (in validators/ files) — these
//           are chained on the route like middleware.
//   Step 2: You call validationResult() to READ those results.
//
// This middleware performs Step 2.
// It collects all validation errors and, if any exist, returns
// a 422 response immediately — the controller never runs.
//
// Usage in a route:
//   router.post('/register',
//     authValidators.register,  // Step 1: run rules
//     validate,                 // Step 2: check results (this file)
//     authController.register   // Only runs if validation passes
//   );
// ---------------------------------------------------------------

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into a clean array: [{ field, message }]
    const formattedErrors = errors.array().map((err) => ({
      field:   err.path,
      message: err.msg,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      errors:  formattedErrors,
    });
  }

  // No errors — pass to the next handler
  next();
};

module.exports = validate;

// src/routes/authRoutes.js
// ---------------------------------------------------------------
// Authentication Routes
//
// Public:
//   POST   /api/auth/register  — Create a normal USER account
//   POST   /api/auth/login     — Log in (any role), receive JWT
//
// Protected (require a valid JWT):
//   GET    /api/auth/me        — Get current user's profile
//   PATCH  /api/auth/password  — Change own password
// ---------------------------------------------------------------

const express        = require('express');
const authController = require('../controllers/authController');
const authenticate   = require('../middleware/auth');
const validate       = require('../middleware/validate');
const authValidators = require('../validators/authValidators');

const router = express.Router();

// Public routes
router.post('/register',
  authValidators.register,  // 1. Run validation rules
  validate,                 // 2. Check results — stop if any errors
  authController.register   // 3. Execute the controller
);

router.post('/login',
  authValidators.login,
  validate,
  authController.login
);

// Protected routes (authenticate runs first, verifies JWT)
router.get('/me',
  authenticate,
  authController.getMe
);

router.patch('/password',
  authenticate,
  authValidators.changePassword,
  validate,
  authController.changePassword
);

module.exports = router;

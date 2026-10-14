

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

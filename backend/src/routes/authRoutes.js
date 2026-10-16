

const express        = require('express');
const authController = require('../controllers/authController');
const authenticate   = require('../middleware/auth');
const validate       = require('../middleware/validate');
const authValidators = require('../validators/authValidators');

const router = express.Router();

// Public routes
router.post('/register',
  authValidators.register,  
  validate,                 
  authController.register   
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

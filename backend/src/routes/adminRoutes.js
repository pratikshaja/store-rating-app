// src/routes/adminRoutes.js
// ---------------------------------------------------------------
// Admin Routes — ALL require: authenticate + authorize('ADMIN')
//
// GET    /api/admin/dashboard     — Dashboard stats
// POST   /api/admin/users         — Create any user role
// GET    /api/admin/users         — List users (filter + sort)
// GET    /api/admin/users/:id     — Single user detail
// POST   /api/admin/stores        — Add a new store
// GET    /api/admin/stores        — List stores (filter + sort)
// ---------------------------------------------------------------

const express          = require('express');
const adminController  = require('../controllers/adminController');
const authenticate     = require('../middleware/auth');
const authorize        = require('../middleware/authorize');
const validate         = require('../middleware/validate');
const adminValidators  = require('../validators/adminValidators');

const router = express.Router();

// Apply authentication and admin role check to ALL routes in this file.
// Any request without a valid ADMIN token is rejected before
// reaching the controller.
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// User management
router.post('/users',
  adminValidators.createUser,
  validate,
  adminController.createUser
);
router.get('/users',    adminController.getUsers);
router.get('/users/:id', adminController.getUserById);

// Store management
router.post('/stores',
  adminValidators.createStore,
  validate,
  adminController.createStore
);
router.get('/stores', adminController.getStores);

module.exports = router;

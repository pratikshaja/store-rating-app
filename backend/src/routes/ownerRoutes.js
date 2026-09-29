// src/routes/ownerRoutes.js
// ---------------------------------------------------------------
// Store Owner Routes — ALL require: authenticate + authorize('STORE_OWNER')
//
// GET   /api/owner/dashboard  — Avg rating + stats for owned stores
// GET   /api/owner/ratings    — List of users who rated the owner's stores
// ---------------------------------------------------------------

const express          = require('express');
const ownerController  = require('../controllers/ownerController');
const authenticate     = require('../middleware/auth');
const authorize        = require('../middleware/authorize');

const router = express.Router();

// All owner routes require STORE_OWNER role
router.use(authenticate);
router.use(authorize('STORE_OWNER'));

router.get('/dashboard', ownerController.getDashboard);
router.get('/ratings',   ownerController.getRatings);

module.exports = router;



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


const express          = require('express');
const storeController  = require('../controllers/storeController');
const authenticate     = require('../middleware/auth');
const authorize        = require('../middleware/authorize');
const validate         = require('../middleware/validate');
const ratingValidators = require('../validators/ratingValidators');

const router = express.Router();

// All store routes require a valid JWT
router.use(authenticate);

// Any authenticated role can view stores
router.get('/',    storeController.getAllStores);
router.get('/:id', storeController.getStoreById);

// Only USERs can rate stores (not ADMINs or STORE_OWNERs)
router.put('/:id/rating',
  authorize('USER'),
  ratingValidators.submitRating,
  validate,
  storeController.rateStore
);

module.exports = router;

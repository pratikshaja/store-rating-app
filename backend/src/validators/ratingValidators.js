// src/validators/ratingValidators.js
// ---------------------------------------------------------------
// Validation rules for the rating endpoint.
// ---------------------------------------------------------------

const { body } = require('express-validator');

// ---------------------------------------------------------------
// SUBMIT / UPDATE RATING — PUT /api/stores/:id/rating
// ---------------------------------------------------------------
const submitRating = [
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
];

module.exports = { submitRating };

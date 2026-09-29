

const { body } = require('express-validator');


const submitRating = [
  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),
];

module.exports = { submitRating };

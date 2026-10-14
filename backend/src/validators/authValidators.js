
const { body } = require('express-validator');


const register = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20 }).withMessage('Name must be at least 20 characters.')
    .isLength({ max: 60 }).withMessage('Name must not exceed 60 characters.'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .isLength({ max: 16 }).withMessage('Password must not exceed 16 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character.'),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters.'),
];


const login = [
  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];


const changePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
    .isLength({ max: 16 }).withMessage('New password must not exceed 16 characters.')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter.')
    .matches(/[^a-zA-Z0-9]/).withMessage('New password must contain at least one special character.'),
];

module.exports = { register, login, changePassword };

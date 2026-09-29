// src/validators/adminValidators.js
// ---------------------------------------------------------------
// Validation rules for admin-only endpoints.
// ---------------------------------------------------------------

const { body } = require('express-validator');

// ---------------------------------------------------------------
// CREATE USER (admin creates any role) — POST /api/admin/users
// ---------------------------------------------------------------
const createUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 10 }).withMessage('Name must be at least 10 characters.')
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

  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['ADMIN', 'USER', 'STORE_OWNER'])
    .withMessage('Role must be one of: ADMIN, USER, STORE_OWNER.'),
];

// ---------------------------------------------------------------
// CREATE STORE — POST /api/admin/stores
// ---------------------------------------------------------------
const createStore = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 20 }).withMessage('Store name must be at least 20 characters.')
    .isLength({ max: 60 }).withMessage('Store name must not exceed 60 characters.'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid store email address.'),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ max: 400 }).withMessage('Store address must not exceed 400 characters.'),

  body('owner_id')
    .notEmpty().withMessage('Owner ID is required.')
    .isInt({ min: 1 }).withMessage('Owner ID must be a positive integer.'),
];

module.exports = { createUser, createStore };

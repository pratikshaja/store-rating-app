// src/controllers/adminController.js
// ---------------------------------------------------------------
// All admin-only API handlers:
//   - getDashboard : Total counts for users, stores, ratings
//   - createUser   : Admin creates user of ANY role
//   - getUsers     : List all users (filter + sort via query params)
//   - getUserById  : Single user detail
//   - createStore  : Admin adds a new store
//   - getStores    : List all stores (filter + sort)
//
// SECURITY:
//   - All routes that use this controller are protected by
//     authenticate + authorize('ADMIN') middleware in the router.
//   - SQL injection is prevented by parameterized queries (?).
//   - Sorting columns are validated against an ALLOWLIST so
//     a user cannot inject column names.
// ---------------------------------------------------------------

const bcrypt = require('bcrypt');
const pool   = require('../config/db');

const SALT_ROUNDS = 10;

// Allowlists prevent SQL injection in ORDER BY clauses
// (parameterized queries don't work for column names).
const USER_SORT_ALLOWLIST  = ['name', 'email', 'address', 'role', 'created_at'];
const STORE_SORT_ALLOWLIST = ['name', 'email', 'address', 'created_at'];

// ---------------------------------------------------------------
// GET /api/admin/dashboard
// Returns total counts: users, stores, ratings
// ---------------------------------------------------------------
const getDashboard = async (req, res, next) => {
  try {
    // Run all three counts in parallel for speed
    const [
      [usersResult],
      [storesResult],
      [ratingsResult],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total_users FROM users'),
      pool.query('SELECT COUNT(*) AS total_stores FROM stores'),
      pool.query('SELECT COUNT(*) AS total_ratings FROM ratings'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        total_users:   usersResult[0].total_users,
        total_stores:  storesResult[0].total_stores,
        total_ratings: ratingsResult[0].total_ratings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// POST /api/admin/users
// Admin creates a user of any role (ADMIN, USER, STORE_OWNER)
// ---------------------------------------------------------------
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check for duplicate email
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email, hashedPassword, address || null, role]
    );

    return res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      data: { id: result.insertId, name: name.trim(), email, role },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// GET /api/admin/users
// List all users with optional filtering and sorting.
//
// Query parameters:
//   ?name=John          — filter by name (partial, case-insensitive)
//   ?email=john@        — filter by email (partial)
//   ?address=NY         — filter by address (partial)
//   ?role=USER          — filter by exact role
//   ?sort=name          — sort column (allowlisted)
//   ?order=asc|desc     — sort direction (default: asc)
// ---------------------------------------------------------------
const getUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sort = 'created_at', order = 'asc' } = req.query;

    // Validate sort column against allowlist (SQL injection prevention)
    const sortColumn = USER_SORT_ALLOWLIST.includes(sort) ? sort : 'created_at';
    const sortOrder  = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    // Build dynamic WHERE clause with only the filters the caller provided
    const conditions = [];
    const params     = [];

    if (name) {
      conditions.push('name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push('email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push('address LIKE ?');
      params.push(`%${address}%`);
    }
    if (role) {
      conditions.push('role = ?');
      params.push(role.toUpperCase());
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Note: sortColumn is safe because it was validated against the allowlist
    const sql = `
      SELECT id, name, email, address, role, created_at
      FROM users
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
    `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      count:   rows.length,
      data:    rows,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// GET /api/admin/users/:id
// Get a single user's full details.
// For store owners: also shows their store + avg rating.
// ---------------------------------------------------------------
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch the user
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

    // If this user is a store owner, fetch their store rating info
    let storeInfo = null;
    if (user.role === 'STORE_OWNER') {
      const [storeRows] = await pool.query(
        `SELECT s.id, s.name, s.email, s.address,
                ROUND(AVG(r.rating), 2) AS avg_rating,
                COUNT(r.id) AS total_ratings
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = ?
         GROUP BY s.id`,
        [id]
      );
      storeInfo = storeRows;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        ...(storeInfo && { stores: storeInfo }),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// POST /api/admin/stores
// Admin adds a new store and assigns it to a STORE_OWNER
// ---------------------------------------------------------------
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Verify the owner exists AND has the right role
    const [ownerRows] = await pool.query(
      'SELECT id, name FROM users WHERE id = ? AND role = ?',
      [owner_id, 'STORE_OWNER']
    );

    if (ownerRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Owner not found or the specified user is not a Store Owner.',
      });
    }

    // Check store email uniqueness
    const [existingStore] = await pool.query(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );
    if (existingStore.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email already exists.',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email, address.trim(), owner_id]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: {
        id:      result.insertId,
        name:    name.trim(),
        email,
        address: address.trim(),
        owner_id,
        owner_name: ownerRows[0].name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// GET /api/admin/stores
// List all stores with optional filtering and sorting.
// Also shows each store's average rating and total rating count.
//
// Query parameters:
//   ?name=    — partial name filter
//   ?email=   — partial email filter
//   ?address= — partial address filter
//   ?sort=name|email|address|created_at
//   ?order=asc|desc
// ---------------------------------------------------------------
const getStores = async (req, res, next) => {
  try {
    const { name, email, address, sort = 'created_at', order = 'asc' } = req.query;

    const sortColumn = STORE_SORT_ALLOWLIST.includes(sort) ? sort : 'created_at';
    const sortOrder  = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const conditions = [];
    const params     = [];

    if (name) {
      conditions.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (email) {
      conditions.push('s.email LIKE ?');
      params.push(`%${email}%`);
    }
    if (address) {
      conditions.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name AS owner_name,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        COUNT(r.id) AS total_ratings,
        s.created_at
      FROM stores s
      LEFT JOIN users u   ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, u.name, s.created_at
      ORDER BY s.${sortColumn} ${sortOrder}
    `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      count:   rows.length,
      data:    rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, createUser, getUsers, getUserById, createStore, getStores };

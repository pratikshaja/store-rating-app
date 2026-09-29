
const bcrypt = require('bcrypt');
const pool   = require('../config/db');

const SALT_ROUNDS = 10;

const USER_SORT_ALLOWLIST  = ['name', 'email', 'address', 'role', 'created_at'];
const STORE_SORT_ALLOWLIST = ['name', 'email', 'address', 'created_at'];


const getDashboard = async (req, res, next) => {
  try {
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

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

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


const getUsers = async (req, res, next) => {
  try {
    const { name, email, address, role, sort = 'created_at', order = 'asc' } = req.query;

    const sortColumn = USER_SORT_ALLOWLIST.includes(sort) ? sort : 'created_at';
    const sortOrder  = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

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


const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = rows[0];

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


const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

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

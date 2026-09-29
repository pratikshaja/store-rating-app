// src/controllers/storeController.js
// ---------------------------------------------------------------
// Store and Rating API handlers for normal users:
//   - getAllStores  : List all stores with avg rating + user's own rating
//   - getStoreById  : Single store detail
//   - rateStore     : Upsert a rating (submit or update, USER only)
//
// SECURITY:
//   - rateStore enforces that req.user.id is used as user_id,
//     so a user can never submit ratings on behalf of someone else.
//   - Only users with role = USER can rate stores (enforced in router).
// ---------------------------------------------------------------

const pool = require('../config/db');

// ---------------------------------------------------------------
// GET /api/stores
// Protected — accessible to all authenticated users
// Returns all stores with:
//   - avg_rating   : calculated from all submitted ratings
//   - user_rating  : this user's own rating (null if not rated)
//
// Query parameters:
//   ?name=    — partial store name filter
//   ?address= — partial address filter
// ---------------------------------------------------------------
const getAllStores = async (req, res, next) => {
  try {
    const { name, address } = req.query;
    const userId = req.user.id;

    const conditions = [];
    const params     = [];

    if (name) {
      conditions.push('s.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (address) {
      conditions.push('s.address LIKE ?');
      params.push(`%${address}%`);
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // LEFT JOIN on ratings twice:
    //   r_all   — to compute the overall average across ALL users
    //   r_mine  — to get only the CURRENT user's rating
    const sql = `
      SELECT
        s.id,
        s.name,
        s.address,
        ROUND(AVG(r_all.rating), 2) AS avg_rating,
        COUNT(r_all.id)             AS total_ratings,
        r_mine.rating               AS user_rating
      FROM stores s
      LEFT JOIN ratings r_all  ON r_all.store_id  = s.id
      LEFT JOIN ratings r_mine ON r_mine.store_id = s.id
                               AND r_mine.user_id = ?
      ${whereClause}
      GROUP BY s.id, s.name, s.address, r_mine.rating
      ORDER BY s.name ASC
    `;

    // userId must be the FIRST param (before the WHERE filters)
    const [rows] = await pool.query(sql, [userId, ...params]);

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
// GET /api/stores/:id
// Protected — any authenticated user
// Returns single store detail + avg rating + user's own rating
// ---------------------------------------------------------------
const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
         s.id,
         s.name,
         s.email,
         s.address,
         ROUND(AVG(r_all.rating), 2) AS avg_rating,
         COUNT(r_all.id)             AS total_ratings,
         r_mine.rating               AS user_rating
       FROM stores s
       LEFT JOIN ratings r_all  ON r_all.store_id  = s.id
       LEFT JOIN ratings r_mine ON r_mine.store_id = s.id
                                AND r_mine.user_id = ?
       WHERE s.id = ?
       GROUP BY s.id, s.name, s.email, s.address, r_mine.rating`,
      [userId, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// PUT /api/stores/:id/rating
// Protected — only USER role (enforced in router)
//
// Upsert logic:
//   - If the user has never rated this store → INSERT a new rating
//   - If the user already rated this store   → UPDATE their rating
//
// The user cannot rate on behalf of someone else because we
// always use req.user.id (from the verified JWT), never req.body.user_id.
// ---------------------------------------------------------------
const rateStore = async (req, res, next) => {
  try {
    const { id: storeId } = req.params;
    const userId          = req.user.id;  // ALWAYS from the token, not the request body
    const { rating }      = req.body;

    // 1. Make sure the store exists
    const [storeRows] = await pool.query(
      'SELECT id FROM stores WHERE id = ?',
      [storeId]
    );
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // 2. Check if this user already has a rating for this store
    const [existing] = await pool.query(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let message;
    if (existing.length > 0) {
      // UPDATE existing rating
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
      message = 'Your rating has been updated successfully.';
    } else {
      // INSERT new rating
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
      message = 'Rating submitted successfully.';
    }

    // 3. Return the new average rating for this store
    const [avgRow] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) AS avg_rating FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.status(200).json({
      success: true,
      message,
      data: {
        store_id:    Number(storeId),
        user_rating: Number(rating),
        avg_rating:  avgRow[0].avg_rating,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStores, getStoreById, rateStore };

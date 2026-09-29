

const pool = require('../config/db');


const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id; // Always from the JWT — never req.body

    const [rows] = await pool.query(
      `SELECT
         s.id               AS store_id,
         s.name             AS store_name,
         s.email            AS store_email,
         s.address          AS store_address,
         ROUND(AVG(r.rating), 2) AS avg_rating,
         COUNT(r.id)        AS total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id, s.name, s.email, s.address`,
      [ownerId]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'You do not own any stores yet.',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// GET /api/owner/ratings
// Protected — STORE_OWNER only
// Returns all ratings submitted for the owner's store(s),
// including the name and email of each user who submitted a rating.
// ---------------------------------------------------------------
const getRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const [rows] = await pool.query(
      `SELECT
         r.id               AS rating_id,
         r.rating,
         r.created_at,
         r.updated_at,
         u.id               AS user_id,
         u.name             AS user_name,
         u.email            AS user_email,
         s.id               AS store_id,
         s.name             AS store_name
       FROM ratings r
       JOIN users  u ON u.id = r.user_id
       JOIN stores s ON s.id = r.store_id
       WHERE s.owner_id = ?
       ORDER BY r.updated_at DESC`,
      [ownerId]
    );

    return res.status(200).json({
      success: true,
      count:   rows.length,
      data:    rows,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getRatings };

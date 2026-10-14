
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');


const SALT_ROUNDS = 10;


const generateToken = (user) => {
  const payload = {
    id:    user.id,
    email: user.email,
    role:  user.role,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
};


const register = async (req, res, next) => {
  try {
    const { name, email, password, address } = req.body;

    // 1. Check if email is already taken
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
       VALUES (?, ?, ?, ?, 'USER')`,
      [name.trim(), email, hashedPassword, address || null]
    );

    // 4. Respond with the new user's ID (no password hash!)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. You can now log in.',
      data: { id: result.insertId, email, role: 'USER' },
    });
  } catch (err) {
    next(err);
  }
};


const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    // Use a generic message — never tell attackers which part was wrong
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // 2. Compare the provided password against the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Generate a JWT token
    const token = generateToken(user);

    // 4. Return the token and basic user info (no password hash!)
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// GET /api/auth/me
// Protected — requires a valid JWT
// Returns the full profile of the currently logged-in user
// ---------------------------------------------------------------
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the authenticate middleware
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------
// PATCH /api/auth/password
// Protected — any logged-in user can change their own password
// ---------------------------------------------------------------
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 1. Fetch the user's current hashed password from DB
    const [rows] = await pool.query(
      'SELECT id, password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 2. Verify the current password is correct
    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    // 3. Hash the new password
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // 4. Update the database
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHash, req.user.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword };

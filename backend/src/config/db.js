// src/config/db.js
// ---------------------------------------------------------------
// Creates a MySQL connection POOL using mysql2/promise.
//
// Why a pool instead of a single connection?
// A pool keeps several connections open and reuses them.
// This is much faster than opening a new connection for every
// API request, especially when many users hit the server at once.
// ---------------------------------------------------------------

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the pool with settings from .env
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,   // Queue requests when all connections are busy
  connectionLimit:    10,     // Max 10 simultaneous connections
  queueLimit:         0,      // Unlimited queue (0 = no limit)
  timezone:           '+00:00', // Always store timestamps in UTC
});

// Test the connection when the server starts.
// This catches wrong credentials or a missing database early.
pool.getConnection()
  .then((connection) => {
    console.log('✅ MySQL connected successfully to:', process.env.DB_NAME);
    connection.release(); // Always release connections back to the pool
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1); // Stop the server — no point running without a DB
  });

module.exports = pool;

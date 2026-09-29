// src/server.js
// ---------------------------------------------------------------
// Express Application Entry Point
//
// This file:
//   1. Loads environment variables from .env
//   2. Creates the Express app
//   3. Registers global middleware (CORS, JSON parser)
//   4. Mounts all route modules under their URL prefixes
//   5. Registers the centralized error handler (MUST be last)
//   6. Starts the HTTP server
//
// To start the server:
//   Development (auto-restart on file changes): npm run dev
//   Production:                                 npm start
// ---------------------------------------------------------------

require('dotenv').config(); // Load .env BEFORE anything else

const express      = require('express');
const cors         = require('cors');

// Route modules
const authRoutes   = require('./routes/authRoutes');
const adminRoutes  = require('./routes/adminRoutes');
const storeRoutes  = require('./routes/storeRoutes');
const ownerRoutes  = require('./routes/ownerRoutes');

// Centralized error handler (must be imported for the last app.use)
const errorHandler = require('./middleware/errorHandler');

// Initialize the connection pool (this also tests the DB connection on startup)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------

// CORS — allow requests from your React frontend
// In development we allow any origin for convenience.
// In production, replace the origin with your actual frontend URL.
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-frontend-domain.com'  // <-- change this for production
    : '*',
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Parse URL-encoded form data (useful for some clients)
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------
// Routes
// Each router handles everything under its prefix.
// ---------------------------------------------------------------

// Health check — useful to quickly verify the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating API is running.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',  authRoutes);    // POST /api/auth/register, etc.
app.use('/api/admin', adminRoutes);   // GET  /api/admin/dashboard, etc.
app.use('/api/stores', storeRoutes);  // GET  /api/stores, etc.
app.use('/api/owner', ownerRoutes);   // GET  /api/owner/dashboard, etc.

// ---------------------------------------------------------------
// 404 Handler — for any route not matched above
// ---------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------------------------------------------------
// Centralized Error Handler — MUST be registered LAST
// Catches any error passed via next(err) in controllers
// ---------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------
// Start the server
// ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log('');
  console.log('Store Rating API is running!');
  console.log(`   URL:         http://localhost:${PORT}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

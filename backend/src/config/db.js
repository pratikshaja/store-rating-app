
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the pool with settings from .env
const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               Number(process.env.DB_PORT) || 3306,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  waitForConnections: true,  
  connectionLimit:    10,     
  queueLimit:         0,      
  timezone:           '+00:00', 
});


pool.getConnection()
  .then((connection) => {
    console.log('✅ MySQL connected successfully to:', process.env.DB_NAME);
    connection.release(); 
  })
  .catch((err) => {
    console.error('MySQL connection failed:', err.message);
    process.exit(1); 
  });

module.exports = pool;

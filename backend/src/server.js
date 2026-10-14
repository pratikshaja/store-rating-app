

require('dotenv').config(); // Load .env BEFORE anything else

const express      = require('express');
const cors         = require('cors');

// Route modules
const authRoutes   = require('./routes/authRoutes');
const adminRoutes  = require('./routes/adminRoutes');
const storeRoutes  = require('./routes/storeRoutes');
const ownerRoutes  = require('./routes/ownerRoutes');

const errorHandler = require('./middleware/errorHandler');

require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-frontend-domain.com'  // <-- change this for production
    : '*',
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json());


app.use(express.urlencoded({ extended: true }));




app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating API is running.',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth',  authRoutes);    
app.use('/api/admin', adminRoutes);  
app.use('/api/stores', storeRoutes);  
app.use('/api/owner', ownerRoutes);   


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


app.use(errorHandler);


app.listen(PORT, () => {
  console.log('');
  console.log('Store Rating API is running!');
  console.log(`   URL:         http://localhost:${PORT}`);
  console.log(`   Health:      http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});

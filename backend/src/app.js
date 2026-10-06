const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const entryRoutes = require('./routes/entryRoutes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Borewell Daily Drilling Fleet Management Backend',
    version: '2.0.0',
    mode: 'Modular Clean Architecture',
  });
});

// Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/entries', entryRoutes);

// Compatibility Routes for existing endpoints
const AuthController = require('./controllers/authController');
const EntryController = require('./controllers/entryController');
const { validateDailyEntry } = require('./middleware/validateMiddleware');

app.post('/api/login', AuthController.login);
app.get('/api/reports/:vehicleId', EntryController.getVehicleEntries);
app.post('/api/reports', validateDailyEntry, EntryController.submitEntry);
app.get('/api/reports', EntryController.getGlobalFeed);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;

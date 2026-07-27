const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const xrayRoutes = require('./routes/xrayRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Global Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// Static Folders for Uploads and Generated PDF Reports
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/reports', express.static(path.join(__dirname, '../reports')));

// Health Check Endpoint (Public)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'AI BAMP Outcome Predictor API Server',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/xray', xrayRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', userRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Middleware
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 AI BAMP Predictor Backend Server active on port ${PORT}`);
  console.log(`📡 Listening on 0.0.0.0:${PORT} (LAN & Localhost accessible)`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🤖 AI Microservice URL: ${config.aiServiceUrl}`);
  console.log(`=================================================`);
});

module.exports = app;

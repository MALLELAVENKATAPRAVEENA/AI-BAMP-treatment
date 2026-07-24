const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'bamp_super_secret_jwt_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  }
};

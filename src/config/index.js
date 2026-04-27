require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
  },
  downstream: {
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://user-service:4001',
    orderServiceUrl: process.env.ORDER_SERVICE_URL || 'http://order-service:4002',
    notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4003',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:4200'],
  }
};

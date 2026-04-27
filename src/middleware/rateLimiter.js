const rateLimit = require('express-rate-limit');
const { rateLimit: rateLimitConfig } = require('../config');
const logger = require('../utils/logger');

/**
 * Rate limiter middleware.
 * Protects BFF endpoints from abuse and runaway MFE clients.
 */
const defaultLimiter = rateLimit({
  windowMs: rateLimitConfig.windowMs,
  max: rateLimitConfig.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000),
    });
  },
});

/** Stricter limiter for auth endpoints */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' },
});

module.exports = { defaultLimiter, authLimiter };

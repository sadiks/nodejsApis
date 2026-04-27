const logger = require('../utils/logger');

/**
 * Global error handler middleware.
 * Must be the last middleware registered in app.js.
 * Catches any error thrown by route handlers and formats a clean response.
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational
    ? err.message
    : 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

/**
 * 404 handler — must be registered AFTER all routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { errorHandler, notFoundHandler };

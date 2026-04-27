const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config');
const { unauthorized } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * JWT authentication middleware.
 * Verifies Bearer token and attaches decoded user payload to req.user.
 * Used to protect all BFF routes that require an authenticated session.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return unauthorized(res, 'Missing or malformed authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    logger.debug('JWT verified', { userId: decoded.id, role: decoded.role });
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token has expired');
    }
    if (err.name === 'JsonWebTokenError') {
      return unauthorized(res, 'Invalid token');
    }
    logger.error('JWT verification failed', { error: err.message });
    return unauthorized(res, 'Authentication failed');
  }
};

/**
 * Role-based access control middleware factory.
 * Usage: authorize('admin') or authorize(['admin', 'manager'])
 */
const authorize = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return unauthorized(res, 'Not authenticated');
    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized role access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };

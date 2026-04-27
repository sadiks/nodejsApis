/**
 * Standardised API response helpers.
 * Ensures every endpoint returns a consistent envelope shape
 * that the React MFE clients can rely on.
 */

const success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const created = (res, data, message = 'Resource created') => {
  return success(res, data, message, 201);
};

const error = (res, message = 'Internal server error', statusCode = 500, details = null) => {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };
  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
};

const notFound = (res, message = 'Resource not found') => error(res, message, 404);
const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401);
const forbidden = (res, message = 'Forbidden') => error(res, message, 403);
const badRequest = (res, message = 'Bad request', details = null) => error(res, message, 400, details);

module.exports = { success, created, error, notFound, unauthorized, forbidden, badRequest };

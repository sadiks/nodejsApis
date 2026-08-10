const app = require('../src/app');

// Vercel will route requests for /api/docs here if this file exists.
// Normalize and forward the request into the existing Express app so
// the Swagger UI and its static assets are served correctly in production.
module.exports = (req, res) => {
  const incoming = req.url || req.originalUrl || '/';
  // Preserve any sub-paths under /docs (e.g., /api/docs/swagger-initializer.js)
  const [pathOnly, query] = incoming.split('?');
  const normalizedPath = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;

  // Ensure the forwarded path begins with /api/docs
  const rest = normalizedPath.replace(/^\/docs|^\/api\/docs/, '');
  const forwardPath = `/api/docs${rest || ''}${query ? `?${query}` : ''}`;

  req.url = forwardPath;
  req.originalUrl = forwardPath;

  return app(req, res);
};

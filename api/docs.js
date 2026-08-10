const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const swaggerDist = (() => {
  try {
    // swagger-ui-dist exposes the dist path via getAbsoluteFSPath()
    const distPkg = require('swagger-ui-dist');
    return distPkg.getAbsoluteFSPath ? distPkg.getAbsoluteFSPath() : path.dirname(require.resolve('swagger-ui-dist'));
  } catch (err) {
    return null;
  }
})();

// Serve a small set of Swagger UI static assets directly from swagger-ui-dist
// when running on Vercel. This avoids Vercel returning 404 for asset requests
// that otherwise might not be routed into the Express app correctly.
const ASSET_MAP = {
  'swagger-ui.css': 'text/css',
  'swagger-ui-bundle.js': 'application/javascript',
  'swagger-ui-standalone-preset.js': 'application/javascript',
  'swagger-ui-init.js': 'application/javascript',
  'favicon-32x32.png': 'image/png',
  'favicon-16x16.png': 'image/png',
};

module.exports = (req, res) => {
  const incoming = req.url || req.originalUrl || '/';
  const [pathOnly, query] = incoming.split('?');
  const normalizedPath = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;

  // If the request targets a known Swagger UI asset, serve it directly.
  const assetName = Object.keys(ASSET_MAP).find((name) => normalizedPath.endsWith(name));
  if (assetName && swaggerDist) {
    const filePath = path.join(swaggerDist, assetName);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', ASSET_MAP[assetName]);
      const stream = fs.createReadStream(filePath);
      stream.on('error', (err) => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      });
      return stream.pipe(res);
    }
  }

  // Preserve any sub-paths under /docs (e.g., /api/docs/swagger-initializer.js)
  const rest = normalizedPath.replace(/^\/docs|^\/api\/docs/, '');
  const forwardPath = `/api/docs${rest || ''}${query ? `?${query}` : ''}`;

  req.url = forwardPath;
  req.originalUrl = forwardPath;

  return app(req, res);
};

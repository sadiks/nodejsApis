const fs = require('fs');
const path = require('path');
const app = require('../../src/app');

// Resolve swagger-ui-dist install location if available
const swaggerDist = (() => {
  try {
    const distPkg = require('swagger-ui-dist');
    return distPkg.getAbsoluteFSPath ? distPkg.getAbsoluteFSPath() : path.dirname(require.resolve('swagger-ui-dist'));
  } catch (err) {
    return null;
  }
})();

const ASSET_MAP = {
  'swagger-ui.css': 'text/css',
  'swagger-ui-bundle.js': 'application/javascript',
  'swagger-ui-standalone-preset.js': 'application/javascript',
  'swagger-ui-init.js': 'application/javascript',
  'swagger-ui-init.js.map': 'application/json',
  'favicon-32x32.png': 'image/png',
  'favicon-16x16.png': 'image/png',
};

module.exports = (req, res) => {
  const incoming = req.url || req.originalUrl || '/';
  // If request contains a known asset filename, attempt to serve it from swaggerDist
  const assetName = Object.keys(ASSET_MAP).find((name) => incoming.includes(name));
  if (assetName && swaggerDist) {
    const filePath = path.join(swaggerDist, assetName);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', ASSET_MAP[assetName]);
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        res.statusCode = 500;
        res.end('Internal Server Error');
      });
      return stream.pipe(res);
    }
  }

  // If asset not found locally, redirect to CDN-hosted file so the UI can load.
  if (assetName) {
    const cdnUrl = `https://unpkg.com/swagger-ui-dist/${assetName}`;
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    return res.writeHead(302, { Location: cdnUrl }).end();
  }

  // Forward everything else into the Express app
  // Normalize path to ensure Express receives /api/docs/... paths
  const normalized = incoming.startsWith('/') ? incoming : `/${incoming}`;
  req.url = normalized;
  req.originalUrl = normalized;
  return app(req, res);
};

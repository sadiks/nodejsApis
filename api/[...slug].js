const app = require('../src/app');

// Vercel routes requests for /api/* to this catch-all function.
// When the runtime invokes the function, the incoming URL may be stripped of
// the /api prefix, so we restore it before passing the request to Express.
module.exports = (req, res) => {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
};

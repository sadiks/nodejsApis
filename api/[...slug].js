const { URL } = require('url');
const app = require('../src/app');

// Vercel routes requests for /api/* to this catch-all function.
// We normalize the incoming URL so Express always sees /api/... paths.
module.exports = (req, res) => {
  const incoming = req.url || req.originalUrl || '/';
  const normalizedUrl = incoming.startsWith('/') ? incoming : `/${incoming}`;
  const parsed = new URL(normalizedUrl, 'http://localhost');

  const slugKey = ['__slug', '_slug', 'slug'].find((key) => parsed.searchParams.has(key));
  if (slugKey) {
    const slugValue = parsed.searchParams.get(slugKey) || '';
    parsed.searchParams.delete(slugKey);
    parsed.pathname = `/api/${slugValue.replace(/^\/+|\/+$/g, '')}`;
  }

  let pathname = parsed.pathname || '/';
  if (!pathname.startsWith('/api')) {
    pathname = pathname.replace(/^\/+/, '');
    pathname = `/api/${pathname}`.replace(/\/+/g, '/');
  }

  const query = parsed.searchParams.toString();
  req.url = query ? `${pathname}?${query}` : pathname;
  if (req.originalUrl !== undefined) {
    req.originalUrl = req.url;
  }

  return app(req, res);
};

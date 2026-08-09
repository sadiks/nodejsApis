const { URL } = require('url');
const app = require('../src/app');

// Vercel routes requests for /api/* to this catch-all function.
// Normalize incoming paths so Express always receives /api/... URLs.
module.exports = (req, res) => {
  const incoming = req.url || req.originalUrl || '/';
  const normalizedUrl = incoming.startsWith('/') ? incoming : `/${incoming}`;
  let reqUrl = normalizedUrl;

  try {
    const parsed = new URL(normalizedUrl, 'http://localhost');
    const slugKey = ['...slug', '__slug', '_slug', 'slug'].find((key) => parsed.searchParams.has(key));

    if (slugKey) {
      const slugValue = parsed.searchParams.get(slugKey) || '';
      ['...slug', '__slug', '_slug', 'slug'].forEach((key) => parsed.searchParams.delete(key));
      parsed.pathname = `/api/${slugValue.replace(/^\/+|\/+$/g, '')}`;
    }

    if (!parsed.pathname.startsWith('/api')) {
      parsed.pathname = `/api${parsed.pathname}`;
    }

    const query = parsed.searchParams.toString();
    reqUrl = query ? `${parsed.pathname}?${query}` : parsed.pathname;
  } catch (error) {
    if (!reqUrl.startsWith('/api')) {
      reqUrl = `/api${reqUrl}`;
    }
  }

  req.url = reqUrl;
  req.originalUrl = reqUrl;

  return app(req, res);
};

const app = require('../src/app');

// Vercel uses this catch-all serverless function to route all /api/* requests
// to the Express app defined in src/app.js.
module.exports = app;

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { cors: corsConfig } = require('./config');
const { defaultLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// ── Security headers ──────────────────────────────────────────────
app.use(helmet());

// ── CORS — restrict to registered MFE origins ────────────────────
app.use(cors({
  origin: corsConfig.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Request parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP request logging ──────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Global rate limiter ───────────────────────────────────────────
app.use(defaultLimiter);

// ── API routes ────────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 + global error handler (must be last) ─────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

/**
 * Lightweight structured logger.
 * Outputs JSON in production for log aggregation tools (Datadog, ELK).
 * Outputs readable format in development.
 */

const { nodeEnv } = require('../config');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = nodeEnv === 'production' ? levels.info : levels.debug;

const format = (level, message, meta = {}) => {
  const base = { level, message, timestamp: new Date().toISOString(), ...meta };
  return nodeEnv === 'production'
    ? JSON.stringify(base)
    : `[${base.timestamp}] ${level.toUpperCase()}: ${message}${
        Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
      }`;
};

const logger = {
  error: (msg, meta) => levels.error <= currentLevel && console.error(format('error', msg, meta)),
  warn:  (msg, meta) => levels.warn  <= currentLevel && console.warn(format('warn',  msg, meta)),
  info:  (msg, meta) => levels.info  <= currentLevel && console.log(format('info',   msg, meta)),
  debug: (msg, meta) => levels.debug <= currentLevel && console.log(format('debug',  msg, meta)),
};

module.exports = logger;

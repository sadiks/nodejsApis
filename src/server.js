const app = require('./app');
const { port } = require('./config');
const logger = require('./utils/logger');

const server = app.listen(port, () => {
  logger.info(`BFF API server running`, { port, env: process.env.NODE_ENV || 'development' });
});

// Graceful shutdown — drain in-flight requests before exiting
const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = server;

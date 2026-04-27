const router = require('express').Router();

router.use('/auth',      require('./auth.routes'));
router.use('/users',     require('./user.routes'));
router.use('/dashboard', require('./dashboard.routes'));

// Health check — used by Docker and k8s probes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

module.exports = router;

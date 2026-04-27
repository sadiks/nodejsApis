const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login',   authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.get('/me',       authenticate, authController.me);

module.exports = router;

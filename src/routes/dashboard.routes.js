const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

// All dashboard routes require authentication
router.get('/:userId', authenticate, dashboardController.getDashboard);

module.exports = router;

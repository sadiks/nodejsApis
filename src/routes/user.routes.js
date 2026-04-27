const router = require('express').Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',    authenticate, authorize('admin'), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);

module.exports = router;

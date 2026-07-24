const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.put('/users/profile', userController.updateUserProfile);
router.get('/users', authorizeRoles('Administrator'), userController.getUsers);
router.put('/users/role', authorizeRoles('Administrator'), userController.updateUserRole);
router.get('/audit-logs', authorizeRoles('Administrator', 'Researcher'), userController.fetchAuditLogs);

module.exports = router;

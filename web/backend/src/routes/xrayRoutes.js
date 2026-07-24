const express = require('express');
const router = express.Router();
const xrayController = require('../controllers/xrayController');
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.post('/upload', authorizeRoles('Orthodontist'), upload.single('xray'), xrayController.uploadXray);
router.get('/:id', xrayController.getXrayById);

module.exports = router;

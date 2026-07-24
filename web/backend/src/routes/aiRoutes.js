const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.post('/detect-landmarks', authorizeRoles('Orthodontist', 'Researcher', 'Administrator'), aiController.detectLandmarks);
router.post('/calculate-measurements', authorizeRoles('Orthodontist', 'Researcher', 'Administrator'), aiController.calculateMeasurements);
router.post('/predict', authorizeRoles('Orthodontist', 'Researcher', 'Administrator'), aiController.predictBampOutcome);
router.post('/chat', aiController.chatWithAI);

module.exports = router;

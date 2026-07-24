const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', patientController.getPatients);
router.post('/', authorizeRoles('Orthodontist'), patientController.createPatient);
router.get('/:id', patientController.getPatientById);
router.put('/:id', authorizeRoles('Orthodontist'), patientController.updatePatient);
router.delete('/:id', authorizeRoles('Orthodontist'), patientController.deletePatient);

module.exports = router;

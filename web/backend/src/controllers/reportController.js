const pdfReportService = require('../services/pdfReportService');
const patientService = require('../services/patientService');
const aiBridgeService = require('../services/aiBridgeService');
const { calculateCephalometrics } = require('../utils/cephalometricMath');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const generateReport = async (req, res, next) => {
  try {
    const { patientId, doctorNotes } = req.body;
    let patient = await patientService.getPatientById(patientId || 'PAT-2026-001');

    if (!patient) {
      patient = {
        patientId: 'PAT-2026-001',
        name: 'Emily Vance',
        age: 10,
        gender: 'Female',
        dob: '2016-03-15',
        cvmStage: 'CVM 3',
        skeletalAge: 10.5,
        growthPotential: 'High',
        bampStartDate: '2026-01-10'
      };
    }

    const prediction = await aiBridgeService.predictBampOutcome(patient);
    const cephalometrics = calculateCephalometrics({});

    const reportRecord = await pdfReportService.generatePDFReport(patient, prediction, cephalometrics, doctorNotes);
    return sendSuccess(res, 'PDF Report generated successfully', reportRecord, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  generateReport
};

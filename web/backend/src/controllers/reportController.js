const pdfReportService = require('../services/pdfReportService');
const patientService = require('../services/patientService');
const aiBridgeService = require('../services/aiBridgeService');
const { calculateCephalometrics } = require('../utils/cephalometricMath');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const generateReport = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    const { patientId, doctorNotes } = req.body;

    let patient = await patientService.getPatientById(patientId, doctorId);

    if (!patient) {
      const allPatients = await patientService.getAllPatients(doctorId);
      if (allPatients.length > 0) {
        patient = allPatients[0];
      } else {
        return sendError(res, 'No patient records found in your account. Please create a patient record first.', 404);
      }
    }

    patient.doctorId = doctorId;

    const prediction = await aiBridgeService.predictBampOutcome(patient);
    const cephalometrics = calculateCephalometrics(patient.landmarks || {});

    const reportRecord = await pdfReportService.generatePDFReport(patient, prediction, cephalometrics, doctorNotes, doctorId);
    return sendSuccess(res, 'PDF Report generated successfully from Firestore patient chart', reportRecord, 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  generateReport
};

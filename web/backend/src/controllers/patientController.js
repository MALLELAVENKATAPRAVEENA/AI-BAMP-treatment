const patientService = require('../services/patientService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getPatients = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    const patients = await patientService.getAllPatients(doctorId);
    return sendSuccess(res, 'Patients retrieved successfully', patients);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const getPatientById = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    const patient = await patientService.getPatientById(req.params.id, doctorId);
    if (!patient) {
      return sendError(res, 'Patient Not Found', 404);
    }
    return sendSuccess(res, 'Patient retrieved successfully', patient);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const createPatient = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    const newPatient = await patientService.createPatient(req.body, doctorId);
    return sendSuccess(res, 'Patient record created successfully', newPatient, 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const updatePatient = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    const updated = await patientService.updatePatient(req.params.id, req.body, doctorId);
    return sendSuccess(res, 'Patient record updated successfully', updated);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    await patientService.deletePatient(req.params.id, doctorId);
    return sendSuccess(res, 'Patient record deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};

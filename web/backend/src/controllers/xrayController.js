const xrayService = require('../services/xrayService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const uploadXray = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const xrayData = {
      patientId: req.body.patientId || 'PAT-2026-001',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    };

    const saved = await xrayService.saveXrayMetadata(xrayData);
    return sendSuccess(res, 'X-Ray uploaded and metadata saved successfully', saved, 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

const getXrayById = async (req, res, next) => {
  try {
    const xray = await xrayService.getXrayById(req.params.id);
    if (!xray) {
      return sendError(res, 'X-Ray record not found', 404);
    }
    return sendSuccess(res, 'X-Ray retrieved successfully', xray);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  uploadXray,
  getXrayById
};

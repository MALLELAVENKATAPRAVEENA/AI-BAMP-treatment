const aiBridgeService = require('../services/aiBridgeService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const detectLandmarks = async (req, res, next) => {
  try {
    const { xrayId, imageUrl } = req.body;
    const result = await aiBridgeService.detectLandmarks(xrayId || 'XRAY-001', imageUrl);
    return sendSuccess(res, 'Cephalometric landmarks detected successfully', result);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const calculateMeasurements = async (req, res, next) => {
  try {
    const { patientId, landmarks } = req.body;
    const result = await aiBridgeService.calculateMeasurements(patientId || 'PAT-001', landmarks);
    return sendSuccess(res, 'Cephalometric parameters calculated successfully', result);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const predictBampOutcome = async (req, res, next) => {
  try {
    const result = await aiBridgeService.predictBampOutcome(req.body);
    return sendSuccess(res, 'BAMP treatment outcome prediction completed', result);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

const chatWithAI = async (req, res, next) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return sendError(res, 'Prompt message is required', 400);
    }
    const result = await aiBridgeService.chatWithAI(prompt, history);
    return sendSuccess(res, 'AI Assistant Response generated', result);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  detectLandmarks,
  calculateMeasurements,
  predictBampOutcome,
  chatWithAI
};

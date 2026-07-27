const fs = require('fs');
const xrayService = require('../services/xrayService');
const { validateXRayImage } = require('../utils/xrayValidator');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const uploadXray = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }

    const patientId = req.body.patientId || 'PAT-001';
    const doctorId = req.user?.uid || req.user?.id;
    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // Step 1: Run Strict AI Validation
    const validationResult = await validateXRayImage(filePath, originalName);

    // Step 2: Handle Rejection (< 90% confidence score)
    if (!validationResult.isValid || validationResult.confidenceScore < 90.0) {
      // Auto-delete rejected file from disk
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (unlinkErr) {
        console.warn('[X-Ray Auto-Delete Warning]: Could not delete rejected file:', unlinkErr.message);
      }

      // Log rejection record in Firestore `xray_validations`
      const rejectionReason = validationResult.rejectionReason || 'Non-radiographic image detected. Confidence score below 90%.';
      await xrayService.logValidationRecord({
        patientId,
        imageName: originalName,
        validationStatus: 'Rejected',
        confidenceScore: validationResult.confidenceScore || 0,
        rejectionReason,
        xrayProbability: validationResult.xrayProbability || 0
      });

      return res.status(400).json({
        success: false,
        message: `Invalid Image Detected. Please upload a valid Lateral Cephalometric X-Ray. (${rejectionReason})`,
        data: {
          validationStatus: 'Rejected',
          confidenceScore: validationResult.confidenceScore,
          rejectionReason,
          validatedByAI: true
        }
      });
    }

    // Step 3: Accept Valid Cephalometric X-Ray (>= 90% confidence)
    await xrayService.logValidationRecord({
      patientId,
      imageName: originalName,
      validationStatus: 'Accepted',
      confidenceScore: validationResult.confidenceScore,
      rejectionReason: null,
      xrayProbability: validationResult.xrayProbability
    });

    const xrayData = {
      patientId,
      doctorId,
      filename: req.file.filename,
      originalName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      confidenceScore: validationResult.confidenceScore
    };

    const saved = await xrayService.saveXrayMetadata(xrayData);
    return res.status(201).json({
      success: true,
      message: '✅ Valid Cephalometric X-Ray verified and saved successfully.',
      data: {
        ...saved,
        validationStatus: 'Accepted',
        confidenceScore: validationResult.confidenceScore,
        xrayProbability: validationResult.xrayProbability,
        validatedByAI: true
      }
    });

  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (_) {}
    }
    return sendError(res, error.message, 400);
  }
};

const getXrayById = async (req, res, next) => {
  try {
    const doctorId = req.user?.uid || req.user?.id;
    const xray = await xrayService.getXrayById(req.params.id, doctorId);
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

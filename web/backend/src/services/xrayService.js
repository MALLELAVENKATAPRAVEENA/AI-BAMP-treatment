const { db, inMemoryStore } = require('../config/firebaseAdmin');

const logValidationRecord = async (validationData) => {
  const logId = `VAL-${Date.now()}`;
  const record = {
    logId,
    patientId: validationData.patientId || 'PAT-001',
    imageName: validationData.imageName || 'uploaded_xray.jpg',
    uploadDate: new Date().toISOString(),
    validationStatus: validationData.validationStatus, // 'Accepted' or 'Rejected'
    confidenceScore: validationData.confidenceScore || 0,
    rejectionReason: validationData.rejectionReason || null,
    validatedByAI: true,
    xrayProbability: validationData.xrayProbability || 0
  };

  try {
    if (db) {
      await db.collection('xray_validations').doc(logId).set(record);
    }
  } catch (e) {
    console.warn('[Firestore Notice] Offline, logging validation in memory:', e.message);
  }

  inMemoryStore.auditLogs.set(logId, record);
  return record;
};

const saveXrayMetadata = async (xrayData) => {
  const xrayId = xrayData.xrayId || `XRAY-${Date.now()}`;
  const record = {
    xrayId,
    patientId: xrayData.patientId,
    doctorId: xrayData.doctorId,
    filename: xrayData.filename,
    originalName: xrayData.originalName,
    mimeType: xrayData.mimeType,
    size: xrayData.size,
    url: xrayData.url || `/uploads/${xrayData.filename}`,
    validationStatus: 'Accepted',
    confidenceScore: xrayData.confidenceScore || 95.0,
    uploadedAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('xrays').doc(xrayId).set(record);
    }
  } catch (e) {
    console.warn('Firestore offline, storing X-ray in memory');
  }

  inMemoryStore.xrays.set(xrayId, record);
  return record;
};

const getXrayById = async (xrayId, doctorId) => {
  try {
    if (db) {
      const doc = await db.collection('xrays').doc(xrayId).get();
      if (doc.exists) {
        const data = doc.data();
        if (!doctorId || data.doctorId === doctorId) {
          return data;
        }
      }
    }
  } catch (e) {
    console.warn('Fallback to in-memory xray lookup');
  }
  
  const inMem = inMemoryStore.xrays.get(xrayId);
  if (inMem && (!doctorId || inMem.doctorId === doctorId)) {
    return inMem;
  }
  return null;
};

module.exports = {
  logValidationRecord,
  saveXrayMetadata,
  getXrayById
};

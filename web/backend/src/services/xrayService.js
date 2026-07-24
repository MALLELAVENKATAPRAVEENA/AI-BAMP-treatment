const { db, inMemoryStore } = require('../config/firebaseAdmin');

const saveXrayMetadata = async (xrayData) => {
  const xrayId = xrayData.xrayId || `XRAY-${Date.now()}`;
  const record = {
    xrayId,
    patientId: xrayData.patientId,
    filename: xrayData.filename,
    originalName: xrayData.originalName,
    mimeType: xrayData.mimeType,
    size: xrayData.size,
    url: xrayData.url || `/uploads/${xrayData.filename}`,
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

const getXrayById = async (xrayId) => {
  try {
    if (db) {
      const doc = await db.collection('xrays').doc(xrayId).get();
      if (doc.exists) return doc.data();
    }
  } catch (e) {
    console.warn('Fallback to in-memory xray lookup');
  }
  return inMemoryStore.xrays.get(xrayId) || null;
};

module.exports = {
  saveXrayMetadata,
  getXrayById
};

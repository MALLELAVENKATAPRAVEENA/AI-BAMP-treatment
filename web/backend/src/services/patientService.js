const { db, inMemoryStore } = require('../config/firebaseAdmin');

const validateAge = (age) => {
  const numAge = Number(age);
  if (isNaN(numAge) || numAge < 8 || numAge > 25) {
    throw new Error('Patient age must be between 8 and 25 years for BAMP treatment analysis.');
  }
  return numAge;
};

const getAllPatients = async (doctorId) => {
  try {
    if (db && doctorId) {
      const snapshot = await db.collection('patients').where('doctorId', '==', doctorId).get();
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data());
      }
    }
  } catch (e) {
    console.warn('[PatientService] Firestore query error:', e.message);
  }

  // Filter in-memory store by doctorId
  const all = Array.from(inMemoryStore.patients.values());
  if (doctorId) {
    return all.filter(p => p.doctorId === doctorId);
  }
  return all;
};

const getPatientById = async (patientId, doctorId) => {
  try {
    if (db) {
      const doc = await db.collection('patients').doc(patientId).get();
      if (doc.exists) {
        const data = doc.data();
        if (!doctorId || data.doctorId === doctorId) {
          return data;
        }
      }
    }
  } catch (e) {
    console.warn('[PatientService] Firestore lookup error:', e.message);
  }

  const inMem = inMemoryStore.patients.get(patientId);
  if (inMem && (!doctorId || inMem.doctorId === doctorId)) {
    return inMem;
  }
  return null;
};

const createPatient = async (patientData, doctorId) => {
  const validAge = validateAge(patientData.age || 10);
  const patientId = `PAT-${Date.now()}`;
  
  const newPatient = {
    patientId,
    doctorId: doctorId || patientData.doctorId,
    patientName: patientData.patientName || patientData.name || 'Patient Record',
    name: patientData.name || patientData.patientName || 'Patient Record',
    age: validAge,
    gender: patientData.gender || 'Female',
    cvmStage: patientData.cvmStage || 'CVM 3',
    growthPotential: patientData.growthPotential || 'High',
    bampStartDate: patientData.bampStartDate || new Date().toISOString().split('T')[0],
    diagnosis: patientData.diagnosis || patientData.chiefComplaint || 'Class III Skeletal Malocclusion',
    cephalometricMeasurements: patientData.cephalometricMeasurements || {},
    uploadedImages: patientData.uploadedImages || [],
    predictionResult: patientData.predictionResult || null,
    treatmentPlan: patientData.treatmentPlan || patientData.treatmentNotes || 'Bone-Anchored Maxillary Protraction Protocol',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('patients').doc(patientId).set(newPatient);
    }
  } catch (e) {
    console.warn('[PatientService] Firestore save error:', e.message);
  }

  inMemoryStore.patients.set(patientId, newPatient);
  return newPatient;
};

const updatePatient = async (patientId, updateData, doctorId) => {
  const existing = await getPatientById(patientId, doctorId);
  if (!existing) {
    throw new Error('Patient record not found or unauthorized');
  }

  if (updateData.age !== undefined) {
    validateAge(updateData.age);
  }

  const updated = {
    ...existing,
    ...updateData,
    patientName: updateData.patientName || updateData.name || existing.patientName || existing.name,
    name: updateData.name || updateData.patientName || existing.name || existing.patientName,
    updatedAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('patients').doc(patientId).set(updated, { merge: true });
    }
  } catch (e) {
    console.warn('[PatientService] Firestore update error:', e.message);
  }

  inMemoryStore.patients.set(patientId, updated);
  return updated;
};

const deletePatient = async (patientId, doctorId) => {
  const existing = await getPatientById(patientId, doctorId);
  if (!existing) {
    throw new Error('Patient record not found or unauthorized');
  }

  try {
    if (db) {
      await db.collection('patients').doc(patientId).delete();
    }
  } catch (e) {
    console.warn('[PatientService] Firestore delete error:', e.message);
  }
  inMemoryStore.patients.delete(patientId);
  return true;
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};

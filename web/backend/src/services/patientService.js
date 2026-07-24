const { db, inMemoryStore } = require('../config/firebaseAdmin');

// Initial seed patients for demo and testing if database is fresh
const SEED_PATIENTS = [
  {
    patientId: 'PAT-2026-001',
    name: 'Emily Vance',
    age: 10,
    gender: 'Female',
    dob: '2016-03-15',
    contactNumber: '+1 555-0192',
    chiefComplaint: 'Maxillary hypoplasia with skeletal Class III malocclusion and midface deficiency.',
    medicalHistory: 'No systemic illness. No known drug allergies.',
    familyHistory: 'Father has mild skeletal Class III trait.',
    previousTreatment: 'Intermittent palatal expander at age 8.',
    cvmStage: 'CVM 3',
    skeletalAge: 10.5,
    chronologicalAge: 10.0,
    growthPotential: 'High',
    bampStartDate: '2026-01-10',
    followUpDates: ['2026-03-10', '2026-06-15', '2026-09-20'],
    treatmentNotes: 'BAMP mini-plates surgically inserted in infrazygomatic crest and mandibular canine region.',
    createdAt: new Date().toISOString()
  },
  {
    patientId: 'PAT-2026-002',
    name: 'Lucas Miller',
    age: 12,
    gender: 'Male',
    dob: '2014-07-22',
    contactNumber: '+1 555-0184',
    chiefComplaint: 'Severe anterior crossbite and retrusive upper jaw.',
    medicalHistory: 'Asthma (controlled with inhaler).',
    familyHistory: 'Unremarkable.',
    previousTreatment: 'None.',
    cvmStage: 'CVM 4',
    skeletalAge: 12.8,
    chronologicalAge: 12.0,
    growthPotential: 'Moderate',
    bampStartDate: '2026-02-01',
    followUpDates: ['2026-04-05', '2026-07-12'],
    treatmentNotes: 'Elastics engaged (250g per side). Good oral hygiene maintained.',
    createdAt: new Date().toISOString()
  }
];

// Pre-seed in-memory store
SEED_PATIENTS.forEach(p => inMemoryStore.patients.set(p.patientId, p));

const getAllPatients = async (query = {}) => {
  try {
    if (db) {
      const snapshot = await db.collection('patients').get();
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data());
      }
    }
  } catch (e) {
    console.warn('Fallback to in-memory patient store');
  }
  return Array.from(inMemoryStore.patients.values());
};

const getPatientById = async (patientId) => {
  try {
    if (db) {
      const doc = await db.collection('patients').doc(patientId).get();
      if (doc.exists) return doc.data();
    }
  } catch (e) {
    console.warn('Fallback to in-memory patient lookup');
  }
  return inMemoryStore.patients.get(patientId) || null;
};

const createPatient = async (patientData) => {
  const patientId = patientData.patientId || `PAT-2026-${String(inMemoryStore.patients.size + 1).padStart(3, '0')}`;
  const newPatient = {
    ...patientData,
    patientId,
    createdAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('patients').doc(patientId).set(newPatient);
    }
  } catch (e) {
    console.warn('Firestore offline, storing patient in memory');
  }

  inMemoryStore.patients.set(patientId, newPatient);
  return newPatient;
};

const updatePatient = async (patientId, updateData) => {
  const existing = await getPatientById(patientId);
  if (!existing) {
    throw new Error('Patient not found');
  }

  const updated = {
    ...existing,
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  try {
    if (db) {
      await db.collection('patients').doc(patientId).update(updated);
    }
  } catch (e) {
    console.warn('Firestore offline, updating patient in memory');
  }

  inMemoryStore.patients.set(patientId, updated);
  return updated;
};

const deletePatient = async (patientId) => {
  try {
    if (db) {
      await db.collection('patients').doc(patientId).delete();
    }
  } catch (e) {
    console.warn('Firestore delete fallback');
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

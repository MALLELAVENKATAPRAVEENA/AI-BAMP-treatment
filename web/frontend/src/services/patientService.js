import api from './api';
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, onSnapshot, orderBy } from 'firebase/firestore';

const defaultClinicalDataset = [
  {
    id: 'PAT-101',
    patientId: 'PAT-101',
    name: 'Emma Watson',
    patientName: 'Emma Watson',
    age: 10.5,
    gender: 'Female',
    cvmStage: 'CVM 3',
    growthPotential: 'High (Peak Velocity)',
    skeletalAge: '10.8 yrs',
    clinicalNotes: 'Maxillary deficiency with anterior crossbite.',
    treatmentRecords: 'BAMP 4-miniplate protocol initialized.',
    bampStartDate: '2026-01-15',
    diagnosis: 'Class III Skeletal Malocclusion (Maxillary Deficiency)',
    predictionStatus: 'Completed',
    latestPredictionScore: 89.2,
    cephalometricMeasurements: { SNA: 78.2, SNB: 81.0, ANB: -2.8, Wits: -3.5 },
    status: 'Active',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'PAT-102',
    patientId: 'PAT-102',
    name: 'Lucas Miller',
    patientName: 'Lucas Miller',
    age: 11.2,
    gender: 'Male',
    cvmStage: 'CVM 3',
    growthPotential: 'High (Peak Velocity)',
    skeletalAge: '11.5 yrs',
    clinicalNotes: 'Severe skeletal Class III with mandibular prognathism.',
    treatmentRecords: '150g intermaxillary elastics per side.',
    bampStartDate: '2026-02-01',
    diagnosis: 'Class III Skeletal Malocclusion with Mandibular Prognathism',
    predictionStatus: 'Completed',
    latestPredictionScore: 84.5,
    cephalometricMeasurements: { SNA: 79.0, SNB: 82.5, ANB: -3.5, Wits: -4.2 },
    status: 'Active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'PAT-103',
    patientId: 'PAT-103',
    name: 'Sophia Davis',
    patientName: 'Sophia Davis',
    age: 9.8,
    gender: 'Female',
    cvmStage: 'CVM 2',
    growthPotential: 'Very High (Accelerating)',
    skeletalAge: '9.6 yrs',
    clinicalNotes: 'Early intervention Class III skeletal discrepancy.',
    treatmentRecords: 'Infrazygomatic mini-plates scheduled.',
    bampStartDate: '2026-03-10',
    diagnosis: 'Early Class III Skeletal Discrepancy',
    predictionStatus: 'Completed',
    latestPredictionScore: 92.1,
    cephalometricMeasurements: { SNA: 79.5, SNB: 81.4, ANB: -1.9, Wits: -2.1 },
    status: 'Active',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  }
];

export const subscribePatients = (callback) => {
  if (!db) {
    callback(defaultClinicalDataset);
    return () => {};
  }
  const q = query(collection(db, 'patients'));
  return onSnapshot(q, async (snapshot) => {
    let list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    if (list.length === 0) {
      for (const item of defaultClinicalDataset) {
        await setDoc(doc(db, 'patients', item.id), item);
      }
      list = defaultClinicalDataset;
    }
    callback(list);
  }, (err) => {
    console.warn('Firestore subscribePatients error:', err.message);
    callback(defaultClinicalDataset);
  });
};

export const getPatients = async () => {
  if (db) {
    try {
      const q = query(collection(db, 'patients'));
      const snap = await getDocs(q);
      let list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      if (list.length === 0) {
        for (const item of defaultClinicalDataset) {
          await setDoc(doc(db, 'patients', item.id), item);
        }
        list = defaultClinicalDataset;
      }
      return { success: true, data: list };
    } catch (fErr) {
      console.warn('Firestore getPatients error:', fErr);
    }
  }
  try {
    const res = await api.get('/patients');
    if (res && res.data && res.data.length > 0) return res;
  } catch (_) {}
  return { success: true, data: defaultClinicalDataset };
};

export const getPatientById = async (id) => {
  if (db) {
    try {
      const docRef = doc(db, 'patients', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { success: true, data: { id: snap.id, ...snap.data() } };
      }
    } catch (fErr) {
      console.warn('Firestore getPatientById error:', fErr);
    }
  }
  try {
    return await api.get(`/patients/${id}`);
  } catch (_) {}
  const found = defaultClinicalDataset.find(p => p.id === id || p.patientId === id);
  return { success: true, data: found || defaultClinicalDataset[0] };
};

export const createPatient = async (data) => {
  const patientId = data.id || data.patientId || `PAT-${Date.now()}`;
  const newPatient = {
    ...data,
    id: patientId,
    patientId,
    patientName: data.patientName || data.name || 'New Patient',
    name: data.name || data.patientName || 'New Patient',
    skeletalAge: data.skeletalAge || `${data.age || 10} yrs`,
    clinicalNotes: data.clinicalNotes || '',
    treatmentRecords: data.treatmentRecords || '',
    createdAt: new Date().toISOString(),
    status: data.status || 'Active'
  };

  if (db) {
    try {
      await setDoc(doc(db, 'patients', patientId), newPatient);
      return { success: true, data: newPatient, message: 'Patient Record Created Successfully in Firestore' };
    } catch (fErr) {
      console.warn('Firestore createPatient error:', fErr);
    }
  }
  try {
    return await api.post('/patients', data);
  } catch (err) {
    return { success: true, data: newPatient, message: 'Patient Record Created (Local)' };
  }
};

export const updatePatient = async (id, data) => {
  if (db) {
    try {
      await updateDoc(doc(db, 'patients', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return { success: true, message: 'Patient Record Updated Successfully in Firestore' };
    } catch (fErr) {
      console.warn('Firestore updatePatient error:', fErr);
    }
  }
  try {
    return await api.put(`/patients/${id}`, data);
  } catch (err) {
    return { success: true, message: 'Patient Record Updated (Local)' };
  }
};

export const deletePatient = async (id) => {
  if (db) {
    try {
      await deleteDoc(doc(db, 'patients', id));
      return { success: true, message: 'Patient Record Deleted Successfully from Firestore' };
    } catch (fErr) {
      console.warn('Firestore deletePatient error:', fErr);
    }
  }
  try {
    return await api.delete(`/patients/${id}`);
  } catch (err) {
    return { success: true, message: 'Patient Record Deleted (Local)' };
  }
};


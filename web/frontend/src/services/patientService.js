import api from './api';
import { db } from '../firebase/firebaseConfig';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query } from 'firebase/firestore';

export const getPatients = async () => {
  try {
    return await api.get('/patients');
  } catch (err) {
    if (db) {
      try {
        const q = query(collection(db, 'patients'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        return { success: true, data: list };
      } catch (fErr) {
        console.warn('Firestore fallback getPatients:', fErr);
      }
    }
    throw err;
  }
};

export const getPatientById = async (id) => {
  try {
    return await api.get(`/patients/${id}`);
  } catch (err) {
    if (db) {
      try {
        const docRef = doc(db, 'patients', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { success: true, data: { id: snap.id, ...snap.data() } };
        }
      } catch (fErr) {
        console.warn('Firestore fallback getPatientById:', fErr);
      }
    }
    throw err;
  }
};

export const createPatient = async (data) => {
  try {
    return await api.post('/patients', data);
  } catch (err) {
    if (db) {
      try {
        const patientId = data.id || `P-${Date.now()}`;
        const newPatient = {
          ...data,
          id: patientId,
          createdAt: new Date().toISOString(),
          status: data.status || 'Active'
        };
        await setDoc(doc(db, 'patients', patientId), newPatient);
        return { success: true, data: newPatient, message: 'Patient Created Successfully' };
      } catch (fErr) {
        console.warn('Firestore fallback createPatient:', fErr);
      }
    }
    throw err;
  }
};

export const updatePatient = async (id, data) => {
  try {
    return await api.put(`/patients/${id}`, data);
  } catch (err) {
    if (db) {
      try {
        await updateDoc(doc(db, 'patients', id), {
          ...data,
          updatedAt: new Date().toISOString()
        });
        return { success: true, message: 'Patient Updated Successfully' };
      } catch (fErr) {
        console.warn('Firestore fallback updatePatient:', fErr);
      }
    }
    throw err;
  }
};

export const deletePatient = async (id) => {
  try {
    return await api.delete(`/patients/${id}`);
  } catch (err) {
    if (db) {
      try {
        await deleteDoc(doc(db, 'patients', id));
        return { success: true, message: 'Patient Deleted Successfully' };
      } catch (fErr) {
        console.warn('Firestore fallback deletePatient:', fErr);
      }
    }
    throw err;
  }
};

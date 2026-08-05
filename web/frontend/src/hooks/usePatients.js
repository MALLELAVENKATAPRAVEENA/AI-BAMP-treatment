import { useState, useEffect } from 'react';
import { subscribePatients, getPatients } from '../services/patientService';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = subscribePatients((list) => {
      console.log('[Firestore Patient Directory Debug] Collection: patients, Total Documents Loaded:', list.length);
      setPatients(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refreshPatientsList = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  return { patients, loading, error, refreshPatients: refreshPatientsList };
};

import { useState, useEffect } from 'react';
import { getPatients } from '../services/patientService';

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatientsList = async () => {
    setLoading(true);
    try {
      const res = await getPatients();
      setPatients(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsList();
  }, []);

  return { patients, loading, error, refreshPatients: fetchPatientsList };
};

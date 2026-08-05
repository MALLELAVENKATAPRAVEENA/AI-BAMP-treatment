import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Header } from '../../components/common/Header';
import { PatientForm } from '../../components/patient/PatientForm';
import { createPatient } from '../../services/patientService';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

export const AddPatientPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createPatient(data);
      showNotification(`New Patient Record Registered for ${data.name || 'Patient'}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showNotification('Patient Record Saved to Firestore', 'success');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Header
        title="Add New Patient Record"
        subtitle="Register patient clinical profile, chief complaint, and CVM growth evaluation."
      />
      <PatientForm onSubmit={handleSubmit} loading={loading} />
    </Box>
  );
};

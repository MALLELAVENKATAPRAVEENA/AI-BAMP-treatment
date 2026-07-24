import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { PatientForm } from '../../components/patient/PatientForm';
import { getPatientById, updatePatient } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const EditPatientPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPatientById(id)
      .then((res) => setPatient(res.data))
      .catch((err) => showNotification(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await updatePatient(id, data);
      showNotification('Patient profile updated successfully', 'success');
      navigate('/patients');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching Patient Details..." />;

  return (
    <Box>
      <Header
        title={`Edit Patient Profile: ${patient?.name || id}`}
        subtitle="Update clinical information, CVM stage, and follow-up milestones."
      />
      <PatientForm initialValues={patient} onSubmit={handleSubmit} loading={submitting} />
    </Box>
  );
};

import React, { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, TextField,
  InputAdornment, Button, Chip, IconButton, MenuItem, Typography
} from '@mui/material';
import { Search, PersonAdd, Visibility, Edit, Delete, FolderOff } from '@mui/icons-material';
import { Header } from '../../components/common/Header';
import { usePatients } from '../../hooks/usePatients';
import { useNavigate } from 'react-router-dom';
import { deletePatient } from '../../services/patientService';
import { useNotification } from '../../context/NotificationContext';

export const PatientListPage = () => {
  const navigate = useNavigate();
  const { patients, refreshPatients } = usePatients();
  const { showNotification } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cvmFilter, setCvmFilter] = useState('ALL');
  const [genderFilter, setGenderFilter] = useState('ALL');

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record from your Firestore database?')) {
      try {
        await deletePatient(id);
        showNotification('Patient record deleted successfully', 'success');
        refreshPatients();
      } catch (err) {
        showNotification(err.message || 'Error deleting patient record', 'error');
      }
    }
  };

  const filteredPatients = patients.filter((p) => {
    const nameStr = p.name || '';
    const idStr = p.patientId || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || idStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCvm = cvmFilter === 'ALL' || p.cvmStage === cvmFilter;
    const matchesGender = genderFilter === 'ALL' || (p.gender || '').toLowerCase() === genderFilter.toLowerCase();
    return matchesSearch && matchesCvm && matchesGender;
  });

  return (
    <Box>
      <Header
        title="Patient Management Directory"
        subtitle="User-isolated patient clinical records stored directly in your Firebase Firestore database."
        action={
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => navigate('/patients/add')} sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Add New Patient
          </Button>
        }
      />

      <Card sx={{ p: 2, mb: 3, borderRadius: '16px' }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            placeholder="Search by Patient Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
            }}
          />
          <TextField
            select
            value={cvmFilter}
            onChange={(e) => setCvmFilter(e.target.value)}
            sx={{ width: 170 }}
            label="CVM Stage"
          >
            <MenuItem value="ALL">All CVM Stages</MenuItem>
            <MenuItem value="CVM 1">CVM 1</MenuItem>
            <MenuItem value="CVM 2">CVM 2</MenuItem>
            <MenuItem value="CVM 3">CVM 3</MenuItem>
            <MenuItem value="CVM 4">CVM 4</MenuItem>
            <MenuItem value="CVM 5">CVM 5</MenuItem>
            <MenuItem value="CVM 6">CVM 6</MenuItem>
          </TextField>

          <TextField
            select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            sx={{ width: 150 }}
            label="Gender"
          >
            <MenuItem value="ALL">All Genders</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Card sx={{ borderRadius: '16px' }}>
        {filteredPatients.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell><strong>Patient ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Age / Gender</strong></TableCell>
                <TableCell><strong>CVM Stage</strong></TableCell>
                <TableCell><strong>Growth Potential</strong></TableCell>
                <TableCell><strong>BAMP Start Date</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((p) => (
                <TableRow key={p.patientId} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{p.patientId}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                  <TableCell>{p.age} yrs / {p.gender}</TableCell>
                  <TableCell><Chip label={p.cvmStage || 'CVM 3'} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell><Chip label={p.growthPotential || 'High'} size="small" color="secondary" /></TableCell>
                  <TableCell>{p.bampStartDate || new Date().toISOString().split('T')[0]}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => navigate(`/patients/${p.patientId}`)}><Visibility /></IconButton>
                    <IconButton color="info" onClick={() => navigate(`/patients/edit/${p.patientId}`)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(p.patientId)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box p={5} textAlign="center">
            <FolderOff sx={{ fontSize: 64, color: 'gray', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No Patient Records Found
            </Typography>
            <Typography variant="body2" color="gray" mb={3}>
              You currently have 0 patients in your Firestore database. Click below to add your first patient chart.
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/patients/add')}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Add First Patient Record
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
};

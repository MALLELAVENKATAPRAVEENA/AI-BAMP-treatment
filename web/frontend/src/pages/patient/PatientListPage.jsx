import React, { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow, TextField,
  InputAdornment, Button, Chip, IconButton, MenuItem
} from '@mui/material';
import { Search, PersonAdd, Visibility, Edit, Delete } from '@mui/icons-material';
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await deletePatient(id);
        showNotification('Patient record deleted', 'success');
        refreshPatients();
      } catch (err) {
        showNotification(err.message, 'error');
      }
    }
  };

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCvm = cvmFilter === 'ALL' || p.cvmStage === cvmFilter;
    return matchesSearch && matchesCvm;
  });

  return (
    <Box>
      <Header
        title="Patient Management Directory"
        subtitle="Manage patient clinical records, cervical vertebral maturation (CVM) stages, and treatment progress."
        action={
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => navigate('/patients/add')}>
            Add New Patient
          </Button>
        }
      />

      <Card sx={{ p: 2, mb: 3 }}>
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
            sx={{ width: 180 }}
            label="Filter by CVM"
          >
            <MenuItem value="ALL">All CVM Stages</MenuItem>
            <MenuItem value="CVM 1">CVM 1</MenuItem>
            <MenuItem value="CVM 2">CVM 2</MenuItem>
            <MenuItem value="CVM 3">CVM 3</MenuItem>
            <MenuItem value="CVM 4">CVM 4</MenuItem>
            <MenuItem value="CVM 5">CVM 5</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Card sx={{ borderRadius: '16px' }}>
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
                <TableCell>{p.patientId}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                <TableCell>{p.age} yrs / {p.gender}</TableCell>
                <TableCell><Chip label={p.cvmStage || 'CVM 3'} size="small" color="primary" variant="outlined" /></TableCell>
                <TableCell><Chip label={p.growthPotential || 'High'} size="small" color="secondary" /></TableCell>
                <TableCell>{p.bampStartDate || '2026-01-10'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => navigate(`/patients/${p.patientId}`)}><Visibility /></IconButton>
                  <IconButton color="info" onClick={() => navigate(`/patients/edit/${p.patientId}`)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(p.patientId)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

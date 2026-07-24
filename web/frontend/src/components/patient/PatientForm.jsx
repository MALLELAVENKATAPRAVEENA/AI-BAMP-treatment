import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { patientSchema } from '../../utils/validators';
import {
  Grid, TextField, MenuItem, Button, Box, Typography, Card, CardContent
} from '@mui/material';
import { CVM_STAGES, GROWTH_POTENTIALS } from '../../utils/constants';

export const PatientForm = ({ initialValues, onSubmit, loading }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(patientSchema),
    defaultValues: initialValues || {
      name: '',
      age: 11,
      gender: 'Female',
      dob: '2015-05-12',
      contactNumber: '+1 555-0199',
      chiefComplaint: 'Maxillary hypoplasia with skeletal Class III malocclusion',
      medicalHistory: 'None',
      familyHistory: 'None',
      previousTreatment: 'None',
      cvmStage: 'CVM 3',
      skeletalAge: 11.5,
      chronologicalAge: 11.0,
      growthPotential: 'High',
      bampStartDate: '2026-01-15'
    }
  });

  return (
    <Card component="form" onSubmit={handleSubmit(onSubmit)}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight={700} mb={3} color="primary.main">
          Patient Demographics & Growth Profile
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Full Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Controller
              name="age"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Chronological Age"
                  error={!!errors.age}
                  helperText={errors.age?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Gender">
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                </TextField>
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth type="date" label="Date of Birth" InputLabelProps={{ shrink: true }} />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="contactNumber"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Contact Number" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="chiefComplaint"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth multiline rows={2} label="Chief Complaint" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} mt={2} mb={1} color="secondary.main">
              Growth Assessment & Cervical Vertebral Maturation (CVM)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              name="cvmStage"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="CVM Stage">
                  {CVM_STAGES.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="skeletalAge"
              control={control}
              render={({ field }) => (
                <TextField {...field} type="number" step="0.1" fullWidth label="Skeletal Age (yrs)" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Controller
              name="growthPotential"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label="Growth Potential">
                  {GROWTH_POTENTIALS.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Saving Record...' : 'Save Patient Record'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

import { createSlice } from '@reduxjs/toolkit';

const patientSlice = createSlice({
  name: 'patient',
  initialState: {
    patients: [],
    selectedPatient: null,
    loading: false,
    error: null
  },
  reducers: {
    setPatients: (state, action) => {
      state.patients = action.payload;
    },
    setSelectedPatient: (state, action) => {
      state.selectedPatient = action.payload;
    },
    setPatientLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setPatients, setSelectedPatient, setPatientLoading } = patientSlice.actions;
export default patientSlice.reducer;

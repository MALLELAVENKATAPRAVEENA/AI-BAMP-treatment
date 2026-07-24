import { createSlice } from '@reduxjs/toolkit';

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    reports: [],
    loading: false
  },
  reducers: {
    setReports: (state, action) => {
      state.reports = action.payload;
    }
  }
});

export const { setReports } = reportSlice.actions;
export default reportSlice.reducer;

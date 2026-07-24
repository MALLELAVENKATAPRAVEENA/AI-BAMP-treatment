import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_LANDMARKS = {
  S: { name: 'Sella (S)', x: 210, y: 150, confidence: 0.96 },
  N: { name: 'Nasion (N)', x: 380, y: 120, confidence: 0.98 },
  pointA: { name: 'Point A (Subspinale)', x: 360, y: 260, confidence: 0.94 },
  pointB: { name: 'Point B (Supramentale)', x: 340, y: 340, confidence: 0.92 },
  pog: { name: 'Pogonion (Pog)', x: 350, y: 410, confidence: 0.95 },
  gn: { name: 'Gnathion (Gn)', x: 330, y: 440, confidence: 0.93 },
  go: { name: 'Gonion (Go)', x: 180, y: 380, confidence: 0.91 },
  ans: { name: 'ANS (Anterior Nasal Spine)', x: 370, y: 230, confidence: 0.97 },
  pns: { name: 'PNS (Posterior Nasal Spine)', x: 240, y: 230, confidence: 0.90 },
  or: { name: 'Orbitale (Or)', x: 330, y: 170, confidence: 0.94 },
  po: { name: 'Porion (Po)', x: 170, y: 170, confidence: 0.89 }
};

const initialState = {
  currentPatient: null,
  uploadedImageUrl: null,
  uploadedImageName: null,
  landmarks: DEFAULT_LANDMARKS,
  cephalometrics: null,
  predictionResult: null,
  loading: false,
  error: null
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setCurrentPatient: (state, action) => {
      state.currentPatient = action.payload;
    },
    setUploadedImage: (state, action) => {
      state.uploadedImageUrl = action.payload.url;
      state.uploadedImageName = action.payload.name;
    },
    setLandmarks: (state, action) => {
      state.landmarks = action.payload;
    },
    updateSingleLandmark: (state, action) => {
      const { key, x, y } = action.payload;
      if (state.landmarks && state.landmarks[key]) {
        state.landmarks[key] = { ...state.landmarks[key], x, y };
      }
    },
    setCephalometrics: (state, action) => {
      state.cephalometrics = action.payload;
    },
    setPredictionResult: (state, action) => {
      state.predictionResult = action.payload;
    },
    setAILoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setCurrentPatient,
  setUploadedImage,
  setLandmarks,
  updateSingleLandmark,
  setCephalometrics,
  setPredictionResult,
  setAILoading
} = aiSlice.actions;

export default aiSlice.reducer;

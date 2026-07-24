import { useState } from 'react';
import { detectLandmarks, calculateMeasurements, predictBampOutcome } from '../services/aiService';

export const useAI = () => {
  const [landmarks, setLandmarks] = useState(null);
  const [cephalometrics, setCephalometrics] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const runLandmarkDetection = async (xrayId, imageUrl) => {
    setLoading(true);
    try {
      const res = await detectLandmarks({ xrayId, imageUrl });
      setLandmarks(res.data?.landmarks || null);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const runPrediction = async (patientData) => {
    setLoading(true);
    try {
      const res = await predictBampOutcome(patientData);
      setPrediction(res.data || null);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  return {
    landmarks,
    cephalometrics,
    prediction,
    loading,
    runLandmarkDetection,
    runPrediction
  };
};

import { useState } from 'react';

export const use3DViewer = () => {
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);

  const toggleLandmarks = () => setShowLandmarks((prev) => !prev);
  const toggleWireframe = () => setWireframeMode((prev) => !prev);

  return {
    simulationProgress,
    setSimulationProgress,
    showLandmarks,
    toggleLandmarks,
    wireframeMode,
    toggleWireframe
  };
};

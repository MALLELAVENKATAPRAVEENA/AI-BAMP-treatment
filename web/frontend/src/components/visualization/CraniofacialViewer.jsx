import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { Card, CardContent, Typography, Box, Slider, Button, Alert } from '@mui/material';
import { ViewInAr, RotateLeft } from '@mui/icons-material';
import { useSelector } from 'react-redux';

function SkullMesh({ landmarks, simulationProgress }) {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  // Convert 2D pixel coordinates of uploaded radiograph into 3D viewport space
  const S = landmarks?.S || { x: 210, y: 150 };
  const N = landmarks?.N || { x: 380, y: 120 };
  const pointA = landmarks?.pointA || { x: 360, y: 260 };
  const pointB = landmarks?.pointB || { x: 340, y: 340 };
  const pog = landmarks?.pog || { x: 350, y: 410 };
  const ans = landmarks?.ans || { x: 370, y: 230 };
  const pns = landmarks?.pns || { x: 240, y: 230 };

  const scaleX = (val) => ((val - 280) / 70);
  const scaleY = (val) => ((-val + 280) / 70);

  // Dynamic 3D Nodes calculated from active radiograph landmarks
  const dynamicNodes = [
    { name: 'Sella (S)', pos: [scaleX(S.x), scaleY(S.y), -1.0], color: '#3b82f6' },
    { name: 'Nasion (N)', pos: [scaleX(N.x), scaleY(N.y), 1.8], color: '#3b82f6' },
    { name: 'Point A', pos: [scaleX(pointA.x), scaleY(pointA.y), 2.4 + (simulationProgress * 0.008)], color: '#ef4444' }, // BAMP Protraction
    { name: 'Point B', pos: [scaleX(pointB.x), scaleY(pointB.y), 2.0], color: '#10b981' },
    { name: 'Pogonion', pos: [scaleX(pog.x), scaleY(pog.y), 2.2], color: '#10b981' },
    { name: 'ANS', pos: [scaleX(ans.x), scaleY(ans.y), 2.6 + (simulationProgress * 0.009)], color: '#f59e0b' },
    { name: 'PNS', pos: [scaleX(pns.x), scaleY(pns.y), -0.8], color: '#f59e0b' }
  ];

  return (
    <group ref={meshRef}>
      {/* Wireframe Facial Contour Approximation */}
      <mesh>
        <sphereGeometry args={[2.6, 16, 16]} />
        <meshBasicMaterial wireframe color="#0d9488" opacity={0.25} transparent />
      </mesh>

      {/* Render Dynamic 3D Anatomical Nodes */}
      {dynamicNodes.map((node, i) => (
        <group key={i} position={node.pos}>
          <Sphere args={[0.16, 16, 16]}>
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.5} />
          </Sphere>
          <Text position={[0.25, 0.25, 0]} fontSize={0.25} color="#ffffff">
            {node.name}
          </Text>
        </group>
      ))}

      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
    </group>
  );
}

export const CraniofacialViewer = () => {
  const { landmarks } = useSelector((state) => state.ai);
  const [simulation, setSimulation] = useState(0);

  return (
    <Card sx={{ p: 2, borderRadius: '16px' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ViewInAr color="primary" />
            <Typography variant="h6" fontWeight={700}>
              3D Craniofacial AI Interactive Visualization
            </Typography>
          </Box>
          <Button startIcon={<RotateLeft />} onClick={() => setSimulation(0)} size="small">
            Reset View
          </Button>
        </Box>

        {/* 3D Three.js Canvas Container */}
        <Box height={420} bgcolor="#0b0f19" borderRadius="12px" position="relative" overflow="hidden">
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <SkullMesh landmarks={landmarks} simulationProgress={simulation} />
            <OrbitControls enableZoom={true} enableRotate={true} />
          </Canvas>
        </Box>

        {/* BAMP Maxillary Protraction Simulation Slider */}
        <Box mt={3} px={2}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Simulate BAMP Maxillary Protraction Advancement (0mm to 4.5mm):
          </Typography>
          <Slider
            value={simulation}
            onChange={(e, val) => setSimulation(val)}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${(v * 0.045).toFixed(1)} mm`}
            sx={{ color: 'secondary.main' }}
          />
        </Box>

        {/* MANDATORY AI DISCLAIMER */}
        <Alert severity="warning" sx={{ mt: 2, borderRadius: '10px', fontSize: '12px' }}>
          <strong>Disclaimer:</strong> This visualization is AI-estimated and is not a true 3D reconstruction from a single cephalometric radiograph.
        </Alert>
      </CardContent>
    </Card>
  );
};

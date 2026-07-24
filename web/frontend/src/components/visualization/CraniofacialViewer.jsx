import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, Typography, Box, Slider, Button, Alert, Chip, Stack } from '@mui/material';
import { ViewInAr, RotateLeft, AutoAwesome, Flare } from '@mui/icons-material';
import { useSelector } from 'react-redux';

function CraniofacialSkullModel({ landmarks, simulationProgress }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
    }
  });

  // Scale 2D pixel landmarks (S, N, pointA, pointB, pog, gn, go, ans, pns, or, po) to 3D world coordinates
  const S = landmarks?.S || { x: 210, y: 150 };
  const N = landmarks?.N || { x: 380, y: 120 };
  const pointA = landmarks?.pointA || { x: 360, y: 260 };
  const pointB = landmarks?.pointB || { x: 340, y: 340 };
  const pog = landmarks?.pog || { x: 350, y: 410 };
  const gn = landmarks?.gn || { x: 330, y: 440 };
  const go = landmarks?.go || { x: 180, y: 380 };
  const ans = landmarks?.ans || { x: 370, y: 230 };
  const pns = landmarks?.pns || { x: 240, y: 230 };
  const or = landmarks?.or || { x: 330, y: 170 };
  const po = landmarks?.po || { x: 170, y: 170 };

  const sx = (x) => (x - 270) / 55.0;
  const sy = (-y + 270) / 55.0;

  // Maxillary advancement displacement (0mm to 4.5mm) along BAMP traction vector
  const maxillaAdvancement = simulationProgress * 0.012; // 3D units

  const pS = useMemo(() => [sx(S.x), sy(S.y), 0], [S]);
  const pN = useMemo(() => [sx(N.x), sy(N.y), 0.2], [N]);
  const pOr = useMemo(() => [sx(or.x), sy(or.y), 0.8], [or]);
  const pPo = useMemo(() => [sx(po.x), sy(po.y), -0.8], [po]);
  
  // Maxilla landmarks (Advancing dynamically with BAMP protraction slider)
  const pANS = useMemo(() => [sx(ans.x) + maxillaAdvancement, sy(ans.y), 1.2], [ans, maxillaAdvancement]);
  const pPNS = useMemo(() => [sx(pns.x) + (maxillaAdvancement * 0.3), sy(pns.y), -0.6], [pns, maxillaAdvancement]);
  const pPointA = useMemo(() => [sx(pointA.x) + maxillaAdvancement, sy(pointA.y), 1.1], [pointA, maxillaAdvancement]);

  // Mandible landmarks (Fixed baseline)
  const pPointB = useMemo(() => [sx(pointB.x), sy(pointB.y), 1.0], [pointB]);
  const pPog = useMemo(() => [sx(pog.x), sy(pog.y), 1.1], [pog]);
  const pGn = useMemo(() => [sx(gn.x), sy(gn.y), 0.8], [gn]);
  const pGo = useMemo(() => [sx(go.x), sy(go.y), -1.1], [go]);

  // Mini-Plate Attachment Anchors
  const pInfrazygomatic = useMemo(() => [sx(ans.x) - 0.4 + maxillaAdvancement, sy(ans.y) + 0.3, 1.4], [ans, maxillaAdvancement]);
  const pParasymphyseal = useMemo(() => [sx(pointB.x) + 0.1, sy(pointB.y) - 0.2, 1.3], [pointB]);

  // Cranial Vault Curved Profile Mesh Points
  const cranialVaultPoints = useMemo(() => {
    const points = [];
    const radius = 2.4;
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 1.2 - 0.3;
      const x = pS[0] + Math.cos(angle) * radius * 0.95;
      const y = pS[1] + Math.sin(angle) * radius * 1.05;
      const z = Math.sin(angle * 2) * 0.6;
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, [pS]);

  // Cranial Base Wire (Sella-Nasion-Orbitale)
  const cranialBasePoints = [
    new THREE.Vector3(...pPo),
    new THREE.Vector3(...pS),
    new THREE.Vector3(...pN),
    new THREE.Vector3(...pOr)
  ];

  // Maxillary Bone Profile (PNS - ANS - Point A - Dental Arch)
  const maxillaBonePoints = [
    new THREE.Vector3(...pPNS),
    new THREE.Vector3(...pANS),
    new THREE.Vector3(...pPointA),
    new THREE.Vector3(pPointA[0] - 0.2, pPointA[1] - 0.5, 0.9)
  ];

  // Mandibular Body & Ramus Profile (Gonion - Gnathion - Pogonion - Point B)
  const mandibleBonePoints = [
    new THREE.Vector3(...pGo),
    new THREE.Vector3(...pGn),
    new THREE.Vector3(...pPog),
    new THREE.Vector3(...pPointB),
    new THREE.Vector3(pPointB[0] - 0.2, pPointB[1] + 0.4, 0.8)
  ];

  const landmarksList = [
    { label: 'Sella (S)', pos: pS, color: '#38bdf8' },
    { label: 'Nasion (N)', pos: pN, color: '#38bdf8' },
    { label: 'Point A (Maxilla)', pos: pPointA, color: '#ef4444' },
    { label: 'Point B (Mandible)', pos: pPointB, color: '#10b981' },
    { label: 'Pogonion (Pog)', pos: pPog, color: '#10b981' },
    { label: 'ANS', pos: pANS, color: '#f59e0b' },
    { label: 'PNS', pos: pPNS, color: '#f59e0b' },
    { label: 'Gonion (Go)', pos: pGo, color: '#8b5cf6' },
    { label: 'Gnathion (Gn)', pos: pGn, color: '#8b5cf6' }
  ];

  return (
    <group ref={groupRef}>
      {/* 1. Anatomical Calvarium / Skull Vault Contour Curve */}
      <Line points={cranialVaultPoints} color="#38bdf8" lineWidth={3} transparent opacity={0.8} />

      {/* 2. Cranial Base Line (Sella-Nasion-Orbitale) */}
      <Line points={cranialBasePoints} color="#0284c7" lineWidth={3.5} />

      {/* 3. Maxillary Bone Contour (Upper Jaw) */}
      <Line points={maxillaBonePoints} color="#f43f5e" lineWidth={4} />

      {/* 4. Mandibular Bone Contour (Lower Jaw & Condyle Ramus) */}
      <Line points={mandibleBonePoints} color="#10b981" lineWidth={4} />
      <Line points={[new THREE.Vector3(...pGo), new THREE.Vector3(pGo[0] + 0.2, pGo[1] + 1.8, -0.9)]} color="#10b981" lineWidth={3} />

      {/* 5. BAMP Intermaxillary Elastics Traction Line (150g-250g force vector) */}
      <Line
        points={[new THREE.Vector3(...pInfrazygomatic), new THREE.Vector3(...pParasymphyseal)]}
        color="#fbbf24"
        lineWidth={5}
        dashed
        dashScale={8}
      />

      {/* 6. BAMP Mini-Plate Anchorage Hardware Render */}
      <group position={pInfrazygomatic}>
        <Sphere args={[0.22, 16, 16]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.6} />
        </Sphere>
        <Text position={[0.4, 0.2, 0]} fontSize={0.22} color="#fbbf24">
          Infrazygomatic Mini-Plate
        </Text>
      </group>

      <group position={pParasymphyseal}>
        <Sphere args={[0.22, 16, 16]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#f59e0b" emissiveIntensity={0.6} />
        </Sphere>
        <Text position={[0.4, -0.2, 0]} fontSize={0.22} color="#fbbf24">
          Parasymphyseal Mini-Plate
        </Text>
      </group>

      {/* 7. Anatomical Cephalometric Landmark Nodes */}
      {landmarksList.map((lm, idx) => (
        <group key={idx} position={lm.pos}>
          <Sphere args={[0.15, 16, 16]}>
            <meshStandardMaterial color={lm.color} emissive={lm.color} emissiveIntensity={0.6} />
          </Sphere>
          <Text position={[0.28, 0.2, 0]} fontSize={0.22} color="#ffffff">
            {lm.label}
          </Text>
        </group>
      ))}

      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 6]} intensity={1.5} />
      <pointLight position={[-6, -4, -4]} intensity={0.8} />
    </group>
  );
}

export const CraniofacialViewer = () => {
  const { landmarks } = useSelector((state) => state.ai);
  const [simulation, setSimulation] = useState(0);

  return (
    <Card sx={{ p: 2.5, borderRadius: '16px', bgcolor: '#0b0f19', color: '#fff' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <ViewInAr sx={{ color: '#38bdf8', fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={700} color="#f8fafc">
                3D Anatomical Craniofacial AI Visualization
              </Typography>
              <Typography variant="caption" color="#94a3b8">
                3D Lateral Cephalometric Skull & Jaw Structure • Bone-Anchored Maxillary Protraction (BAMP) Simulation
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<RotateLeft />}
            onClick={() => setSimulation(0)}
            size="small"
            variant="outlined"
            sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            Reset Orientation
          </Button>
        </Box>

        {/* Legend Toolbar */}
        <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap" useFlexGap>
          <Chip label="Cranial Base (S-N)" size="small" sx={{ bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 700 }} />
          <Chip label="Maxilla Bone (Upper Jaw)" size="small" sx={{ bgcolor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', fontWeight: 700 }} />
          <Chip label="Mandible Bone (Lower Jaw)" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }} />
          <Chip label="BAMP Elastics (150g-250g)" size="small" sx={{ bgcolor: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontWeight: 700 }} />
        </Stack>

        {/* 3D Canvas Workspace */}
        <Box height={440} bgcolor="#020617" borderRadius="14px" border="1px solid rgba(255, 255, 255, 0.12)" position="relative" overflow="hidden">
          <Canvas camera={{ position: [0, 0, 7.5], fov: 48 }}>
            <CraniofacialSkullModel landmarks={landmarks} simulationProgress={simulation} />
            <OrbitControls enableZoom={true} enableRotate={true} />
          </Canvas>
        </Box>

        {/* Maxillary Protraction Interactive Slider */}
        <Box mt={3} px={2} p={2} bgcolor="rgba(255,255,255,0.03)" borderRadius="12px" border="1px solid rgba(255,255,255,0.08)">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={700} color="#38bdf8" display="flex" alignItems="center" gap={1}>
              <AutoAwesome sx={{ fontSize: 18 }} /> BAMP Orthopedic Maxillary Advancement Simulation (0mm to 4.5mm):
            </Typography>
            <Chip
              label={`+${(simulation * 0.045).toFixed(2)} mm Advancement`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </Box>
          <Slider
            value={simulation}
            onChange={(e, val) => setSimulation(val)}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `+${(v * 0.045).toFixed(1)} mm`}
            sx={{ color: '#38bdf8' }}
          />
        </Box>

        <Alert severity="info" sx={{ mt: 2, borderRadius: '10px', fontSize: '12px', bgcolor: 'rgba(56, 189, 248, 0.08)', color: '#93c5fd' }}>
          <strong>3D Cephalometric Modeling:</strong> The anatomical skull mesh above maps 2D landmarks (Sella, Nasion, Point A, Point B, Pogonion, ANS, PNS, Gonion, Gnathion) directly from the uploaded lateral radiograph into 3D space with BAMP mini-plate force vector simulation.
        </Alert>
      </CardContent>
    </Card>
  );
};

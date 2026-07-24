import React, { useRef, useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';

export const XrayCanvas = ({ imageUrl, landmarks, onLandmarkClick, selectedLandmark, onLandmarkDrag }) => {
  const canvasRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const renderOverlay = () => {
      // Draw grid if no image
      if (!imageUrl) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      if (!landmarks) return;

      // Connect Key Cephalometric Lines
      ctx.lineWidth = 2;

      // 1. SN Line (Sella to Nasion - Blue)
      if (landmarks.S && landmarks.N) {
        ctx.strokeStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(landmarks.S.x, landmarks.S.y);
        ctx.lineTo(landmarks.N.x, landmarks.N.y);
        ctx.stroke();
      }

      // 2. Facial Plane (Nasion to Pogonion - Green)
      if (landmarks.N && landmarks.pog) {
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(landmarks.N.x, landmarks.N.y);
        ctx.lineTo(landmarks.pog.x, landmarks.pog.y);
        ctx.stroke();
      }

      // 3. Mandibular Plane (Gonion to Gnathion - Amber)
      if (landmarks.go && landmarks.gn) {
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(landmarks.go.x, landmarks.go.y);
        ctx.lineTo(landmarks.gn.x, landmarks.gn.y);
        ctx.stroke();
      }

      // 4. Maxillary Plane (ANS to PNS - Purple)
      if (landmarks.ans && landmarks.pns) {
        ctx.strokeStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.moveTo(landmarks.ans.x, landmarks.ans.y);
        ctx.lineTo(landmarks.pns.x, landmarks.pns.y);
        ctx.stroke();
      }

      // Draw Landmark Nodes
      Object.keys(landmarks).forEach((key) => {
        const pt = landmarks[key];
        const isSelected = selectedLandmark === key;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 9 : 6, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#ef4444' : '#0d9488';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px Inter';
        ctx.fillText(pt.name || key, pt.x + 8, pt.y - 4);
      });
    };

    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        renderOverlay();
      };
      img.onerror = () => renderOverlay();
    } else {
      renderOverlay();
    }

  }, [imageUrl, landmarks, selectedLandmark]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !landmarks) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (selectedLandmark && onLandmarkDrag) {
      onLandmarkDrag(selectedLandmark, x, y);
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedLandmark || !onLandmarkDrag) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    onLandmarkDrag(selectedLandmark, x, y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, background: '#0f172a', textAlign: 'center', borderRadius: '16px' }}>
      <Typography variant="caption" color="gray" mb={1} display="block">
        {imageUrl ? 'Uploaded Lateral Cephalogram with AI Overlay (Click canvas to adjust landmark coordinates)' : 'Cephalometric Canvas Overlay (11 Anatomical Landmarks Mapped)'}
      </Typography>
      <Box display="flex" justifyContent="center">
        <canvas
          ref={canvasRef}
          width={560}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', cursor: selectedLandmark ? 'crosshair' : 'default' }}
        />
      </Box>
    </Paper>
  );
};

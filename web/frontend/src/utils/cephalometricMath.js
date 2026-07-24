export function calculateAngle(p1, vertex, p2) {
  if (!p1 || !vertex || !p2) return 0;
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (mag1 === 0 || mag2 === 0) return 0;
  let cosTheta = dot / (mag1 * mag2);
  cosTheta = Math.max(-1, Math.min(1, cosTheta));

  const angleRad = Math.acos(cosTheta);
  return Number((angleRad * (180 / Math.PI)).toFixed(1));
}

export function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'Success':
      return '#10b981'; // Emerald Green
    case 'Moderate Risk':
      return '#f59e0b'; // Amber
    case 'High Risk':
      return '#ef4444'; // Red
    default:
      return '#6b7280';
  }
}

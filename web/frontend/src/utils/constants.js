export const ROLES = {
  ADMINISTRATOR: 'Administrator',
  ORTHODONTIST: 'Orthodontist',
  RESEARCHER: 'Researcher'
};

export const CVM_STAGES = ['CVM 1', 'CVM 2', 'CVM 3', 'CVM 4', 'CVM 5', 'CVM 6'];

export const GROWTH_POTENTIALS = ['Low', 'Moderate', 'High', 'Optimal Peak'];

export const RISK_LEVELS = {
  SUCCESS: 'Success',
  MODERATE: 'Moderate Risk',
  HIGH: 'High Risk'
};

export const CEPHALOMETRIC_LANDMARKS = [
  { id: 'S', name: 'Sella (S)', description: 'Midpoint of hypophyseal fossa' },
  { id: 'N', name: 'Nasion (N)', description: 'Anterior point of frontonasal suture' },
  { id: 'pointA', name: 'Point A', description: 'Deepest midline point of maxilla' },
  { id: 'pointB', name: 'Point B', description: 'Deepest midline point of mandible concavity' },
  { id: 'pog', name: 'Pogonion (Pog)', description: 'Most anterior point of chin' },
  { id: 'gn', name: 'Gnathion (Gn)', description: 'Midpoint between Pog and Menton' },
  { id: 'go', name: 'Gonion (Go)', description: 'Angle of the mandible' },
  { id: 'ans', name: 'ANS', description: 'Anterior Nasal Spine' },
  { id: 'pns', name: 'PNS', description: 'Posterior Nasal Spine' },
  { id: 'or', name: 'Orbitale (Or)', description: 'Lowest point of infraorbital margin' },
  { id: 'po', name: 'Porion (Po)', description: 'Highest point of external auditory meatus' }
];

export const PASSWORD_RULES_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{7,9}$/;

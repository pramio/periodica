// src/engine/chemistry.js

// 1. Madelung Rule for Orbital Filling (1s, 2s, 2p...)
const ORBITAL_ORDER = [
  '1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p'
];

const ORBITAL_CAPACITIES = { s: 2, p: 6, d: 10, f: 14 };

/**
 * Calculates electron configuration based on Atomic Number
 */
export const getElectronConfiguration = (atomicNumber) => {
  let electrons = atomicNumber;
  const config = [];

  for (const orbital of ORBITAL_ORDER) {
    if (electrons <= 0) break;
    
    const type = orbital.charAt(1); // 's', 'p', 'd', 'f'
    const capacity = ORBITAL_CAPACITIES[type];
    const count = Math.min(electrons, capacity);
    
    config.push({
      label: orbital,
      n: parseInt(orbital.charAt(0)), // Principal quantum number (Shell)
      type: type,
      count: count,
      capacity: capacity
    });
    
    electrons -= count;
  }
  return config;
};

/**
 * Calculates Bond Type based on Electronegativity Difference
 */
export const calculateBondType = (elem1, elem2) => {
  // Use mock values if data missing for now
  const en1 = elem1.electronegativity || 2.1; 
  const en2 = elem2.electronegativity || 2.1;
  
  const diff = Math.abs(en1 - en2);
  
  let type = "Nonpolar Covalent";
  let color = "#00ff00"; // Green

  if (diff > 1.7) {
    type = "Ionic";
    color = "#ff0055"; // Red
  } else if (diff >= 0.4 && diff <= 1.7) {
    type = "Polar Covalent";
    color = "#bc13fe"; // Purple
  }

  return { type, diff: diff.toFixed(2), color };
};

/**
 * Calculates Effective Nuclear Charge (Zeff)
 * Simplified Slater's Rule for visualization
 */
export const calculateZeff = (protons, electrons) => {
  const shells = [2, 8, 18, 32];
  let remaining = electrons;
  let shielding = 0;
  
  for(let i=0; i<shells.length; i++) {
    if(remaining <= 0) break;
    const count = Math.min(remaining, shells[i]);
    const isValence = count === remaining; // If this is the last shell being filled
    
    // Core electrons shield 0.85, Valence shield 0.35
    shielding += isValence ? (count - 1) * 0.35 : count * 0.85;
    remaining -= count;
  }
  
  return (protons - shielding).toFixed(2);
};
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLORS = {
  red: '#EA4335',    // Protons
  blue: '#4285F4',   // Neutrons
  yellow: '#FBBC04', // Electrons
  ring: '#DADCE0',   // Shells
};

// --- ELECTRON COMPONENT ---
// Positions the electron on the ring based on an index and total count
const Electron = ({ radius, speed, angleOffset }) => {
  const ref = useRef();
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + angleOffset;
    ref.current.position.x = radius * Math.cos(t);
    ref.current.position.z = radius * Math.sin(t);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.15, 32, 32]} />
      <meshStandardMaterial color={COLORS.yellow} emissive={COLORS.yellow} emissiveIntensity={0.5} />
    </mesh>
  );
};

// --- ORBITAL SHELL COMPONENT ---
const OrbitalShell = ({ radius, speed, electronCount, is3D, rotationOffset }) => {
  const groupRef = useRef();

  useFrame(() => {
    if (!groupRef.current) return;
    const targetRot = is3D ? rotationOffset : [0, 0, 0];
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRot[0], 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot[1], 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRot[2], 0.05);
  });

  // Calculate positions for each electron so they are evenly spaced
  const electrons = useMemo(() => {
    return Array.from({ length: electronCount }).map((_, i) => (
      <Electron 
        key={i} 
        radius={radius} 
        speed={speed} 
        angleOffset={(i / electronCount) * Math.PI * 2} 
      />
    ));
  }, [electronCount, radius, speed]);

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.015, 16, 100]} />
        <meshBasicMaterial color={COLORS.ring} transparent opacity={0.3} />
      </mesh>
      {electrons}
    </group>
  );
};

// --- MAIN ATOM COMPONENT ---
const Atom3D = ({ atomicNumber = 6 }) => {
  const [is3D, setIs3D] = useState(false);
  const groupRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => setIs3D(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // --- NUCLEUS LOGIC ---
  const nucleusParticles = useMemo(() => {
    const particles = [];
    const protons = atomicNumber;
    const neutrons = Math.ceil(atomicNumber * 1.1); // Simple approximation for stability
    const total = protons + neutrons;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < total; i++) {
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / total);
      const r = 0.4 * Math.pow(total, 0.3); // Scale nucleus size with particle count

      particles.push({
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ],
        color: i < protons ? COLORS.red : COLORS.blue
      });
    }
    return particles;
  }, [atomicNumber]);

  // --- SHELL LOGIC (Bohr Model: 2n^2) ---
  const shellsData = useMemo(() => {
    const data = [];
    let remainingElectrons = atomicNumber;
    let n = 1;

    while (remainingElectrons > 0) {
      const capacity = 2 * Math.pow(n, 1); // For visual clarity, we use simplified shells
      // Note: Real Bohr shells follow 2, 8, 18, but for visualization 
      // simple shell distribution works better.
      const electronsInThisShell = Math.min(remainingElectrons, n === 1 ? 2 : 8); 
      
      data.push({
        radius: n * 2.2,
        electronCount: electronsInThisShell,
        speed: 1 / n,
        rotationOffset: [Math.random() * Math.PI, Math.random() * Math.PI, 0]
      });

      remainingElectrons -= electronsInThisShell;
      n++;
    }
    return data;
  }, [atomicNumber]);

  return (
    <group ref={groupRef}>
      {/* NUCLEUS */}
      <group>
        {nucleusParticles.map((p, i) => (
          <mesh key={i} position={p.pos}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={p.color} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* SHELLS & ELECTRONS */}
      {shellsData.map((shell, i) => (
        <OrbitalShell 
          key={i}
          radius={shell.radius}
          speed={shell.speed}
          electronCount={shell.electronCount}
          is3D={is3D}
          rotationOffset={shell.rotationOffset}
        />
      ))}
    </group>
  );
};

export default Atom3D;
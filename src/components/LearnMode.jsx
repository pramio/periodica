// src/components/LearnMode.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Html, Trail, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

// --- SHARED UTILS ---
const ATOM_COLORS = {
  H: '#FFFFFF',  // White
  O: '#FF0000',  // Red
  Na: '#AB5CF2', // Purple (Sodium)
  Cl: '#00FF00', // Green
  Fe: '#FFA500', // Orange
  Cu: '#B87333', // Copper
  Zn: '#A0A0A0', // Grey
  C: '#333333',  // Black
};

// --- 3D VISUAL COMPONENTS ---

// 1. GLOWING ATOM SPHERE
const Atom = ({ symbol, position, size = 1, charge = 0, label = true }) => {
  const color = ATOM_COLORS[symbol] || '#FFF';
  
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        {/* Core */}
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.2} 
            metalness={0.5} 
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Glass Shell (Electron Cloud) */}
        <mesh>
          <sphereGeometry args={[size * 1.2, 32, 32]} />
          <meshPhysicalMaterial 
            color={color} 
            transparent 
            opacity={0.15} 
            roughness={0} 
            transmission={0.9} 
            thickness={1}
          />
        </mesh>

        {/* Label */}
        {label && (
          <Html position={[0, size + 0.5, 0]} center>
            <div style={{
              fontFamily: 'Orbitron', color: 'white', fontWeight: 'bold', 
              textShadow: '0 0 5px black', background: 'rgba(0,0,0,0.5)', 
              padding: '2px 5px', borderRadius: '4px', fontSize: '0.8rem'
            }}>
              {symbol}{charge !== 0 ? (charge > 0 ? `+${charge}` : charge) : ''}
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

// 2. ELECTRON PARTICLE (With Trail)
const Electron = ({ position, color = '#FFFF00' }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
      <pointLight distance={1} intensity={2} color={color} />
      <Trail width={0.8} length={6} color={color} attenuation={(t) => t * t} />
    </mesh>
  );
};

// 3. BOND CONNECTION (Glowing Line)
const Bond = ({ start, end, type = 'single' }) => {
  return (
    <Line 
      points={[start, end]} 
      color="white" 
      lineWidth={type === 'double' ? 4 : 2} 
      transparent 
      opacity={0.5} 
    />
  );
};

// --- MODULE 1: QUANTUM BUILDER (Streamlined) ---
const QuantumBuilder = () => {
  const [protons, setProtons] = useState(1);
  const [electrons, setElectrons] = useState(1);
  
  // Physics (Visual Scale)
  const zEff = Math.max(0.5, protons - (Math.max(0, electrons - 1) * 0.85));
  const radius = Math.max(0.5, (4 / zEff));

  const filledOrbitals = useMemo(() => {
    let eRem = electrons;
    const config = [];
    ['1s', '2s', '2p', '3s', '3p'].forEach(orb => {
      if (eRem <= 0) return;
      const type = orb.charAt(1);
      const cap = (type === 's' ? 2 : 6);
      const count = Math.min(eRem, cap);
      config.push({ label: orb, count, type });
      eRem -= count;
    });
    return config;
  }, [electrons]);

  return (
    <div className="builder-layout fade-in">
      <div className="panel-left">
        <h3 style={{color:'var(--neon-blue)', margin:0}}>ATOM CREATOR</h3>
        <div style={{marginTop:20}}>
           <label>Protons (Z): <span style={{color:'red'}}>{protons}</span></label>
           <input type="range" min="1" max="18" style={{width:'100%'}} value={protons} onChange={(e)=>setProtons(parseInt(e.target.value))} />
        </div>
        <div style={{marginTop:20}}>
           <label>Electrons: <span style={{color:'cyan'}}>{electrons}</span></label>
           <div style={{display:'flex', gap:10}}>
             <button className="orb-btn" onClick={()=>setElectrons(e => Math.max(0, e-1))}>-</button>
             <button className="orb-btn" onClick={()=>setElectrons(e => e+1)}>+</button>
           </div>
        </div>
        <div style={{marginTop:'auto', padding:10, background:'rgba(255,255,255,0.05)', borderRadius:5}}>
           <small>Effective Charge: {zEff.toFixed(2)}</small><br/>
           <small>Atomic Radius: {radius.toFixed(2)} Å</small>
        </div>
      </div>

      <div style={{position:'relative', width:'100%', height:'100%'}}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <ambientLight intensity={0.5} /><pointLight position={[10, 10, 10]} intensity={1} /><OrbitControls enablePan={false} />
          
          <Sphere args={[0.2 + (protons*0.05), 16, 16]}><meshStandardMaterial color="#ff3333" emissive="#550000" /></Sphere>
          
          <group>
             {filledOrbitals.map((orb, i) => (
                <group key={orb.label} rotation={[Math.random(), Math.random(), 0]}>
                   {/* Simplified Orbital Visuals */}
                   {orb.type === 's' ? (
                     <mesh>
                       <sphereGeometry args={[radius * (1 + i*0.4), 32, 32]} />
                       <meshStandardMaterial color="#ff0055" transparent opacity={0.15} depthWrite={false} />
                     </mesh>
                   ) : (
                     <group>
                       <mesh position={[radius*(1+i*0.4), 0, 0]}><sphereGeometry args={[radius*0.5, 32, 32]} /><meshStandardMaterial color="#00f3ff" transparent opacity={0.15} depthWrite={false} /></mesh>
                       <mesh position={[-radius*(1+i*0.4), 0, 0]}><sphereGeometry args={[radius*0.5, 32, 32]} /><meshStandardMaterial color="#00f3ff" transparent opacity={0.15} depthWrite={false} /></mesh>
                     </group>
                   )}
                   {Array.from({length: orb.count}).map((_, j) => (
                      <Electron key={j} position={[radius * (1 + i*0.4) * Math.cos(j), radius * (1 + i*0.4) * Math.sin(j), 0]} />
                   ))}
                </group>
             ))}
          </group>
        </Canvas>
      </div>

      <div className="panel-right">
         <h3 style={{color:'var(--neon-green)'}}>CONFIG</h3>
         {filledOrbitals.map(orb => (
           <div key={orb.label} className="orbital-row">
             <div className="orb-label">{orb.label}</div>
             <div className="orb-box" style={{width:'auto', padding:'0 8px'}}>{orb.count}e⁻</div>
           </div>
         ))}
      </div>
    </div>
  );
};

// --- MODULE 2: REACTION LAB (THE UPGRADE) ---
const ReactionLab = () => {
  const [activeReaction, setActiveReaction] = useState(null);
  const [step, setStep] = useState(0); // Animation progress 0.0 to 1.0
  const [description, setDescription] = useState("Select a reaction type to begin.");

  // --- 3D SCENE LOGIC ---
  const Scene = () => {
    const groupRef = useRef();
    
    useFrame((state) => {
      const t = state.clock.getElapsedTime();
      
      // IONIC BOND (Na + Cl)
      if (activeReaction === 'ionic') {
        if (!groupRef.current) return;
        const na = groupRef.current.children[0];
        const cl = groupRef.current.children[1];
        const electron = groupRef.current.children[2];

        // Step 1: Approach
        const dist = 3;
        na.position.x = THREE.MathUtils.lerp(-4, -1.2, step);
        cl.position.x = THREE.MathUtils.lerp(4, 1.2, step);

        // Step 2: Electron Transfer (at step > 0.5)
        if (step > 0.5) {
          const transferProgress = (step - 0.5) * 2; // 0 to 1
          electron.position.x = THREE.MathUtils.lerp(-1.2 + 0.8, 1.2 - 0.8, transferProgress);
          electron.position.y = Math.sin(transferProgress * Math.PI) * 1.5; // Arc
          
          // Na shrinks, Cl grows
          na.scale.setScalar(1 - (transferProgress * 0.2));
          cl.scale.setScalar(1 + (transferProgress * 0.2));
        } else {
          // Reset electron to orbit Na
          electron.position.x = na.position.x + Math.cos(t*5)*0.8;
          electron.position.y = na.position.y + Math.sin(t*5)*0.8;
        }
      }

      // COVALENT BOND (H + H)
      if (activeReaction === 'covalent') {
        const h1 = groupRef.current.children[0];
        const h2 = groupRef.current.children[1];
        
        // Approach
        h1.position.x = THREE.MathUtils.lerp(-3, -0.6, step);
        h2.position.x = THREE.MathUtils.lerp(3, 0.6, step);
        
        // Electrons Figure-8
        if (step > 0.8) {
           const e1 = groupRef.current.children[2];
           const e2 = groupRef.current.children[3];
           // Figure 8 math
           e1.position.x = Math.cos(t*3) * 1.2;
           e1.position.y = Math.sin(t*6) * 0.5;
           e2.position.x = Math.cos(t*3 + Math.PI) * 1.2;
           e2.position.y = Math.sin(t*6 + Math.PI) * 0.5;
        }
      }

      // SYNTHESIS (2H2 + O2 -> 2H2O)
      if (activeReaction === 'synthesis') {
         // Simplified visual: 2 H and 1 O collide
         const h1 = groupRef.current.children[0];
         const h2 = groupRef.current.children[1];
         const o = groupRef.current.children[2];

         // Approach O
         h1.position.x = THREE.MathUtils.lerp(-3, -0.8, step);
         h1.position.y = THREE.MathUtils.lerp(1, -0.5, step);
         
         h2.position.x = THREE.MathUtils.lerp(3, 0.8, step);
         h2.position.y = THREE.MathUtils.lerp(1, -0.5, step);
         
         o.position.y = THREE.MathUtils.lerp(-1, 0.5, step);
         
         // Vibrate on impact
         if(step > 0.9) {
            o.position.x = Math.sin(t*20)*0.05;
         }
      }
      
      // SINGLE DISPLACEMENT (Zn + CuCl2 -> ZnCl2 + Cu)
      // Visual: A + BC -> AC + B
      if (activeReaction === 'displacement') {
         const a = groupRef.current.children[0]; // Zn (Grey)
         const b = groupRef.current.children[1]; // Cu (Orange)
         const c = groupRef.current.children[2]; // Cl (Green)

         // Start: B and C attached
         // End: A and C attached, B pushed away
         
         // A approaches
         a.position.x = THREE.MathUtils.lerp(-4, -1, Math.min(step * 2, 1));
         
         // Swap happens at step 0.5
         if (step > 0.5) {
            const swapP = (step - 0.5) * 2;
            b.position.x = THREE.MathUtils.lerp(1, 4, swapP); // B leaves
            c.position.x = THREE.MathUtils.lerp(1, -0.2, swapP); // C moves to A
         } else {
            b.position.x = 1;
            c.position.x = 1.8;
         }
      }
    });

    return (
      <group ref={groupRef}>
        {activeReaction === 'ionic' && (
          <>
            <Atom symbol="Na" position={[-4, 0, 0]} size={1.2} />
            <Atom symbol="Cl" position={[4, 0, 0]} size={1.0} />
            <Electron position={[-3,0,0]} color="#FFFF00" />
          </>
        )}
        {activeReaction === 'covalent' && (
          <>
            <Atom symbol="H" position={[-3, 0, 0]} size={0.8} />
            <Atom symbol="H" position={[3, 0, 0]} size={0.8} />
            <Electron position={[-3,0.5,0]} color="cyan" />
            <Electron position={[3,-0.5,0]} color="cyan" />
          </>
        )}
        {activeReaction === 'synthesis' && (
          <>
            <Atom symbol="H" position={[-3, 1, 0]} size={0.6} />
            <Atom symbol="H" position={[3, 1, 0]} size={0.6} />
            <Atom symbol="O" position={[0, -1, 0]} size={1.2} />
          </>
        )}
        {activeReaction === 'displacement' && (
          <>
            <Atom symbol="Zn" position={[-4, 0, 0]} size={1.1} label /> {/* A */}
            <Atom symbol="Cu" position={[1, 0, 0]} size={1.1} label />  {/* B */}
            <Atom symbol="Cl" position={[1.8, 0, 0]} size={0.8} label={false} />  {/* C */}
          </>
        )}
      </group>
    );
  };

  // --- CONTROLS ---
  const triggerReaction = (type) => {
    setActiveReaction(type);
    setStep(0);
    // Animation Loop
    let p = 0;
    const interval = setInterval(() => {
      p += 0.01;
      if(p >= 1) {
        p = 1;
        clearInterval(interval);
      }
      setStep(p);
    }, 20); // 2 seconds duration
    
    // Set Descriptions
    if(type==='ionic') setDescription("Ionic Bond: Electron transfer creates electrostatic attraction.");
    if(type==='covalent') setDescription("Covalent Bond: Atoms share electrons to fill valence shells.");
    if(type==='synthesis') setDescription("Synthesis: 2H₂ + O₂ → 2H₂O. Multiple reactants combine.");
    if(type==='displacement') setDescription("Single Displacement: Zn + CuCl₂ → ZnCl₂ + Cu. More reactive metal displaces less reactive one.");
  };

  return (
    <div className="builder-layout fade-in">
      <div className="panel-left">
        <h3 style={{color:'var(--neon-purple)', margin:0}}>REACTION LAB</h3>
        
        <h4 style={{marginTop:20, color:'#aaa'}}>BONDING TYPES</h4>
        <button className="mix-btn" style={{width:'100%', marginBottom:10}} onClick={()=>triggerReaction('ionic')}>Ionic (Transfer)</button>
        <button className="mix-btn" style={{width:'100%', marginBottom:10, background:'var(--neon-blue)', color:'black'}} onClick={()=>triggerReaction('covalent')}>Covalent (Share)</button>
        
        <h4 style={{marginTop:20, color:'#aaa'}}>REACTION TYPES</h4>
        <button className="orb-btn" style={{width:'100%', marginBottom:5, textAlign:'left'}} onClick={()=>triggerReaction('synthesis')}>Synthesis (A+B→AB)</button>
        <button className="orb-btn" style={{width:'100%', marginBottom:5, textAlign:'left'}} onClick={()=>triggerReaction('displacement')}>Single Displacement</button>
        
        <div style={{marginTop: 30, padding: 15, background: 'rgba(255,255,255,0.1)', borderRadius: 10}}>
           <h4 style={{margin:0, color:'var(--neon-green)'}}>Observation Log:</h4>
           <p style={{fontSize:'0.9rem', lineHeight: 1.4}}>{description}</p>
        </div>
      </div>

      <div style={{position:'relative', width:'100%', height:'100%'}}>
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
           <ambientLight intensity={0.5} />
           <pointLight position={[10, 10, 10]} intensity={1} />
           <OrbitControls enablePan={false} />
           <Scene />
        </Canvas>
        
        {/* Progress Bar */}
        <div style={{position:'absolute', bottom: 20, left:'10%', width:'80%', height: 4, background:'#333', borderRadius:2}}>
           <div style={{width: `${step*100}%`, height:'100%', background:'var(--neon-green)', boxShadow:'0 0 10px var(--neon-green)'}} />
        </div>
      </div>

      <div className="panel-right">
         <h3>ENERGY PROFILE</h3>
         <div style={{height: 200, width: '100%', borderLeft:'2px solid #555', borderBottom:'2px solid #555', position:'relative', display:'flex', alignItems:'flex-end'}}>
             {/* Dynamic Energy Graph Visualization */}
             <svg width="100%" height="100%" style={{overflow:'visible'}}>
                <path 
                  d="M0,150 Q100,50 200,180" 
                  fill="none" 
                  stroke={activeReaction ? "var(--neon-purple)" : "#333"} 
                  strokeWidth="3" 
                  strokeDasharray="5"
                />
                {/* Active Dot */}
                {activeReaction && (
                   <circle cx={step * 200} cy={
                      // Simple parabola math for visual
                      step < 0.5 ? 150 - (step*200) : 50 + ((step-0.5)*260)
                   } r="5" fill="white" />
                )}
             </svg>
         </div>
         <p style={{fontSize:'0.8rem', color:'#aaa', marginTop:10}}>
            Reaction Progress (Exothermic) 

[Image of exothermic reaction energy diagram]

         </p>
      </div>
    </div>
  );
};

// --- MAIN CONTAINER ---
const LearnMode = ({ onExit }) => {
  const [mode, setMode] = useState('builder'); 

  return (
    <div className="academy-container">
       <div className="academy-nav">
          <button className={`mode-btn ${mode==='builder'?'active':''}`} onClick={()=>setMode('builder')}>Quantum Builder</button>
          <button className={`mode-btn ${mode==='reaction'?'active':''}`} onClick={()=>setMode('reaction')}>Reaction Lab</button>
          <button className="mode-btn" onClick={onExit} style={{marginLeft:'auto', borderColor:'red', color:'red'}}>EXIT</button>
       </div>
       <div style={{flexGrow:1, position:'relative'}}>
          {mode === 'builder' ? <QuantumBuilder /> : <ReactionLab />}
       </div>
    </div>
  );
};

export default LearnMode;
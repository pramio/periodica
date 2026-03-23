// src/components/TrendsGame.jsx
import React, { useState, useEffect } from 'react';
import { Reorder, motion } from 'framer-motion';
import { periodicData } from '../data/elements';

// Game Rules Configuration
const TRENDS = [
  {
    id: 'number',
    label: 'Atomic Number',
    instruction: 'Arrange from LOWEST (Top) to HIGHEST (Bottom)',
    getValue: (el) => el.number, // Simple sort by ID
  },
  {
    id: 'mass',
    label: 'Atomic Mass',
    instruction: 'Arrange from LIGHTEST (Top) to HEAVIEST (Bottom)',
    getValue: (el) => parseFloat(el.mass),
  }
];

const TrendsGame = ({ onExit }) => {
  const [items, setItems] = useState([]);
  const [currentTrend, setCurrentTrend] = useState(TRENDS[0]); 
  const [status, setStatus] = useState('playing'); // 'playing', 'success', 'wrong'
  const [level, setLevel] = useState(1);

  // Initialize Game on Load or Level Change
  useEffect(() => {
    startNewLevel();
  }, [level]);

  const startNewLevel = () => {
    setStatus('playing');
    
    // 1. Pick a Random Trend Rule
    const randomTrend = TRENDS[Math.floor(Math.random() * TRENDS.length)];
    setCurrentTrend(randomTrend);

    // 2. Pick 4 Random Elements
    const shuffled = [...periodicData].sort(() => 0.5 - Math.random());
    const selection = shuffled.slice(0, 4);
    
    setItems(selection);
  };

  const handleCheck = () => {
    // 1. Extract the values in the current order shown on screen
    const currentValues = items.map(item => currentTrend.getValue(item));
    
    // 2. Mathematically sort them correctly
    const correctSorted = [...currentValues].sort((a, b) => a - b);

    // 3. Compare (Convert to string to check equality)
    const isCorrect = JSON.stringify(currentValues) === JSON.stringify(correctSorted);

    if (isCorrect) {
      setStatus('success');
      setTimeout(() => {
        setLevel(l => l + 1); // Next Level after delay
      }, 1500);
    } else {
      setStatus('wrong');
      // Reset status to 'playing' after shake animation finishes (0.5s)
      setTimeout(() => setStatus('playing'), 800); 
    }
  };

  return (
    <div className="quiz-container" style={{maxWidth: '500px'}}>
      
      {/* Header HUD */}
      <div className="hud">
        <span>Level {level}</span>
        <button className="exit-btn" onClick={onExit}>✕</button>
      </div>

      {/* Instructions */}
      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <h2 style={{color: 'var(--neon-blue)', margin: '0 0 10px 0', fontSize: '1.5rem'}}>
          {currentTrend.label}
        </h2>
        <p style={{color: '#aaa', margin: 0, fontSize: '0.9rem'}}>
          {currentTrend.instruction}
        </p>
      </div>

      {/* Draggable List Area */}
      <Reorder.Group 
        axis="y" 
        values={items} 
        onReorder={setItems} 
        style={{listStyle: 'none', padding: 0}}
      >
        {items.map((item) => (
          <Reorder.Item key={item.number} value={item} style={{marginBottom: '10px'}}>
            <div className={`element-strip ${status === 'wrong' ? 'shake' : ''} ${status === 'success' ? 'glow-green' : ''}`}>
              
              <div className="strip-left">
                <span className="strip-symbol">{item.symbol}</span>
                <span className="strip-name">{item.name}</span>
              </div>
              
              <div className="strip-right">
                <span style={{fontSize: '0.8rem', color: '#666', marginRight: '10px'}}>
                  {/* CHEAT MODE: Uncomment line below to see values for debugging */}
                  {/* {currentTrend.getValue(item)} */}
                </span>
                ≡
              </div>

            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Submit Button Area */}
      <div style={{marginTop: '30px', textAlign: 'center', height: '60px'}}>
        {status === 'success' ? (
          <motion.div initial={{scale: 0}} animate={{scale: 1}} className="success-msg">
            🎉 PERFECT!
          </motion.div>
        ) : (
          <button 
            className="action-btn" 
            onClick={handleCheck}
            disabled={status === 'wrong'} // Prevent double clicking while shaking
          >
            {status === 'wrong' ? '❌ TRY AGAIN' : '✅ CHECK ORDER'}
          </button>
        )}
      </div>

    </div>
  );
};

export default TrendsGame;
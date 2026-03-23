// src/components/SplashScreen.jsx
import React, { useEffect, useState } from 'react';
import '../styles/global.css'; // Ensure we can access global styles

const SplashScreen = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Wait 2.5 seconds, then fade out
    setTimeout(() => setFade(true), 2500);
    
    // Wait 3 seconds, then tell App to unmount this component
    setTimeout(onFinish, 3000);
  }, [onFinish]);

  return (
    <div className={`splash-container ${fade ? 'fade-out' : ''}`}>
      <div className="atom-loader">
        <div className="electron e1"></div>
        <div className="electron e2"></div>
        <div className="electron e3"></div>
        <div className="nucleus"></div>
      </div>
      
      <h1 className="splash-title">PERIODICA</h1>
      <p className="splash-subtitle">Initializing Lab Environment...</p>
    </div>
  );
};

export default SplashScreen;
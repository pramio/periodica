// src/hooks/useSound.js
import { useCallback } from 'react';

export const useSound = () => {
  const playSound = useCallback((type) => {
    let audio;
    if (type === 'click') audio = new Audio('/click.mp3'); 
    // In a real app, use relative paths or imports
    if (type === 'correct') audio = new Audio('/correct.mp3');
    if (type === 'wrong') audio = new Audio('/wrong.mp3');
    
    if (audio) {
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked", e));
    }
  }, []);

  return playSound;
};
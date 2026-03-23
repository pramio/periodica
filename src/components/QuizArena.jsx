// src/components/QuizArena.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { periodicData } from '../data/elements';

// Utility: Shuffle an array (Fisher-Yates)
const shuffleArray = (array) => {
  return [...array].sort(() => Math.random() - 0.5);
};

// 1. Logic to Generate a Random Question
const generateQuestion = () => {
  // Pick a random element as the correct answer
  const correctElement = periodicData[Math.floor(Math.random() * periodicData.length)];
  
  // Decide Question Type randomly
  const types = ['symbol_to_name', 'name_to_symbol', 'atomic_number'];
  const type = types[Math.floor(Math.random() * types.length)];

  let questionText = "";
  let correctAnswer = "";

  // Formulate the question
  switch (type) {
    case 'symbol_to_name':
      questionText = `What is the name of the element with symbol "${correctElement.symbol}"?`;
      correctAnswer = correctElement.name;
      break;
    case 'name_to_symbol':
      questionText = `Which symbol represents ${correctElement.name}?`;
      correctAnswer = correctElement.symbol;
      break;
    case 'atomic_number':
      questionText = `What is the atomic number of ${correctElement.name}?`;
      correctAnswer = correctElement.number.toString();
      break;
    default:
      break;
  }

  // Generate Distractors (Wrong Answers)
  const distractors = shuffleArray(periodicData)
    .filter(e => e.number !== correctElement.number) // Remove correct answer
    .slice(0, 3) // Take 3 wrong ones
    .map(e => type === 'symbol_to_name' ? e.name : type === 'name_to_symbol' ? e.symbol : e.number.toString());

  const options = shuffleArray([correctAnswer, ...distractors]);

  return { questionText, options, correctAnswer, type, correctElement };
};

const QuizArena = ({ onExit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); // null, true, or false
  const [streak, setStreak] = useState(0);

  // Load first question
  useEffect(() => {
    loadNewQuestion();
  }, []);

  const loadNewQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setCurrentQuestion(generateQuestion());
  };

  const handleOptionClick = (option) => {
    if (selectedOption) return; // Prevent double clicking

    setSelectedOption(option);
    
    if (option === currentQuestion.correctAnswer) {
      // Correct!
      setIsCorrect(true);
      setScore(score + 100 + (streak * 10)); // Bonus for streaks
      setStreak(streak + 1);
      setTimeout(loadNewQuestion, 1500); // Auto-advance
    } else {
      // Wrong!
      setIsCorrect(false);
      setLives(lives - 1);
      setStreak(0);
      setTimeout(loadNewQuestion, 2000); // Wait longer to show correct answer
    }
  };

  // Game Over Screen
  if (lives === 0) {
    return (
      <div className="quiz-container game-over">
        <h1 className="neon-text">GAME OVER</h1>
        <div className="score-board">
          <h2>Final Score: {score}</h2>
          <p>Highest Streak: {streak}</p>
        </div>
        <button className="action-btn" onClick={() => { setLives(3); setScore(0); loadNewQuestion(); }}>
          Try Again
        </button>
        <button className="secondary-btn" onClick={onExit}>
          Return to Lab
        </button>
      </div>
    );
  }

  if (!currentQuestion) return <div>Loading Reactor...</div>;

  return (
    <div className="quiz-container">
      {/* Top HUD */}
      <div className="hud">
        <div className="life-bar">❤️ x {lives}</div>
        <div className="score">SCORE: {score}</div>
        <button className="exit-btn" onClick={onExit}>✕</button>
      </div>

      {/* Progress/Streak */}
      {streak > 2 && <div className="streak-flame">🔥 {streak} Streak!</div>}

      {/* Question Card */}
      <div className="question-card">
        <h2>{currentQuestion.questionText}</h2>
      </div>

      {/* Options Grid */}
      <div className="options-grid">
        {currentQuestion.options.map((option, index) => {
          let btnClass = "option-btn";
          if (selectedOption) {
            if (option === currentQuestion.correctAnswer) btnClass += " correct";
            if (option === selectedOption && option !== currentQuestion.correctAnswer) btnClass += " wrong";
          }
          
          return (
            <button 
              key={index} 
              className={btnClass} 
              onClick={() => handleOptionClick(option)}
              disabled={!!selectedOption}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizArena;
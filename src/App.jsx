// src/App.jsx
import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber'; 
import { OrbitControls } from '@react-three/drei'; 
import './styles/global.css';
import './styles/quiz.css';
import { periodicData } from './data/elements';
import QuizArena from './components/QuizArena';
import TrendsGame from './components/TrendsGame';
import Atom3D from './components/Atom3D'; 
import SplashScreen from './components/SplashScreen';
import LearnMode from './components/LearnMode'; // IMPORT LEARN COMPONENT

// --- CONFIGURATION: Detailed Filter Options ---
const FILTER_OPTIONS = [
  { label: 'All', key: 'all' },
  { label: 'Alkali Metals', key: 'alkali-metal' },
  { label: 'Alkaline Earth', key: 'alkaline-earth' },
  { label: 'Transition Metals', key: 'transition' },
  { label: 'Post-transition', key: 'post-transition' },
  { label: 'Metalloids', key: 'metalloid' },
  { label: 'Reactive Nonmetals', key: 'nonmetal' },
  { label: 'Noble Gases', key: 'noble-gas' },
  { label: 'Lanthanides', key: 'lanthanide' },
  { label: 'Actinides', key: 'actinide' },
  { label: 'Unknown Properties', key: 'unknown' },
];

// --- SOUND HOOK ---
const useSound = () => {
  const playClick = () => {
    const audio = new Audio('/click.mp3'); 
    audio.volume = 0.3;
    audio.play().catch(() => {}); 
  };
  return { playClick };
};

// 1. Element Card Component
const ElementCard = ({ element, onClick, isDimmed, onHover }) => {
  const style = { gridColumn: element.xpos, gridRow: element.ypos };

  return (
    <div 
      className={`element-card ${element.category} ${isDimmed ? 'dimmed' : ''}`} 
      style={style}
      onClick={() => !isDimmed && onClick(element)}
      onMouseEnter={!isDimmed ? onHover : undefined}
    >
      <span className="number">{element.number}</span>
      <span className="symbol">{element.symbol}</span>
      <span className="name">{element.name}</span>
    </div>
  );
};

// 2. Element Modal Component
const ElementModal = ({ element, onClose }) => {
  if (!element) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div>
            <h1 style={{margin:0}}>
              {element.name} 
              <span style={{fontSize:'0.5em', color:'#666', marginLeft: '10px'}}>
                #{element.number}
              </span>
            </h1>
            <span style={{color: '#aaa', fontSize: '1.2rem'}}>{element.bengaliName}</span>
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {/* 3D Atom Viewer */}
        <div style={{ 
            height: '350px', 
            marginBottom: '20px', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '15px', 
            position: 'relative',
            background: '#050505', 
            overflow: 'hidden'
        }}>
             <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Atom3D atomicNumber={element.number} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.0} />
             </Canvas>

             <p style={{
                 textAlign: 'center', 
                 fontSize: '0.7rem', 
                 color: 'rgba(255,255,255,0.5)', 
                 position: 'absolute', 
                 bottom: '10px', 
                 width: '100%', 
                 margin: 0, 
                 pointerEvents: 'none'
             }}>
               👆 Drag to Rotate
             </p>
        </div>

        {/* Data Grid */}
        <div className="data-grid">
          <div className="data-item"><strong>Atomic Mass</strong>{element.mass} u</div>
          <div className="data-item"><strong>Electron Config</strong>{element.config}</div>
          <div className="data-item"><strong>Block</strong>{element.block}-block</div>
          <div className="data-item"><strong>Group</strong>{element.group}</div>
        </div>
        
        {/* Summary Box */}
        <div style={{marginTop: '20px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px'}}>
          <strong>🔬 Quick Fact:</strong>
          <p style={{margin: '5px 0 0 0', lineHeight: '1.5'}}>{element.summary}</p>
        </div>
      </div>
    </div>
  );
};

// 3. Main App Component
const App = () => {
  const [loading, setLoading] = useState(true); 
  const [view, setView] = useState('table'); 
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const { playClick } = useSound();

  // --- FILTERING LOGIC ---
  const filteredElements = useMemo(() => {
    return periodicData.map((el) => {
      let isVisible = true;

      // 1. Search Logic
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = el.name.toLowerCase().includes(q);
        const matchesSymbol = el.symbol.toLowerCase().includes(q);
        const matchesNumber = el.number.toString().startsWith(q);
        const matchesBengali = el.bengaliName && el.bengaliName.includes(q);
        
        if (!matchesName && !matchesSymbol && !matchesNumber && !matchesBengali) {
          isVisible = false;
        }
      }

      // 2. Filter Logic
      if (isVisible && activeFilter !== 'all') {
        if (el.category !== activeFilter) {
            // Note: Ensure your elements.js data 'category' matches these keys exactly
            isVisible = false;
        }
      }

      return { ...el, isVisible };
    });
  }, [searchQuery, activeFilter]);

  // Handlers
  const handleElementClick = (el) => {
    playClick();
    setSelectedElement(el);
  };

  const handleNavClick = (newView) => {
    playClick();
    setView(newView);
    if (newView !== 'table') setSelectedElement(null);
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <div className="app-container">
      {/* --- TOP HEADER --- */}
      <header className="main-header">
        {/* Left Side: Logo & Navigation */}
        <div className="header-left">
          <h1 className="logo-text">PERIODICA</h1>
          
          <div className="nav-controls">
            <button className={`nav-btn ${view === 'table' ? 'active' : ''}`} onClick={() => handleNavClick('table')}>🧪 Lab</button>
            <button className={`nav-btn ${view === 'quiz' ? 'active' : ''}`} onClick={() => handleNavClick('quiz')}>🎮 Quiz</button>
            <button className={`nav-btn ${view === 'trends' ? 'active' : ''}`} onClick={() => handleNavClick('trends')}>📈 Trends</button>
            {/* NEW LEARN BUTTON */}
            <button className={`nav-btn ${view === 'learn' ? 'active' : ''}`} onClick={() => handleNavClick('learn')}>🎓 Learn</button>
          </div>
        </div>

        {/* Right Side: Search Input (Only in Table View) */}
        {view === 'table' && (
          <input 
            type="text" 
            placeholder="🔍 Search Element..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main>
        {view === 'table' && (
          <div className="periodic-table fade-in">
            {filteredElements.map((el) => (
              <ElementCard 
                key={el.number} 
                element={el} 
                isDimmed={!el.isVisible} 
                onClick={handleElementClick}
              />
            ))}
          </div>
        )}

        {view === 'quiz' && <QuizArena onExit={() => handleNavClick('table')} />}
        {view === 'trends' && <TrendsGame onExit={() => handleNavClick('table')} />}
        {/* NEW LEARN MODE RENDER */}
        {view === 'learn' && <LearnMode onExit={() => handleNavClick('table')} />}
      </main>

      {/* --- BOTTOM FILTER BAR --- */}
      {view === 'table' && (
        <footer className="bottom-bar">
          <div className="filter-group">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`filter-btn ${activeFilter === opt.key ? 'active' : ''}`}
                onClick={() => { playClick(); setActiveFilter(opt.key); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </footer>
      )}

      {/* Detail Modal */}
      {selectedElement && view === 'table' && (
        <ElementModal 
          element={selectedElement} 
          onClose={() => setSelectedElement(null)} 
        />
      )}
    </div>
  );
};

export default App;
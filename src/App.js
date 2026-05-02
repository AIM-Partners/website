import React from 'react';
import TickerTape from './components/TickerTape';
import MainContent from './components/MainContent';
import NavBar from './components/NavBar';
// import './App.css';
import './App-AboutUs.css'
import './App-Body.css'
import './App-Projects.css'
import { Route, Routes, useLocation } from 'react-router-dom';
import AboutUs from './pages/AboutUs';
import Projects from './pages/Projects';
// import Waves from './components/Waves';
import Competition from './pages/Competition';
import { SpectatorView } from './pages/Competition';
import Admin from './math_competition/Admin';

function App() {
  const location = useLocation();
  const isSpectator = location.pathname === '/leaderboard';

  // Spectator view: full screen, no navbar
  if (isSpectator) {
    return <SpectatorView />;
  }

  return (
    <div className="App">
      <NavBar/>
      
      <Routes>
        {/* main page */}
        <Route path='/' element={
          <>
            <TickerTape/>
            <MainContent/>
          </>
          }
        />
        {/* about us page */}
        <Route path='/about-us' element={<AboutUs />}/>
        {/* join us page */}
        <Route path='/projects' element={<Projects />}/>
        <Route path='/competition' element={<Competition />}/>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}

export default App;
import React from 'react';
import TickerTape from './components/TickerTape';
import MainContent from './components/MainContent';
import NavBar from './components/NavBar';
// import './App.css';
import './App-AboutUs.css'
import './App-Body.css'
import './App-Projects.css'
import { Route, Routes } from 'react-router-dom';
import AboutUs from './pages/AboutUs';
import Projects from './pages/Projects';
// import Waves from './components/Waves';

function App() {
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
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import logo from './icons/aim_logo.svg';
import { ReactComponent as DiscordLogo } from './icons/discord_logo.svg';
import { ReactComponent as LinkedinLogo } from './icons/linkedin_logo.svg'
import TickerTape from './components/TickerTape';
import MainContent from './components/MainContent';
import './App.css';
import './App-AboutUs.css'
import './App-Body.css'
import './App-Projects.css'
import { Route, Routes, Link } from 'react-router-dom';
import AboutUs from './pages/AboutUs';
import Projects from './pages/Projects';
// import Waves from './components/Waves';

function App() {
  return (
    <div className="App">
      <nav className="top-navbar">
        <div className='top-navbar__logo'>
          <Link to='/'>
            <img src={logo} width='225' height='100' alt='Alpha Investment Management Partners logl'/>
          </Link>
        </div>
        <ul className='top-navbar__links'>
          <li><Link to="/about-us">About Us</Link></li>
          {/* <li><a href="/reports">Reports</a></li> */}
          <li><Link to="/projects">Projects</Link></li>
          <li>
            <a href='https://www.linkedin.com/company/aimpartnersuiuc/' target='_blank' rel="noopener noreferrer">
              <LinkedinLogo className='top-navbar__linkedin'/>
            </a>
          </li>
          <li>
            <a href='https://discord.gg/EMSf7pjKM6' target='_blank' rel="noopener noreferrer">
              <DiscordLogo className="top-navbar__discord"/>
            </a>
          </li>
        </ul>
      </nav>
      
      <Routes>
        {/* main page */}
        <Route path='/' element={
          <>
            <TickerTape/>
            {/* <Waves
              lineColor="#FF5F05"
              backgroundColor="rgba(255, 255, 255, 0.2)"
              waveSpeedX={0.02}
              waveSpeedY={0.01}
              waveAmpX={40}
              waveAmpY={20}
              friction={0.9}
              tension={0.01}
              maxCursorMove={120}
              xGap={12}
              yGap={36}
            /> */}
            <MainContent/>
          </>
          }
        />
        {/* about us page */}
        <Route path='/about-us' element={<AboutUs />}/>
        {/* join us page */}
        <Route path='/projects' element={<Projects />}/>
      </Routes>
      
      
      
      {/* <div className='footer-links'>
          <div className='footer-links__container'>
              <a
                href='https://www.linkedin.com/company/aimpartnersuiuc/'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-links__icon'
              >
                <LinkedinLogo/>
              </a>
              <a
                href='https://discord.gg/EMSf7pjKM6'
                target='_blank'
                rel='noopener noreferrer'
                className='footer-links__icon'
              >
                <DiscordWhiteLogo/>
              </a>
              
          </div>
      </div> */}
    </div>
    
  );
}

export default App;

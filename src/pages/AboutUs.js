import React from 'react';
import president from '../images/yunho_chang_profile.jpg';
import vice_president from '../images/jacob_lee_profile.png';
// import vp_jason from '../images/vp-jason_profile.png';
import hoi from '../images/tony_kwon_profile.jpg';
import hor from '../images/jaeho_lim_profile.jpeg';
import hos from '../images/arnav_saraogi_profile.png';
import hoo from '../images/ibrahim_aldrees_profile.png';
import logo from '../icons/aim_logo.svg';
// import hoap from '../images/no_image.png';
// import howd from '../images/howd_profile.png';
// import ProfileCard from '../components/ProfileCard'


export default function AboutUs() {
  return (
    <div className="about-us">
      <div className='about-us-main'>
        <h2>About AIM Partners</h2>
      </div>
      <div className='about-us-block'>
        <div className='about-us-logo'>
          <img src={logo} alt='aim partners logo'/>
        </div>
        <div className='about-us-detail'>
          <p>Founded in January 2020, AIM Partners is an investment management organization run by UIUC students. We comprise undergraduate and graduate students from diverse backgrounds, which enables us to take a holistic approach to our investment portfolios. </p>   

          <p>Our mission is to provide unique market insights and deliver exceptional investment returns to our members. Through AIM Partners, not only do we hope to provide both educational and practical experience for students who have a passion for investment, but also to continue our ongoing partnerships with our clients. </p>
        </div>
      </div>
      
      <div className='about-us-leaderships'>
        <h2>Leaderships</h2>
        <div className='leaderships-grid'>
          <div className='leadership-card'>
            <a
              href='https://www.linkedin.com/in/yunhoc1204'
              target='_blank'
              rel="noopener noreferrer"
            >
              <img src={president} alt='Yunho Chang'/>
            </a>
            <h3 className='leadership-name'>Yunho Chang</h3>
            <p className='leadership-position'>President</p>
          </div>

          <div className='leadership-card'>
            <a
              href='https://www.linkedin.com/in/jacob-lee-a5164734a/'
              target='_blank'
              rel="noopener noreferrer"
            >
              <img src={vice_president} alt='Jacob Lee'/>
            </a>
            <h3 className='leadership-name'>Jacob Lee</h3>
            <p className='leadership-position'>Vice President</p>
          </div>

          <div className='leadership-card'>
            <a
              href='https://www.linkedin.com/in/tonykwon02/'
              target='_blank'
              rel="noopener noreferrer"
            >
              <img src={hoi} alt='Tony Kwon'/>
            </a>
            <h3 className='leadership-name'>Tony Kwon</h3>
            <p className='leadership-position'>Head of Investment</p>
          </div>

          <div className='leadership-card'>
            <a
              href='https://www.linkedin.com/in/jaeho-lim/'
              target='_blank'
              rel="noopener noreferrer"
            >
              <img src={hor} alt='Jaeho Lim'/>
            </a>
            <h3 className='leadership-name'>Jaeho Lim</h3>
            <p className='leadership-position'>Head of Research</p>
          </div>

          <div className='leadership-card'>
            <a
              href='https://www.linkedin.com/in/arnav-saraogi/'
              target='_blank'
              rel="noopener noreferrer"
            >
              <img src={hos} alt='Arnav Saraogi'/>
            </a>
            <h3 className='leadership-name'>Arnav Saraogi</h3>
            <p className='leadership-position'>Head of Software</p>
          </div>
          <div className='leadership-card'>
            <a
              href='https://www.linkedin.com/in/ibrahim-aldrees-42a608256/'
              target='_blank'
              rel="noopener noreferrer"
            >
              <img src={hoo} alt='Ibrahim Aldrees'/>
            </a>
            <h3 className='leadership-name'>Ibrahim Aldrees</h3>
            <p className='leadership-position'>Head of Outreach</p>
          </div>
        </div>
      </div>
      <div className='contact-us'>
            <div className='contact-us-logo'>
                <img src={logo} alt='aim-logo'/>
            </div>
            <h2 className='contact-us-main'>
                Contact Us

                <div className='contact-us-main-detail'>
                    <p className='email'>aimpartnersuiuc@gmail.com</p>
                    <li className='contact-us-discord'>
                        <a href='https://discord.com/invite/EMSf7pjKM6' target='_blank' rel="noopener noreferrer">
                            Discord
                        </a>
                    </li>
                    <li className='contact-us-linkedin'>
                        <a href='https://www.linkedin.com/company/aimpartnersuiuc/' target='_blank' rel="noopener noreferrer">
                            LinkedIn
                        </a>
                    </li>
                </div>
            </h2>
        </div>
    </div>
  );
}

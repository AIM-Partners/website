import React from 'react';
import logo from '../icons/aim_logo.svg'

export default function Projects() {
  return (
    <div className="projects">
        <div className='projects-main'>
            <h2>Our Projects</h2>
        </div>
      
        <div className='projects-block'>
            <div className='projects-left'>
                <h1 className='projects-reports'>Reports</h1>

                <div className='reports-list'>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>September Monthly Report</h3>
                        <h4 className='reports-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>October Monthly Report</h3>
                        <h4 className='reports-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>November Monthly Report</h3>
                        <h4 className='reports-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>December Monthly Report</h3>
                        <h4 className='reports-item-detail'>To Be Posted</h4>
                    </div>
                    
                </div>
            </div>

            <div className='projects-right'>
                <h1 className='projects-reports'>Investments</h1>

                <div className='investments-list'>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>September Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>October Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>November Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>December Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
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
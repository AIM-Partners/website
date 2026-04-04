import React from 'react';
import logo from '../icons/aim_logo.png'

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
                        <h3 className='reports-item-month'>February Monthly Report</h3>
                        <h4 className='reports-item-detail'>
                            {/* <a
                                className='research-report'
                                href='/Research/Research_Arm.pdf'
                                target='_blank'
                                rel="noopener noreferrer"
                            >
                                Click here to view the August preview report (Full report for AIM members only)
                            </a> */}
                            {/* <a
                                className='research-report'
                                href='/Research/Research_Sep_RKLB.pdf'
                                target='_blank'
                                rel="noopener noreferrer"
                            >
                                Click here to view the September Company Research!
                            </a>
                            <br/>
                            <a
                                className='research-report'
                                href='/Research/Pitch_RKLB.pdf'
                                target='_blank'
                                rel="noopener noreferrer"
                            >
                                Click here to view the September Stock Pitch!
                            </a> */}
                            <h4 className='reports-item-detail'>To Be Posted</h4>
                        </h4>
                    </div>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>March Monthly Report</h3>
                        <h4 className='reports-item-detail'>
                            {/* <a
                                className='research-report'
                                href='/Research/Research_Oct_UNH.pdf'
                                target='_blank'
                                rel="noopener noreferrer"
                            >
                                Click here to view the October Company Research!
                            </a> */}
                            {/* <br/> */}
                            <h4 className='reports-item-detail'>To Be Posted</h4>
                            
                        </h4>
                    </div>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>April Monthly Report</h3>
                        <h4 className='reports-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='reports-item'>
                        <h3 className='reports-item-month'>May Monthly Report</h3>
                        <h4 className='reports-item-detail'>To Be Posted</h4>
                    </div>
                    
                </div>
            </div>

            <div className='projects-right'>
                <h1 className='projects-reports'>Investments</h1>

                <div className='investments-list'>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>February Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>March Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>April Presentation</h3>
                        <h4 className='investments-item-detail'>To Be Posted</h4>
                    </div>
                    <div className='investments-item'>
                        <h3 className='investments-item-month'>May Presentation</h3>
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
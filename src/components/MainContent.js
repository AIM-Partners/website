import React from 'react';
import logo from '../icons/aim_logo.png'
// import logo from '../icons/alpha-investment-management-high-resolution-logo-transparent (1).png'
import samsung from '../icons/company_icons/samsung_logo.svg'
import pwc from '../icons/company_icons/pwc_logo.svg'
import kpmg from '../icons/company_icons/kpmg_logo.svg';
import ey from '../icons/company_icons/ey_logo.svg';
import deloitte from '../icons/company_icons/deloitte_logo.svg';
import bcg from '../icons/company_icons/bcg_logo.svg';
import meta from '../icons/company_icons/meta_logo.svg';
import microsoft from '../icons/company_icons/microsoft_logo.svg';
import lg from '../icons/company_icons/lg_logo.svg'
import prot from '../icons/company_icons/protiviti_logo.svg'
import bnp from '../icons/company_icons/bnp-paribas_logo.svg'
import sc from '../icons/company_icons/standard-chartered_logo.svg'
import BlurText from './BlurText';
import wso from '../icons/partner_icons/wso.png'
import deshaw from '../icons/company_icons/deshaw_logo.png'
import google from '../icons/company_icons/google_logo.svg'
import imc from '../icons/company_icons/imc_logo.png'
import jpmc from '../icons/company_icons/jpmc_logo.png'
import ms from '../icons/company_icons/morgan_stanley_logo.png'
import hrt from '../icons/partner_icons/hudson_river_trading.svg'
import janestreet from '../icons/partner_icons/jane_street_logo.png'

// import image from '../images/img.jpg'

export default function MainContent() {
  const events = [
    {
      title: 'Spring 2026 Info Night',
      datetime: 'Jan 26th 2026',
      location: 'Zoom',
      description: 'Info Night'
    },
    {
      title: 'General Meeting',
      datetime: 'Feb 11th 2026',
      location: 'Siebel Center for Computer Science room 1304',
      description: 'General Meeting'
    },{
      title: 'Mental Math Competition',
      datetime: 'April 4th 2026',
      location: 'Siebel Center for Computer Science',
      description: 'General Meeting'
    },
    {
      title: 'General Meeting',
      datetime: 'TBD',
      location: 'TBD',
      description: 'General Meeting'
    },
    {
      title: 'General Meeting',
      datetime: 'TBD',
      location: 'TBD',
      description: 'General Meeting'
    },
    {
      title: 'General Meeting',
      datetime: 'TBD',
      location: 'TBD',
      description: 'General Meeting'
    },
    {
      title: 'General Meeting',
      datetime: 'TBD',
      location: 'TBD',
      description: 'General Meeting'
    },
    {
      title: 'General Meeting',
      datetime: 'TBD',
      location: 'TBD',
      description: 'General Meeting'
    },

  ];
  return (
    <div className="body-content">
        <div className='body-content-split'>
            <div className='body-content-left'>
                <div className='body-content-logo'>
                  <img src={logo} alt='aim_logo'/>
                </div>
                <div className="body-content-motto">
                    "Learn While You Earn"
                </div>
                <div className='body-content-pr'>
                    <h2>We are a student-led corporate and quantitative finance organization at the University of Illinois Urbana Champaign.</h2>
                </div>
                <div className="body-content-apply">
                    <h2 className='body-content-apply-announcement'>Application for Spring 2026 is closed. <br></br>If you're interested in our group, please join our discord for more information!</h2>
                    {/* <h2>
                        <a
                            href='https://docs.google.com/forms/d/e/1FAIpQLScJvoMGYRRgFcEeo4LejKwexVggIdRnWU313DFpnCcNINnMeg/viewform?usp=header'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                          Spring 2026 Research Team Application 
                        </a>
                        <a
                            href='https://docs.google.com/forms/d/e/1FAIpQLSfs_ucMFZCQsce3SfaZNWWCY7Up5lqtFpRsW1KIbzya4SHknQ/viewform?usp=header'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                          Spring 2026 Investment Team Application 
                        </a>
                        <a
                            href='https://docs.google.com/forms/d/e/1FAIpQLSf1XQ2IbIAdlre9gPwSL34A-w-V07jlEtt_czz73NpSAR9l9A/viewform?usp=header'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                          Spring 2026 Software Team Application 
                        </a>
                    </h2> */}
                </div>
            </div>
            <div className='body-content-right'>
                <h2 className='upcoming-events'>Upcomping Events</h2>
                <div className='events-list'>
                    {events.map((e, i) => (
                    <div key={i} className='event-card'>
                        <p className='event-datetime'>{e.datetime}</p>
                        <h3 className="event-title">{e.title}</h3>
                        <p className="event-desc">{e.description}</p>
                        <p className="event-location">📍 {e.location}</p>
                        {e.formURL && (<a
                          href={e.formURL} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="event-btn"
                        >
                          RSVP
                        </a>
                        )}
                    </div>
                    ))}
                </div>
            </div>
            
        </div>
      
        <div className='body-content-fake'></div>
        <div className='what-we-do'>
          <h2 className='what-we-do-main'>
            <BlurText
                text="What We Do"
                delay={150}
                animateBy="words"
                direction="top"
                // onAnimationComplete={handleAnimationComplete}
                className="blur-text"
            />
              {/* What We Do */}
          </h2>
          <div className='what-we-do-content'>
              <div className='what-we-do-detail'>
                <h2>At AIM Partners, we enhance ourselves to <span className='highlight'>learn while we earn</span>. <br/><br/>We host weekly workshops, mentor beginners in finance, and
                manage a fund powered by tested valuation and strategy.</h2>
              </div>

              <div className='what-we-do-keywords'>
                  <h2><span className='highlight'>Learn</span></h2>
                  <h3 className='what-we-do-keywords-detail'>We learn market, industry, and company research. Also, we learn about trading simulations, portfolio management using trained strategy.</h3>
                  <h2><span className='highlight'>Earn</span></h2>
                  <h3 className='what-we-do-keywords-detail'>We earn key financial market concepts as well as trading strategy by hosting mock trading competition and posting a monthly financial due diligence report.</h3>
              </div>
          </div>
        </div>
        {/* <div className='partners'>
          <h2 className='partners-main'>
            <BlurText
                text="Sponsors"
                delay={150}
                animateBy='letters'
                direction='top'
                className='blur-text'
            />
          </h2>
          <img src={hrt} alt='HRT logo' className='sponsor-logo'/><br/>
          <img src={wso} alt='WSO logo' className='sponsor-logo'/>
        </div> */}
        <div className='partners'>
          <h2 className='partners-main'>
            <BlurText
              text="Sponsors"
              delay={150}
              animateBy='letters'
              direction='top'
              className='blur-text'
            />
          </h2>

          {/* ORANGE */}
          <div className='sponsor-tier sponsor-tier-orange'>
            <div className='sponsor-tier-header'><span className='sponsor-tier-header-orange'>Orange</span></div>
            <div className='sponsor-tier-logos'>
              <img src={hrt} alt='HRT logo' className='sponsor-logo'/>
              <img src={janestreet} alt='Jane Street logo' className='sponsor-logo'/>
            </div>
          </div>

          {/* BLUE */}
          <div className='sponsor-tier sponsor-tier-blue'>
            <div className='sponsor-tier-header'><span className='sponsor-tier-header-blue'>Blue</span></div>

            <div className='sponsor-tier-logos'>
              <img src={wso} alt='WSO logo' className='sponsor-logo'/>
            </div>
          </div>
        </div>
        <div className='placements'>
            <div className='placements-main'>
                  <h2 className='placements-main-text'>
                      <BlurText
                        text="Placements"
                        delay={50}
                        animateBy="letters"
                        direction="top"
                        // onAnimationComplete={handleAnimationComplete}
                        className="blur-text"
                      />
                      {/* Placements */}
                  </h2>
                  <div className='placements-logos'>
                      {/* IMC, Google, JP Morgan, Morgan stanley, DE Shaw, microsoft, meta, bcg,  */}
                      <img src={imc} alt='IMC logo' className='placement-logo'/>
                      <img src={google} alt='Google logo' className='placement-logo'/>
                      <img src={deshaw} alt='DE Shaw logo' className='placement-logo'/>
                      <img src={jpmc} alt='JP Morgan Chase logo' className='placement-logo'/>
                      <img src={ms} alt='Morgan Stanley logo' className='placement-logo'/>
                      <img src={samsung} alt='Samsung logo' className='placement-logo'/>
                      <img src={microsoft} alt='Microsoft logo' className='placement-logo'/>
                      <img src={meta} alt='Meta logo' className='placement-logo'/>
                      <img src={bcg} alt='Boston Consulting Group logo' className='placement-logo'/>
                      <img src={pwc} alt='PwC logo' className='placement-logo'/>
                      <img src={kpmg} alt='KPMG logo' className='placement-logo'/>
                      <img src={ey} alt='EY logo' className='placement-logo'/>
                      <img src={deloitte} alt='Deloitte logo' className='placement-logo'/>
                      <img src={lg} alt='LG logo' className='placement-logo'/>
                      <img src={prot} alt='Protiviti logo' className='placement-logo'/>
                      <img src={bnp} alt='BNP Paribas logo' className='placement-logo'/>
                      <img src={sc} alt='Standard Chartered logo' className='placement-logo'/>
                  </div>
            </div>
        </div>
        <div className='contact-sponsor'>
            <h3 className='contact-sponsor-main'>Interested in sponsoring us? Reach out at {' '}
              <a className='highlight' href='mailto:corporate-outreach@aim-illinois.com'>corporate-outreach@aim-illinois.com</a>!</h3>
        </div>
        <div className='contact-us'>
            <div className='contact-us-logo'>
                <img src={logo} alt='aim-logo'/>
            </div>
            <h2 className='contact-us-main'>
                Contact Us

                <div className='contact-us-main-detail'>
                    <li className='contact-us-email'>
                        <a href='mailto:aimpartnersuiuc@gmail.com' target='_blank' rel="noopener noreferrer">
                            aimpartnersuiuc@gmail.com
                        </a>
                        
                    </li>
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
import React, { useState } from "react";
import logo from '../icons/aim_logo.png';

// leaderships
import president from '../images/leaderships/yunho_chang_profile.jpg';
import vice_president from '../images/leaderships/jacob_lee_profile.png';
import hoi from '../images/leaderships/tony_kwon_profile.jpg';
import hor from '../images/leaderships/jaeho_lim_profile.jpeg';
import hos from '../images/leaderships/sameul_hos.jpg';
import hoo from '../images/leaderships/ibrahim_aldrees_profile.png';

// import photo from '../images/member-sp26.png';
import photo from '../images/member-sp26.png';

// members (consent only)
import avinash from '../images/members/avinash_profile.png';
import nathan from '../images/members/nathan_profile.png';
import ibrahim from '../images/members/ibrahim_profile.png';
import nick from '../images/members/nick_profile.png';
import otice from '../images/members/otice_profile.png';
import sam from '../images/members/sam_profile.png';

const DIVISIONS = {
  Research: {
    name: 'Research',
    description:
      'The Research team focuses on fundamental research across global equity and macro markets. Members learn how to build investment theses, write reports, and present trade ideas to the broader club.',
    leader: {
      name: 'Joey Lim',
      position: 'Head of Research',
      photo: hor,
      linkedin: 'https://www.linkedin.com/in/jaeho-lim/',
      resume: null,
    },
    members: [
      {
        name: 'Pratibaa Prabhakaran',
        position: 'Business Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/pratibaa/',
        resume: '',
      },
      {
        name: 'Gur Bindra',
        position: 'Business Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/gurbindra/',
        resume: '',
      },
      {
        name: 'William Vignocchi',
        position: 'Business Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/william-vignocchi/',
        resume: '',
      },
      {
        name: 'Neal Mehrotra',
        position: 'Business Analyst',
        photo: null,
        linkedin: '',
        resume: '',
      },
    ],
  },
  Investment: {
    name: 'Investment',
    description:
      'The Investment team explores the crypto market, excutes trades, and prioritizes risk management.',
    leader: {
      name: 'Tony Kwon',
      position: 'Head of Investment',
      photo: hoi,
      linkedin: 'https://www.linkedin.com/in/tonykwon02/',
      resume: null,
    },
    members: [
      {
        name: 'Nathan Yue',
        position: 'Market/Trading Analyst',
        photo: nathan,
        linkedin: 'https://www.linkedin.com/in/nathan-yue-07a238263/',
        resume: '',
      },
      {
        name: 'Avinash Sri-kumeran',
        position: 'Market/Trading Analyst',
        photo: avinash,
        linkedin: 'https://www.linkedin.com/in/avinash-sri-kumeran-695191203/',
        resume: '',
      },
      {
        name: 'Tristan Schryvers',
        position: 'Market/Trading Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/tristan-schryvers-526147279/',
        resume: '',
      },
      {
        name: 'Agam Singh',
        position: 'Market/Trading Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/agamsingh2/',
        resume: '',
      },
      {
        name: 'Emily Cheng',
        position: 'Market/Trading Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/emily-cheng0825/',
        resume: '',
      },
      {
        name: 'Kate Hwang',
        position: 'Market/Trading Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/kate-hwang-3606622aa/',
        resume: '',
      },
      {
        name: 'O\'Tice Lewis',
        position: 'Market/Trading Analyst',
        photo: otice,
        linkedin: 'https://www.linkedin.com/in/o-tice-lewis/',
        resume: '',
      },
      {
        name: 'Ibrahim Aldrees',
        position: 'Market/Trading Analyst',
        photo: ibrahim,
        linkedin: 'https://www.linkedin.com/in/avinash-sri-kumeran-695191203/',
        resume: '',
      },
      {
        name: 'Nick Becker',
        position: 'Market/Trading Analyst',
        photo: nick,
        linkedin: 'https://www.linkedin.com/in/ibrahim-aldrees-42a608256/',
        resume: '',
      },
      {
        name: 'Michael Han',
        position: 'Market/Trading Analyst',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/jaeho-han-7937391b8/',
        resume: '',
      },
    ],
  },
  Software: {
    name: 'Software',
    description:
      'The Software team builds internal tools for research and trading, such as backtesting frameworks, data pipelines, and web applications for members. Members gain experience in full stack development and quantitative infrastructure.',
    leader: {
      name: 'Arnav Saraogi',
      position: 'Head of Software',
      photo: hos,
      linkedin: 'https://www.linkedin.com/in/arnav-saraogi/',
      resume: null,
    },
    members: [
      {
        name: 'Sam Vishnevskiy',
        position: 'Software Engineer',
        photo: sam,
        linkedin: 'https://www.linkedin.com/in/sam-vishnevskiy-a439b5286/',
        resume: '',
      },
      {
        name: 'Krish Patel',
        position: 'Software Engineer',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/patelkrish513/',
        resume: '',
      },
      {
        name: 'Michele Autorino',
        position: 'Software Engineer',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/michele-autorino/',
        resume: '',
      },
      {
        name: 'Luke Zimmerman',
        position: 'Software Engineer',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/lukerzimm/',
        resume: '',
      },
      {
        name: 'Kerem Alp Acar',
        position: 'Software Engineer',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/kerem-acar/',
        resume: '',
      },
      {
        name: 'Aadhavan Sridharan',
        position: 'Software Engineer',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/aadhavansridharan/',
        resume: '',
      },
    ],
  },
};

export default function AboutUs() {
  const [openDivision, setOpenDivision] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleOpenDivision = (divisionKey) => {
    const division = DIVISIONS[divisionKey];
    setOpenDivision(division);
    setSelectedMember(division.leader);
  };

  const handleCloseDivision = () => {
    setOpenDivision(null);
    setSelectedMember(null);
  };

  const handleSelectMember = (member) => {
    setSelectedMember(member);
  };

  return (
    <div className="about-us">
      <div className="about-us-main">
        <h2>About AIM Partners</h2>
      </div>

      <div className="about-us-block">
        <div className="about-us-logo">
          <img src={photo} alt="member-photo-fa25" />
        </div>
        <div className="about-us-detail">
          <p>
            Founded in January 2020, Alpha Investment Management Partners (AIM Partners) is a corporate and quantitative finance organization at the University of Illinois at Urbana Champaign. 
          </p>
          <p>
            Our members primarily come from Computer Science, Mathematics, Statistics, Economics, and Engineering. Over 25% of our members have competed at the USACO Gold division or higher and have qualified for the AIME or more advanced mathematical competitions.
          </p>
          <p>
            AIM Partners focuses on developing quantitative reasoning, structured decision making, and technical depth through market research, algorithmic trading simulations, and applied financial modeling initiatives. Our mission is to cultivate analytically rigorous students prepared for high performance roles in quantitative trading, technology, and finance.
          </p>

          {/* <p>
            To support this mission, AIM Partners is organized into three divisions{" "}
            <span
              className="highlight division-link"
              onClick={() => handleOpenDivision("Research")}
            >
              <strong>Research</strong>
            </span>
            ,{" "}
            <span
              className="highlight division-link"
              onClick={() => handleOpenDivision("Investment")}
            >
              <strong>Investment</strong>
            </span>
            , and{" "}
            <span
              className="highlight division-link"
              onClick={() => handleOpenDivision("Software")}
            >
              <strong>Software</strong>
            </span>
            .
          </p> */}
        </div>
      </div>

      <div className="about-us-leaderships">
        <h2>Leaderships</h2>
        <div className="leaderships-grid">
          <div className="leadership-card">
            <a
              href="https://www.linkedin.com/in/jacob-lee-a5164734a/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={vice_president} alt="Jacob Lee" />
            </a>
            <h3 className="leadership-name">Jacob Lee</h3>
            <p className="leadership-position">President</p>
          </div>

          <div className="leadership-card">
            <a
              href="https://www.linkedin.com/in/yunhoc1204"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={president} alt="Yunho Chang" />
            </a>
            <h3 className="leadership-name">Yunho Chang</h3>
            <p className="leadership-position">Co-President, Head of Investment</p>
          </div>

          <div className="leadership-card">
            <a
              href="https://www.linkedin.com/in/tonykwon02/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={hoi} alt="Tony Kwon" />
            </a>
            <h3 className="leadership-name">Tony Kwon</h3>
            <p className="leadership-position">Vice President</p>
          </div>
          <div className="leadership-card">
            <a
              href="https://www.linkedin.com/in/jaeho-lim/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={hor} alt="Jaeho Lim" />
            </a>
            <h3 className="leadership-name">Joey Lim</h3>
            <p className="leadership-position">VP Head of Research</p>
          </div>

          <div className="leadership-card">
            <a
              href="https://www.linkedin.com/in/sam-vishnevskiy-a439b5286/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={hos} alt="Samuel Vishnevskiy" />
            </a>
            <h3 className="leadership-name">Samuel Vishnevskiy</h3>
            <p className="leadership-position">Head of Software</p>
          </div>

          
        </div>
      </div>

      {/* Division Modal */}
      {openDivision && (
        <div className="division-modal-backdrop" onClick={handleCloseDivision}>
          <div
            className="division-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="division-modal-close"
              onClick={handleCloseDivision}
            >
              ×
            </button>

            <div className="division-modal-header">
              {/* division header text */}
              <h2>Fall 2025 {openDivision.name}</h2>
              <p>{openDivision.description}</p>
            </div>

            <div className="division-modal-body">
              <div className="division-members-list">
                <h3>Head of {openDivision.name}</h3>
                <button
                  className={`division-member-button ${
                    selectedMember &&
                    selectedMember.name === openDivision.leader.name
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectMember(openDivision.leader)}
                >
                  {openDivision.leader.name}
                </button>

                <h3>Members</h3>
                {openDivision.members.map((member) => (
                  <button
                    key={member.name}
                    className={`division-member-button ${
                      selectedMember &&
                      selectedMember.name === member.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() => handleSelectMember(member)}
                  >
                    {member.name}
                  </button>
                ))}
              </div>

              <div className="division-member-detail">
                {selectedMember ? (
                  <>
                    {selectedMember.photo && (
                      <img
                        src={selectedMember.photo}
                        alt={selectedMember.name}
                        width={220}
                        height={220}
                        className="division-member-photo"
                      />
                    )}
                    <h3>{selectedMember.name}</h3>
                    {selectedMember.position && (
                      <p className="division-member-position">
                        {selectedMember.position}
                      </p>
                    )}
                    <div className="division-member-links">
                      {selectedMember.linkedin && (
                        <a
                          href={selectedMember.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      )}
                      {selectedMember.resume && (
                        <a
                          href={selectedMember.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Resume
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <p>Select a member to view details.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="contact-us">
        <div className="contact-us-logo">
          <img src={logo} alt="aim-logo" />
        </div>
        <h2 className="contact-us-main">
          Contact Us
          <div className="contact-us-main-detail">
            <p className="email">aimpartnersuiuc@gmail.com</p>
            <li className="contact-us-discord">
              <a
                href="https://discord.com/invite/EMSf7pjKM6"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord
              </a>
            </li>
            <li className="contact-us-linkedin">
              <a
                href="https://www.linkedin.com/company/aimpartnersuiuc/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
          </div>
        </h2>
      </div>
    </div>
  );
}

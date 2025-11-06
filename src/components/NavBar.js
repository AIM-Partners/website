import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../icons/aim_logo.svg';
import { ReactComponent as DiscordLogo } from '../icons/discord_logo.svg';
import { ReactComponent as LinkedinLogo } from '../icons/linkedin_logo.svg';
import '../NavBar.css';

export default function Navbar() {
    return (
        <nav className="top-navbar">
            <div className="top-navbar__logo">
            <Link to="/">
                <img src={logo} alt="Alpha Investment Management Partners logo" />
            </Link>
            </div>
            <ul className="top-navbar__links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about-us">About Us</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li>
                <a href="https://www.linkedin.com/company/aimpartnersuiuc/" target="_blank" rel="noopener noreferrer">
                <LinkedinLogo className="top-navbar__linkedin" />
                </a>
            </li>
            <li>
                <a href="https://discord.gg/EMSf7pjKM6" target="_blank" rel="noopener noreferrer">
                <DiscordLogo className="top-navbar__discord" />
                </a>
            </li>
            </ul>
        </nav>
    );
}
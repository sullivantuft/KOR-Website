import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div id="header_grid">
        <Link to="/">
          <img 
            className="icon" 
            src="/images/KOR_app_Logo.png" 
            alt="KOR Logo" 
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link className="link" to="/">Home</Link>
          <Link className="link" to="/our-app">The KOR App</Link>
          <Link className="link" to="/our-story">Our Story</Link>
          <Link className="link" to="/sign-up">Shop Sign Up</Link>
          <Link className="link" to="/faq">FAQ</Link>
          <Link className="link" to="/contact">Contact Us</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X color="white" size={24} /> : <Menu color="white" size={24} />}
        </button>

        <nav className="right_position desktop-nav">
          <Link 
            className="link" 
            to="/shop/login"
          >
            Log In
          </Link>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link className="mobile-link" to="/" onClick={() => setIsMobileMenuOpen(false)}>
          Home
        </Link>
        <Link className="mobile-link" to="/our-app" onClick={() => setIsMobileMenuOpen(false)}>
          The KOR App
        </Link>
        <Link className="mobile-link" to="/our-story" onClick={() => setIsMobileMenuOpen(false)}>
          Our Story
        </Link>
        <Link className="mobile-link" to="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
          Shop Sign Up
        </Link>
        <Link className="mobile-link" to="/faq" onClick={() => setIsMobileMenuOpen(false)}>
          FAQ
        </Link>
        <Link className="mobile-link" to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
          Contact Us
        </Link>
        <Link className="mobile-link" to="/shop/login" onClick={() => setIsMobileMenuOpen(false)}>
          Log In
        </Link>
      </nav>
    </header>
  );
};

export default Header;

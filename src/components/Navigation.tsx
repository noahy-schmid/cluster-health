import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  brandLink?: string;
  brandText?: string;
  navLinks?: Array<{
    href?: string;
    to?: string;
    text: string;
    className?: string;
    onClick?: () => void;
  }>;
}

const Navigation: React.FC<NavigationProps> = ({
  brandLink = "/",
  brandText = "Mein Stylist",
  navLinks = []
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to={brandLink} className="nav-brand">{brandText}</Link>
          <div className="nav-links">
            {navLinks.map((link, index) => (
              link.to ? (
                <Link 
                  key={index} 
                  to={link.to} 
                  className={link.className}
                  onClick={link.onClick}
                >
                  {link.text}
                </Link>
              ) : (
                <a 
                  key={index} 
                  href={link.href} 
                  className={link.className}
                  onClick={link.onClick}
                >
                  {link.text}
                </a>
              )
            ))}
          </div>
          <button 
            className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div 
        className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      >
        <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
          <button 
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Close mobile menu"
          >
            ✕
          </button>
          {navLinks.map((link, index) => (
            link.to ? (
              <Link 
                key={index} 
                to={link.to} 
                className={link.className}
                onClick={() => {
                  closeMobileMenu();
                  link.onClick?.();
                }}
              >
                {link.text}
              </Link>
            ) : (
              <a 
                key={index} 
                href={link.href} 
                className={link.className}
                onClick={() => {
                  closeMobileMenu();
                  link.onClick?.();
                }}
              >
                {link.text}
              </a>
            )
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';
import './MembershipPage.css';

const MembershipPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="membership-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">Mein Stylist</Link>
          <div className="nav-links">
            <Link to="/">Zurück zur Hauptseite</Link>
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
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/" onClick={closeMobileMenu}>Zurück zur Hauptseite</Link>
      </div>

      {/* Header Section */}
      <section className="membership-header">
        <div className="container">
          <div className="membership-content">
            <h1>Starten Sie jetzt</h1>
            <p className="membership-subtitle">
              Nutzen Sie Mein Stylist für Ihren Friseursalon
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="membership-info">
        <div className="container">
          <div className="info-content">
            <h2>Starten Sie jetzt mit Mein Stylist</h2>
            <p>
              Partner werden bedeutet einfach, dass Sie unser Produkt nutzen. Nach Ihrer Anfrage 
              kontaktieren wir Sie, um alles einzurichten und Ihnen den Einstieg zu erleichtern.
            </p>
            
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">📅</div>
                <h3>Intelligente Terminbuchung</h3>
                <p>Revolutionieren Sie Ihren Friseursalon mit intelligenter Terminverwaltung</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💼</div>
                <h3>Professionelle Verwaltung</h3>
                <p>Verwalten Sie Ihren Terminkalender und behalten Sie die volle Kontrolle über Ihre Kunden</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <h3>Transparente Preisstruktur</h3>
                <p>Faire und transparente Preise - Sie zahlen nur für das, was Sie tatsächlich nutzen</p>
              </div>
            </div>

            <div className="process-info">
              <h3>So einfach geht's:</h3>
              <div className="process-steps">
                <div className="process-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>Anfrage senden</h4>
                    <p>Füllen Sie das Kontaktformular aus und teilen Sie uns Ihre Bedürfnisse mit</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>Persönliche Kontaktaufnahme</h4>
                    <p>Wir kontaktieren Sie direkt, um alles für Ihren Friseursalon einzurichten</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>Sofort loslegen</h4>
                    <p>Nach der Einrichtung können Sie sofort mit der intelligenten Terminverwaltung starten</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2>Jetzt starten</h2>
            <p>Füllen Sie das untenstehende Formular aus und wir kontaktieren Sie, um alles einzurichten</p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2024 Mein Stylist. Alle Rechte vorbehalten. | <Link to="/">Zurück zur Hauptseite</Link></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MembershipPage;
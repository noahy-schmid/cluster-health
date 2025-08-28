import React from 'react';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';
import './MembershipPage.css';

const MembershipPage: React.FC = () => {
  return (
    <div className="membership-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">Mein Stylist</Link>
          <div className="nav-links">
            <Link to="/">Zurück zur Hauptseite</Link>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="membership-header">
        <div className="container">
          <div className="membership-content">
            <h1>Partner werden</h1>
            <p className="membership-subtitle">
              Werden Sie Teil des Mein Stylist Partner-Netzwerks
            </p>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="membership-info">
        <div className="container">
          <div className="info-content">
            <h2>Kontaktieren Sie uns für Ihren Partnerstatus</h2>
            <p>
              Um Partner bei Mein Stylist zu werden, müssen Sie sich direkt bei unserem Team bewerben. 
              Wir prüfen jeden Antrag sorgfältig, um sicherzustellen, dass unsere Partner den höchsten 
              Qualitätsstandards entsprechen.
            </p>
            
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <h3>Exklusive Vorteile</h3>
                <p>Erhalten Sie Zugang zu erweiterten Funktionen und Prioritäts-Support</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💼</div>
                <h3>Geschäftswachstum</h3>
                <p>Profitieren Sie von unserem Marketing und erweiterten Geschäftstools</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🤝</div>
                <h3>Persönliche Betreuung</h3>
                <p>Erhalten Sie einen dedizierten Ansprechpartner für Ihre Bedürfnisse</p>
              </div>
            </div>

            <div className="process-info">
              <h3>So funktioniert der Bewerbungsprozess:</h3>
              <div className="process-steps">
                <div className="process-step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <h4>Kontaktformular ausfüllen</h4>
                    <p>Teilen Sie uns mit, warum Sie Partner werden möchten</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <h4>Bewertung & Gespräch</h4>
                    <p>Unser Team prüft Ihre Anfrage und kontaktiert Sie für ein Gespräch</p>
                  </div>
                </div>
                <div className="process-step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <h4>Partner-Onboarding</h4>
                    <p>Nach der Genehmigung erhalten Sie Zugang zu exklusiven Partner-Features</p>
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
            <h2>Jetzt Partner werden</h2>
            <p>Füllen Sie das untenstehende Formular aus und wir melden uns bei Ihnen</p>
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
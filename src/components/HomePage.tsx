import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">Mein Stylist</div>
          <div className="nav-links">
            <a href="#features">Funktionen</a>
            <a href="#pricing">Preise</a>
            <Link to="/membership" className="btn-primary">Jetzt starten</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Revolutionieren Sie Ihren Friseursalon mit 
              <span className="highlight"> intelligenter Terminbuchung</span>
            </h1>
            <p className="hero-subtitle">
              Die professionelle Terminverwaltung speziell für Friseure. 
              Akzeptieren Sie Online-Buchungen, verwalten Sie Ihren Terminkalender und behalten Sie die volle Kontrolle über Ihre Kunden.
            </p>
            <div className="hero-cta">
              <Link to="/membership" className="btn-primary-large">3 Monate kostenlos testen</Link>
            </div>
            <div className="hero-social-proof">
              <p className="social-proof-text">Vertraut von über 10.000 Friseuren weltweit</p>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-mockup">
              <div className="mockup-screen">
                <div className="mockup-header"></div>
                <div className="mockup-content">
                  <div className="mockup-calendar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Alles was Sie für Ihren Salon brauchen</h2>
            <p>Optimieren Sie Ihre Geschäftsabläufe mit professionellen Tools für Friseure</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Intelligente Terminplanung</h3>
              <p>Intelligenter Kalender der Doppelbuchungen verhindert und Ihren Tagesablauf optimiert</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Kundenkontrolle</h3>
              <p>Kunden können nicht direkt über die App bezahlen - Sie behalten die vollständige Kontrolle über die Kundenbeziehung</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile-optimierte Web-App</h3>
              <p>Verwalten Sie Buchungen unterwegs mit unserer für mobile Geräte optimierten Web-Anwendung. Funktioniert in jedem Browser - keine App-Installation erforderlich</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Kundenverwaltung</h3>
              <p>Erstellen Sie detaillierte Kundenprofile mit Servicehistorie und Präferenzen</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Geschäftsanalysen</h3>
              <p>Verfolgen Sie Umsatz, beliebte Services und Wachstumstrends mit detaillierten Berichten</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Automatische Erinnerungen</h3>
              <p>Reduzieren Sie No-Shows mit automatischen SMS- und E-Mail-Terminerinnerungen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefits-content">
              <h2>Steigern Sie Ihr Geschäft mit professionellen Tools</h2>
              <ul className="benefits-list">
                <li>✅ Steigern Sie Ihre Buchungen um 40% mit 24/7 Online-Terminplanung</li>
                <li>✅ Reduzieren Sie No-Shows um 60% mit automatischen Erinnerungen</li>
                <li>✅ Sparen Sie täglich 2+ Stunden bei Verwaltungsaufgaben</li>
                <li>✅ Behalten Sie die volle Kontrolle über Kundenzahlungen</li>
                <li>✅ Stärken Sie Kundenbeziehungen mit detaillierten Profilen</li>
                <li>✅ Skalieren Sie Ihr Geschäft mit Multi-Stylist-Unterstützung</li>
              </ul>
              <Link to="/membership" className="btn-primary-large">Jetzt 3 Monate kostenlos testen</Link>
            </div>
            <div className="benefits-image">
              <div className="stats-card">
                <div className="stat">
                  <div className="stat-number">40%</div>
                  <div className="stat-label">Mehr Buchungen</div>
                </div>
                <div className="stat">
                  <div className="stat-number">60%</div>
                  <div className="stat-label">Weniger No-Shows</div>
                </div>
                <div className="stat">
                  <div className="stat-number">2 Std.</div>
                  <div className="stat-label">Täglich gespart</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Einfache, transparente Preise</h2>
            <p>Starten Sie kostenlos und zahlen Sie nur für das, was Sie nutzen</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card featured">
              <div className="popular-badge">Empfohlen</div>
              <div className="pricing-header">
                <h3>Für alle Friseure</h3>
                <div className="pricing-price">
                  <span className="price">3 Monate</span>
                  <span className="period">kostenlos</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Unbegrenzte Terminbuchungen</li>
                <li>Kundenverwaltung und -profile</li>
                <li>Automatische Erinnerungen</li>
                <li>Mobile App</li>
                <li>E-Mail-Support</li>
                <li>Keine Kreditkarte erforderlich</li>
              </ul>
              <Link to="/membership" className="btn-primary">Jetzt kostenlos starten</Link>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Nach der Testphase</h3>
                <div className="pricing-price">
                  <span className="price">10 Cent</span>
                  <span className="period">pro Buchung</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Nur zahlen für tatsächliche Buchungen</li>
                <li>Monatliche Rechnung</li>
                <li>Keine versteckten Kosten</li>
                <li>Sie behalten Kundenkontrolle</li>
                <li>Jederzeit kündbar</li>
                <li>Prioritäts-Support</li>
              </ul>
              <button className="btn-primary">Mehr erfahren</button>
            </div>
          </div>
          <div style={{textAlign: 'center', marginTop: '40px', padding: '20px', background: '#f9fafb', borderRadius: '12px'}}>
            <h4 style={{marginBottom: '16px', color: '#6366f1'}}>Warum dieses Preismodell?</h4>
            <p style={{color: '#6b7280', maxWidth: '600px', margin: '0 auto'}}>
              Kunden können nicht direkt über die App bezahlen - das bedeutet, Sie behalten die vollständige Kontrolle 
              über Ihre Kundenbeziehungen und Zahlungsabwicklung. Wir rechnen nur für erfolgreiche Buchungen ab.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Bereit, Ihr Geschäft zu revolutionieren?</h2>
            <p>Schließen Sie sich tausenden von Friseuren an, die bereits ihren Buchungsprozess modernisiert haben</p>
            <div className="cta-buttons">
              <Link to="/membership" className="btn-primary-large">3 Monate kostenlos testen</Link>
              <p className="cta-note">Keine Kreditkarte erforderlich • Jederzeit kündbar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">Mein Stylist</div>
              <p>Die komplette Buchungslösung für Friseur-Profis</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Produkt</h4>
                <a href="#features">Funktionen</a>
                <a href="#pricing">Preise</a>
                <a href="#demo">Demo</a>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <a href="#help">Hilfe-Center</a>
                <Link to="/membership">Kontakt</Link>
                <a href="#tutorials">Anleitungen</a>
              </div>
              <div className="footer-section">
                <h4>Unternehmen</h4>
                <a href="#about">Über uns</a>
                <a href="#careers">Karriere</a>
                <a href="#privacy">Datenschutz</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Mein Stylist. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
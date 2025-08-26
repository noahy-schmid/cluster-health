import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">BookStylist</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Transform Your Hair Salon with 
              <span className="highlight"> Smart Booking</span>
            </h1>
            <p className="hero-subtitle">
              The complete appointment management solution designed exclusively for hair stylists. 
              Accept online bookings, manage your schedule, and grow your business effortlessly.
            </p>
            <div className="hero-cta">
              <button className="btn-primary-large">Start Free Trial</button>
              <button className="btn-secondary">Watch Demo</button>
            </div>
            <div className="hero-social-proof">
              <p className="social-proof-text">Trusted by 10,000+ stylists worldwide</p>
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
            <h2>Everything You Need to Run Your Salon</h2>
            <p>Streamline your business operations with powerful tools designed for hair professionals</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Smart Scheduling</h3>
              <p>Intelligent calendar that prevents double-bookings and optimizes your daily schedule</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Online Payments</h3>
              <p>Accept payments and deposits online. Reduce no-shows with secure payment processing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile App</h3>
              <p>Manage bookings on-the-go with our mobile app. Never miss an appointment again</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Client Management</h3>
              <p>Build detailed client profiles with service history and preferences</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Business Analytics</h3>
              <p>Track revenue, popular services, and growth trends with detailed reports</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Automated Reminders</h3>
              <p>Reduce no-shows with automatic SMS and email appointment reminders</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <div className="benefits-grid">
            <div className="benefits-content">
              <h2>Grow Your Business with Professional Tools</h2>
              <ul className="benefits-list">
                <li>✅ Increase bookings by 40% with 24/7 online scheduling</li>
                <li>✅ Reduce no-shows by 60% with automated reminders</li>
                <li>✅ Save 2+ hours daily on administrative tasks</li>
                <li>✅ Accept payments and deposits to secure bookings</li>
                <li>✅ Build stronger client relationships with detailed profiles</li>
                <li>✅ Scale your business with multi-stylist support</li>
              </ul>
              <button className="btn-primary-large">Start Your Free Trial</button>
            </div>
            <div className="benefits-image">
              <div className="stats-card">
                <div className="stat">
                  <div className="stat-number">40%</div>
                  <div className="stat-label">More Bookings</div>
                </div>
                <div className="stat">
                  <div className="stat-number">60%</div>
                  <div className="stat-label">Fewer No-Shows</div>
                </div>
                <div className="stat">
                  <div className="stat-number">2hrs</div>
                  <div className="stat-label">Time Saved Daily</div>
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
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that's right for your salon</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Solo Stylist</h3>
                <div className="pricing-price">
                  <span className="price">$29</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Up to 100 bookings/month</li>
                <li>Online scheduling</li>
                <li>Client management</li>
                <li>Basic analytics</li>
                <li>Email support</li>
              </ul>
              <button className="btn-primary">Start Free Trial</button>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Professional</h3>
                <div className="pricing-price">
                  <span className="price">$49</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Unlimited bookings</li>
                <li>Online payments</li>
                <li>SMS reminders</li>
                <li>Advanced analytics</li>
                <li>Priority support</li>
                <li>Mobile app</li>
              </ul>
              <button className="btn-primary">Start Free Trial</button>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Salon Team</h3>
                <div className="pricing-price">
                  <span className="price">$89</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Up to 5 stylists</li>
                <li>Team scheduling</li>
                <li>Revenue sharing</li>
                <li>Custom branding</li>
                <li>Dedicated support</li>
              </ul>
              <button className="btn-primary">Start Free Trial</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Business?</h2>
            <p>Join thousands of stylists who have already modernized their booking process</p>
            <div className="cta-buttons">
              <button className="btn-primary-large">Start Free 14-Day Trial</button>
              <p className="cta-note">No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">BookStylist</div>
              <p>The complete booking solution for hair professionals</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#demo">Demo</a>
              </div>
              <div className="footer-section">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#contact">Contact</a>
                <a href="#tutorials">Tutorials</a>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#privacy">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BookStylist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

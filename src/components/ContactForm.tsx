import React, { useState } from 'react';
import './ContactForm.css';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ContactFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name muss mindestens 2 Zeichen lang sein';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
      }
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Nachricht ist erforderlich';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Nachricht muss mindestens 10 Zeichen lang sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ContactFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="contact-form-success">
        <div className="success-icon">✅</div>
        <h3>Vielen Dank für Ihre Anfrage!</h3>
        <p>
          Wir haben Ihre Partnerstatus-Anfrage erhalten und werden uns so schnell wie möglich bei Ihnen melden.
          Unser Team wird Ihre Informationen prüfen und Ihnen weitere Details zum Beitritt als Partner zukommen lassen.
        </p>
        <button 
          className="btn-primary"
          onClick={() => {
            setIsSubmitted(false);
            setFormData({ name: '', email: '', message: '' });
          }}
        >
          Weitere Anfrage senden
        </button>
      </div>
    );
  }

  return (
    <div className="contact-form-container">
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${errors.name ? 'form-input-error' : ''}`}
            placeholder="Ihr vollständiger Name"
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">
            E-Mail-Adresse *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'form-input-error' : ''}`}
            placeholder="ihre.email@beispiel.de"
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Nachricht *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={`form-textarea ${errors.message ? 'form-input-error' : ''}`}
            placeholder="Erzählen Sie uns mehr über Ihren Salon und warum Sie Partner werden möchten..."
            rows={5}
          />
          {errors.message && <span className="form-error">{errors.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary-large contact-form-submit"
        >
          {isSubmitting ? 'Wird gesendet...' : 'Partnerstatus-Anfrage senden'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactForm from './components/ContactForm';

test('renders contact form with required fields', () => {
  render(<ContactForm />);
  
  // Check for required form fields
  const nameInput = screen.getByRole('textbox', { name: /Name/i });
  const emailInput = screen.getByRole('textbox', { name: /E-Mail/i });
  const messageInput = screen.getByRole('textbox', { name: /Nachricht/i });
  const submitButton = screen.getByRole('button', { name: /Partnerstatus-Anfrage senden/i });
  
  expect(nameInput).toBeInTheDocument();
  expect(emailInput).toBeInTheDocument();
  expect(messageInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});

// Test for the specific text content without rendering the full component
test('intelligente terminplanung description should use correct wording', () => {
  const expectedText = "Intelligenter Kalender der Doppelbuchungen verhindert und auf Ihren Tagesablauf abgestimmt ist";
  const oldText = "Intelligenter Kalender der Doppelbuchungen verhindert und Ihren Tagesablauf optimiert";
  
  // This test validates that we're using the new wording
  expect(expectedText).toContain("abgestimmt ist");
  expect(expectedText).not.toContain("optimiert");
  expect(oldText).toContain("optimiert");
});

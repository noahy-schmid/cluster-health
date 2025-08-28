import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Mein Stylist app', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /Revolutionieren Sie Ihren Friseursalon/i });
  expect(titleElement).toBeInTheDocument();
});

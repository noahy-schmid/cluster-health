import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BookStylist app', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { name: /Transform Your Hair Salon/i });
  expect(titleElement).toBeInTheDocument();
});

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    // UI package components
    './src/**/*.{js,ts,jsx,tsx}',
    // Include app components that might use UI components
    '../../../apps/**/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: 'var(--color-secondary)',
        highlight: {
          DEFAULT: 'var(--color-highlight)',
          strong: 'var(--color-highlight-strong)',
        },
        accent: {
          1: 'var(--color-accent-1)',
          2: 'var(--color-accent-2)',
        },
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
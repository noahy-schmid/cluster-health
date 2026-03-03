import { join } from 'path';
import uiConfig from '../../packages/ui/tailwind.config.mjs';

/** @type {import('tailwindcss').Config} */
const config = {
  // Extend the UI package configuration
  presets: [uiConfig],
  content: [
    // Only include this app's content
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      // App-specific theme extensions can go here
    },
  },
};

export default config;

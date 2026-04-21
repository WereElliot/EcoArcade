import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./public/**/*.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        basalt: '#081211',
        moss: '#10312d',
        fern: '#1a5d4e',
        ember: '#f3b26b',
        mist: '#dbe5de',
        sand: '#efe6d5'
      },
      boxShadow: {
        panel: '0 24px 80px rgba(0, 0, 0, 0.35)',
        glow: '0 20px 60px rgba(55, 197, 127, 0.18)'
      },
      backgroundImage: {
        'eco-grid':
          'radial-gradient(circle at top left, rgba(79, 184, 128, 0.18), transparent 22%), radial-gradient(circle at 88% 8%, rgba(243, 178, 107, 0.12), transparent 16%), linear-gradient(180deg, #081211 0%, #0d1716 100%)'
      },
      fontFamily: {
        sans: ['Segoe UI', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;

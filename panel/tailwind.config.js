export default {
  content: ['./panel.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          950: '#05121a',
          900: '#071c20',
          800: '#0f2c31',
          700: '#154249',
          600: '#1b5f55',
          500: '#2b7b66',
          400: '#4f9c84',
          300: '#7cc7a4',
          200: '#b9e3cc'
        }
      },
      boxShadow: {
        glow: '0 24px 80px rgba(20, 120, 80, 0.18)',
        soft: '0 18px 36px rgba(3, 18, 24, 0.16)'
      },
      backgroundImage: {
        'eco-radial': 'radial-gradient(circle at top left, rgba(94, 188, 103, 0.18), transparent 20%), radial-gradient(circle at 85% 10%, rgba(77, 168, 127, 0.09), transparent 18%)'
      }
    }
  },
  plugins: []
};

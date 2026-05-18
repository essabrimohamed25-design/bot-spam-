module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        luxury: {
          gold: '#D4AF37',
          dark: '#0A0A0A',
          light: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}

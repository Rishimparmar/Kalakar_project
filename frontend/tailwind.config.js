/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF8F5',      // Light canvas/off-white background
        cream: {
          light: '#FFFDF9',
          DEFAULT: '#F7F4EB',
          dark: '#EFECE2',
        },
        peach: {
          light: '#FFF0EA',
          DEFAULT: '#FCDFD7',
        },
        gold: {
          artistic: '#D4AF37',   // Artistic Gold
          rose: '#B76E79',       // Rose Gold
          soft: '#C5A059',
        },
        charcoal: {
          DEFAULT: '#2A2825',    // Luxury charcoal text
          light: '#4A4743',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 12px 40px -10px rgba(183, 110, 121, 0.12)',
        gold: '0 8px 30px -4px rgba(212, 175, 55, 0.15)',
      }
    },
  },
  plugins: [],
}

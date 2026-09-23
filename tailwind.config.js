/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        warm: {
          bg: '#FAF5EF',
          card: '#FFFFFF',
          border: '#E8DDD0',
          'border-dark': '#D4C4B0',
        },
        terra: {
          50: '#FDF5F0',
          100: '#FAEADE',
          200: '#F2D0B8',
          300: '#E5B08A',
          400: '#D4915F',
          500: '#C47243',
          600: '#B05E32',
          700: '#8E4A28',
          800: '#6E3A20',
          900: '#4A2816',
        },
        olive: {
          50: '#F4F7F0',
          100: '#E6EEDb',
          200: '#CCD9B8',
          300: '#A8BE8A',
          400: '#7A9E5A',
          500: '#5A7A3D',
          600: '#466330',
          700: '#374D26',
          800: '#2C3E1F',
          900: '#1E2B15',
        },
        bark: {
          50: '#F7F3EF',
          100: '#EDE5DB',
          200: '#D9CBBB',
          300: '#BEA992',
          400: '#A08B6E',
          500: '#7A6B5D',
          600: '#5E5347',
          700: '#4A3F37',
          800: '#3D2B1F',
          900: '#2A1D14',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}

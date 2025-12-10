import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors (inspired by Fiken but adjusted)
        primary: {
          50: '#f8fafe',
          100: '#ecf4ff',
          200: '#e5eefb',
          300: '#aecdf9',
          400: '#AECDF9', // Main brand color
          500: '#75abf7',
          600: '#5a96f5',
          700: '#3471cb',
          800: '#2a5ba8',
          900: '#1656a0',
          950: '#003068',
        },
        // Semantic colors
        success: {
          DEFAULT: '#6BD1B7',
          50: '#eaf9f4',
          100: '#dbf7ef',
          200: '#b5ecde',
          300: '#6BD1B7',
          400: '#00997d',
          500: '#008069',
          600: '#006a57',
        },
        warning: {
          DEFAULT: '#FFE86F',
          50: '#fdf6d3',
          100: '#faeb99',
          200: '#FFE86F',
          300: '#f1d01f',
          400: '#e0a206',
          500: '#b37e14',
          600: '#684000',
        },
        error: {
          DEFAULT: '#F28F88',
          50: '#ffebe8',
          100: '#ffdbd4',
          200: '#F28F88',
          300: '#C90000',
          400: '#960000',
        },
        // Neutrals
        background: '#f9f9fb',
        surface: '#ffffff',
        border: '#dee0e5',
        muted: '#eff0f3',
        'black-blue': {
          50: '#f9f9fb',
          100: '#f4f5f8',
          150: '#eff0f3',
          200: '#dee0e5',
          300: '#c7cad2',
          400: '#aeb2bd',
          500: '#8f94a3',
          600: '#6e7487',
          700: '#4f5667',
          800: '#383e4c',
          900: '#272d3a',
        },
      },
      spacing: {
        '2': '2px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        'lg': '12px',
        'md': '8px',
        'sm': '6px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
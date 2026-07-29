/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // pharma_alyosr brand colors (extracted from logo)
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0891b2',  // core teal from logo
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#0c4a6e',
        },
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',  // core green from logo
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        navy: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e3a5f',  // dark navy from logo text
          800: '#1e3a8a',
          900: '#1e3474',
        },
        // Keep sage for backwards compat with existing components
        sage: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0891b2',
          600: '#0e7490',
          700: '#155e75',
          800: '#164e63',
          900: '#0c4a6e',
        },
        beige: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft':    '0 2px 15px -3px rgba(8,145,178,0.08), 0 10px 20px -2px rgba(8,145,178,0.04)',
        'card':    '0 4px 24px -6px rgba(0,0,0,0.08), 0 2px 8px -2px rgba(0,0,0,0.05)',
        'hover':   '0 20px 60px -12px rgba(8,145,178,0.25), 0 8px 24px -4px rgba(0,0,0,0.1)',
        'glass':   '0 8px 32px 0 rgba(8,145,178,0.12)',
        'glow':    '0 0 24px rgba(8,145,178,0.35)',
        'primary': '0 4px 20px rgba(8,145,178,0.4)',
      },
      borderRadius: {
        'xl':  '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-out both',
        'fade-in-up':   'fadeInUp 0.6s ease-out both',
        'fade-in-down': 'fadeInDown 0.5s ease-out both',
        'slide-up':     'slideUp 0.4s ease-out both',
        'slide-in-right': 'slideInRight 0.4s ease-out both',
        'shimmer':      'shimmer 2s infinite linear',
        'float':        'float 4s ease-in-out infinite',
        'float-slow':   'float 6s ease-in-out infinite',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'gradient':     'gradientShift 6s ease infinite',
        'bounce-soft':  'bounceSoft 2s ease-in-out infinite',
        'scale-in':     'scaleIn 0.3s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(8,145,178,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(8,145,178,0.6)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0891b2 0%, #16a34a 100%)',
        'gradient-hero':  'linear-gradient(135deg, #0c4a6e 0%, #155e75 50%, #166534 100%)',
        'gradient-card':  'linear-gradient(135deg, rgba(8,145,178,0.08) 0%, rgba(22,163,74,0.08) 100%)',
      },
    },
  },
  plugins: [],
}

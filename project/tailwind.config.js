/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfcf9',
          100: '#faf8f2',
          200: '#f5f1e6',
          300: '#ede7d4',
        },
        navy: {
          50: '#eef2f7',
          100: '#d6dfeb',
          200: '#aabdd9',
          300: '#7d9bc6',
          400: '#4f78a8',
          500: '#305589',
          600: '#21426b',
          700: '#1a3657',
          800: '#162c46',
          900: '#0f1f33',
        },
        lavender: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        serif: ['"Georgia"', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15, 31, 51, 0.08), 0 1px 2px rgba(15, 31, 51, 0.04)',
        card: '0 2px 8px rgba(15, 31, 51, 0.06), 0 1px 3px rgba(15, 31, 51, 0.04)',
        lifted: '0 4px 16px rgba(15, 31, 51, 0.10), 0 2px 6px rgba(15, 31, 51, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};

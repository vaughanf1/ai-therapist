/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B5CF6',
        'primary-dark': '#7C3AED',
        'primary-light': '#A78BFA',
        accent: '#10B981',
        'accent-dark': '#059669',
        'warm-50': '#FFFBEB',
        'warm-100': '#FEF3C7',
        'warm-200': '#FDE68A',
        'warm-300': '#F59E0B',
        'sage-50': '#F0FDF4',
        'sage-100': '#DCFCE7',
        'sage-200': '#BBF7D0',
        'sage-300': '#86EFAC',
        'sage-400': '#4ADE80',
        'sage-500': '#22C55E',
        'neutral-50': '#FAFAF9',
        'neutral-100': '#F5F5F4',
        'neutral-200': '#E7E5E4',
        'neutral-300': '#D6D3D1',
        'neutral-400': '#A8A29E',
        'neutral-500': '#78716C',
        'neutral-600': '#57534E',
        'neutral-700': '#44403C',
        'neutral-800': '#292524',
        'neutral-900': '#1C1917',
        'cozy': '#F3E8FF',
        'cozy-dark': '#E9D5FF',
      },
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'base': '16px',
        'heading': '24px',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
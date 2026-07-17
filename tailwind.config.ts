import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais Born to Run
        brand: {
          red: {
            50:  '#fff1f1',
            100: '#ffd9d9',
            200: '#ffb3b3',
            300: '#ff7a7a',
            400: '#ff4040',
            500: '#e81010', // Vermelho principal
            600: '#c90000',
            700: '#a10000',
            800: '#850505',
            900: '#6e0a0a',
          },
          green: {
            50:  '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#16a34a', // Verde principal
            600: '#15803d',
            700: '#166534',
            800: '#14532d',
            900: '#052e16',
          },
          orange: {
            50:  '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#ea6a0a', // Laranja detalhe
            600: '#c2560a',
            700: '#9a3a0a',
            800: '#7c2d12',
            900: '#431407',
          },
        },
        // Neutros do projeto
        surface: {
          white:   '#ffffff',
          offwhite:'#fafaf9',
          light:   '#f5f5f4',
          border:  '#e7e5e4',
        },
        text: {
          primary:   '#1c1917',
          secondary: '#44403c',
          muted:     '#78716c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.06)',
        'card-lg': '0 10px 24px -3px rgba(0,0,0,0.08), 0 4px 8px -4px rgba(0,0,0,0.05)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

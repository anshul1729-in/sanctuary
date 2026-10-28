/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          bg: '#121316',
          card: '#1A1C20',
          elevated: '#22252A',
          border: 'rgba(255, 255, 255, 0.07)',
          'border-subtle': 'rgba(255, 255, 255, 0.04)',
          text: '#E6E4DD',
          muted: '#8E9299',
        },
        paper: {
          bg: '#FBF9F5',
          card: '#F3EFE6',
          elevated: '#EBE6DC',
          border: 'rgba(43, 45, 66, 0.08)',
          'border-subtle': 'rgba(43, 45, 66, 0.04)',
          text: '#2B2D42',
          muted: '#6C707E',
        },
        sage: {
          50: '#F4F7F6',
          100: '#E4ECE9',
          200: '#C7D9D3',
          300: '#A4C1B8',
          400: '#84A59D',
          500: '#678B83',
          600: '#52796F',
          700: '#3D5C54',
          800: '#2C433D',
          900: '#1C2C28',
        },
        amber: {
          warm: '#F6BD60',
          ochre: '#D4A373',
          glow: 'rgba(246, 189, 96, 0.15)',
        },
        terracotta: {
          soft: '#E07A5F',
          muted: 'rgba(224, 122, 95, 0.15)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      lineHeight: {
        relaxed: '1.8',
      },
      boxShadow: {
        'soft-dark': '0 8px 30px rgba(0, 0, 0, 0.35)',
        'soft-light': '0 8px 30px rgba(43, 45, 66, 0.06)',
        'zen': '0 20px 40px -15px rgba(0,0,0,0.25)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

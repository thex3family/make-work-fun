const colors = require('tailwindcss/colors');

module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderRadius: ['hover', 'focus'],
      zIndex: {
        '-10': '-10',
       },
      backgroundColor: ['active'],
      backgroundImage: (theme) => ({
        'player-pattern': "url('/background/cityscape.jpg')",
        'dailies-pattern': "url('/background/dailies.jpg')",
        'hall-pattern': "url('/background/great-hall.jpg')",
        'first-place': "url('/img/first-place.svg')"
      }),
      maxWidth: {
        '8xl': '1920px'
      },
      colors: {
        primary: 'var(--primary)',
        'primary-2': 'var(--primary-2)',
        'primary-3': 'var(--primary-3)',
        secondary: 'var(--secondary)',
        'secondary-2': 'var(--secondary-2)',
        hover: 'var(--hover)',
        'hover-1': 'var(--hover-1)',
        'hover-2': 'var(--hover-2)',
        'accents-0': 'var(--accents-0)',
        'accents-1': 'var(--accents-1)',
        'accents-2': 'var(--accents-2)',
        'accents-3': 'var(--accents-3)',
        'accents-4': 'var(--accents-4)',
        'accents-5': 'var(--accents-5)',
        'accents-6': 'var(--accents-6)',
        'accents-7': 'var(--accents-7)',
        'accents-8': 'var(--accents-8)',
        'accents-9': 'var(--accents-9)',
        violet: 'var(--violet)',
        'violet-light': 'var(--violet-light)',
        pink: colors.pink,
        error: 'var(--pink)',
        cyan: 'var(--cyan)',
        green: 'var(--green)',
        red: colors.red,
        emerald: colors.emerald,
        blueGray: colors.blueGray,
        lightBlue: colors.lightBlue,
        blue: colors.blue,
        dailies: {
          default: '#EEE7DD',
          light: '#fffaf4',
          dark: '#8e745e'
        },
        dark: '#191919',
      },
      textColor: {
        base: 'var(--text-base)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        dailies: '#8e745e'
      },
      boxShadow: {
        'outline-2': '0 0 0 2px var(--accents-2)',
        magical:
          'rgba(0, 0, 0, 0.02) 0px 30px 30px, rgba(0, 0, 0, 0.03) 0px 0px 8px, rgba(0, 0, 0, 0.05) 0px 1px 0px'
      },
      lineHeight: {
        'extra-loose': '2.2'
      },
      letterSpacing: {
        widest: '0.3em'
      },
      animation: {
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'fade-out-down': 'fade-out-down 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-out-up': 'fade-out-up 0.5s ease-out',
        'soft-bounce': 'soft-bounce 1.25s linear infinite',
        'slow-fade-in': 'fade-in 2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out'
      },
      keyframes: {
        'soft-bounce': {
          '0%, 100%': {
            transform: 'translateY(-10%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' }
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-out-down': {
          from: {
            opacity: '1',
            transform: 'translateY(0px)'
          },
          to: {
            opacity: '0',
            transform: 'translateY(10px)'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          }
        },
        'fade-out-up': {
          from: {
            opacity: '1',
            transform: 'translateY(0px)'
          },
          to: {
            opacity: '0',
            transform: 'translateY(10px)'
          }
        }
      }
    }
  },
  plugins: [require("@tailwindcss/typography")],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        glass: {
          50: 'rgba(255, 255, 255, 0.95)',
          100: 'rgba(255, 255, 255, 0.90)',
          200: 'rgba(255, 255, 255, 0.80)',
          300: 'rgba(255, 255, 255, 0.70)',
          400: 'rgba(255, 255, 255, 0.60)',
          500: 'rgba(255, 255, 255, 0.50)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'glass-morphism': 'glassMorphism 0.2s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'bounce-gentle': 'bounceGentle 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        glassMorphism: {
          '0%': { opacity: '0', backdropFilter: 'blur(0px)' },
          '100%': { opacity: '1', backdropFilter: 'blur(6px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'deep': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.6)',
        'glow-sm': '0 0 10px rgba(59, 130, 246, 0.4)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass-morphism': {
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--backdrop-filter)',
          border: '1px solid var(--glass-border)',
          position: 'relative',
        },
        '.glass-dark': {
          background: 'var(--surface-bg)',
          backdropFilter: 'var(--backdrop-filter)',
          border: '1px solid var(--surface-border)',
        },
        '.lightning-dark': {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.08)',
        },
        '.glow-effect': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            borderRadius: 'inherit',
            padding: '1px',
            background: 'linear-gradient(135deg, var(--primary-glow), var(--accent-glow))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
            zIndex: '-1',
          }
        },
        '.gradient-border': {
          border: '1px solid transparent',
          backgroundImage: 'linear-gradient(var(--surface-bg), var(--surface-bg)), linear-gradient(45deg, var(--primary-glow), var(--accent-glow))',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
        },
        '.theme-surface': {
          background: 'var(--surface-bg)',
          backdropFilter: 'var(--backdrop-filter)',
          border: '1px solid var(--surface-border)',
          color: 'var(--text-primary)',
        },
        '.theme-text': {
          color: 'var(--text-primary)',
        },
        '.theme-text-secondary': {
          color: 'var(--text-secondary)',
        },
        '.bento-grid': {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          gridAutoRows: 'minmax(200px, auto)',
        },
        '.bento-item': {
          borderRadius: '1rem',
          padding: '1.5rem',
          transition: 'all 0.2s ease',
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--backdrop-filter)',
          border: '1px solid var(--glass-border)',
          willChange: 'transform',
        },
        '.bento-item-large': {
          gridColumn: 'span 2',
          gridRow: 'span 2',
        },
        '.bento-item-wide': {
          gridColumn: 'span 2',
        },
        '.bento-item-tall': {
          gridRow: 'span 2',
        },
        '.grid-responsive': {
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        },
        '.layout-stack': {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        },
        '.layout-cluster': {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'flex-start',
          alignItems: 'center',
        },
        '.layout-sidebar': {
          display: 'grid',
          gridTemplateColumns: 'minmax(250px, 1fr) 3fr',
          gap: '1rem',
        },
        '.layout-center': {
          boxSizing: 'content-box',
          marginLeft: 'auto',
          marginRight: 'auto',
          maxWidth: 'min(100% - 2rem, 1200px)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}
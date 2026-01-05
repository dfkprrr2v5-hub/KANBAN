import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'background-primary': '#0A0E1A',
      'background-secondary': '#111827',
      'background-tertiary': '#1F2937',
      'background-elevated': '#374151',
      'accent-primary': '#FF6B35',
      'accent-secondary': '#F59E0B',
      'accent-hover': '#FB923C',
      'accent-muted': '#FCD34D',
      'text-primary': '#F9FAFB',
      'text-secondary': '#D1D5DB',
      'text-muted': '#9CA3AF',
      'text-disabled': '#6B7280',
      'status-success': '#10B981',
      'status-warning': '#F59E0B',
      'status-danger': '#EF4444',
      'status-info': '#3B82F6',
      'border-primary': '#374151',
      'border-accent': '#FF6B35',
      'border-hover': '#4B5563',
      black: '#000000',
      white: '#FFFFFF',
    },
    fontFamily: {
      mono: ['Fira Code', 'JetBrains Mono', 'Courier New', 'monospace'],
      sans: ['system-ui', 'sans-serif'],
    },
    extend: {
      animation: {
        'scan-line': 'scanline 8s linear infinite',
        'glitch-text': 'glitch 3s ease-in-out infinite',
        'grid-pulse': 'grid-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%, 100%': {
            textShadow: '0 0 5px rgba(255, 107, 53, 0.5)',
          },
          '25%': {
            textShadow:
              '-2px 0 5px rgba(255, 107, 53, 0.8), 2px 0 5px rgba(59, 130, 246, 0.8)',
            transform: 'translateX(-2px)',
          },
          '75%': {
            textShadow:
              '2px 0 5px rgba(255, 107, 53, 0.8), -2px 0 5px rgba(59, 130, 246, 0.8)',
            transform: 'translateX(2px)',
          },
        },
        'grid-pulse': {
          '0%, 100%': { opacity: '0.05' },
          '50%': { opacity: '0.1' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(255, 107, 53, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;

import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Product-site grammar: white canvas, near-black text, one blue accent.
        // Role names are stable across the codebase; only the values define the
        // look. `accent` replaces the former `gold` token.
        accent: '#4d6bfe',
        'accent-deep': '#3a56e0',
        paper: '#ffffff',
        'paper-2': '#f7f8fa',
        ink: '#0d0e12',
        mute: '#61656e',
        hair: '#e6e8ec',
        signal: '#e5484d',
        // Retained for the 3D canvas, which stays dark by nature.
        'dark-bg': '#0b0d12',
        'dark-card': '#14171f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        jp: ['"Noto Serif JP"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(13,14,18,0.04), 0 4px 16px rgba(13,14,18,0.05)',
        lift: '0 10px 34px rgba(13,14,18,0.10)',
        glow: '0 6px 20px rgba(77,107,254,0.28)',
      },
      borderRadius: {
        xl2: '1.125rem',
      },
    },
  },
  plugins: [],
} satisfies Config

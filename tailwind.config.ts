import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // House grammar (AGENTS.md). `gold` reused at the brand value #c9a44c —
        // no duplicate gold token. `dark-bg`/`dark-card` kept for the 3D scene.
        gold: '#c9a44c',
        'gold-dark': '#927327',
        paper: '#f4f1ea',
        'paper-2': '#e9e3d7',
        ink: '#16150f',
        mute: '#6c685f',
        hair: '#d4cdbd',
        signal: '#b8332a',
        'dark-bg': '#050505',
        'dark-card': '#0f0f0f',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        // House grammar type roles.
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        jp: ['"Noto Serif JP"', 'serif'],
      },
      letterSpacing: {
        widest: '0.3em',
        'ultra-wide': '0.5em',
      },
    },
  },
  plugins: [],
} satisfies Config

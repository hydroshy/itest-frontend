import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './plugins/**/*.{vue,js,ts,jsx,tsx}',
  ],
  corePlugins: {
    // Tắt preflight để không reset CSS trình duyệt, tránh xung đột style
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        owl: {
          bg: '#0b0f19',
          surface: '#111827',
          card: '#1e293b',
          border: 'rgba(255, 255, 255, 0.08)',
          teal: '#38bdf8',
          cyan: '#06b6d4',
          indigo: '#6366f1',
          amber: '#f59e0b',
          coral: '#f43f5e',
          muted: '#64748b',
          text: '#f1f5f9',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        midnightOwl: {
          primary: '#38bdf8',
          secondary: '#818cf8',
          accent: '#06b6d4',
          neutral: '#1e293b',
          'base-100': '#0b0f19',
          'base-200': '#111827',
          'base-300': '#1e293b',
          info: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#f43f5e',
          '--rounded-box': '1rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
          '--tab-radius': '0.75rem',
        },
      },
      'dark',
      'night',
    ],
    darkTheme: 'midnightOwl',
    base: false, // Không inject base reset của daisyUI để bảo toàn style Element Plus
    styled: true,
    utils: true,
    prefix: '',
    logs: false,
  },
}

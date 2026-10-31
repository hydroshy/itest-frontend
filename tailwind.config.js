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
          bg: '#0f172a',
          surface: '#151d2c',
          card: '#1a2436',
          border: 'rgba(255, 255, 255, 0.08)',
          teal: '#38bdf8',
          cyan: '#38bdf8',
          indigo: '#7c3aed',
          amber: '#fbbf24',
          coral: '#fb7185',
          muted: '#64748b',
          text: '#f8fafc',
          primary: '#7c3aed',
          secondary: '#38bdf8',
          accent: '#34d399',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['DM Sans', 'Poppins', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'DM Sans', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        dmsans: ['DM Sans', 'system-ui', 'sans-serif'],
        memphis: ['Poppins', 'DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dim: {
          primary: '#7c3aed',
          'primary-content': '#ffffff',
          secondary: '#38bdf8',
          'secondary-content': '#0f172a',
          accent: '#34d399',
          'accent-content': '#0f172a',
          neutral: '#0b1120',
          'neutral-content': '#f8fafc',
          'base-100': '#151d2c',
          'base-200': '#1a2436',
          'base-300': '#0f172a',
          'base-content': '#94a3b8',
          info: '#38bdf8',
          'info-content': '#0f172a',
          success: '#34d399',
          'success-content': '#0f172a',
          warning: '#fbbf24',
          'warning-content': '#0f172a',
          error: '#fb7185',
          'error-content': '#ffffff',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.75rem',
          '--rounded-badge': '9999px',
          '--tab-radius': '0.75rem',
        },
      },
      'dark',
      'night',
    ],
    darkTheme: 'dim',
    base: false, // Không inject base reset của daisyUI để bảo toàn style Element Plus
    styled: true,
    utils: true,
    prefix: '',
    logs: false,
  },
}

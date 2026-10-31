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
          bg: '#20252E',
          surface: '#242933',
          card: '#2A303C',
          border: 'rgba(178, 204, 214, 0.12)',
          teal: '#28ebff',
          cyan: '#28ebff',
          indigo: '#C792E9',
          amber: '#efd057',
          coral: '#ffae9b',
          muted: '#718096',
          text: '#f1f5f9',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      'dim',
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

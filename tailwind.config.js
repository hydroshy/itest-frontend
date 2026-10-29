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
          bg: '#011627',
          surface: '#081d32',
          card: '#0b2942',
          border: '#1d3b5a',
          teal: '#7fdbca',
          cyan: '#00f0ff',
          amber: '#ecc48d',
          coral: '#ef5350',
          muted: '#5f7e97',
          text: '#d6deeb',
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
          primary: '#7fdbca',
          secondary: '#ecc48d',
          accent: '#00f0ff',
          neutral: '#0b2942',
          'base-100': '#011627',
          'base-200': '#081d32',
          'base-300': '#0d2d4a',
          info: '#82aaff',
          success: '#22da6e',
          warning: '#ecc48d',
          error: '#ef5350',
        },
      },
      'dark',
      'cyberpunk',
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

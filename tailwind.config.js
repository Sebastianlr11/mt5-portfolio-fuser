/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                surface:    '#111111',
                surface2:   '#181818',
                surface3:   '#1f1f1f',
                primary:    '#00d9ff',
                secondary:  '#7c6dff',
                error:      '#fb5a6f',
                success:    '#00d9ff',
                warning:    '#fbbf24',
                muted:      '#4d4d4d',
                text:       '#e5e5e5',
                border:     '#222222',
                border2:    '#2a2a2a',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                'glow-green':  '0 0 24px rgba(0, 217, 255, 0.18)',
                'glow-blue':   '0 0 24px rgba(124, 109, 255, 0.15)',
                'glow-red':    '0 0 24px rgba(251, 90, 111, 0.14)',
                'card':        '0 1px 3px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                'card-hover':  '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(0, 217, 255, 0.1)',
            },
            animation: {
                'fade-in':     'fadeIn 0.3s ease',
                'slide-up':    'slideUp 0.4s ease',
                'pulse-slow':  'pulse 3s infinite',
            },
            keyframes: {
                fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
                slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
            },
        },
    },
    plugins: [],
}

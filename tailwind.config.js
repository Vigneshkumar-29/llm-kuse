/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Kuse.ai / Architectural Palette
                background: '#FDFCF8', // Warm Paper
                surface: '#F3F2EE',    // Light Sand
                'surface-highlight': '#EBEAE6',
                primary: '#2D2A26',    // Soft Black / Ink
                secondary: '#5C5855',  // Warm Grey
                accent: '#E65D3C',     // Terracotta / Clay
                'accent-hover': '#D44D2D',
                subtle: '#9CA3AF',
                border: '#E5E5E5',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['"Playfair Display"', 'Georgia', 'serif'], // Using Playfair as a proxy for Instrument Serif if needed
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
                'card': '0 4px 20px rgba(0, 0, 0, 0.04)',
                'float': '0 10px 40px -10px rgba(0, 0, 0, 0.08)',
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Colores Oripio Theme (Verde Moderno)
                "primary": "#10B981", // Emerald 500
                "primary-light": "#34D399", // Emerald 400
                "primary-dark": "#059669", // Emerald 600

                // Backgrounds
                "background-light": "#f9fafb",
                "background-dark": "#22262a",

                // Surfaces (cards, sidebars)
                "surface-light": "#ffffff",
                "surface-dark": "#2d3339",

                // Text
                "text-primary-light": "#131516",
                "text-secondary-light": "#6b7880",
                "text-primary-dark": "#f3f4f6",
                "text-secondary-dark": "#9ca3af",
            },
            fontFamily: {
                "display": ["Manrope", "system-ui", "sans-serif"],
            },
            boxShadow: {
                "floating": "0px 10px 30px rgba(0, 0, 0, 0.04)",
                "soft": "0 4px 12px rgba(0,0,0,0.02)",
            },
        },
    },
    plugins: [],
}

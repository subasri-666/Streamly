/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          main: "#050505",
          card: "#151518",
          hover: "#1E1E22",
          surface: "#0D0D0F",
        },
        brand: {
          primary: "#FF1744",
          secondary: "#FF2D75",
          highlight: "#FF6B9A",
          border: "#252529",
          text: "#F5F5F5",
          muted: "#929292",
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF1744 0%, #FF2D75 100%)',
        'card-gradient': 'linear-gradient(180deg, rgba(21, 21, 24, 0.6) 0%, rgba(13, 13, 15, 0.9) 100%)',
      },
    },
  },
  plugins: [],
}

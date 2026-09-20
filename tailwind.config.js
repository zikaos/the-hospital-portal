/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "24px",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0671B8",
          hover: "#035897",
        },
        secondary: {
          DEFAULT: "#00A8A7",
        },
        neutral: {
          DEFAULT: "#9C9C9C",
          50: "#FAFAFA",
          100: "#F4F4F6",
          200: "#E8E8EC",
          300: "#D1D1D6",
          400: "#9C9C9C",
          500: "#6B6B6B",
          600: "#4A4A4A",
          700: "#2B2B2B",
          800: "#1A1A1A",
          900: "#0A0A0A",
        },
        background: "#FAFAFA",
        surface: "#FFFFFF",
        textPrimary: "#0A0A0A",
        textSecondary: "#6B6B6B",
        border: "#E8E8EC",
        success: "#00A8A7",
        warning: "#FAB217",
        error: "#F37521",
        info: "#60C7D3",
      },
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.02)",
        cardHover: "0 8px 30px rgba(0, 0, 0, 0.08)",
        primaryGlow: "0 4px 12px rgba(6, 113, 184, 0.25)",
      },
    },
  },
  plugins: [],
};

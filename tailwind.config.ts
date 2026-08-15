import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          cyan: "#00D4FF",
          purple: "#7C3AED",
          "purple-light": "#9F67FF",
          "cyan-dark": "#0099CC",
        },
        // Dark background scale
        dark: {
          950: "#030712",
          900: "#0a0f1e",
          800: "#0f1629",
          700: "#161e35",
          600: "#1c2540",
          500: "#232d4d",
        },
        // Surface / glass
        surface: {
          DEFAULT: "rgba(15, 22, 41, 0.8)",
          hover: "rgba(22, 30, 53, 0.9)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #7C3AED 0%, #00D4FF 100%)",
        "gradient-brand-r":
          "linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)",
        "gradient-dark":
          "radial-gradient(ellipse at top, #0f1629 0%, #030712 100%)",
        "grid-pattern":
          "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(0, 212, 255, 0.15)",
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.2)",
        "glow-lg": "0 0 40px rgba(0, 212, 255, 0.2)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
        "card-hover": "0 20px 60px rgba(0, 0, 0, 0.5)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.06)",
        "brand-cyan": "rgba(0, 212, 255, 0.3)",
        "brand-purple": "rgba(124, 58, 237, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-up": "slideUp 0.4s ease forwards",
        "slide-in-right": "slideInRight 0.4s ease forwards",
        glow: "glow 2s ease-in-out infinite alternate",
        pulse2: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        float: "float 3s ease-in-out infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "gradient-x": "gradientX 3s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0,212,255,0.1)" },
          "100%": { boxShadow: "0 0 25px rgba(0,212,255,0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

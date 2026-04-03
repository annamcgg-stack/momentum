import type { Config } from "tailwindcss";

/**
 * Theme tokens for Momentum.
 * Adjust colours here for quick branding changes (see README-style notes in project root comments in lib/theme.ts).
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#FAF8F5",
          subtle: "#F3EFE8",
        },
        ink: {
          DEFAULT: "#2C2825",
          muted: "#6B6560",
          faint: "#9C958D",
        },
        accent: {
          DEFAULT: "#8B7355",
          soft: "#C4B5A0",
          muted: "#D9CFC2",
        },
        rose: {
          DEFAULT: "#C4A4A4",
          soft: "#E8DEDE",
        },
        sage: {
          DEFAULT: "#9CAF94",
          soft: "#D4DDD0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(44, 40, 37, 0.06), 0 8px 24px rgba(44, 40, 37, 0.06)",
        soft: "0 2px 12px rgba(44, 40, 37, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;

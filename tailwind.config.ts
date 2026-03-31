import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f0f7f0",
          100: "#d9eeda",
          200: "#b3ddb5",
          300: "#7dc480",
          400: "#4da552",
          500: "#2d8a33",
          600: "#226e28",
          700: "#1a571f",
          800: "#164519",
          900: "#123816",
        },
        water: {
          50: "#eff8ff",
          100: "#daeeff",
          200: "#b3deff",
          300: "#66bfff",
          400: "#1a9cf0",
          500: "#0080d6",
          600: "#0065b0",
          700: "#004f8f",
          800: "#004276",
          900: "#003563",
        },
        amber: {
          400: "#f59e0b",
          500: "#d97706",
          100: "#fef3c7",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontSize: {
        body: ["17px", { lineHeight: "1.75" }],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;

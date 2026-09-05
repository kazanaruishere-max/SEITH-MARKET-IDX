/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bloomberg: { bg: "#0B0E14", card: "#11151F", panel: "#1A1F2E", border: "#27272a" },
        mispricing: { low: "#ef4444", mid: "#fbbf24", high: "#10b981" },
      },
      fontFamily: { mono: ["JetBrains Mono", "monospace"], sans: ["Inter", "sans-serif"] },
      borderRadius: { DEFAULT: "6px" },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkTextColor: '#1a1a1a',
        lightTextColor: '#ffffff',
        secondaryColor: '#f5f5f5',
        detailsColor: '#3b82f6',
      },
      boxShadow: {
        small: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
} satisfies Config;

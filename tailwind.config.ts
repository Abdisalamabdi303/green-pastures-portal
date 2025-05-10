
import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'farm': {
          '50': '#f2fae5',
          '100': '#e4f5cb',
          '200': '#c9ea9e',
          '300': '#aedc71',
          '400': '#94cf43',
          '500': '#79c215',
          '600': '#619c11',
          '700': '#49760d',
          '800': '#304f08',
          '900': '#182904',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

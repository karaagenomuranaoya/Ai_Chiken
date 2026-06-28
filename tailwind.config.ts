import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mist: {
          50: "#eef8ff",
          100: "#d8eeff",
          200: "#b4ddfb",
          300: "#8fc9f4",
          400: "#66afe8",
          500: "#3f94d1",
          600: "#2c73ad",
        },
        ink: "#174963",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(44, 115, 173, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;

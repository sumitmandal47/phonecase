import { animation } from "framer-motion";
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },

  keyframes: {
    "fade-in": {
      form: { opacity: "0" },
      to: { opacity: "1" },
    },

    marquee: {
      
      "100%": { transform: "translateX(-50%)" },
    }
},

  animation: {
    "marquee": "marquee var(--marquee-duration) linear infinite",
    "fade-in": "fade-in 0.5s linear forwards",
  
  }
};

export default config;

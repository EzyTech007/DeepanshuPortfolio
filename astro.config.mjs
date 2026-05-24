// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://ezytech007.github.io",
  base: "/DeepanshuPortfolio",
  server: {
    host: true,  // or use '0.0.0.0'
    port: 4321   // default port, change if needed
  },
  vite: {
    plugins: [tailwindcss()],
  },
});

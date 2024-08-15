import { defineConfig } from "astro/config";
import db from "@astrojs/db";
import react from "@astrojs/react";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [db(), react()],
  security: {
    checkOrigin: true,
  },
  image: {
    domains: ["i.scdn.co"],
    remotePatterns: [
      {
        protocol: "https",
      },
    ],
  },
  vite: {
    optimizeDeps: {
      exclude: ["astro:db"],
    },
  },
  adapter: vercel(),
});

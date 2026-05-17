import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  root: "site",
  base: mode === "production" ? "/marginalia/" : "/",
  build: {
    outDir: "../site-dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    open: "/",
    fs: {
      allow: [".."],
    },
  },
}));

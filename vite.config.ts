import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SideNote",
      fileName: (format) => (format === "es" ? "index.js" : "index.umd.js"),
      formats: ["es", "umd"],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    dts({
      include: ["src"],
      rollupTypes: false,
      insertTypesEntry: true,
    }),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    include: ["test/**/*.test.ts"],
  },
  server: {
    open: "/examples/index.html",
  },
});

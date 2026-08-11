import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // `server-only` throws on import unless the bundler applies React's
      // "react-server" condition, which vitest does not. Aliasing it to the
      // package's own no-op build lets server modules be unit tested without
      // dropping the guard that protects them in the real build.
      "server-only": path.resolve(__dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
  },
});

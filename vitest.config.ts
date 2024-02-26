/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsConfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
    reporters: ["default", ["junit", { suiteName: "UI tests" }]],
    outputFile: {
      junit: "./junit-report.xml",
    },
  },
});

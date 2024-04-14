/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

const isStorybook = process.argv[1]?.includes("storybook");

export default defineConfig({
  ssr: {
    noExternal: ["aspida", "@aspida/axios"],
  },
  plugins: [!process.env.VITEST && !isStorybook && remix(), tsconfigPaths()],
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

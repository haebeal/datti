/// <reference types="vitest" />
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isStorybook = process.argv[1]?.includes("storybook");

export default defineConfig({
  ssr: {
    noExternal: ["aspida", "@aspida/fetch"],
  },
  plugins: [
    remixCloudflareDevProxy(),
    !process.env.VITEST && !isStorybook && remix(),
    tsconfigPaths(),
  ],
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

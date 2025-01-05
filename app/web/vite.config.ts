/// <reference types="vitest" />
import adapter from "@hono/vite-dev-server/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import serverAdapter from "hono-react-router-adapter/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isStorybook = process.argv[1]?.includes("storybook");

export default defineConfig({
	ssr: {
		noExternal: ["aspida", "@aspida/fetch"],
	},
	plugins: [
		cloudflareDevProxy(),
		!process.env.VITEST && !isStorybook && reactRouter(),
		serverAdapter({
			adapter,
			entry: "./server/index.ts",
		}),
		tsconfigPaths(),
	],
	server: {
		host: true,
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./vitest.setup.ts",
		include: ["app/**/*.test.{ts,tsx}"],
		reporters: ["default", ["junit", { suiteName: "UI tests" }]],
		outputFile: {
			junit: "./junit-report.xml",
		},
	},
});

import adapter from "@hono/vite-dev-server/cloudflare";
/// <reference types="vitest" />
import {
	vitePlugin as remix,
	cloudflareDevProxyVitePlugin as remixCloudflareDevProxy,
} from "@remix-run/dev";
import serverAdapter from "hono-remix-adapter/vite";
import { flatRoutes } from "remix-flat-routes";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const isStorybook = process.argv[1]?.includes("storybook");

export default defineConfig({
	ssr: {
		noExternal: ["aspida", "@aspida/fetch"],
	},
	plugins: [
		remixCloudflareDevProxy(),
		!process.env.VITEST &&
			!isStorybook &&
			remix({
				ignoredRouteFiles: ["**/.*"],
				routes: async (defineRoutes) => {
					return flatRoutes("routes", defineRoutes);
				},
			}),
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

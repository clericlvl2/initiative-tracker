import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		conditions: ["browser"],
		alias: {
			"@/app": path.resolve(__dirname, "./src/app"),
			"@/pages": path.resolve(__dirname, "./src/pages"),
			"@/entities": path.resolve(__dirname, "./src/entities"),
			"@/shared": path.resolve(__dirname, "./src/shared"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test-setup.ts"],
		exclude: ["tests/e2e/**", "node_modules/**"],
	},
});

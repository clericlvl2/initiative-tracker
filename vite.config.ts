import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		svelte(),
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico"],
			manifest: {
				name: "Initiative Tracker",
				short_name: "Initiative",
				description: "Combat initiative tracker for d20 and OSR TTRPGs",
				theme_color: "#EDEAE4",
				background_color: "#EDEAE4",
				display: "standalone",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@/app": path.resolve(__dirname, "./src/app"),
			"@/pages": path.resolve(__dirname, "./src/pages"),
			"@/entities": path.resolve(__dirname, "./src/entities"),
			"@/shared": path.resolve(__dirname, "./src/shared"),
		},
	},
});

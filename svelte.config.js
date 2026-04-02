import adapter from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			"@/app": "src/app",
			"@/pages": "src/pages",
			"@/entities": "src/entities",
			"@/shared": "src/shared",
		},
	},
};

export default config;

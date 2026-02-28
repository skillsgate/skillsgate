import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		cloudflareDevProxy(),
		reactRouter(),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"~": "/src",
		},
	},
});

import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

/**
 * Prisma generates `new WebAssembly.Module(bytes)` (sync) which
 * Cloudflare Workers blocks. Replace it with the async
 * `WebAssembly.compile(bytes)` which Workers allows.
 * The calling function is already async so this is safe.
 */
function prismaWasmFix(): Plugin {
	return {
		name: "prisma-wasm-fix",
		transform(code, id) {
			if (id.includes("prisma") && code.includes("new WebAssembly.Module")) {
				return {
					code: code.replace(
						"return new WebAssembly.Module(wasmArray)",
						"return await WebAssembly.compile(wasmArray)",
					),
					map: null,
				};
			}
		},
	};
}

export default defineConfig({
	plugins: [
		cloudflareDevProxy(),
		reactRouter(),
		tailwindcss(),
		prismaWasmFix(),
	],
	resolve: {
		alias: {
			"~": "/src",
		},
	},
});

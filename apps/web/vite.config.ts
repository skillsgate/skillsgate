import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { resolve, dirname, relative } from "node:path";
import { copyFileSync, mkdirSync } from "node:fs";

/**
 * Prisma with `runtime = "cloudflare"` generates
 * `import ... from "./query_compiler_fast_bg.wasm?module"`
 * which is a Cloudflare Workers convention for pre-compiled WASM.
 *
 * Vite can't parse `.wasm?module` during SSR builds. This plugin:
 * 1. Marks `.wasm?module` imports as external so Vite skips them
 * 2. Copies the .wasm file next to the server output so wrangler
 *    can resolve it when it re-bundles worker.ts
 */
function prismaCloudflareWasm(): Plugin {
	const wasmFiles: Array<{ src: string }> = [];

	return {
		name: "prisma-cloudflare-wasm",
		enforce: "pre",
		resolveId(source, importer) {
			if (source.endsWith(".wasm?module") && importer) {
				const cleanSource = source.replace("?module", "");
				const absolutePath = resolve(dirname(importer), cleanSource);
				const filename = absolutePath.split("/").pop()!;
				wasmFiles.push({ src: absolutePath });
				// Point to the file in build/server/ where we'll copy it
				return { id: "./" + filename + "?module", external: true };
			}
		},
		closeBundle() {
			// Copy WASM files to the server output directory
			for (const { src } of wasmFiles) {
				const filename = src.split("/").pop()!;
				const dest = resolve("build/server", filename);
				mkdirSync(dirname(dest), { recursive: true });
				copyFileSync(src, dest);
			}
		},
	};
}

export default defineConfig({
	plugins: [
		cloudflareDevProxy(),
		reactRouter(),
		tailwindcss(),
		prismaCloudflareWasm(),
	],
	resolve: {
		alias: {
			"~": "/src",
		},
	},
});

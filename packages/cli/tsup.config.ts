import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts", "src/mcp/server.ts"],
  format: ["esm"],
  outDir: "dist",
  target: "node18",
  platform: "node",
  splitting: true,
  sourcemap: true,
  dts: true,
  clean: true,
  banner: {},
  external: ["@napi-rs/keyring"],
  noExternal: [],
  shims: true,
});

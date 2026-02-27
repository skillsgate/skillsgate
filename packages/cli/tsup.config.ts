import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  outDir: "dist",
  target: "node18",
  platform: "node",
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  banner: {},
  noExternal: [],
  shims: true,
});

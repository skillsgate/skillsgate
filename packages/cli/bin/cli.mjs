#!/usr/bin/env node

// Enable compile cache for faster startup (Node 22+)
try {
  const { enableCompileCache } = await import("node:module");
  if (enableCompileCache && !process.env.NODE_DISABLE_COMPILE_CACHE) {
    enableCompileCache();
  }
} catch {}

await import("../dist/cli.js");

import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import react from "@vitejs/plugin-react"

// electron-vite 3.1.0 only knows Electron versions up to 35, so for newer
// Electron it silently falls back to Electron 35's build targets
// (node22.14 / chrome134). Electron 42.11.3 actually ships Node 24.19 and
// Chromium 148, so set the targets explicitly. Keep these in sync with the
// `electron` devDependency in package.json.
//
// Electron 42 is the newest line for which better-sqlite3 publishes prebuilt
// binaries (Electron ABI 146). Newer Electron forces a from-source compile,
// which fails on the Windows CI runner because node-gyp cannot find Visual
// Studio there. Check https://github.com/WiseLibs/better-sqlite3/releases for
// an electron-v<abi>-win32-x64 asset before moving past 42.
const NODE_TARGET = "node24.19"
const CHROME_TARGET = "chrome148"

export default defineConfig({
  main: {
    build: { target: NODE_TARGET },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    build: { target: NODE_TARGET },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    build: { target: CHROME_TARGET },
    plugins: [react()],
  },
})

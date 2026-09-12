import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import react from "@vitejs/plugin-react"

// electron-vite 3.1.0 only knows Electron versions up to 35, so for newer
// Electron it silently falls back to Electron 35's build targets
// (node22.14 / chrome134). Electron 44.3.0 actually ships Node 24.20 and
// Chromium 152, so set the targets explicitly. Keep these in sync with the
// `electron` devDependency in package.json.
const NODE_TARGET = "node24.20"
const CHROME_TARGET = "chrome152"

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

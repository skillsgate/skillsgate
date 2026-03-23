import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { openDb } from "./db/index.js"
import { App } from "./app.js"

// Open the local SQLite database at ~/.skillsgate/skillsgate.db
const db = openDb()

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  useAlternateScreen: true,
})

const root = createRoot(renderer)
root.render(<App db={db} />)

// Make cleanExit available globally so layout.tsx can call it
;(globalThis as any).__skillsgateTuiCleanExit = function cleanExit() {
  try {
    db.close()
  } catch {
    // ignore close errors
  }
  try {
    renderer.destroy()
  } catch {
    // ignore destroy errors
  }
  // Ensure terminal is fully restored
  process.stdout.write("\x1B[?1049l") // switch to main screen
  process.stdout.write("\x1B[?25h")   // show cursor
  process.stdout.write("\x1Bc")       // full reset (RIS)
  process.exit(0)
}

process.on("SIGINT", (globalThis as any).__skillsgateTuiCleanExit)
process.on("SIGTERM", (globalThis as any).__skillsgateTuiCleanExit)

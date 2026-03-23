import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./app.js"

const renderer = await createCliRenderer({
  exitOnCtrlC: false,
  useAlternateScreen: true,
})

const root = createRoot(renderer)
root.render(<App />)

// Clean exit: restore terminal on Ctrl+C and Ctrl+Q
function cleanExit() {
  renderer.destroy()
  // Ensure terminal is fully restored after OpenTUI cleanup
  process.stdout.write("\x1B[?1049l") // switch to main screen
  process.stdout.write("\x1B[?25h")   // show cursor
  process.stdout.write("\x1Bc")        // full reset (RIS)
  process.exit(0)
}

process.on("SIGINT", cleanExit)
process.on("SIGTERM", cleanExit)

// Also handle Ctrl+Q from within the app
renderer.on("keypress", (event: any) => {
  if ((event.ctrl && event.name === "c") || (event.ctrl && event.name === "q")) {
    cleanExit()
  }
})

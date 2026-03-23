import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"
import { App } from "./app.js"

const renderer = await createCliRenderer({ exitOnCtrlC: true })
const root = createRoot(renderer)
root.render(<App />)

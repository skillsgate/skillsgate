import { createRoot } from "react-dom/client"
import { App } from "./app"
import { initLocale } from "./lib/i18n"
import "./app.css"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

// Resolve the locale before the first paint so the UI never flashes English.
initLocale().finally(() => {
  createRoot(root).render(<App />)
})

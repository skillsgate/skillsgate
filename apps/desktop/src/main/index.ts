import { app, BrowserWindow, shell, nativeImage } from "electron"
import path from "node:path"
import { registerIpcHandlers } from "./ipc-handlers"
import { SkillsFileWatcher } from "./file-watcher"
import { closeDb } from "./db/index"

let mainWindow: BrowserWindow | null = null
let fileWatcher: SkillsFileWatcher | null = null

function createWindow(): void {
  // Load app icon
  const iconPath = path.join(__dirname, "../../resources/icon.png")
  const icon = nativeImage.createFromPath(iconPath)

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: "SkillsGate",
    icon,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show()
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })

  // Start the file watcher once the window is created
  fileWatcher = new SkillsFileWatcher(mainWindow)
  fileWatcher.start().catch((err) => {
    console.error("Failed to start file watcher:", err)
  })

  mainWindow.on("closed", () => {
    fileWatcher?.stop()
    fileWatcher = null
    mainWindow = null
  })

  // Load the renderer
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"))
  }
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("will-quit", () => {
  closeDb()
})

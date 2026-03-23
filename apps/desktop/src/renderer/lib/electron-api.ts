/**
 * Typed wrapper for the Electron IPC API exposed via preload.
 * In development with hot reload, window.electronAPI is always available
 * because the preload script runs before the renderer.
 */
export const electronAPI: ElectronAPI = window.electronAPI

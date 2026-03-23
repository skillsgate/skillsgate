import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("electronAPI", {
  // Agents
  detectAgents: () => ipcRenderer.invoke("agents:detect"),

  // Skills
  listInstalled: () => ipcRenderer.invoke("skills:list-installed"),
  installSkill: (source: string, agents: string[], scope: string) =>
    ipcRenderer.invoke("skills:install", source, agents, scope),
  removeSkill: (name: string) => ipcRenderer.invoke("skills:remove", name),
  updateSkill: (name: string) => ipcRenderer.invoke("skills:update", name),
  readSkillContent: (skillPath: string) =>
    ipcRenderer.invoke("skill:read-content", skillPath),

  // Auth
  authLoad: () => ipcRenderer.invoke("auth:load"),
  authExchange: (code: string) => ipcRenderer.invoke("auth:exchange", code),
  authLogout: () => ipcRenderer.invoke("auth:logout"),
  authOpenBrowser: (url: string) => ipcRenderer.invoke("auth:open-browser", url),

  // Events
  onSkillsUpdated: (callback: (skills: unknown[]) => void) => {
    ipcRenderer.on("skills:updated", (_event, skills) => callback(skills))
    return () => {
      ipcRenderer.removeAllListeners("skills:updated")
    }
  },
})

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
  writeSkillContent: (filePath: string, content: string) =>
    ipcRenderer.invoke("skill:write-content", filePath, content),
  openInFinder: (filePath: string) =>
    ipcRenderer.invoke("skill:open-in-finder", filePath),
  removeFromAgent: (skillName: string, agentName: string) =>
    ipcRenderer.invoke("skills:remove-from-agent", skillName, agentName),

  // Auth
  authLoad: () => ipcRenderer.invoke("auth:load"),
  authExchange: (code: string) => ipcRenderer.invoke("auth:exchange", code),
  authLogout: () => ipcRenderer.invoke("auth:logout"),
  authOpenBrowser: (url: string) => ipcRenderer.invoke("auth:open-browser", url),

  // Remote servers
  serversList: () => ipcRenderer.invoke("servers:list"),
  serversCreate: (data: {
    label: string
    host: string
    port?: number
    username: string
    skillsBasePath?: string
    sshKeyPath?: string | null
  }) => ipcRenderer.invoke("servers:create", data),
  serversUpdate: (
    id: string,
    fields: {
      label?: string
      host?: string
      port?: number
      username?: string
      skillsBasePath?: string
      sshKeyPath?: string | null
    },
  ) => ipcRenderer.invoke("servers:update", id, fields),
  serversDelete: (id: string) => ipcRenderer.invoke("servers:delete", id),
  serversTest: (id: string) => ipcRenderer.invoke("servers:test", id),
  serversSync: (id: string) => ipcRenderer.invoke("servers:sync", id),
  serversSkills: (serverId: string) =>
    ipcRenderer.invoke("servers:skills", serverId),
  serversCount: () => ipcRenderer.invoke("servers:count"),

  // Settings
  settingsGet: (key: string, defaultValue: unknown) =>
    ipcRenderer.invoke("settings:get", key, defaultValue),
  settingsSet: (key: string, value: unknown) =>
    ipcRenderer.invoke("settings:set", key, value),
  settingsAll: () => ipcRenderer.invoke("settings:all"),

  // Events
  onSkillsUpdated: (callback: (skills: unknown[]) => void) => {
    ipcRenderer.on("skills:updated", (_event, skills) => callback(skills))
    return () => {
      ipcRenderer.removeAllListeners("skills:updated")
    }
  },
})

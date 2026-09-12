import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron"

async function invokeWithLogging<T>(channel: string, ...args: unknown[]): Promise<T> {
  try {
    return await ipcRenderer.invoke(channel, ...args) as T
  } catch (error) {
    console.error(`[preload] ${channel} failed`, error)
    throw error
  }
}

function subscribe<T>(
  channel: string,
  callback: (payload: T) => void,
): () => void {
  const listener = (_event: IpcRendererEvent, payload: T) => {
    callback(payload)
  }
  ipcRenderer.on(channel, listener)
  return () => {
    ipcRenderer.removeListener(channel, listener)
  }
}

contextBridge.exposeInMainWorld("electronAPI", {
  // Agents
  agentsList: () => ipcRenderer.invoke("agents:list"),
  agentsSetActive: (names: string[]) =>
    ipcRenderer.invoke("agents:set-active", names),
  agentsResetActive: () => ipcRenderer.invoke("agents:reset-active"),

  // Skills
  listInstalled: () => ipcRenderer.invoke("skills:list-installed"),
  rescanSkills: () => ipcRenderer.invoke("skills:rescan"),
  installSkill: (source: string, agents: string[], scope: string) =>
    ipcRenderer.invoke("skills:install", source, agents, scope),
  installSkillViaCli: (source: string) =>
    invokeWithLogging("skills:install-via-cli", source),
  searchCatalog: (query: string, limit?: number, offset?: number) =>
    ipcRenderer.invoke("skills:search-catalog", query, limit, offset),
  fetchTrending: () => ipcRenderer.invoke("skills:fetch-trending"),
  fetchSkillContent: (source: string, skillId: string) =>
    ipcRenderer.invoke("skills:fetch-content", source, skillId),
  createSkill: (data: {
    name: string
    description?: string
    content?: string
    agentNames?: string[]
  }) => ipcRenderer.invoke("skills:create", data),
  removeSkill: (name: string) => ipcRenderer.invoke("skills:remove", name),
  updateSkill: (name: string) => ipcRenderer.invoke("skills:update", name),
  readSkillContent: (skillPath: string) =>
    ipcRenderer.invoke("skill:read-content", skillPath),
  listSupportingFiles: (skillPath: string) =>
    ipcRenderer.invoke("skill:list-supporting-files", skillPath),
  readSupportingFile: (skillPath: string, relativePath: string) =>
    ipcRenderer.invoke("skill:read-supporting-file", skillPath, relativePath),
  writeSkillContent: (filePath: string, content: string) =>
    ipcRenderer.invoke("skill:write-content", filePath, content),
  openInFinder: (filePath: string) =>
    ipcRenderer.invoke("skill:open-in-finder", filePath),
  removeFromAgent: (skillName: string, agentName: string) =>
    ipcRenderer.invoke("skills:remove-from-agent", skillName, agentName),
  addToAgent: (skillName: string, canonicalPath: string, agentName: string) =>
    ipcRenderer.invoke("skills:add-to-agent", skillName, canonicalPath, agentName),

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
  serversReadSkill: (serverId: string, remotePath: string) =>
    ipcRenderer.invoke("servers:read-skill", serverId, remotePath),
  serversWriteSkill: (serverId: string, remotePath: string, content: string) =>
    ipcRenderer.invoke("servers:write-skill", serverId, remotePath, content),
  serversCount: () => ipcRenderer.invoke("servers:count"),
  serversPushPreview: (serverId: string, mirror: boolean) =>
    ipcRenderer.invoke("servers:push-preview", serverId, mirror),
  serversPushApply: (serverId: string, preview: unknown) =>
    ipcRenderer.invoke("servers:push-apply", serverId, preview),

  // Settings
  settingsGet: (key: string, defaultValue: unknown) =>
    ipcRenderer.invoke("settings:get", key, defaultValue),
  settingsSet: (key: string, value: unknown) =>
    ipcRenderer.invoke("settings:set", key, value),
  settingsAll: () => ipcRenderer.invoke("settings:all"),

  // Favorites
  favoritesList: () => ipcRenderer.invoke("favorites:list"),
  favoritesToggle: (name: string) =>
    ipcRenderer.invoke("favorites:toggle", name),

  // Updates
  updatesGetState: () => ipcRenderer.invoke("updates:get-state"),
  updatesCheck: () => ipcRenderer.invoke("updates:check"),
  updatesInstall: () => ipcRenderer.invoke("updates:install"),
  appGetVersion: () => ipcRenderer.invoke("app:get-version"),

  // Events
  onSkillsUpdated: (callback: (skills: unknown[]) => void) => {
    return subscribe("skills:updated", callback)
  },
  onUpdateState: (callback: (state: unknown) => void) => {
    return subscribe("updates:state", callback)
  },
})

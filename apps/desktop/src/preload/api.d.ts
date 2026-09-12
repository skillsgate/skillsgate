export {}

declare global {
  /**
   * A registry agent plus whether this machine looks like it has that tool.
   * `detected` is directory existence only — it says nothing about whether the
   * user actually installs skills there, which is what `active` tracks.
   */
  interface AgentInfo {
    name: string
    displayName: string
    shortCode: string
    detected: boolean
  }

  interface AgentListResult {
    registry: AgentInfo[]
    /** Registry keys the user has chosen to see, in registry order. */
    active: string[]
  }

  interface InstalledSkill {
    name: string
    description: string
    path: string
    canonicalPath: string
    agents: string[]
    agentShortCodes: string[]
    scope: "global" | "project" | "custom"
    projectName: string | null
    hasSupportingFiles: boolean
    supportingFiles: Array<{
      relativePath: string
      size: number
    }>
    source?: string
    sourceType?: string
    installedAt?: string
    updatedAt?: string
  }

  interface InstallResult {
    skillName: string
    agent: string
    success: boolean
    path: string
    error?: string
  }

  // Remote server types
  interface RemoteServer {
    id: string
    label: string
    host: string
    port: number
    username: string
    skillsBasePath: string
    sshKeyPath: string | null
    lastSyncAt: string | null
    lastSyncError: string | null
    createdAt: string
    skillCount?: number
  }

  interface RemoteSkill {
    id: string
    serverId: string
    name: string
    description: string | null
    remotePath: string
    content: string | null
    contentHash: string | null
    syncedAt: string
  }

  interface SyncResult {
    added: number
    updated: number
    removed: number
    unchanged: number
    error?: string
  }

  interface PushPlanEntry {
    folderName: string
    name: string
    localPath: string
    remotePath: string
    remoteDir: string
    reason: "added" | "updated" | "deleted" | "unchanged"
    localHash?: string
    remoteHash?: string
  }

  interface UpdateState {
    status:
      | "idle"
      | "checking"
      | "available"
      | "downloading"
      | "downloaded"
      | "not-available"
      | "error"
    version: string
    availableVersion?: string
    downloadedVersion?: string
    progressPercent?: number
    message?: string
  }

  interface ElectronAPI {
    agentsList: () => Promise<AgentListResult>
    agentsSetActive: (names: string[]) => Promise<string[]>
    agentsResetActive: () => Promise<string[]>
    listInstalled: () => Promise<InstalledSkill[]>
    rescanSkills: () => Promise<InstalledSkill[]>
    installSkill: (
      source: string,
      agents: string[],
      scope: string,
    ) => Promise<InstallResult[]>
    installSkillViaCli: (
      source: string,
    ) => Promise<{ success: boolean; output: string; error?: string }>
    searchCatalog: (
      query: string,
      limit?: number,
      offset?: number,
    ) => Promise<{ skills: { id: string; skillId: string; name: string; installs: number; source: string }[]; count: number }>
    fetchTrending: () => Promise<
      {
        id: string
        skillId: string
        name: string
        installs: number
        source: string
        isOfficial?: boolean
      }[]
    >
    fetchSkillContent: (
      source: string,
      skillId: string,
    ) => Promise<string | null>
    createSkill: (data: {
      name: string
      description?: string
      content?: string
      agentNames?: string[]
    }) => Promise<{ name: string; path: string; targets: string[] }>
    removeSkill: (name: string) => Promise<void>
    updateSkill: (name: string) => Promise<void>
    readSkillContent: (path: string) => Promise<string>
    listSupportingFiles: (
      path: string,
    ) => Promise<Array<{ relativePath: string; size: number }>>
    readSupportingFile: (path: string, relativePath: string) => Promise<string>
    writeSkillContent: (filePath: string, content: string) => Promise<void>
    openInFinder: (filePath: string) => Promise<void>
    removeFromAgent: (skillName: string, agentName: string) => Promise<void>
    addToAgent: (
      skillName: string,
      canonicalPath: string,
      agentName: string,
    ) => Promise<void>

    // Remote servers
    serversList: () => Promise<RemoteServer[]>
    serversCreate: (data: {
      label: string
      host: string
      port?: number
      username: string
      skillsBasePath?: string
      sshKeyPath?: string | null
    }) => Promise<RemoteServer>
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
    ) => Promise<RemoteServer | null>
    serversDelete: (id: string) => Promise<void>
    serversTest: (id: string) => Promise<{ ok: boolean; error?: string }>
    serversSync: (id: string) => Promise<SyncResult>
    serversSkills: (serverId: string) => Promise<RemoteSkill[]>
    serversReadSkill: (serverId: string, remotePath: string) => Promise<string>
    serversWriteSkill: (
      serverId: string,
      remotePath: string,
      content: string,
    ) => Promise<{ ok: boolean }>
    serversCount: () => Promise<number>
    serversPushPreview: (serverId: string, mirror: boolean) => Promise<{
      toAdd: PushPlanEntry[]
      toUpdate: PushPlanEntry[]
      toDelete: PushPlanEntry[]
      unchanged: PushPlanEntry[]
      mirror: boolean
    }>
    serversPushApply: (
      serverId: string,
      preview: unknown,
    ) => Promise<{
      added: number
      updated: number
      deleted: number
      unchanged: number
      errors: { folderName: string; message: string }[]
    }>

    // Settings
    settingsGet: <T>(key: string, defaultValue: T) => Promise<T>
    settingsSet: (key: string, value: unknown) => Promise<void>
    settingsAll: () => Promise<Record<string, unknown>>

    // Favorites
    favoritesList: () => Promise<string[]>
    favoritesToggle: (name: string) => Promise<boolean>

    updatesGetState: () => Promise<UpdateState>
    updatesCheck: () => Promise<UpdateState>
    updatesInstall: () => Promise<void>
    appGetVersion: () => Promise<string>

    onSkillsUpdated: (
      callback: (skills: InstalledSkill[]) => void,
    ) => () => void
    onUpdateState: (callback: (state: UpdateState) => void) => () => void
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}

declare global {
  interface DetectedAgent {
    name: string
    displayName: string
    shortCode: string
  }

  interface InstalledSkill {
    name: string
    description: string
    path: string
    agents: string[]
    agentShortCodes: string[]
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

  interface StoredAuthUser {
    id: string
    name: string
    email: string
    image?: string
  }

  interface StoredAuth {
    token: string
    user: StoredAuthUser
  }

  interface ElectronAPI {
    detectAgents: () => Promise<DetectedAgent[]>
    listInstalled: () => Promise<InstalledSkill[]>
    installSkill: (
      source: string,
      agents: string[],
      scope: string,
    ) => Promise<InstallResult[]>
    removeSkill: (name: string) => Promise<void>
    updateSkill: (name: string) => Promise<void>
    readSkillContent: (path: string) => Promise<string>

    // Auth
    authLoad: () => Promise<StoredAuth | null>
    authExchange: (code: string) => Promise<StoredAuth>
    authLogout: () => Promise<void>
    authOpenBrowser: (url: string) => Promise<void>

    onSkillsUpdated: (
      callback: (skills: InstalledSkill[]) => void,
    ) => () => void
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}

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
    onSkillsUpdated: (
      callback: (skills: InstalledSkill[]) => void,
    ) => () => void
  }

  interface Window {
    electronAPI: ElectronAPI
  }
}

import { createContext, useContext, type ReactNode } from "react"
import type { Database } from "bun:sqlite"
import { SettingsStore } from "./settings.js"
import { RemoteServerStore } from "./servers.js"
import { RemoteSkillStore } from "./skills.js"

export interface DbContext {
  db: Database
  settings: SettingsStore
  servers: RemoteServerStore
  skills: RemoteSkillStore
}

const DbCtx = createContext<DbContext | null>(null)

interface DbProviderProps {
  db: Database
  children: ReactNode
}

export function DbProvider({ db, children }: DbProviderProps) {
  const ctx: DbContext = {
    db,
    settings: new SettingsStore(db),
    servers: new RemoteServerStore(db),
    skills: new RemoteSkillStore(db),
  }

  return <DbCtx.Provider value={ctx}>{children}</DbCtx.Provider>
}

export function useDb(): DbContext {
  const ctx = useContext(DbCtx)
  if (!ctx) {
    throw new Error("useDb must be used within a DbProvider")
  }
  return ctx
}

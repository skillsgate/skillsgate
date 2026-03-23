import { useEffect, useState } from "react"
import { electronAPI } from "../lib/electron-api"

export function Home() {
  const [agents, setAgents] = useState<DetectedAgent[]>([])
  const [skills, setSkills] = useState<InstalledSkill[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [detectedAgents, installedSkills] = await Promise.all([
          electronAPI.detectAgents(),
          electronAPI.listInstalled(),
        ])
        setAgents(detectedAgents)
        setSkills(installedSkills)
      } catch (err) {
        console.error("Failed to load installed skills:", err)
      } finally {
        setLoading(false)
      }
    }

    load()

    const cleanup = electronAPI.onSkillsUpdated((updatedSkills) => {
      setSkills(updatedSkills)
    })

    return cleanup
  }, [])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Installed Skills
      </h2>
      <p className="text-sm text-muted mb-6">
        Skills installed on your device across all detected agents.
      </p>

      {/* Detected agents badges */}
      {agents.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {agents.map((agent) => (
            <span
              key={agent.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-hover text-muted border border-border"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {agent.displayName}
            </span>
          ))}
        </div>
      )}

      {/* Skills list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-muted">
            Scanning for installed skills...
          </div>
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 text-muted"
          >
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <p className="text-muted text-sm">
            No skills installed yet.
          </p>
          <p className="text-muted text-xs mt-1">
            Head to Discover to find and install skills.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface hover:border-accent transition-colors cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {skill.name}
                </h3>
                {skill.description && (
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {skill.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  {skill.agents.map((agent) => (
                    <span
                      key={agent}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-surface-hover text-muted"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
              {skill.source && (
                <span className="text-xs text-muted ml-4 flex-shrink-0">
                  {skill.source}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

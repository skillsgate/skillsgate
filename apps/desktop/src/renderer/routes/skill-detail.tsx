import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { electronAPI } from "../lib/electron-api"

export function SkillDetail() {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name) return

    async function load() {
      try {
        // Attempt to read skill content by finding it in installed skills
        const skills = await electronAPI.listInstalled()
        const skill = skills.find((s) => s.name === name)
        if (skill?.path) {
          const raw = await electronAPI.readSkillContent(skill.path)
          setContent(raw)
        }
      } catch (err) {
        console.error("Failed to load skill content:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [name])

  return (
    <div className="p-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        {name || "Skill Detail"}
      </h2>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : content ? (
        <pre className="mt-4 p-4 rounded-lg bg-surface border border-border text-sm text-muted whitespace-pre-wrap overflow-x-auto font-mono">
          {content}
        </pre>
      ) : (
        <p className="text-sm text-muted">
          Skill content not available. This skill may not be installed locally.
        </p>
      )}
    </div>
  )
}

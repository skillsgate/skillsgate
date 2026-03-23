export function Discover() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
        Discover
      </h2>
      <p className="text-sm text-[var(--color-foreground-secondary)] mb-6">
        Search and browse the SkillsGate catalog to find skills for your AI
        agents.
      </p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-muted)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mb-4"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-[var(--color-muted)] text-sm">
          Search and catalog integration coming soon.
        </p>
        <p className="text-[var(--color-muted)] text-xs mt-1">
          This view will use shared components from @skillsgate/ui.
        </p>
      </div>
    </div>
  )
}

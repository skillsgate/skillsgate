export function Dashboard() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
        Dashboard
      </h2>
      <p className="text-sm text-[var(--color-foreground-secondary)] mb-6">
        Overview of your skills, usage, and publishing activity.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
            Installed Skills
          </p>
          <p className="text-3xl font-bold text-[var(--color-foreground)]">
            --
          </p>
        </div>
        <div className="p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
            Detected Agents
          </p>
          <p className="text-3xl font-bold text-[var(--color-foreground)]">
            --
          </p>
        </div>
        <div className="p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
            Published Skills
          </p>
          <p className="text-3xl font-bold text-[var(--color-foreground)]">
            --
          </p>
        </div>
        <div className="p-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1">
            Favorites
          </p>
          <p className="text-3xl font-bold text-[var(--color-foreground)]">
            --
          </p>
        </div>
      </div>

      <p className="text-[var(--color-muted)] text-xs text-center">
        Dashboard data will be populated once authentication is configured.
      </p>
    </div>
  )
}

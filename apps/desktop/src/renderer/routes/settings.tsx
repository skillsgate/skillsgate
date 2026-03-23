export function Settings() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
        Settings
      </h2>
      <p className="text-sm text-[var(--color-foreground-secondary)] mb-6">
        Configure your SkillsGate Desktop preferences.
      </p>

      <div className="flex flex-col gap-6 max-w-lg">
        {/* Install preferences */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
            Installation
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div>
                <p className="text-sm text-[var(--color-foreground)]">
                  Default scope
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  Where skills are installed by default
                </p>
              </div>
              <span className="text-xs text-[var(--color-foreground-secondary)] px-2 py-1 rounded bg-[var(--color-bg-tertiary)]">
                Global
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
              <div>
                <p className="text-sm text-[var(--color-foreground)]">
                  Install method
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  How skill files are placed in agent directories
                </p>
              </div>
              <span className="text-xs text-[var(--color-foreground-secondary)] px-2 py-1 rounded bg-[var(--color-bg-tertiary)]">
                Symlink
              </span>
            </div>
          </div>
        </section>

        {/* Account */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
            Account
          </h3>
          <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="text-sm text-[var(--color-muted)]">
              Not signed in. Sign in to sync favorites and access your dashboard.
            </p>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
            About
          </h3>
          <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
            <p className="text-sm text-[var(--color-foreground)]">
              SkillsGate Desktop v0.1.0
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              Manage AI agent skills from your desktop.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

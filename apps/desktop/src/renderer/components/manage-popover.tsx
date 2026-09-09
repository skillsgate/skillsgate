import { t } from "../lib/i18n"
// apps/desktop/src/renderer/components/manage-popover.tsx
import { useEffect, useRef } from "react"

export interface ManagePopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  onRefresh: () => void
  onPush: () => void
  onMirror: () => void
  onClose: () => void
}

/**
 * Popover anchored under a "Manage" button. Three rows:
 *   - Refresh from remote
 *   - Push to remote
 *   - Mirror to remote (destructive)
 *
 * Closes on outside click or Escape.
 */
export function ManagePopover({
  open,
  anchorEl,
  onRefresh,
  onPush,
  onMirror,
  onClose,
}: ManagePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorEl &&
        !anchorEl.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open, anchorEl, onClose])

  if (!open || !anchorEl) return null

  const rect = anchorEl.getBoundingClientRect()
  const top = rect.bottom + 4
  const right = window.innerWidth - rect.right

  return (
    <div
      ref={popoverRef}
      className="fixed z-40 w-80 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden animate-slide-down"
      style={{ top, right }}
      role="menu"
    >
      <button
        onClick={() => {
          onRefresh()
          onClose()
        }}
        className="w-full text-left px-4 py-3 hover:bg-background transition-colors flex items-start gap-3 border-b border-border"
        role="menuitem"
      >
        <span className="text-foreground text-base leading-none mt-0.5">↻</span>
        <span className="flex-1">
          <span className="block text-[12px] font-medium text-foreground">
            {t("Refresh from remote")}
          </span>
          <span className="block text-[11px] text-muted mt-0.5">
            {t("Pull the latest list of skills on this server.")}
          </span>
        </span>
      </button>

      <button
        onClick={() => {
          onPush()
          onClose()
        }}
        className="w-full text-left px-4 py-3 hover:bg-background transition-colors flex items-start gap-3 border-b border-border"
        role="menuitem"
      >
        <span className="text-foreground text-base leading-none mt-0.5">↑</span>
        <span className="flex-1">
          <span className="block text-[12px] font-medium text-foreground">
            {t("Push to remote")}
          </span>
          <span className="block text-[11px] text-muted mt-0.5">
            Send your local skills. Adds new ones, updates changed ones, never deletes.
          </span>
        </span>
      </button>

      <button
        onClick={() => {
          onMirror()
          onClose()
        }}
        className="w-full text-left px-4 py-3 hover:bg-background transition-colors flex items-start gap-3"
        role="menuitem"
      >
        <span className="text-red-400 text-base leading-none mt-0.5">⇄</span>
        <span className="flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-foreground">
              {t("Mirror to remote")}
            </span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/15 text-red-400">
              destructive
            </span>
          </span>
          <span className="block text-[11px] text-muted mt-0.5">
            Match this server one-to-one. Anything on the remote that you don't
            have locally is deleted.
          </span>
        </span>
      </button>
    </div>
  )
}

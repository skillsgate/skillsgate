/**
 * A horizontally resizable pane whose width is persisted in settings.
 *
 * Design notes:
 *  1. The width is stored in a ref as well as state. Pointer-move fires far
 *     faster than React commits, so the drag maths reads the ref and never the
 *     possibly-stale closure value.
 *  2. Persistence happens once, on pointer-up. A drag is a single user gesture,
 *     so there is nothing to debounce and no reason to write on every frame.
 *  3. The saved value is clamped on read as well as on write. Min/max can change
 *     with a release; a width saved by an older build must not strand a pane at
 *     an unusable size.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { electronAPI } from "./electron-api"

export interface ResizablePane {
  /** Current width in pixels, already clamped. */
  width: number
  /** Attach to the drag handle's `onPointerDown`. */
  startResize: (event: React.PointerEvent) => void
  /** Attach to the drag handle's `onDoubleClick`. Restores the default width. */
  reset: () => void
}

export function useResizablePane(
  key: string,
  defaultWidth: number,
  min: number,
  max: number,
): ResizablePane {
  const [width, setWidth] = useState(defaultWidth)
  const widthRef = useRef(defaultWidth)

  const clamp = useCallback(
    (value: number) => Math.min(max, Math.max(min, Math.round(value))),
    [min, max],
  )

  useEffect(() => {
    let cancelled = false
    electronAPI
      .settingsGet<number>(key, defaultWidth)
      .then((saved) => {
        if (cancelled || typeof saved !== "number" || !Number.isFinite(saved)) {
          return
        }
        const next = clamp(saved)
        widthRef.current = next
        setWidth(next)
      })
      .catch(() => {
        // Settings unavailable — the default width is already in place.
      })
    return () => {
      cancelled = true
    }
  }, [key, defaultWidth, clamp])

  const startResize = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault()
      const startX = event.clientX
      const startWidth = widthRef.current
      const handle = event.currentTarget
      const pointerId = event.pointerId

      const handleMove = (moveEvent: PointerEvent) => {
        const next = clamp(startWidth + (moveEvent.clientX - startX))
        widthRef.current = next
        setWidth(next)
      }

      // A drag can end without a pointerup: Cmd-Tab away, a system gesture, or
      // the browser cancelling the pointer all leave the move listener attached
      // and the body cursor stuck. Every exit route runs this once.
      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        window.removeEventListener("pointermove", handleMove)
        window.removeEventListener("pointerup", finish)
        window.removeEventListener("pointercancel", finish)
        handle.removeEventListener("lostpointercapture", finish)
        try {
          if (handle.hasPointerCapture(pointerId)) {
            handle.releasePointerCapture(pointerId)
          }
        } catch {
          // Capture was already released with the pointer.
        }
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
        void electronAPI.settingsSet(key, widthRef.current)
      }

      try {
        handle.setPointerCapture(pointerId)
      } catch {
        // Capture is an optimisation, not a requirement — the window listeners
        // below still track the drag without it.
      }

      window.addEventListener("pointermove", handleMove)
      window.addEventListener("pointerup", finish)
      window.addEventListener("pointercancel", finish)
      handle.addEventListener("lostpointercapture", finish)
      // Keeps the col-resize cursor while the pointer is outside the handle and
      // stops the drag from selecting text in either pane.
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [key, clamp],
  )

  const reset = useCallback(() => {
    widthRef.current = defaultWidth
    setWidth(defaultWidth)
    void electronAPI.settingsSet(key, defaultWidth)
  }, [key, defaultWidth])

  return { width, startResize, reset }
}

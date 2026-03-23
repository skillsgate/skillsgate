import { useKeyboard } from "@opentui/react"
import { colors } from "../utils/colors.js"

interface ConfirmDialogProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Overlay confirmation dialog that captures y/n keypress.
 * Renders as a centered box with the message and (y/n) hint.
 */
export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  useKeyboard((key) => {
    if (key.name === "y") {
      onConfirm()
    } else if (key.name === "n" || key.name === "escape") {
      onCancel()
    }
  })

  return (
    <box
      style={{
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.bg,
      }}
    >
      <box
        style={{
          width: 60,
          border: true,
          borderColor: colors.primary,
          backgroundColor: "#1a1a2e",
          paddingLeft: 2,
          paddingRight: 2,
          paddingTop: 1,
          paddingBottom: 1,
          flexDirection: "column",
          alignItems: "center",
        }}
        title="Confirm"
      >
        <text fg={colors.text}>{message}</text>
        <text>{" "}</text>
        <text fg={colors.textDim}>
          Press <span fg={colors.success}>y</span> to confirm, <span fg={colors.error}>n</span> to cancel
        </text>
      </box>
    </box>
  )
}

import { useState, useCallback } from "react"
import { useKeyboard } from "@opentui/react"
import { useStore, useDispatch } from "../store/context.js"
import { useAuth } from "../data/use-auth.js"
import { API_BASE_URL } from "../../../cli/src/constants.js"
import { colors } from "../utils/colors.js"

type LoginStep = "prompt" | "code" | "exchanging"

/**
 * Login view implementing the device code flow:
 * 1. Show instructions with the auth URL
 * 2. Prompt to open browser (y/n)
 * 3. Show input for device code (XXXX-XXXX)
 * 4. Exchange code for token, save auth, navigate back
 */
export function LoginView() {
  const state = useStore()
  const dispatch = useDispatch()
  const { auth, login } = useAuth()

  const [step, setStep] = useState<LoginStep>("prompt")
  const [error, setError] = useState<string | null>(null)

  const authUrl = `${API_BASE_URL}/cli/auth`

  // Handle y/n for "open browser?" prompt
  useKeyboard((key) => {
    if (state.activeView !== "login") return
    if (state.showHelp) return

    // Esc to go back at any step
    if (key.name === "escape") {
      dispatch({ type: "GO_BACK" })
      return
    }

    if (step === "prompt") {
      if (key.name === "y") {
        // Open browser
        try {
          const { exec } = require("node:child_process")
          const cmd = process.platform === "darwin" ? "open" : "xdg-open"
          exec(`${cmd} "${authUrl}"`)
          dispatch({
            type: "SHOW_NOTIFICATION",
            notification: { type: "info", message: "Opening browser..." },
          })
        } catch {
          // Best effort - user can open manually
        }
        setStep("code")
      } else if (key.name === "n") {
        setStep("code")
      }
    }
  })

  const handleCodeSubmit = useCallback(async (value: string) => {
    const code = value.trim()
    if (!code) return

    setStep("exchanging")
    setError(null)

    const errMsg = await login(code)

    if (errMsg) {
      setError(errMsg)
      setStep("code") // Let user retry
    } else {
      // Success - navigate back
      dispatch({
        type: "SHOW_NOTIFICATION",
        notification: { type: "success", message: "Logged in successfully!" },
      })
      dispatch({ type: "GO_BACK" })
    }
  }, [login, dispatch])

  // Already logged in
  if (auth) {
    return (
      <box style={{ flexDirection: "column", padding: 2 }}>
        <text fg={colors.success}>
          Already logged in as <strong>{auth.user.name}</strong> ({auth.user.email})
        </text>
        <text>{" "}</text>
        <text fg={colors.textDim}>Press Esc to go back</text>
      </box>
    )
  }

  return (
    <box style={{ flexDirection: "column", padding: 2 }}>
      {/* Title */}
      <text fg={colors.primary}>
        <strong>Sign in to SkillsGate</strong>
      </text>
      <text>{" "}</text>

      {/* Instructions */}
      <text fg={colors.text}>
        Visit the following URL in your browser to get a login code:
      </text>
      <text>{" "}</text>
      <text fg={colors.primary}>
        {authUrl}
      </text>
      <text>{" "}</text>

      {step === "prompt" && (
        <>
          <text fg={colors.text}>
            Open browser? <span fg={colors.textDim}>(y/n)</span>
          </text>
        </>
      )}

      {step === "code" && (
        <>
          <text fg={colors.text}>
            Paste the code from the browser:
          </text>
          <text>{" "}</text>
          <box
            style={{
              height: 3,
              width: 40,
              border: true,
              borderColor: colors.primary,
              paddingLeft: 1,
              paddingRight: 1,
            }}
            title="Code"
          >
            <input
              placeholder="XXXX-XXXX"
              focused={state.activeView === "login" && step === "code" && !state.showHelp}
              onSubmit={handleCodeSubmit}
            />
          </box>
          <text>{" "}</text>
          <text fg={colors.textDim}>
            Press Enter to submit, Esc to cancel
          </text>
        </>
      )}

      {step === "exchanging" && (
        <text fg={colors.primary}>
          Verifying code...
        </text>
      )}

      {/* Error message */}
      {error && (
        <>
          <text>{" "}</text>
          <text fg={colors.error}>{error}</text>
        </>
      )}
    </box>
  )
}

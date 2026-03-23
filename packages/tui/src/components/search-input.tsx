import { useStore, useDispatch } from "../store/context.js"
import { colors } from "../utils/colors.js"

interface SearchInputProps {
  /** Override focus (if not provided, uses store's focusedPane) */
  focused?: boolean
  /** Action type to dispatch on input change */
  filterAction?: "SET_INSTALLED_FILTER" | "SET_SEARCH_QUERY"
  /** Placeholder text */
  placeholder?: string
}

export function SearchInput({
  focused,
  filterAction = "SET_INSTALLED_FILTER",
  placeholder = "Type to filter...",
}: SearchInputProps) {
  const state = useStore()
  const dispatch = useDispatch()

  const isFocused = focused ?? (state.focusedPane === "search")

  return (
    <box
      style={{
        height: 3,
        width: "100%",
        border: true,
        borderColor: isFocused ? colors.primary : colors.border,
        paddingLeft: 1,
        paddingRight: 1,
      }}
      title="Filter skills"
      onClick={() => dispatch({ type: "SET_FOCUSED_PANE", pane: "search" })}
    >
      <input
        placeholder={placeholder}
        focused={isFocused && !state.showHelp}
        onClick={() => dispatch({ type: "SET_FOCUSED_PANE", pane: "search" })}
        onInput={(value: string) => {
          dispatch({ type: filterAction, [filterAction === "SET_INSTALLED_FILTER" ? "filter" : "query"]: value } as any)
        }}
      />
    </box>
  )
}

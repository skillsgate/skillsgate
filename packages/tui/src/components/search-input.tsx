import { useStore, useDispatch } from "../store/context.js"
import { colors } from "../utils/colors.js"

interface SearchInputProps {
  /** Whether this input should be focused for keyboard input */
  focused?: boolean
}

export function SearchInput({ focused }: SearchInputProps) {
  const state = useStore()
  const dispatch = useDispatch()

  return (
    <box
      style={{
        height: 3,
        width: "100%",
        border: true,
        borderColor: colors.border,
        paddingLeft: 1,
        paddingRight: 1,
      }}
      title="Filter skills"
    >
      <input
        placeholder="Type to filter..."
        focused={focused}
        onInput={(value: string) => {
          dispatch({ type: "SET_INSTALLED_FILTER", filter: value })
        }}
      />
    </box>
  )
}

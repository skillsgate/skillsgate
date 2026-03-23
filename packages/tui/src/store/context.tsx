import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react"
import type { AppState, Action } from "./types.js"
import { appReducer, initialState } from "./reducers.js"

const StoreContext = createContext<AppState>(initialState)
const DispatchContext = createContext<Dispatch<Action>>(() => {})

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <StoreContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  )
}

export function useStore(): AppState {
  return useContext(StoreContext)
}

export function useDispatch(): Dispatch<Action> {
  return useContext(DispatchContext)
}

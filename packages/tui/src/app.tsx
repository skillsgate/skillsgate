import { StoreProvider } from "./store/context.js"
import { Layout } from "./components/layout.js"

export function App() {
  return (
    <StoreProvider>
      <Layout />
    </StoreProvider>
  )
}

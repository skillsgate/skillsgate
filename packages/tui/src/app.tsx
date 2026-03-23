import type { Database } from "bun:sqlite"
import { StoreProvider } from "./store/context.js"
import { DbProvider } from "./db/context.js"
import { Layout } from "./components/layout.js"

interface AppProps {
  db: Database
}

export function App({ db }: AppProps) {
  return (
    <DbProvider db={db}>
      <StoreProvider>
        <Layout />
      </StoreProvider>
    </DbProvider>
  )
}

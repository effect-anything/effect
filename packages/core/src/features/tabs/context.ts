import createContext from "zustand/context"
import { State } from "./state"

const { Provider: TabsStoreProvider, useStore } = createContext<State>()

// @ts-expect-error
TabsStoreProvider.displayName = "TabsStoreProvider"

export { TabsStoreProvider, useStore }

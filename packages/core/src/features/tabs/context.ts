import createContext from "zustand/context"
import { State } from "./state"

const { Provider: TabsZustandProvider, useStore } = createContext<State>()

// @ts-expect-error
TabsZustandProvider.displayName = "TabsProvider"

export { TabsZustandProvider, useStore }

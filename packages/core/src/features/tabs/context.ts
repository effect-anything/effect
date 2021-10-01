import createContext from "zustand/context"
import { State } from "./state"

const { Provider, useStore } = createContext<State>()

// @ts-expect-error
Provider.displayName = "TabsProvider"

export { Provider, useStore }

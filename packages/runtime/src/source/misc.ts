import { State } from "../state"

export const handler = (state: State) => {
  const beforeUnloadHandler = () => {
    state.setUnloading(true)
  }

  self.addEventListener("beforeunload", beforeUnloadHandler)

  return () => {
    self.removeEventListener("beforeunload", beforeUnloadHandler)
  }
}

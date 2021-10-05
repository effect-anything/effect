import actualCreate from "zustand"
import { createBrowserHistory } from "history"
const stores = new Set<any>()

const create: typeof actualCreate = (createState) => {
  const store = actualCreate(createState)

  const initialState = store.getState()

  stores.add(() => {
    store.setState({ ...initialState, history: createBrowserHistory() }, true)
  })

  return store
}

beforeEach(() => {
  stores.forEach((resetFn) => resetFn())
})

export default create

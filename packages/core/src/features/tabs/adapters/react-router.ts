import type { History } from "history"
import { TabsAdapter } from "../types"

interface A {
  history: History
}

export const adapter: TabsAdapter<A> = ({ event, history }) => {
  return {
    listen(fn) {
      const unsubscribe = history.listen((location) => {
        fn({
          pathname: location.pathname,
          search: location.search,
          state: location.state || {},
          hash: location.hash,
        })
      })

      return unsubscribe
    },
    identity() {
      return {
        pathname: history.location.pathname,
        search: history.location.search,
        state: history.location.state || {},
        hash: history.location.hash,
      }
    },
    push(path) {
      history.push(path)
    },
    replace(path) {
      history.replace(path)
    },
  }
}

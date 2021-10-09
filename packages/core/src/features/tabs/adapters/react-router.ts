import * as R from "ramda"
import type { History } from "history"
import { TabIdentity, TabsAdapter } from "../types"

interface ReactRouterAdapterOptions {
  history: History
}

export const adapter: TabsAdapter<ReactRouterAdapterOptions> = ({ history }) => {
  return {
    listen(callback) {
      const unsubscribe = history.listen((location) => callback(this.getIdentity(location)))

      return unsubscribe
    },
    identity() {
      return this.getIdentity(history.location)
    },
    equal(a, b) {
      // "search", "hash"
      return R.eqBy(R.omit(["state"]), a, b)
    },
    exist(tabs, tabIdentity) {
      const index = R.findIndex((tab) => this.equal(tab.identity, tabIdentity), tabs)

      return index !== -1
    },
    getIdentity(location) {
      const isString = typeof location === "string"

      const id: TabIdentity = {
        pathname: isString ? location : location.pathname || "",
        search: isString ? "" : location.search ? decodeURIComponent(location.search) : "",
        state: isString ? {} : typeof location.state === "undefined" ? {} : location.state || {},
        hash: isString ? "" : location.hash || "",
      }

      return id
    },
    push(tabIdentity) {
      history.push({
        pathname: tabIdentity.pathname,
        search: tabIdentity.search,
        hash: tabIdentity.hash,
        state: tabIdentity.state,
      })
    },
    replace(tabIdentity) {
      history.replace({
        pathname: tabIdentity.pathname,
        search: tabIdentity.search,
        hash: tabIdentity.hash,
        state: tabIdentity.state,
      })
    },
  }
}

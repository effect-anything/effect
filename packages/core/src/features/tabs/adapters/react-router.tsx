import * as R from "ramda"
import React from "react"
import type { History } from "history"
import { TabIdentity, TabsAdapter } from "../types"
import { OpenTab } from "../openTab"

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
      // TODO: optional "search", "hash"
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
    getComponent(Component, identity, properties) {
      // eslint-disable-next-line react/display-name
      return () => <Component key={properties.key} location={identity} />
    },
    persistence(tabs) {
      const value = tabs.map((tab) => {
        return {
          identity: tab.identity,
          properties: tab.properties,
          tabKey: tab.tabKey,
        }
      })

      // TODO: optional storage, cacheKey
      sessionStorage.setItem("_TABS_PERSISTENT", JSON.stringify(value))
    },
    recovery(getState, children) {
      let initialTabs: OpenTab[] = []

      try {
        // TODO: optional storage, cacheKey
        const persistentTabs: OpenTab[] = JSON.parse(sessionStorage.getItem("_TABS_PERSISTENT") || "")

        initialTabs = persistentTabs.map((x) => {
          return new OpenTab({
            getState: getState,
            tabKey: x.tabKey,
            identity: x.identity,
            // TODO: more tests
            component: children,
          })
        })
      } catch {}

      return initialTabs
    },
  }
}

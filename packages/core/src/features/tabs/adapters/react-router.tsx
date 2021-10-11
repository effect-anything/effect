import * as R from "ramda"
import React from "react"
import type { History } from "history"
import type { GetState } from "zustand"
import type { FunctionComponent } from "react"
import type { ReactChildren, TabProperties } from "../openTab"
import { OpenTab } from "../openTab"
import { JumpTabIdentity, TabIdentity } from "../types"
import { DefaultAdapterOptions, TabsAdapter } from "./types"
import { State } from "../state"

interface ReactRouterAdapterOptions extends DefaultAdapterOptions {
  persistentKey?: string

  storage?: "sessionStorage" | "localStorage"

  ignoreKeys?: Array<"state" | "search" | "hash">

  history: History
}

class ReactRouterAdapter extends TabsAdapter<ReactRouterAdapterOptions> {
  private readonly history: History

  private persistentKey: string

  private storage: Storage

  private ignoreKeys: string[]

  constructor(options: ReactRouterAdapterOptions) {
    super(options)

    this.history = options.history

    this.ignoreKeys = options.ignoreKeys ? options.ignoreKeys : ["state"]

    this.persistentKey = options.persistentKey || "_TABS_PERSISTENT"

    this.storage = options.storage === "localStorage" ? localStorage : sessionStorage
  }

  public listen(callback: (location: TabIdentity) => void): () => void {
    const unsubscribe = this.history.listen((location) => callback(this.getIdentity(location)))

    return unsubscribe
  }

  public identity() {
    return this.getIdentity(this.history.location)
  }

  public equal(a: TabIdentity, b: TabIdentity) {
    return R.eqBy(R.omit(this.ignoreKeys), a, b)
  }

  public getIdentity(location: JumpTabIdentity) {
    const isString = typeof location === "string"

    const id: TabIdentity = {
      pathname: isString ? location : location.pathname || "",
      search: isString ? "" : location.search ? decodeURIComponent(location.search) : "",
      state: isString ? {} : typeof location.state === "undefined" ? {} : location.state || {},
      hash: isString ? "" : location.hash || "",
    }

    return id
  }

  public exist(tabs: OpenTab[], identity: TabIdentity) {
    const index = R.findIndex((tab) => this.equal(tab.identity, identity), tabs)

    return index !== -1
  }

  public push(identity: TabIdentity) {
    this.history.push({
      pathname: identity.pathname,
      search: identity.search,
      hash: identity.hash,
      state: identity.state,
    })
  }

  public replace(identity: TabIdentity) {
    this.history.replace({
      pathname: identity.pathname,
      search: identity.search,
      hash: identity.hash,
      state: identity.state,
    })
  }

  public getComponent(Component: FunctionComponent, identity: TabIdentity, properties: TabProperties) {
    // TODO: refactor
    // eslint-disable-next-line react/display-name
    return () => <Component key={properties.key} location={identity} />
  }

  public persistence(tabs: OpenTab[]) {
    const value = tabs.map((tab) => {
      return {
        identity: tab.identity,
        properties: tab.properties,
        tabKey: tab.tabKey,
      }
    })

    this.storage.setItem(this.persistentKey, JSON.stringify(value))
  }

  public recovery(getState: GetState<State>, children: ReactChildren) {
    let initialTabs: OpenTab[] = []

    try {
      const persistentTabs: OpenTab[] = JSON.parse(this.storage.getItem(this.persistentKey) || "")

      initialTabs = persistentTabs.map((tab) => {
        return new OpenTab({
          getState: getState,
          tabKey: tab.tabKey,
          identity: tab.identity,
          // TODO: more tests
          component: children,
        })
      })
    } catch {}

    return initialTabs
  }
}

export { ReactRouterAdapter }
